import { NextRequest, NextResponse } from "next/server";
import { getSimulatorOrderById, updateSimulatorOrder } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

async function authenticate(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  return { err: null, colab };
}

/**
 * Formats a date + time pair into the Google Calendar compact format: YYYYMMDDTHHmmss
 * e.g. date="2026-07-03", time="09:00" → "20260703T090000"
 */
function toGcalDateTime(date: string, time: string): string {
  const d = date.replace(/-/g, "");
  const t = time.replace(/:/g, "").padEnd(6, "0");
  return `${d}T${t}`;
}

/**
 * Builds the full event description from the order data.
 */
function buildEventDescription(order: Awaited<ReturnType<typeof getSimulatorOrderById>>, raw: Record<string, any>): string {
  if (!order) return "";

  const isMov = (order.serviceType ?? "").toLowerCase().replace(/[^a-z]/g, "").includes("mudanca") ||
                (order.serviceType ?? "").toLowerCase() === "moving";

  const lines: string[] = [
    `Pedido #${order.id}`,
    "",
    "CLIENTE",
    `Nome: ${order.contactName ?? "—"}`,
    `Telefone: ${order.contactPhone ?? "—"}`,
    `Email: ${order.contactEmail ?? "—"}`,
    "",
    "SERVIÇO",
    `Tipo: ${order.serviceType ?? "—"}`,
    `Descrição: ${order.description ?? "—"}`,
    "",
  ];

  if (isMov) {
    const originAddr = raw.originAddress?.formattedAddress ?? raw.originAddress?.address ?? order.address;
    const destAddr = raw.destinationAddress?.formattedAddress ?? raw.destinationAddress?.address;
    const dist = raw.movingDistance?.distanceText ?? (order.distanceKm ? `${order.distanceKm} km` : null);
    const originAccess = raw.originAccess ?? {};
    const destAccess = raw.destinationAccess ?? {};

    lines.push(
      "MORADA",
      `Origem: ${originAddr ?? "—"}`,
      `  Andar: ${originAccess.floor ?? "—"} | Elevador: ${originAccess.hasElevator ?? "—"} | Estacionamento: ${originAccess.parkingDistance ?? "—"}`,
      `Destino: ${destAddr ?? "—"}`,
      `  Andar: ${destAccess.floor ?? "—"} | Elevador: ${destAccess.hasElevator ?? "—"} | Estacionamento: ${destAccess.parkingDistance ?? "—"}`,
      ...(dist ? [`Percurso: ${dist}`] : []),
    );
  } else {
    lines.push(
      "MORADA",
      `Serviço: ${order.address ?? "—"}`,
      `Localidade: ${order.city ?? "—"}`,
      `Andar: ${order.floor ?? "—"} | Elevador: ${order.hasElevator ?? "—"}`,
    );
  }

  lines.push(
    "",
    "VALORES",
    `Sem IVA: ${order.precoFinal ? `€${order.precoFinal}` : "—"}`,
    `Total c/ IVA: ${order.precoFinalIva ? `€${order.precoFinalIva}` : "—"}`,
    "",
    "EQUIPA",
    `Assistente: ${order.assignedToName ?? "—"}`,
    `Status: ${order.status}`,
    ...(order.notasInternas ? ["", `Notas internas: ${order.notasInternas}`] : []),
  );

  return lines.join("\n");
}

// POST /api/admin/pedidos/[id]/calendar
// Body: { scheduledDate, scheduledStartTime, scheduledEndTime, calendarNotes? }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { err, colab } = await authenticate(req);
  if (err) return err;

  const { id } = await params;
  const orderId = Number(id);

  const order = await getSimulatorOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  // Permission check: admin can schedule any order; assistant can only schedule orders assigned to them
  if (!colab!.isAdmin && order.assignedToId !== colab!.id) {
    return NextResponse.json({ error: "Sem permissão para agendar este pedido." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const scheduledDate = (body.scheduledDate as string | undefined)?.trim();
  const scheduledStartTime = (body.scheduledStartTime as string | undefined)?.trim();
  const scheduledEndTime = (body.scheduledEndTime as string | undefined)?.trim();
  const calendarNotes = (body.calendarNotes as string | undefined)?.trim() ?? null;

  if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) {
    return NextResponse.json({ error: "Data, hora de início e hora de fim são obrigatórios." }, { status: 400 });
  }

  // Parse rawOrderJson for address details
  let rawOrder: Record<string, any> = {};
  try { rawOrder = order.rawOrderJson ? JSON.parse(order.rawOrderJson) : {}; } catch {}

  const isMov = (order.serviceType ?? "").toLowerCase().replace(/[^a-z]/g, "").includes("mudanca") ||
                (order.serviceType ?? "").toLowerCase() === "moving";

  // Build event title: "Pedido #13 - Sílvia Marques - Mudança"
  const eventTitle = [
    `Pedido #${order.id}`,
    order.contactName,
    order.serviceType,
  ].filter(Boolean).join(" - ");

  // Build event description
  const description = [
    buildEventDescription(order, rawOrder),
    ...(calendarNotes ? ["", `OBSERVAÇÕES AGENDA\n${calendarNotes}`] : []),
  ].join("\n");

  // Build event location
  const location = isMov
    ? (rawOrder.originAddress?.formattedAddress ?? rawOrder.originAddress?.address ?? order.address ?? "")
    : (order.address ?? "");

  // Build Google Calendar URL (link-based, no API key needed)
  const startDt = toGcalDateTime(scheduledDate, scheduledStartTime);
  const endDt = toGcalDateTime(scheduledDate, scheduledEndTime);

  const gcalParams = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${startDt}/${endDt}`,
    details: description,
    location,
  });

  const calendarEventUrl = `https://calendar.google.com/calendar/render?${gcalParams.toString()}`;

  // Use a stable deterministic event ID so clicking again updates rather than creates
  // (since we use link-based approach, we store a composite key as the "event id")
  const calendarEventId = `clyon-order-${orderId}-${scheduledDate}`;
  const isUpdate = !!order.calendarEventId;
  const newCalendarStatus: "scheduled" | "updated" = isUpdate ? "updated" : "scheduled";

  // Persist to DB
  await updateSimulatorOrder(orderId, {
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    calendarEventId,
    calendarEventUrl,
    calendarStatus: newCalendarStatus,
    calendarNotes: calendarNotes ?? null,
  });

  const updatedOrder = await getSimulatorOrderById(orderId);

  return NextResponse.json({
    ok: true,
    message: isUpdate ? "Agenda atualizada com sucesso." : "Serviço adicionado à agenda com sucesso.",
    calendarEventId,
    calendarEventUrl,
    order: updatedOrder,
  });
}
