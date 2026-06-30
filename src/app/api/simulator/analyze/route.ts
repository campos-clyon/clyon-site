import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import type { OrderData, EstimateResult, ExternalMarketEstimate, AnalysisSource } from "../../../simulador/types";
import {
  getActivePricingRulesForGemini,
  createPricingSnapshot,
  calculateFastEstimate,
  buildReferenceEstimate,
  FULL_LOAD_ITEM_THRESHOLD,
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
  // Fallback de referência — preservar a fonte original
  if (baseSource === "fallback_reference") return "fallback_reference";

  if (!externalEstimate) {
    // Sem pesquisa externa
    if (baseSource === "gemini" || baseSource === "clyon_pricing") {
      // Gemini não conseguiu calcular preço → marca como referência Gemini
      if (!analysis.estimatedPriceWithoutVat || analysis.estimatedPriceWithoutVat <= 0) {
        return "gemini_reference";
      }
      return "clyon_pricing";
    }
    if (baseSource === "timeout_fallback" || baseSource === "local_fast_estimate") {
      return baseSource;
    }
    if (analysis.status === "onsite_required" || analysis.confidence === "low") {
      return "needs_human_review";
    }
    return baseSource;
  }
  // Com pesquisa externa
  if (analysis.estimatedPriceWithoutVat && analysis.estimatedPriceWithoutVat > 0) {
    return "clyon_pricing_plus_web_reference";
  }
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
    // Número de itens já calculado deterministicamente pelo motor local — o Gemini
    // NUNCA deve recontar a partir do texto livre (era a causa do bug de subcontagem).
    const resolvedItemCount = fastEstimate.itemCount ?? 1;
    const resolvedIsFullLoad = fastEstimate.isFullLoad ?? false;
    const formattedData = formatOrderDataForPrompt(orderForGemini, resolvedItemCount, resolvedIsFullLoad);
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

    // Zero-price guard: se o Gemini devolveu preço 0 ou null, aplicar fallback de referência
    const geminiPrice = analysis.estimatedPriceWithoutVat;
    if (!geminiPrice || geminiPrice <= 0) {
      const ref = buildReferenceEstimate(order as never);
      analysis = {
        ...ref,
        // Manter campos qualitativos do Gemini (summary, missingFields, assumptions)
        status: analysis.status === "needs_more_info" ? "needs_more_info" : ref.status,
        summary: analysis.summary || ref.summary,
        missingFields: [...(analysis.missingFields ?? []), ...(ref.missingFields ?? [])],
        assumptions: [...(analysis.assumptions ?? []), ...ref.assumptions],
        internalNotes: [
          ...(analysis.internalNotes ?? []),
          "Gemini devolveu preço 0 ou null — aplicada estimativa de referência.",
          ...ref.internalNotes,
        ],
      } as EstimateResult;
      baseSource = "gemini_reference";
    }

    // Guarda de mínimo (anti-prejuízo): o motor local já sabe o mínimo comercial
    // real (por item, de zona, de entulho ou de mudança) para este pedido —
    // se o Gemini devolver um preço abaixo desse mínimo (ex: por ter avaliado
    // a descrição como tendo menos itens do que realmente tem), o preço é
    // ajustado para o mínimo local, preservando os campos qualitativos do Gemini.
    const localFloor = fastEstimate.estimateMinWithoutVat ?? fastEstimate.estimatedPriceWithoutVat ?? 0;
    if (
      localFloor > 0 &&
      analysis.estimatedPriceWithoutVat !== null &&
      analysis.estimatedPriceWithoutVat < localFloor
    ) {
      const geminiPriceBeforeClamp = analysis.estimatedPriceWithoutVat;
      const vatRate = 0.23;
      const clampedWithVat = Math.round(localFloor * (1 + vatRate) * 100) / 100;
      analysis = {
        ...analysis,
        estimatedPriceWithoutVat: localFloor,
        vatAmount: Math.round(localFloor * vatRate * 100) / 100,
        estimatedPriceWithVat: clampedWithVat,
        estimateMinWithoutVat: localFloor,
        estimateMaxWithoutVat: Math.max(analysis.estimateMaxWithoutVat ?? localFloor, fastEstimate.estimateMaxWithoutVat ?? localFloor),
        internalNotes: [
          ...(analysis.internalNotes ?? []),
          `Preço do Gemini (${geminiPriceBeforeClamp}€ s/IVA) estava abaixo do mínimo comercial calculado (${localFloor}€ s/IVA, ${resolvedItemCount} item(ns)) — ajustado para evitar prejuízo.`,
        ],
      } as EstimateResult;
    }

    analysis = {
      ...analysis,
      itemCount: resolvedItemCount,
      isFullLoad: resolvedIsFullLoad,
      estimateMinWithVat: analysis.estimateMinWithoutVat != null ? Math.round(analysis.estimateMinWithoutVat * 1.23 * 100) / 100 : fastEstimate.estimateMinWithVat,
      estimateMaxWithVat: analysis.estimateMaxWithoutVat != null ? Math.round(analysis.estimateMaxWithoutVat * 1.23 * 100) / 100 : fastEstimate.estimateMaxWithVat,
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
    analysisSource === "gemini_reference" ||
    analysisSource === "fallback_reference" ||
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

function formatOrderDataForPrompt(order: OrderData, resolvedItemCount: number, isFullLoad: boolean): string {
  const lines = [
    "=== DADOS DO PEDIDO ===",
    "",
    `Tipo de Serviço: ${getServiceName(order.serviceType)}`,
    `Descrição: ${order.description || "(não fornecida)"}`,
    "",
    "=== CONTAGEM DE ITENS (PRÉ-CALCULADA — NÃO RECALCULAR) ===",
    `Número de Itens: ${resolvedItemCount}`,
    `Classificação: ${isFullLoad ? `Carga completa (≥ ${FULL_LOAD_ITEM_THRESHOLD} itens ou esvaziamento)` : "Itens soltos (cobrança por item)"}`,
    "Este valor já foi determinado pelo motor de preços CLYON a partir da lista de itens e/ou da descrição. USA EXATAMENTE este número de itens nos teus cálculos — não tentes recontar a partir da descrição em texto livre.",
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
  return `És o orçamentista sénior da empresa CLYON, baseada em Fernão Ferro (Seixal), Portugal.
A CLYON presta serviços de recolha de móveis/monos, recolha de entulho, esvaziamento de casas/apartamentos e mudanças.

A tua tarefa é calcular o PREÇO COMERCIAL FINAL que a CLYON vai cobrar ao cliente,
usando obrigatoriamente a estrutura de custos reais abaixo.

═══════════════════════════════════════════════════════════
ESTRUTURA DE CUSTOS E REGRAS (valores actuais do backoffice)
═══════════════════════════════════════════════════════════

${pricingRules}

═══════════════════════════════════════════════════════════
FORMATO DE RESPOSTA (JSON puro — sem markdown, sem texto extra)
═══════════════════════════════════════════════════════════

{
  "status": "estimated" | "onsite_required" | "needs_more_info",
  "estimatedPriceWithoutVat": número (valor RECOMENDADO s/IVA — NUNCA null ou 0),
  "vatAmount": número (= estimatedPriceWithoutVat × 0.23),
  "estimatedPriceWithVat": número (= estimatedPriceWithoutVat × 1.23),
  "estimateMinWithoutVat": número (mínimo s/IVA — NUNCA null ou 0),
  "estimateMaxWithoutVat": número (máximo s/IVA — NUNCA null ou 0),
  "estimateMinWithVat": número (= estimateMinWithoutVat × 1.23),
  "estimateMaxWithVat": número (= estimateMaxWithoutVat × 1.23),
  "difficultyLevel": 1-5,
  "confidence": "high" | "medium" | "low",
  "teamSize": "string ex: 3 pessoas",
  "estimatedHoursText": "string ex: 2 horas",
  "recommendation": "pode_aprovar" | "pedir_fotos" | "pedir_info" | "visita_presencial",
  "summary": "resumo BREVE do cálculo mostrando: horas estimadas, custo combustível, custo pessoal, overhead, total custo, margem aplicada, preço final s/IVA",
  "assumptions": ["pressuposto 1", "pressuposto 2"],
  "missingFields": ["campo em falta 1"],
  "customerMessage": "mensagem pronta para o cliente COM o valor estimado incluído (ex: à volta de X € + IVA)",
  "internalNotes": ["nota interna para a equipa"],
  "labor": {
    "estimatedHours": número (mínimo 1),
    "peopleCount": número de pessoas da equipa,
    "hourlyRatePerPerson": custo €/h por pessoa,
    "laborCost": horas × pessoas × €/h
  }
}

═══════════════════════════════════════════════════════════
REGRAS ABSOLUTAS
═══════════════════════════════════════════════════════════

0. NÚMERO DE ITENS: usa SEMPRE o valor em "CONTAGEM DE ITENS (PRÉ-CALCULADA)" acima — está correto e já contabiliza todos os itens mencionados na descrição. NUNCA contes os itens tu mesmo a partir do texto livre nem assumas 1 item quando o valor pré-calculado é maior. Um pedido com 3 ou 4 itens TEM de ser cobrado como 3 ou 4 itens, nunca como 1.
1. USA SEMPRE a fórmula: (combustível + pessoal + overhead) × (1 + margem) = preço s/IVA.
2. MÍNIMOS — REGRAS DIFERENTES POR TIPO DE SERVIÇO:
   a) ITENS SOLTOS (1–5 itens — recolha de móveis/monos): NÃO aplicar mínimo de zona.
      Usar preço real calculado pela fórmula. Mínimo por item: ~48,78 € s/IVA (60 € c/IVA).
      EXEMPLO CORRETO: Mesa e cadeiras (2 itens), 2º andar, elevador pequeno, Lisboa → 100 a 130 € c/IVA (NÃO 270 €!)
      EXEMPLO CORRETO: 1 frigorífico, rés-do-chão, estacionamento à porta → 50 a 80 € c/IVA
      Para múltiplos itens soltos: aplica desconto de eficiência (~60% do custo por item adicional).
   b) CARGA COMPLETA (≥6 itens), ESVAZIAMENTO: aplicar mínimo de zona.
      Lisboa 250 € s/IVA (acesso difícil: 270 €) | Almada/Barreiro 230 € | Amora/Seixal 220 €
      EXEMPLO: Esvaziamento Lisboa, cálculo = 180 € s/IVA → preço final = 250 € s/IVA (mínimo zona).
   c) ENTULHO: mínimo fixo 90 € s/IVA — sem mínimo de zona.
   d) MUDANÇA: mínimo fixo 150 € s/IVA — sem mínimo de zona.
3. estimatedPriceWithoutVat, estimateMinWithoutVat e estimateMaxWithoutVat NUNCA podem ser null ou 0.
4. Se faltarem dados críticos, dá SEMPRE um intervalo razoável com confidence "low".
5. NUNCA devolveres preços 0 ou null.
6. customerMessage SEMPRE inclui o valor estimado.
7. No summary, mostra o cálculo passo a passo E indica se foi ou não aplicado mínimo.
8. Retorna APENAS JSON válido — sem texto antes ou depois, sem backticks.

═══════════════════════════════════════════════════════════
PEDIDO A ANALISAR
═══════════════════════════════════════════════════════════

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

    const validRecommendations = ["pode_aprovar", "pedir_fotos", "pedir_info", "visita_presencial"] as const;
    const recommendation = validRecommendations.includes(parsed.recommendation)
      ? (parsed.recommendation as "pode_aprovar" | "pedir_fotos" | "pedir_info" | "visita_presencial")
      : null;

    return {
      status: parsed.status || "estimated",
      estimatedPriceWithoutVat: parsed.estimatedPriceWithoutVat ?? null,
      vatAmount: parsed.vatAmount ?? null,
      estimatedPriceWithVat: parsed.estimatedPriceWithVat ?? null,
      estimateMinWithoutVat: typeof parsed.estimateMinWithoutVat === "number" ? parsed.estimateMinWithoutVat : null,
      estimateMaxWithoutVat: typeof parsed.estimateMaxWithoutVat === "number" ? parsed.estimateMaxWithoutVat : null,
      estimateMinWithVat: typeof parsed.estimateMinWithVat === "number" ? parsed.estimateMinWithVat : null,
      estimateMaxWithVat: typeof parsed.estimateMaxWithVat === "number" ? parsed.estimateMaxWithVat : null,
      difficultyLevel: diffLevel,
      confidence,
      teamSize: typeof parsed.teamSize === "string" ? parsed.teamSize : null,
      estimatedHoursText: typeof parsed.estimatedHoursText === "string" ? parsed.estimatedHoursText : null,
      recommendation,
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
