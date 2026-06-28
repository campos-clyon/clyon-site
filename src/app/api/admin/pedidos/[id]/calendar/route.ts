import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import crypto from "crypto";
import { getSimulatorOrderById, updateSimulatorOrder } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function authenticate(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  return { err: null, colab };
}

// ─── Private key normalisation ────────────────────────────────────────────────
// Env vars often arrive with literal "\n" instead of real newlines.
// Additionally, some providers export PKCS#1 ("RSA PRIVATE KEY") but
// google-auth-library / Node 18+ crypto requires PKCS#8 ("PRIVATE KEY").
// We convert on the fly using Node's native crypto module.

function normalisePrivateKey(raw: string): string {
  // 1. Unescape literal \n sequences from env var storage
  let key = raw.replace(/\\n/g, "\n").trim();

  // 2. If the key is still a single line without headers, wrap it
  if (!key.includes("-----BEGIN")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }

  // 3. Convert PKCS#1 (RSA PRIVATE KEY) → PKCS#8 (PRIVATE KEY) when needed
  //    Node 18+ rejects PKCS#1 in newer OpenSSL builds with DECODER::unsupported
  if (key.includes("BEGIN RSA PRIVATE KEY")) {
    try {
      const keyObject = crypto.createPrivateKey({ key, format: "pem", type: "pkcs1" });
      key = keyObject.export({ type: "pkcs8", format: "pem" }) as string;
    } catch (convErr) {
      // Conversion failed — return as-is and let google-auth handle the error message
      console.error("[calendar/route] PKCS#1→PKCS#8 conversion failed:", convErr);
    }
  }

  return key;
}

// ─── Google Calendar API client ───────────────────────────────────────────────

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_PRIVATE_KEY?.trim() ?? "";

  if (!email || !rawKey) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY são obrigatórios.");
  }

  const privateKey = normalisePrivateKey(rawKey);

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
        const retryMsg: string = retryErr?.message ?? String(retryErr);
        const retryDisabled =
          retryMsg.toLowerCase().includes("has not been used") ||
          retryMsg.toLowerCase().includes("is disabled");
        if (retryDisabled) {
          const m = retryMsg.match(/project\s+(\d+)/i);
          const pid = m?.[1] ?? null;
          return NextResponse.json(
            {
              error: "A Google Calendar API não está activada neste projecto Google Cloud.",
              errorCode: "calendar_api_disabled",
              enableUrl: pid
                ? `https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=${pid}`
                : "https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview",
              projectId: pid,
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: `Erro ao criar evento na Google Calendar API: ${retryMsg}` },
          { status: 500 }
        );
      }
    } else {
      const rawMsg: string = apiErr?.errors?.[0]?.message ?? apiErr?.message ?? "Erro desconhecido na Google Calendar API.";

      // Detect "API not enabled" error from Google and surface the enable URL
      const isApiDisabled =
        rawMsg.toLowerCase().includes("has not been used") ||
        rawMsg.toLowerCase().includes("is disabled") ||
        apiErr?.code === 403;

      // Extract project ID from the error message if present (e.g. "project 443649873745")
      const projectMatch = rawMsg.match(/project\s+(\d+)/i);
      const projectId = projectMatch?.[1] ?? null;
      const enableUrl = projectId
        ? `https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=${projectId}`
        : "https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview";

      if (isApiDisabled) {
        return NextResponse.json(
          {
            error: "A Google Calendar API não está activada neste projecto Google Cloud.",
            errorCode: "calendar_api_disabled",
            enableUrl,
            projectId,
          },
          { status: 403 }
        );
      }

      return NextResponse.json({ error: rawMsg }, { status: 500 });
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
