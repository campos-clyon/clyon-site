import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSimulatorOrderById } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

const GEMINI_TIMEOUT_MS = 4000;

// ── helpers ────────────────────────────────────────────────────────────────────

function safeParseRaw(json?: string | null): Record<string, any> {
  try { return json ? JSON.parse(json) : {}; } catch { return {}; }
}

function isMudancaType(serviceType?: string | null): boolean {
  if (!serviceType) return false;
  const v = serviceType.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return v === "mudanca" || v === "moving";
}

/** Extract moving addresses from rawOrderJson with multiple fallback levels */
function getMovingAddresses(order: Record<string, any>) {
  const raw = safeParseRaw(order.rawOrderJson);

  const originAddress: string =
    raw?.originAddress?.formattedAddress ||
    raw?.originAddress?.address ||
    (typeof raw?.originAddress === "string" ? raw.originAddress : "") ||
    order.address ||
    "";

  const destinationAddress: string =
    raw?.destinationAddress?.formattedAddress ||
    raw?.destinationAddress?.address ||
    (typeof raw?.destinationAddress === "string" ? raw.destinationAddress : "") ||
    order.destinationAddress ||
    "";

  const originAccess: Record<string, any> = raw?.originAccess ?? {};
  const destinationAccess: Record<string, any> = raw?.destinationAccess ?? {};
  const movingDistance: Record<string, any> = raw?.movingDistance ?? {};

  return { originAddress, destinationAddress, originAccess, destinationAccess, movingDistance };
}

function formatAccess(access: Record<string, any>, floor?: string | null): string {
  const lines: string[] = [];
  const f = access.floor ?? floor;
  if (f) lines.push(`Andar: ${f}`);
  if (access.hasElevator != null) lines.push(`Elevador: ${access.hasElevator}`);
  if (access.parkingDistance) lines.push(`Estacionamento: ${access.parkingDistance}`);
  if (access.difficultAccess != null) lines.push(`Acesso difícil: ${access.difficultAccess ? "Sim" : "Não"}`);
  if (access.observations) lines.push(`Observações: ${access.observations}`);
  return lines.join("\n");
}

/** Structured fallback description — no Gemini */
export function buildDescriptionFallback(order: Record<string, any>): string {
  const isMov = isMudancaType(order.serviceType);
  const lines: string[] = [];

  lines.push(`Pedido #${order.id}`);
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
    const originAccessStr = formatAccess(originAccess, order.floor);
    if (originAccessStr) lines.push(originAccessStr);

    lines.push("");
    lines.push("DESTINO");
    lines.push(`Morada: ${destinationAddress || "—"}`);
    const destAccessStr = formatAccess(destinationAccess);
    if (destAccessStr) lines.push(destAccessStr);

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
    if (order.city) lines.push(`Localidade: ${order.city}`);
    if (order.floor) lines.push(`Andar: ${order.floor}`);
    if (order.hasElevator) lines.push(`Elevador: ${order.hasElevator}`);
    if (order.parkingDistance) lines.push(`Estacionamento: ${order.parkingDistance}`);
  }

  if (order.precoFinal || order.precoFinalIva) {
    lines.push("");
    lines.push("VALORES");
    if (order.precoFinal)    lines.push(`Sem IVA: €${order.precoFinal}`);
    if (order.precoFinalIva) lines.push(`Total c/ IVA: €${order.precoFinalIva}`);
  }

  if (order.assignedToName) lines.push("", `Assistente: ${order.assignedToName}`);

  if (order.description) {
    lines.push("");
    lines.push("DESCRIÇÃO ORIGINAL DO CLIENTE");
    lines.push(order.description);
  }

  return lines.join("\n");
}

/** Generate operational summary using Gemini with 4s timeout */
async function generateOperationalSummary(order: Record<string, any>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY não configurada");

  const isMov = isMudancaType(order.serviceType);
  const { originAddress, destinationAddress, originAccess, destinationAccess, movingDistance } =
    isMov ? getMovingAddresses(order) : { originAddress: "", destinationAddress: "", originAccess: {}, destinationAccess: {}, movingDistance: {} };

  const contextParts: string[] = [
    `Cliente: ${order.contactName || "—"}`,
    `Serviço: ${order.serviceType || "—"}`,
    `Descrição original: ${order.description || "—"}`,
  ];

  if (isMov) {
    contextParts.push(`Origem: ${originAddress || "—"}`);
    contextParts.push(`Destino: ${destinationAddress || "—"}`);
    const originAccessStr = formatAccess(originAccess, order.floor);
    if (originAccessStr) contextParts.push(`Acesso origem:\n${originAccessStr}`);
    const destAccessStr = formatAccess(destinationAccess);
    if (destAccessStr) contextParts.push(`Acesso destino:\n${destAccessStr}`);
    const distText = movingDistance?.distanceText ?? (order.distanceKm ? `${order.distanceKm} km` : null);
    const durText  = movingDistance?.durationText ?? null;
    if (distText) contextParts.push(`Distância: ${distText}`);
    if (durText)  contextParts.push(`Duração estimada: ${durText}`);
  } else {
    contextParts.push(`Morada: ${order.address || "—"}`);
    if (order.city) contextParts.push(`Localidade: ${order.city}`);
    if (order.floor) contextParts.push(`Andar: ${order.floor}`);
    if (order.hasElevator) contextParts.push(`Elevador: ${order.hasElevator}`);
    if (order.parkingDistance) contextParts.push(`Estacionamento: ${order.parkingDistance}`);
  }

  if (order.precoFinal || order.precoFinalIva) {
    contextParts.push(`Estimativa: ${order.precoFinal ? `€${order.precoFinal} s/ IVA` : ""} ${order.precoFinalIva ? `/ €${order.precoFinalIva} c/ IVA` : ""}`.trim());
  }

  const prompt = `És um assistente operacional da empresa de mudanças e serviços domésticos CLYON.
Cria um RESUMO OPERACIONAL claro e conciso em PT-PT para a equipa que vai executar o trabalho.
O resumo deve ter no máximo 200 palavras. Usa linguagem directa e prática.
Inclui: o que fazer, moradas, itens a transportar/recolher (se mencionados), avisos de acesso.
Não inventes informação. Não uses markdown. Usa texto simples.

Dados do pedido:
${contextParts.join("\n")}`;

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), GEMINI_TIMEOUT_MS)
    ),
  ]);

  const text = (result as Awaited<ReturnType<typeof model.generateContent>>).response.text().trim();
  return text;
}

// ── GET /api/admin/pedidos/[id]/calendar/preview ──────────────────────────────
// Returns the full calendar description (Gemini summary + structured data)
// that will be sent to Google Calendar. Used by the modal to show a preview
// the user can edit before scheduling.

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const orderId = Number(id);
  const order = await getSimulatorOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  const isMov = isMudancaType(order.serviceType);
  const { originAddress, destinationAddress, originAccess, destinationAccess, movingDistance } =
    isMov ? getMovingAddresses(order as Record<string, any>) : { originAddress: "", destinationAddress: "", originAccess: {}, destinationAccess: {}, movingDistance: {} };

  // Try Gemini first; fallback to structured text on any error
  let operationalSummary = "";
  let geminiUsed = false;
  try {
    operationalSummary = await generateOperationalSummary(order as Record<string, any>);
    geminiUsed = true;
  } catch (e: any) {
    console.error("[calendar/preview] Gemini failed, using fallback:", e?.message);
    // fallback: just use description as-is in the structured description
  }

  // Build full calendar description
  const descLines: string[] = [];

  if (operationalSummary) {
    descLines.push("RESUMO OPERACIONAL");
    descLines.push(operationalSummary);
    descLines.push("");
  }

  descLines.push(`Pedido #${orderId}`);
  descLines.push("");
  descLines.push("CLIENTE");
  descLines.push(`Nome: ${order.contactName || "—"}`);
  descLines.push(`Telefone: ${order.contactPhone || "—"}`);
  if (order.contactEmail) descLines.push(`Email: ${order.contactEmail}`);
  descLines.push("");
  descLines.push("SERVICO");
  descLines.push(`Tipo: ${order.serviceType || "—"}`);

  if (isMov) {
    descLines.push("");
    descLines.push("MORADAS DA MUDANÇA");
    descLines.push("");
    descLines.push("ORIGEM");
    descLines.push(`Morada: ${originAddress || "—"}`);
    const oAccess = formatAccess(originAccess, (order as any).floor);
    if (oAccess) descLines.push(oAccess);
    descLines.push("");
    descLines.push("DESTINO");
    descLines.push(`Morada: ${destinationAddress || "—"}`);
    const dAccess = formatAccess(destinationAccess);
    if (dAccess) descLines.push(dAccess);

    const distText = movingDistance?.distanceText ?? ((order as any).distanceKm ? `${(order as any).distanceKm} km` : null);
    const durText  = movingDistance?.durationText ?? null;
    if (distText || durText) {
      descLines.push("");
      descLines.push("PERCURSO");
      if (distText) descLines.push(`Distância: ${distText}`);
      if (durText)  descLines.push(`Duração: ${durText}`);
    }
  } else {
    descLines.push("");
    descLines.push("MORADA");
    descLines.push(`Morada: ${(order as any).address || "—"}`);
    if ((order as any).city) descLines.push(`Localidade: ${(order as any).city}`);
    if ((order as any).floor) descLines.push(`Andar: ${(order as any).floor}`);
    if ((order as any).hasElevator) descLines.push(`Elevador: ${(order as any).hasElevator}`);
    if ((order as any).parkingDistance) descLines.push(`Estacionamento: ${(order as any).parkingDistance}`);
  }

  if ((order as any).precoFinal || (order as any).precoFinalIva) {
    descLines.push("");
    descLines.push("VALORES");
    if ((order as any).precoFinal)    descLines.push(`Sem IVA: €${(order as any).precoFinal}`);
    if ((order as any).precoFinalIva) descLines.push(`Total c/ IVA: €${(order as any).precoFinalIva}`);
  }

  if ((order as any).assignedToName) descLines.push("", `Assistente: ${(order as any).assignedToName}`);

  if (order.description) {
    descLines.push("");
    descLines.push("DESCRIÇÃO ORIGINAL DO CLIENTE");
    descLines.push(order.description);
  }

  const calendarDescription = descLines.join("\n");

  return NextResponse.json({
    ok: true,
    calendarDescription,
    geminiUsed,
    isMov,
    originAddress,
    destinationAddress,
  });
}
