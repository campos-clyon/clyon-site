import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getSimulatorOrderById, updateSimulatorOrder } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function authenticate(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  return { err: null, colab };
}

// ─── Google Calendar API client ───────────────────────────────────────────────

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  // Replace literal \n escape sequences that can appear when pasting private keys into env vars
  const rawKey = process.env.GOOGLE_PRIVATE_KEY?.trim() ?? "";
  const privateKey = rawKey.startsWith("-----")
    ? rawKey
    : rawKey.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY são obrigatórios.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

/**
 * Build a Google Calendar event link from a calendar ID and event ID.
 * The compact event ID format needed for the eid param is base64url of "<eventId> <calendarId>".
 */
function buildEventLink(calendarId: string, gcalEventId: string): string {
  try {
    const eid = Buffer.from(`${gcalEventId} ${calendarId}`).toString("base64url");
    return `https://calendar.google.com/calendar/event?eid=${eid}`;
  } catch {
    return `https://calendar.google.com/calendar/r`;
  }
}

/**
 * Converts "2026-07-03" + "09:00" → "2026-07-03T09:00:00" (local time, no TZ suffix).
 * Google Calendar API uses RFC3339 with timeZone specified separately.
 */
function toRfc3339Local(date: string, time: string): string {
  const timePadded = time.length === 5 ? `${time}:00` : time;
  return `${date}T${timePadded}`;
}

// ─── POST /api/admin/pedidos/[id]/calendar ────────────────────────────────────
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

  // Permission: admin can schedule any order; assistant only orders assigned to them
  if (!colab!.isAdmin && order.assignedToId !== colab!.id) {
    return NextResponse.json({ error: "Sem permissão para agendar este pedido." }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const scheduledDate      = (body.scheduledDate as string | undefined)?.trim();
  const scheduledStartTime = (body.scheduledStartTime as string | undefined)?.trim();
  const scheduledEndTime   = (body.scheduledEndTime as string | undefined)?.trim();
  const calendarNotes      = (body.calendarNotes as string | undefined)?.trim() ?? null;

  // Edited fields from confirm modal (fall back to order data when absent)
  const customerName  = (body.customerName as string | undefined)?.trim()       || order.contactName    || "";
  const customerPhone = (body.customerPhone as string | undefined)?.trim()      || order.contactPhone   || "";
  const customerEmail = (body.customerEmail as string | undefined)?.trim()      || order.contactEmail   || "";
  const serviceType   = (body.serviceType as string | undefined)?.trim()        || order.serviceType    || "";
  const serviceDesc   = (body.serviceDescription as string | undefined)?.trim() || order.description    || "";
  const addrAddress   = (body.address as string | undefined)?.trim()            || order.address        || "";
  const originAddr    = (body.originAddress as string | undefined)?.trim()      || "";
  const destAddr      = (body.destinationAddress as string | undefined)?.trim() || "";
  const routeText     = (body.route as string | undefined)?.trim()              || "";

  if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) {
    return NextResponse.json(
      { error: "Data, hora de início e hora de fim são obrigatórios." },
      { status: 400 }
    );
  }

  const isMov =
    serviceType.toLowerCase().replace(/[^a-z]/g, "").includes("mudanca") ||
    (order.serviceType ?? "").toLowerCase() === "moving" ||
    (originAddr !== "" && destAddr !== "");

  // ── Build event content ───────────────────────────────────────────────────

  const eventTitle =
    ((body.title as string | undefined)?.trim()) ||
    [`Pedido #${orderId}`, customerName, serviceType].filter(Boolean).join(" - ");

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
  const location = isMov ? (originAddr || addrAddress) : addrAddress;

  // ── Google Calendar API ───────────────────────────────────────────────────

  const calendarTargetId   = process.env.CLYON_GOOGLE_CALENDAR_ID?.trim()   || "primary";
  const calendarTargetName = process.env.CLYON_GOOGLE_CALENDAR_NAME?.trim() || null;
  const timeZone           = "Europe/Lisbon";

  let gcalEventId: string;
  let calendarEventUrl: string;
  const isUpdate = !!order.calendarEventId && !order.calendarEventId.startsWith("clyon-order-");
  const newCalendarStatus: "scheduled" | "updated" = isUpdate ? "updated" : "scheduled";

  try {
    const calendar = getCalendarClient();

    const eventBody = {
      summary: eventTitle,
      description,
      location,
      start: {
        dateTime: toRfc3339Local(scheduledDate, scheduledStartTime),
        timeZone,
      },
      end: {
        dateTime: toRfc3339Local(scheduledDate, scheduledEndTime),
        timeZone,
      },
      // Add the assistant/admin who scheduled this as an attendee note in description only
      // (no attendee invites — the SA owns the event on behalf of the org calendar)
    };

    let apiResponse;

    if (isUpdate && order.calendarEventId) {
      // Update existing event
      apiResponse = await calendar.events.update({
        calendarId: calendarTargetId,
        eventId: order.calendarEventId,
        requestBody: eventBody,
      });
    } else {
      // Create new event
      apiResponse = await calendar.events.insert({
        calendarId: calendarTargetId,
        requestBody: eventBody,
      });
    }

    gcalEventId     = apiResponse.data.id!;
    calendarEventUrl = apiResponse.data.htmlLink ?? buildEventLink(calendarTargetId, gcalEventId);

  } catch (apiErr: any) {
    console.error("[calendar/route] Google Calendar API error:", apiErr?.message ?? apiErr);

    // If update failed because the event no longer exists (410/404), create fresh
    if (isUpdate && (apiErr?.code === 410 || apiErr?.code === 404)) {
      try {
        const calendar = getCalendarClient();
        const freshResp = await calendar.events.insert({
          calendarId: calendarTargetId,
          requestBody: {
            summary: eventTitle,
            description,
            location,
            start: { dateTime: toRfc3339Local(scheduledDate, scheduledStartTime), timeZone },
            end:   { dateTime: toRfc3339Local(scheduledDate, scheduledEndTime),   timeZone },
          },
        });
        gcalEventId      = freshResp.data.id!;
        calendarEventUrl = freshResp.data.htmlLink ?? buildEventLink(calendarTargetId, gcalEventId);
      } catch (retryErr: any) {
        return NextResponse.json(
          { error: `Erro ao criar evento na Google Calendar API: ${retryErr?.message ?? retryErr}` },
          { status: 500 }
        );
      }
    } else {
      const msg = apiErr?.errors?.[0]?.message ?? apiErr?.message ?? "Erro desconhecido na Google Calendar API.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // ── Persist to DB ─────────────────────────────────────────────────────────

  await updateSimulatorOrder(orderId, {
    scheduledDate,
    scheduledStartTime,
    scheduledEndTime,
    calendarEventId:   gcalEventId,
    calendarEventUrl,
    calendarStatus:    newCalendarStatus,
    calendarNotes:     calendarNotes ?? null,
    calendarTargetId,
    calendarTargetName,
  });

  const updatedOrder = await getSimulatorOrderById(orderId);

  return NextResponse.json({
    ok: true,
    message: isUpdate
      ? "Evento atualizado na agenda da organização com sucesso."
      : "Evento criado na agenda da organização com sucesso.",
    calendarEventId:   gcalEventId,
    calendarEventUrl,
    calendarTargetId,
    calendarTargetName,
    order: updatedOrder,
  });
}
