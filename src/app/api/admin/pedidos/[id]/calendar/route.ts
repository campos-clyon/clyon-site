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



// POST /api/admin/pedidos/[id]/calendar
// Body (from confirm modal):
//   title?, scheduledDate, scheduledStartTime, scheduledEndTime,
//   customerName?, customerPhone?, customerEmail?,
//   serviceType?, serviceDescription?,
//   address?, originAddress?, destinationAddress?, route?,
//   calendarNotes?
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

  // Edited fields from confirm modal (fall back to order data when absent)
  const customerName     = (body.customerName as string | undefined)?.trim()       || order.contactName       || "";
  const customerPhone    = (body.customerPhone as string | undefined)?.trim()      || order.contactPhone      || "";
  const customerEmail    = (body.customerEmail as string | undefined)?.trim()      || order.contactEmail      || "";
  const serviceType      = (body.serviceType as string | undefined)?.trim()        || order.serviceType       || "";
  const serviceDesc      = (body.serviceDescription as string | undefined)?.trim() || order.description       || "";
  const addrAddress      = (body.address as string | undefined)?.trim()            || order.address           || "";
  const originAddr       = (body.originAddress as string | undefined)?.trim()      || "";
  const destAddr         = (body.destinationAddress as string | undefined)?.trim() || "";
  const routeText        = (body.route as string | undefined)?.trim()              || "";

  if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) {
    return NextResponse.json({ error: "Data, hora de início e hora de fim são obrigatórios." }, { status: 400 });
  }

  const isMov = (serviceType).toLowerCase().replace(/[^a-z]/g, "").includes("mudanca") ||
                (order.serviceType ?? "").toLowerCase() === "moving" ||
                (originAddr !== "" && destAddr !== "");

  // Build event title from edited field or fallback
  const eventTitle = ((body.title as string | undefined)?.trim()) ||
    [`Pedido #${orderId}`, customerName, serviceType].filter(Boolean).join(" - ");

  // Build description from edited fields
  const descLines: string[] = [
    `Pedido #${orderId}`,
    "",
    "CLIENTE",
    `Nome: ${customerName || "—"}`,
    `Telefone: ${customerPhone || "—"}`,
    ...(customerEmail ? [`Email: ${customerEmail}`] : []),
    "",
    "SERVICO",
    `Tipo: ${serviceType || "—"}`,
    `Descricao: ${serviceDesc || "—"}`,
    "",
  ];

  if (isMov) {
    descLines.push(
      "MORADA",
      "",
      "ORIGEM",
      `Morada: ${originAddr || "—"}`,
      "",
      "DESTINO",
      `Morada: ${destAddr || "—"}`,
      ...(routeText ? ["", `PERCURSO: ${routeText}`] : []),
    );
  } else {
    descLines.push(
      "MORADA",
      `Morada: ${addrAddress || "—"}`,
      `Localidade: ${order.city || "—"}`,
    );
  }

  if (order.precoFinal || order.precoFinalIva) {
    descLines.push(
      "",
      "VALORES",
      `Sem IVA: ${order.precoFinal ? `€${order.precoFinal}` : "—"}`,
      `Total c/ IVA: ${order.precoFinalIva ? `€${order.precoFinalIva}` : "—"}`,
    );
  }

  if (order.assignedToName) {
    descLines.push("", `Assistente: ${order.assignedToName}`);
  }

  if (calendarNotes) {
    descLines.push("", `OBSERVACOES\n${calendarNotes}`);
  }

  const description = descLines.join("\n");

  // Location: for Mudanca use origin; otherwise use single address
  const location = isMov ? (originAddr || addrAddress) : addrAddress;

  // Build Google Calendar URL (link-based, no API key needed)
  const startDt = toGcalDateTime(scheduledDate, scheduledStartTime);
  const endDt = toGcalDateTime(scheduledDate, scheduledEndTime);

  // ── Target calendar (CLYON org calendar) ─────────────────────────────────
  const calendarTargetId   = process.env.CLYON_GOOGLE_CALENDAR_ID?.trim()   || null;
  const calendarTargetName = process.env.CLYON_GOOGLE_CALENDAR_NAME?.trim() || null;

  const gcalParams = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle,
    dates: `${startDt}/${endDt}`,
    details: description,
    location,
  });

  // When a specific calendar ID is configured, add cid= so Google Calendar
  // pre-selects that calendar in the "Save to" dropdown.
  if (calendarTargetId) {
    gcalParams.set("cid", calendarTargetId);
  }

  const calendarEventUrl = `https://calendar.google.com/calendar/render?${gcalParams.toString()}`;

  // Stable deterministic key — updated on re-schedule
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
    calendarTargetId,
    calendarTargetName,
  });

  const updatedOrder = await getSimulatorOrderById(orderId);

  return NextResponse.json({
    ok: true,
    message: isUpdate ? "Agenda atualizada com sucesso." : "Servico adicionado à agenda com sucesso.",
    calendarEventId,
    calendarEventUrl,
    calendarTargetId,
    calendarTargetName,
    order: updatedOrder,
  });
}
