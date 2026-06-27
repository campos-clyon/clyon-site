import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import type { OrderData, EstimateResult } from "../../../simulador/types";
import {
  getActivePricingRulesForGemini,
  createPricingSnapshot,
  calculateFastEstimate,
} from "@/lib/pricing-helper";

// Gemini abortado após este tempo — cliente nunca fica preso
const GEMINI_TIMEOUT_MS = 4000;

export async function POST(req: NextRequest) {
  let order: OrderData;
  try {
    const body = await req.json();
    order = body.order;
  } catch {
    return Response.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  // ── 1. Estimativa rápida local (sempre calculada, < 50ms) ────────────────
  const fastEstimate = await calculateFastEstimate(order as never);

  // ── 2. Remover ficheiros pesados antes de enviar ao Gemini ───────────────
  // Apenas metadados, nunca base64 ou blobs (evita timeout por payload enorme)
  const orderForGemini: OrderData = {
    ...order,
    files: order.files?.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      mimeType: f.mimeType,
      // base64 e previewUrl excluídos propositadamente
    })) ?? [],
  };

  // ── 3. Chamar Gemini com timeout rígido de 4s ────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    // Sem chave → devolver estimativa local imediatamente
    return Response.json({
      ...fastEstimate,
      internalNotes: [
        ...fastEstimate.internalNotes,
        "GEMINI_API_KEY não configurada — usada estimativa local.",
      ],
    });
  }

  try {
    const pricingRules = await getActivePricingRulesForGemini();
    const pricingSnapshot = await createPricingSnapshot();
    const formattedData = formatOrderDataForPrompt(orderForGemini);
    const prompt = buildAnalysisPrompt(formattedData, pricingRules);

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    // Race: Gemini vs timeout
    const geminiResult = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("GEMINI_TIMEOUT")), GEMINI_TIMEOUT_MS)
      ),
    ]);

    const responseText = (geminiResult as Awaited<ReturnType<typeof model.generateContent>>).response.text();
    const analysis = parseGeminiResponse(responseText);

    return Response.json({
      ...analysis,
      analysisSource: "gemini" as const,
      internalNotes: [
        ...(analysis.internalNotes || []),
        `Preçário usado: ${pricingSnapshot?.timestamp || "default"}`,
      ],
      _pricingSnapshot: pricingSnapshot ?? undefined,
    } satisfies EstimateResult);

  } catch (error) {
    const isTimeout = error instanceof Error && error.message === "GEMINI_TIMEOUT";
    console.error(
      "[v0] /api/simulator/analyze:",
      isTimeout ? "⏱ Gemini timeout — usando estimativa local" : "❌ Erro Gemini",
      isTimeout ? "" : error
    );

    // Fallback: devolver estimativa local com nota interna
    return Response.json({
      ...fastEstimate,
      analysisSource: "timeout_fallback" as const,
      internalNotes: [
        ...fastEstimate.internalNotes,
        isTimeout
          ? `Gemini não respondeu em ${GEMINI_TIMEOUT_MS}ms. Foi usada estimativa rápida local.`
          : `Erro Gemini: ${error instanceof Error ? error.message : String(error)}. Foi usada estimativa rápida local.`,
      ],
    });
  }
}

function formatOrderDataForPrompt(order: OrderData): string {
  const lines = [
    "=== DADOS DO PEDIDO ===",
    "",
    `Tipo de Serviço: ${getServiceName(order.serviceType)}`,
    `Descrição: ${order.description || "(não fornecida)"}`,
  ];

  // Adicionar campos específicos de entulho se aplicável
  if (order.serviceType === "recolha_entulho") {
    lines.push(
      "",
      "=== DETALHES DO ENTULHO ===",
      `Estado do Entulho: ${
        order.entulhoState === "ensacado"
          ? "Já ensacado (2.50€/saco)"
          : order.entulhoState === "chao"
          ? "No chão/Por ensacar (3.00€/saco)"
          : order.entulhoState === "misto"
          ? "Misto (alguns ensacados, alguns não)"
          : "(não especificado)"
      }`,
      `Quantidade de Sacos: ${order.entulhoQuantidade || "(não fornecida)"}`,
    );
  }

  if (order.serviceType === "mudanca") {
    // Mudança: dois endereços + acesso separado
    const elevLabel = (v?: string) =>
      v === "yes" ? "Sim, funciona" : v === "small" ? "Sim, pequeno" : v === "no" ? "Não tem" : "(não especificado)";
    const parkLabel = (v?: string) =>
      v === "door" ? "À porta" : v === "under_20m" ? "Até 20m" : v === "over_30m" ? "Mais de 30m" : v === "difficult" ? "Difícil" : "(não especificado)";

    lines.push(
      "",
      "=== MUDANÇA: MORADA DE ORIGEM ===",
      `Morada: ${order.originAddress?.formattedAddress || "(não fornecida)"}`,
      `Localidade: ${order.originAddress?.city || "(não fornecida)"}`,
      `Código Postal: ${order.originAddress?.postalCode || "(não fornecido)"}`,
      "",
      "=== MUDANÇA: ACESSO NA ORIGEM ===",
      `Andar: ${order.originAccess?.floor || "(não fornecido)"}`,
      `Elevador: ${elevLabel(order.originAccess?.hasElevator)}`,
      `Estacionamento: ${parkLabel(order.originAccess?.parkingDistance)}`,
      `Acesso Difícil: ${order.originAccess?.difficultAccess ? "Sim" : "Não"}`,
      "",
      "=== MUDANÇA: MORADA DE DESTINO ===",
      `Morada: ${order.destinationAddress?.formattedAddress || "(não fornecida)"}`,
      `Localidade: ${order.destinationAddress?.city || "(não fornecida)"}`,
      `Código Postal: ${order.destinationAddress?.postalCode || "(não fornecido)"}`,
      "",
      "=== MUDANÇA: ACESSO NO DESTINO ===",
      `Andar: ${order.destinationAccess?.floor || "(não fornecido)"}`,
      `Elevador: ${elevLabel(order.destinationAccess?.hasElevator)}`,
      `Estacionamento: ${parkLabel(order.destinationAccess?.parkingDistance)}`,
      `Acesso Difícil: ${order.destinationAccess?.difficultAccess ? "Sim" : "Não"}`,
      "",
      "=== MUDANÇA: PERCURSO ===",
      `Distância Origem→Destino: ${order.movingDistance?.distanceKm ? `${order.movingDistance.distanceKm} km` : "(não calculada)"}`,
      `Duração Estimada: ${order.movingDistance?.durationText || "(não calculada)"}`,
    );
  } else {
    lines.push(
      "",
      "=== LOCALIZAÇÃO ===",
      `Morada: ${order.address?.formattedAddress || "(não fornecida)"}`,
      `Localidade: ${order.address?.city || "(não fornecida)"}`,
      `Código Postal: ${order.address?.postalCode || "(não fornecido)"}`,
      `Distância da Base: ${order.distanceFromBase?.distanceKm ? `${order.distanceFromBase.distanceKm} km` : "(não calculada)"}`,
      "",
      "=== CONDIÇÕES DE ACESSO ===",
      `Andar: ${order.floor || "(não fornecido)"}`,
      `Elevador: ${order.hasElevator ? "Sim" : "Não / Não especificado"}`,
      `Estacionamento: ${order.parkingDistance || "(não especificado)"}`,
      `Acesso Difícil: ${order.needsDismantling ? "Sim" : "Não"}`,
    );
  }

  lines.push(
    "",
    "=== URGÊNCIA ===",
    `Urgência: ${order.urgency || "(não especificada)"}`,
    "",
    "=== ITENS ===",
    `Objetos Pesados: ${order.heavyItems?.length ? order.heavyItems.join(", ") : "Nenhum especificado"}`,
    `Fotos/Vídeos Enviados: ${order.files?.length || 0}`,
  );

  return lines.join("\n");
}

function buildAnalysisPrompt(formattedData: string, pricingRules: string): string {
  return `Você é um analista de preços para uma empresa de serviços de transporte e limpeza chamada CLYON, com base em Fernão Ferro, Portugal.

Sua tarefa é analisar o pedido abaixo e retornar APENAS um JSON válido com os seguintes campos:

{
  "status": "estimated" | "onsite_required" | "needs_more_info",
  "estimatedPriceWithoutVat": número ou null,
  "vatAmount": número ou null,
  "estimatedPriceWithVat": número ou null,
  "difficultyLevel": 1-5,
  "summary": "string com resumo da análise",
  "assumptions": ["array", "de", "pressupostos"],
  "missingFields": ["array", "de", "campos faltantes"],
  "customerMessage": "mensagem para o cliente",
  "internalNotes": ["notas internas"]
}

═══════════════════════════════════════════════════════════
PREÇÁRIO ATIVO CLYON (SEMPRE USE ESTES VALORES)
═══════════════════════════════════════════════════════════

${pricingRules}

═══════════════════════════════════════════════════════════
INSTRUÇÕES CRÍTICAS
═══════════════════════════════════════════════════════════

1. USA APENAS OS VALORES ACIMA — Não inventes preços
2. ENTULHO ESPECÍFICO:
   - Se estado="Já ensacado" → usar 2.50€/saco
   - Se estado="No chão/Por ensacar" → usar 3.00€/saco
   - Se estado="Misto" → aproximar 2.75€/saco (média)
   - Fórmula: preço_por_saco × quantidade × (1 + distância_factor + acesso_factor)
3. MUDANÇA ESPECÍFICO:
   - Quando o serviço for Mudança, considera origem e destino separadamente
   - Avalia andar, elevador e estacionamento nos dois locais
   - A distância principal é o percurso entre origem e destino
   - Se faltar morada de origem OU de destino → "needs_more_info"
4. Se falta quantidade de sacos ou estado do entulho → "needs_more_info"
5. Se falta zona/localidade → "needs_more_info"
6. Se não conseguir calcular com segurança → "onsite_required"
6. IVA sempre é 23% (0.23x)
7. Validar que os valores fazem sentido no contexto (ex: 100 sacos de entulho)

Analise o pedido abaixo e retorne APENAS o JSON sem qualquer texto adicional:

${formattedData}`;
}

function parseGeminiResponse(response: string): EstimateResult {
  try {
    // Limpar possível markdown code blocks
    let jsonStr = response.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    const parsed = JSON.parse(jsonStr.trim());

    // Validar e retornar com defaults
    const diffLevel = Math.max(1, Math.min(5, parsed.difficultyLevel || 2)) as 1 | 2 | 3 | 4 | 5;

    return {
      status: parsed.status || "estimated",
      estimatedPriceWithoutVat: parsed.estimatedPriceWithoutVat ?? null,
      vatAmount: parsed.vatAmount ?? null,
      estimatedPriceWithVat: parsed.estimatedPriceWithVat ?? null,
      difficultyLevel: diffLevel,
      summary: parsed.summary || "Análise com base nos dados fornecidos",
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      customerMessage: parsed.customerMessage || "Análise completada",
      internalNotes: Array.isArray(parsed.internalNotes) ? parsed.internalNotes : [],
    };
  } catch (error) {
    console.error("[v0] parseGeminiResponse: ❌ Erro ao parse JSON", error);
    // Fallback se Gemini não retornar JSON válido
    const diffLevel: 1 | 2 | 3 | 4 | 5 = 2;
    return {
      status: "needs_more_info",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: diffLevel,
      summary: "Análise incompleta. Por favor, forneça mais informações.",
      assumptions: [],
      missingFields: ["Dados incompletos para análise precisa"],
      customerMessage: "Erro ao analisar",
      internalNotes: [],
    };
  }
}

function getServiceName(serviceType?: string): string {
  const names: Record<string, string> = {
    recolha_moveis: "Recolha de móveis",
    recolha_monos: "Recolha de monos/volumosos",
    recolha_entulho: "Recolha de entulho",
    esvaziamento_casa: "Esvaziamento de casa",
    esvaziamento_apartamento: "Esvaziamento de apartamento",
    mudanca: "Mudança",
    outro: "Outro serviço",
  };
  return serviceType ? names[serviceType] || serviceType : "(não especificado)";
}
