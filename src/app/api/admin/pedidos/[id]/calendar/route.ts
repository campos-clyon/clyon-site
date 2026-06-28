import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSimulatorOrderById, updateSimulatorOrder } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

const GEMINI_TIMEOUT_MS = 4000;

// ─── rawOrderJson helpers ─────────────────────────────────────────────────────

function safeParseRaw(json?: string | null): Record<string, any> {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

function isMudancaType(serviceType?: string | null): boolean {
  if (!serviceType) return false;
  const v = serviceType.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return v === "mudanca" || v === "moving";
}

function getMovingAddresses(order: Record<string, any>) {
  const raw = safeParseRaw(order.rawOrderJson);
  const originAddress: string =
    raw?.originAddress?.formattedAddress ||
    raw?.originAddress?.address ||
    (typeof raw?.originAddress === "string" ? raw.originAddress : "") ||
    order.address || "";
  const destinationAddress: string =
    raw?.destinationAddress?.formattedAddress ||
    raw?.destinationAddress?.address ||
    (typeof raw?.destinationAddress === "string" ? raw.destinationAddress : "") ||
    order.destinationAddress || "";
  const originAccess: Record<string, any>      = raw?.originAccess ?? {};
  const destinationAccess: Record<string, any> = raw?.destinationAccess ?? {};
  const movingDistance: Record<string, any>    = raw?.movingDistance ?? {};
  return { originAddress, destinationAddress, originAccess, destinationAccess, movingDistance };
}

function formatAccess(access: Record<string, any>, floor?: string | null): string {
  const lines: string[] = [];
  const f = access.floor ?? floor;
  if (f)                         lines.push(`Andar: ${f}`);
  if (access.hasElevator != null) lines.push(`Elevador: ${access.hasElevator}`);
  if (access.parkingDistance)    lines.push(`Estacionamento: ${access.parkingDistance}`);
  if (access.difficultAccess != null)
    lines.push(`Acesso difícil: ${access.difficultAccess ? "Sim" : "Não"}`);
  if (access.observations)       lines.push(`Observações: ${access.observations}`);
  return lines.join("\n");
}

/** Full structured description — used as Gemini fallback */
function buildStructuredDescription(
  order: Record<string, any>,
  calendarNotes?: string | null,
  orderId?: number
): string {
  const isMov = isMudancaType(order.serviceType);
  const id = orderId ?? order.id;
  const lines: string[] = [];

  lines.push(`Pedido #${id}`);
  lines.push("");
  lines.push("CLIENTE");
  lines.push(`Nome: ${order.contactName || "—"}`);
  lines.push(`Telefone: ${order.contactPhone || "—"}`);
  if (order.contactEmail) lines.push(`Email: ${order.contactEmail}`);
  lines.push("");
  lines.push("SERVICO");
  lines.push(`Tipo: ${order.serviceType || "—"}`);

  if (isMov) {
    const { originAddress, destinationAddress, originAccess, destinationAccess, movingDistance } =
      getMovingAddresses(order);
    lines.push("");
    lines.push("MORADAS DA MUDANÇA");
    lines.push("");
    lines.push("ORIGEM");
    lines.push(`Morada: ${originAddress || "—"}`);
    const oA = formatAccess(originAccess, order.floor);
    if (oA) lines.push(oA);
    lines.push("");
    lines.push("DESTINO");
    lines.push(`Morada: ${destinationAddress || "—"}`);
    const dA = formatAccess(destinationAccess);
    if (dA) lines.push(dA);
    const distText = movingDistance?.distanceText ?? (order.distanceKm ? `${order.distanceKm} km` : null);
    const durText  = movingDistance?.durationText ?? null;
    if (distText || durText) {
      lines.push("");
      lines.push("PERCURSO");
      if (distText) lines.push(`Distância: ${distText}`);
      if (durText)  lines.push(`Duração: ${durText}`);
    }
  } else {
    lines.push("");
    lines.push("MORADA");
    lines.push(`Morada: ${order.address || "—"}`);
    if (order.city)            lines.push(`Localidade: ${order.city}`);
    if (order.floor)           lines.push(`Andar: ${order.floor}`);
    if (order.hasElevator)     lines.push(`Elevador: ${order.hasElevator}`);
    if (order.parkingDistance) lines.push(`Estacionamento: ${order.parkingDistance}`);
  }

  if (order.precoFinal || order.precoFinalIva) {
    lines.push("");
    lines.push("VALORES");
    if (order.precoFinal)    lines.push(`Sem IVA: €${order.precoFinal}`);
    if (order.precoFinalIva) lines.push(`Total c/ IVA: €${order.precoFinalIva}`);
  }

  if (order.assignedToName) lines.push("", `Assistente: ${order.assignedToName}`);
  if (calendarNotes)        lines.push("", `OBSERVACOES\n${calendarNotes}`);
  if (order.description) {
    lines.push("", "DESCRIÇÃO ORIGINAL DO CLIENTE", order.description);
  }

  return lines.join("\n");
}

/** Generate Gemini operational summary with 4s timeout */
async function generateOperationalSummary(order: Record<string, any>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");
  const isMov = isMudancaType(order.serviceType);
  const { originAddress, destinationAddress, originAccess, destinationAccess, movingDistance } =
    isMov ? getMovingAddresses(order) : { originAddress: "", destinationAddress: "", originAccess: {}, destinationAccess: {}, movingDistance: {} };
  const parts: string[] = [
    `Cliente: ${order.contactName || "—"}`,
    `Serviço: ${order.serviceType || "—"}`,
    `Descrição original: ${order.description || "—"}`,
  ];
  if (isMov) {
    parts.push(`Origem: ${originAddress || "—"}`);
    parts.push(`Destino: ${destinationAddress || "—"}`);
    const oA = formatAccess(originAccess, order.floor);
    if (oA) parts.push(`Acesso origem:\n${oA}`);
    const dA = formatAccess(destinationAccess);
    if (dA) parts.push(`Acesso destino:\n${dA}`);
    const dist = movingDistance?.distanceText ?? (order.distanceKm ? `${order.distanceKm} km` : null);
    const dur  = movingDistance?.durationText ?? null;
    if (dist) parts.push(`Distância: ${dist}`);
    if (dur)  parts.push(`Duração estimada: ${dur}`);
  } else {
    parts.push(`Morada: ${order.address || "—"}`);
    if (order.city)            parts.push(`Localidade: ${order.city}`);
    if (order.floor)           parts.push(`Andar: ${order.floor}`);
    if (order.hasElevator)     parts.push(`Elevador: ${order.hasElevator}`);
    if (order.parkingDistance) parts.push(`Estacionamento: ${order.parkingDistance}`);
  }
  if (order.precoFinal || order.precoFinalIva) {
    parts.push(`Estimativa: ${order.precoFinal ? `€${order.precoFinal} s/ IVA` : ""} ${order.precoFinalIva ? `/ €${order.precoFinalIva} c/ IVA` : ""}`.trim());
  }
  const prompt = `És um assistente operacional da empresa de mudanças e serviços domésticos CLYON.
Cria um RESUMO OPERACIONAL claro e conciso em PT-PT para a equipa que vai executar o trabalho.
O resumo deve ter no máximo 200 palavras. Usa linguagem directa e prática.
Inclui: o que fazer, moradas, itens a transportar/recolher (se mencionados), avisos de acesso.
Não inventes informação. Não uses markdown. Usa texto simples.

Dados do pedido:
${parts.join("\n")}`;
  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });
  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), GEMINI_TIMEOUT_MS)
    ),
  ]);
  return (result as Awaited<ReturnType<typeof model.generateContent>>).response.text().trim();
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function authenticate(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  return { err: null, colab };
}

// ─── Private key normalisation ────────────────────────────────────────────────
// Env vars arrive from Vercel/hosting with literal "\n" instead of real
// newlines, and sometimes wrapped in quotes. This function handles both cases.
// We deliberately do NOT use crypto.createPrivateKey() because that path
// triggers the DECODER::unsupported error on OpenSSL 3 / Node 18+ when the
// key is PKCS#1. google.auth.JWT accepts the PEM string directly and handles
// both PKCS#1 and PKCS#8 transparently.

function normalizePrivateKey(raw?: string): string {
  if (!raw) {
    throw new Error("GOOGLE_PRIVATE_KEY não configurada.");
  }

  return raw
    .trim()
    .replace(/^["']|["']$/g, "")   // strip surrounding quotes if any
    .replace(/\\n/g, "\n")          // unescape literal \n sequences
    .replace(/\r/g, "");            // remove carriage returns
}

// ─── Google Calendar API client ───────────────────────────────────────────────
// Use google.auth.JWT instead of GoogleAuth so the PEM key is passed directly
// without going through Node's crypto subsystem (avoids DECODER::unsupported).

function getCalendarClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  if (!clientEmail) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL não configurado.");
  }

  console.log("[calendar] Service Account email:", clientEmail);
  console.log("[calendar] Private key starts OK:", privateKey.startsWith("-----BEGIN"));

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
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
  // calendarDescription: edited description from the modal preview textarea (takes precedence)
  const calendarDescriptionFromModal = (body.calendarDescription as string | undefined)?.trim() ?? null;

  const customerName = (body.customerName as string | undefined)?.trim() || order.contactName || "";
  const serviceType  = (body.serviceType as string | undefined)?.trim()  || order.serviceType || "";

  if (!scheduledDate || !scheduledStartTime || !scheduledEndTime) {
    return NextResponse.json(
      { error: "Data, hora de início e hora de fim são obrigatórios." },
      { status: 400 }
    );
  }

  const isMov = isMudancaType(order.serviceType);

  // ── Build event content ───────────────────────────────────────────────────

  const eventTitle =
    ((body.title as string | undefined)?.trim()) ||
    [`Pedido #${orderId}`, customerName, serviceType].filter(Boolean).join(" - ");

  // Use calendarDescription from modal if provided (user edited it), otherwise
  // generate fresh: try Gemini + structured data, fallback to structured data only.
  let description: string;
  if (calendarDescriptionFromModal) {
    description = calendarDescriptionFromModal;
    // If user provided description, append notes if not already included
    if (calendarNotes && !description.includes(calendarNotes)) {
      description += `\n\nOBSERVACOES\n${calendarNotes}`;
    }
  } else {
    // Try Gemini summary, fallback gracefully
    let operationalSummary = "";
    try {
      operationalSummary = await generateOperationalSummary(order as Record<string, any>);
    } catch (e: any) {
      console.error("[calendar/route] Gemini failed, using fallback:", e?.message);
    }

    const structuredPart = buildStructuredDescription(
      order as Record<string, any>,
      calendarNotes,
      orderId
    );

    if (operationalSummary) {
      description = `RESUMO OPERACIONAL\n${operationalSummary}\n\n${structuredPart}`;
    } else {
      description = structuredPart;
    }
  }

  // Location: for moving use origin address from rawOrderJson; otherwise use address
  const { originAddress: rawOrigin } = isMov
    ? getMovingAddresses(order as Record<string, any>)
    : { originAddress: "" };
  const location = isMov
    ? (rawOrigin || (order as any).address || "")
    : ((order as any).address || "");

  // ── Google Calendar API ───────────────────────────────────────────────────

  // Resolve calendarId — guard against placeholder values like "<id real...>"
  const calendarTargetId = (() => {
    const raw = (process.env.CLYON_GOOGLE_CALENDAR_ID ?? "")
      .trim()
      .replace(/^["'`]|["'`]$/g, "") // strip surrounding quotes
      .replace(/\r|\n/g, "");         // strip newlines
    // Reject placeholders (contain < or >) or empty string
    if (!raw || raw.includes("<") || raw.includes(">")) {
      return "geral@clyon.pt"; // confirmed real ID from Google Calendar settings
    }
    return raw;
  })();

  const calendarTargetName =
    (process.env.CLYON_GOOGLE_CALENDAR_NAME?.trim()) || "Agenda Organização CLYON";
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
      const lc = rawMsg.toLowerCase();

      // ── Specific error classification ──────────────────────────────────────
      // DECODER::unsupported — private key mal formatada
      if (lc.includes("decoder") || lc.includes("unsupported") || lc.includes("pkcs")) {
        return NextResponse.json(
          { error: "A chave da agenda CLYON está mal configurada. Verifique GOOGLE_PRIVATE_KEY." },
          { status: 500 }
        );
      }

      // API not enabled — surface enable URL
      if (lc.includes("has not been used") || lc.includes("is disabled")) {
        const projectMatch = rawMsg.match(/project\s+(\d+)/i);
        const projectId = projectMatch?.[1] ?? null;
        const enableUrl = projectId
          ? `https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview?project=${projectId}`
          : "https://console.developers.google.com/apis/api/calendar-json.googleapis.com/overview";
        return NextResponse.json(
          { error: "A Google Calendar API não está activada neste projecto Google Cloud.", errorCode: "calendar_api_disabled", enableUrl, projectId },
          { status: 403 }
        );
      }

      // 403 — calendar not shared with Service Account
      if (apiErr?.code === 403) {
        return NextResponse.json(
          { error: "Sem permissão para aceder à agenda. Partilhe a agenda com o email da Service Account." },
          { status: 403 }
        );
      }

      // invalid_grant — key/email mismatch
      if (lc.includes("invalid_grant") || lc.includes("invalid grant")) {
        return NextResponse.json(
          { error: "Credenciais inválidas (invalid_grant). Verifique se GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY correspondem." },
          { status: 401 }
        );
      }

      // 404 notFound — wrong calendarId or SA not shared on the calendar
      if (apiErr?.code === 404 || lc.includes("notfound") || lc.includes("not found")) {
        const saEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ?? "email da Service Account";
        return NextResponse.json(
          {
            error: `Agenda não encontrada: ID="${calendarTargetId}" (len=${calendarTargetId.length}). Certifique-se que "${saEmail}" tem permissão "Fazer alterações nos eventos" na agenda.`,
            errorCode: "calendar_not_found",
          },
          { status: 404 }
        );
      }

      // Generic fallback
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
