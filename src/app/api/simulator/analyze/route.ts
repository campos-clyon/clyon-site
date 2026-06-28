import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import type { OrderData, EstimateResult, ExternalMarketEstimate, AnalysisSource } from "../../../simulador/types";
import {
  getActivePricingRulesForGemini,
  createPricingSnapshot,
  calculateFastEstimate,
} from "@/lib/pricing-helper";

// Gemini abortado após este tempo — cliente nunca fica preso
const GEMINI_TIMEOUT_MS = 4000;
// Pesquisa externa — timeout maior (grounding é mais lenta)
const GROUNDING_TIMEOUT_MS = 8000;

// ── Decidir se precisamos de pesquisa externa ─────────────────────────────────
function needsExternalSearch(analysis: EstimateResult): boolean {
  if (analysis.status === "onsite_required") return true;
  if (analysis.confidence === "low") return true;
  if (!analysis.estimatedPriceWithoutVat) return true;
  // missingFields críticos que indicam que o preçário não chegou
  const critical = ["serviceType", "city", "description", "zona"];
  const hasCritical = analysis.missingFields?.some((f) =>
    critical.some((c) => f.toLowerCase().includes(c))
  );
  if (hasCritical) return true;
  // Gemini não conseguiu calcular preço mas status é "estimated" (valor 0 ou nulo)
  if (
    analysis.status === "estimated" &&
    (analysis.estimatedPriceWithoutVat === 0 || analysis.estimatedPriceWithoutVat === null)
  )
    return true;
  return false;
}

// ── Construir query de pesquisa — SEM dados pessoais ─────────────────────────
function buildSearchQuery(order: OrderData): string {
  const serviceMap: Record<string, string> = {
    recolha_moveis: "recolha de móveis",
    recolha_monos: "recolha de monos volumosos",
    recolha_entulho: "recolha de entulho",
    esvaziamento_casa: "esvaziamento de casa",
    esvaziamento_apartamento: "esvaziamento de apartamento",
    mudanca: "mudança de casa",
    outro: "serviço de transporte",
  };
  const service = serviceMap[order.serviceType ?? ""] ?? "serviço de transporte";
  // Usar apenas cidade/localidade genérica, nunca morada completa, nome, telefone ou email
  const city = order.address?.city ?? order.city ?? "Lisboa";
  const safeCity = city.split(",")[0].split(" ").slice(0, 2).join(" "); // "Lisboa" ou "Setúbal"

  let q = `preço ${service} ${safeCity} Portugal`;

  if (order.serviceType === "recolha_entulho" && order.entulhoQuantidade) {
    q = `preço recolha entulho sacos ${safeCity} Portugal`;
  } else if (order.serviceType === "mudanca") {
    q = `preço mudança pequena ${safeCity} Portugal empresa mudanças`;
  } else if (order.serviceType === "esvaziamento_casa" || order.serviceType === "esvaziamento_apartamento") {
    q = `preço esvaziamento apartamento ${safeCity} Portugal`;
  }

  return q;
}

// ── Pesquisa externa com Gemini + Google Search grounding ────────────────────
async function getExternalMarketEstimate(
  order: OrderData,
  apiKey: string,
  modelName: string
): Promise<ExternalMarketEstimate | null> {
  const searchQuery = buildSearchQuery(order);
  const serviceLabel = order.serviceType ?? "serviço não especificado";

  const prompt = `Você é um analista interno da empresa CLYON em Portugal.

TAREFA: Pesquisa referências de mercado para o seguinte serviço, usando apenas termos genéricos sem dados pessoais.

Serviço: ${serviceLabel}
Query de pesquisa: ${searchQuery}

INSTRUÇÕES IMPORTANTES:
1. Esta pesquisa é apenas referência interna para a equipa CLYON. Não substitui o preçário oficial CLYON.
2. Procura referências de preços de mercado para serviços semelhantes em Portugal, preferencialmente Grande Lisboa / Setúbal.
3. Considera empresas de recolha de móveis, recolha de entulho, mudanças, esvaziamento de casas e transporte de volumosos.
4. Devolve um intervalo estimado e explica a lógica.
5. Inclui fontes consultadas quando disponíveis.
6. Não uses dados pessoais do cliente na pesquisa.
7. Se não houver fonte fiável, usa confidence low.

Retorna APENAS um JSON válido com este formato exato:
{
  "minWithoutVat": número ou null,
  "maxWithoutVat": número ou null,
  "suggestedWithoutVat": número ou null,
  "confidence": "high" | "medium" | "low",
  "reasoning": "string com explicação do raciocínio e fontes",
  "sources": [
    { "title": "string", "url": "string", "snippet": "string opcional" }
  ]
}

Se não encontrares informação suficiente, devolve null para os valores numéricos e confidence "low".
Retorna APENAS o JSON sem texto adicional.`;

  try {
    const client = new GoogleGenerativeAI(apiKey);
    // gemini-1.5-flash suporta googleSearchRetrieval grounding
    const groundingModel = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [{ googleSearchRetrieval: { dynamicRetrievalConfig: { dynamicThreshold: 0.3 } } }],
    });

    const groundingResult = await Promise.race([
      groundingModel.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("GROUNDING_TIMEOUT")), GROUNDING_TIMEOUT_MS)
      ),
    ]);

    const resp = (groundingResult as Awaited<ReturnType<typeof groundingModel.generateContent>>).response;
    const text = resp.text();
    const groundingMeta = resp.candidates?.[0]?.groundingMetadata;

    // Parse JSON da resposta
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    const parsed = JSON.parse(jsonStr.trim());

    // Extrair fontes do grounding metadata (mais fiável que o que o Gemini inventar)
    const groundingSources = (groundingMeta?.groundingChunks ?? [])
      .filter((c: any) => c.web?.uri)
      .map((c: any) => ({
        title: c.web.title ?? c.web.uri,
        url: c.web.uri,
      }))
      .slice(0, 5); // máximo 5 fontes

    // Fundir fontes do grounding com as que o Gemini declarou (sem duplicados)
    const allUrls = new Set(groundingSources.map((s: any) => s.url));
    const geminiSources = (Array.isArray(parsed.sources) ? parsed.sources : []).filter(
      (s: any) => s.url && !allUrls.has(s.url)
    );
    const sources = [...groundingSources, ...geminiSources].slice(0, 5);

    return {
      minWithoutVat: typeof parsed.minWithoutVat === "number" ? parsed.minWithoutVat : null,
      maxWithoutVat: typeof parsed.maxWithoutVat === "number" ? parsed.maxWithoutVat : null,
      suggestedWithoutVat: typeof parsed.suggestedWithoutVat === "number" ? parsed.suggestedWithoutVat : null,
      confidence: (["high", "medium", "low"].includes(parsed.confidence) ? parsed.confidence : "low") as "high" | "medium" | "low",
      reasoning: typeof parsed.reasoning === "string" ? parsed.reasoning : "Pesquisa externa realizada.",
      sources,
      searchedAt: new Date().toISOString(),
    };
  } catch (err) {
    const isTimeout = err instanceof Error && err.message === "GROUNDING_TIMEOUT";
    console.error("[v0] getExternalMarketEstimate:", isTimeout ? "timeout" : "erro", err);
    return null;
  }
}

// ── Determinar analysisSource final ──────────────────────────────────────────
function resolveAnalysisSource(
  baseSource: AnalysisSource,
  externalEstimate: ExternalMarketEstimate | null,
  analysis: EstimateResult
): AnalysisSource {
  if (!externalEstimate) {
    // Sem pesquisa externa — fonte é o preçário CLYON (via Gemini ou local)
    if (baseSource === "gemini" || baseSource === "clyon_pricing") return "clyon_pricing";
    if (analysis.status === "onsite_required" || analysis.confidence === "low")
      return "needs_human_review";
    return baseSource;
  }
  // Com pesquisa externa
  if (analysis.estimatedPriceWithoutVat) return "clyon_pricing_plus_web_reference";
  return "web_reference_only";
}

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
  const orderForGemini: OrderData = {
    ...order,
    files: order.files?.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      mimeType: f.mimeType,
    })) ?? [],
  };

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json({
      ...fastEstimate,
      analysisSource: "clyon_pricing" as AnalysisSource,
      confidence: "medium" as const,
      internalNotes: [
        ...fastEstimate.internalNotes,
        "GEMINI_API_KEY não configurada — usada estimativa local.",
      ],
    } satisfies EstimateResult);
  }

  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // ── 3. Chamar Gemini com timeout rígido ──────────────────────────────────
  let analysis: EstimateResult;
  let baseSource: AnalysisSource = "clyon_pricing";

  try {
    const pricingRules = await getActivePricingRulesForGemini();
    const pricingSnapshot = await createPricingSnapshot();
    const formattedData = formatOrderDataForPrompt(orderForGemini);
    const prompt = buildAnalysisPrompt(formattedData, pricingRules);

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    const geminiResult = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("GEMINI_TIMEOUT")), GEMINI_TIMEOUT_MS)
      ),
    ]);

    const responseText = (geminiResult as Awaited<ReturnType<typeof model.generateContent>>).response.text();
    analysis = parseGeminiResponse(responseText);
    baseSource = "clyon_pricing";

    analysis = {
      ...analysis,
      internalNotes: [
        ...(analysis.internalNotes || []),
        `Preçário usado: ${pricingSnapshot?.timestamp || "default"}`,
      ],
      _pricingSnapshot: pricingSnapshot ?? undefined,
    };
  } catch (error) {
    const isTimeout = error instanceof Error && error.message === "GEMINI_TIMEOUT";
    console.error(
      "[v0] /api/simulator/analyze:",
      isTimeout ? "Gemini timeout — usando estimativa local" : "Erro Gemini",
      isTimeout ? "" : error
    );
    analysis = {
      ...fastEstimate,
      internalNotes: [
        ...fastEstimate.internalNotes,
        isTimeout
          ? `Gemini não respondeu em ${GEMINI_TIMEOUT_MS}ms. Estimativa rápida local usada.`
          : `Erro Gemini: ${error instanceof Error ? error.message : String(error)}. Estimativa rápida local usada.`,
      ],
    };
    baseSource = isTimeout ? "timeout_fallback" : "local_fast_estimate";
  }

  // ── 4. Pesquisa externa se necessário ────────────────────────────────────
  let externalMarketEstimate: ExternalMarketEstimate | null = null;

  if (needsExternalSearch(analysis)) {
    externalMarketEstimate = await getExternalMarketEstimate(order, apiKey, modelName);
    if (externalMarketEstimate) {
      analysis = {
        ...analysis,
        internalNotes: [
          ...(analysis.internalNotes ?? []),
          `Pesquisa de mercado externa realizada (${externalMarketEstimate.sources.length} fonte(s)). Confiança: ${externalMarketEstimate.confidence}.`,
        ],
      };
    }
  }

  // ── 5. Determinar fonte e confiança finais ────────────────────────────────
  const analysisSource = resolveAnalysisSource(baseSource, externalMarketEstimate, analysis);

  // Confiança: propagar o que o Gemini definiu, ou inferir
  let confidence: "high" | "medium" | "low" = analysis.confidence ?? "medium";
  if (analysis.status === "onsite_required" || analysis.status === "needs_more_info") {
    confidence = "low";
  } else if (analysis.estimatedPriceWithoutVat && analysis.missingFields?.length === 0) {
    confidence = "high";
  }

  // ── 6. Mensagem ao cliente — nunca expor referência externa ──────────────
  let customerMessage = analysis.customerMessage;
  if (
    analysisSource === "web_reference_only" ||
    analysisSource === "needs_human_review" ||
    confidence === "low"
  ) {
    customerMessage =
      "Pedido recebido para análise. A equipa CLYON irá confirmar os dados e entrar em contacto em breve.";
  }

  // ── 7. Compor resposta final ──────────────────────────────────────────────
  const result: EstimateResult = {
    ...analysis,
    analysisSource,
    confidence,
    customerMessage,
    // Incluir referência externa APENAS quando existir — backoffice lê este campo
    ...(externalMarketEstimate ? { externalMarketEstimate } : {}),
  };

  return Response.json(result);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatOrderDataForPrompt(order: OrderData): string {
  const lines = [
    "=== DADOS DO PEDIDO ===",
    "",
    `Tipo de Serviço: ${getServiceName(order.serviceType)}`,
    `Descrição: ${order.description || "(não fornecida)"}`,
  ];

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
  "confidence": "high" | "medium" | "low",
  "summary": "string com resumo da análise",
  "assumptions": ["array", "de", "pressupostos"],
  "missingFields": ["array", "de", "campos faltantes"],
  "customerMessage": "mensagem para o cliente",
  "internalNotes": ["notas internas"],
  "labor": {
    "estimatedHours": número (nunca < 1),
    "peopleCount": 3,
    "hourlyRatePerPerson": 9,
    "laborCost": número
  }
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
6. Se não conseguir calcular com segurança → "onsite_required" com confidence "low"
7. IVA sempre é 23% (0.23x)
8. Valida que os valores fazem sentido no contexto
9. Define sempre o campo "confidence": "high" se preçário cobre bem, "medium" se há incerteza, "low" se não consegues calcular

Analise o pedido abaixo e retorne APENAS o JSON sem qualquer texto adicional:

${formattedData}`;
}

function parseGeminiResponse(response: string): EstimateResult {
  try {
    let jsonStr = response.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    const parsed = JSON.parse(jsonStr.trim());

    const diffLevel = Math.max(1, Math.min(5, parsed.difficultyLevel || 2)) as 1 | 2 | 3 | 4 | 5;

    let labor = undefined;
    if (parsed.labor && typeof parsed.labor.estimatedHours === "number") {
      const hrs = Math.max(1, parsed.labor.estimatedHours);
      labor = {
        estimatedHours: hrs,
        peopleCount: 3 as const,
        hourlyRatePerPerson: 9 as const,
        laborCost: Math.round(hrs * 3 * 9 * 100) / 100,
      };
    }

    const confidence = (["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "medium") as "high" | "medium" | "low";

    return {
      status: parsed.status || "estimated",
      estimatedPriceWithoutVat: parsed.estimatedPriceWithoutVat ?? null,
      vatAmount: parsed.vatAmount ?? null,
      estimatedPriceWithVat: parsed.estimatedPriceWithVat ?? null,
      difficultyLevel: diffLevel,
      confidence,
      summary: parsed.summary || "Análise com base nos dados fornecidos",
      assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      missingFields: Array.isArray(parsed.missingFields) ? parsed.missingFields : [],
      customerMessage: parsed.customerMessage || "Análise completada",
      internalNotes: Array.isArray(parsed.internalNotes) ? parsed.internalNotes : [],
      labor,
    };
  } catch (error) {
    console.error("[v0] parseGeminiResponse: Erro ao parse JSON", error);
    const diffLevel: 1 | 2 | 3 | 4 | 5 = 2;
    return {
      status: "needs_more_info",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: diffLevel,
      confidence: "low",
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
