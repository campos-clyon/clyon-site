import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import type { OrderData, EstimateResult } from "../../../simulador/types";
import { getActivePricingRulesForGemini, createPricingSnapshot } from "@/lib/pricing-helper";

export async function POST(req: NextRequest) {
  try {
    const { order, estimate, chatHistory } = await req.json();
    console.log("[v0] POST /api/simulator/analyze: Iniciando análise com Gemini");

    // Validar env vars
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      console.error("[v0] POST /api/simulator/analyze: ❌ GEMINI_API_KEY não configurada");
      return Response.json(
        { error: "Chave Gemini não configurada no servidor" },
        { status: 500 }
      );
    }

    // Carregar preçário dinâmico do backoffice
    const pricingRules = await getActivePricingRulesForGemini();
    const pricingSnapshot = await createPricingSnapshot();
    
    console.log("[v0] POST /api/simulator/analyze: ✓ Preçário carregado do backoffice");

    // Construir prompt para Gemini com preçário dinâmico
    const formattedData = formatOrderDataForPrompt(order);
    const prompt = buildAnalysisPrompt(formattedData, pricingRules);

    console.log("[v0] POST /api/simulator/analyze: Chamando Gemini com modelo:", modelName);

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("[v0] POST /api/simulator/analyze: Resposta Gemini recebida (", responseText.length, "chars)");

    // Parse resposta JSON do Gemini
    const analysis = parseGeminiResponse(responseText);
    
    // Adicionar snapshot do preçário usado
    const responseWithMetadata = {
      ...analysis,
      internalNotes: [
        ...(analysis.internalNotes || []),
        `Preçário usado: ${pricingSnapshot?.timestamp || "default"}`,
      ],
      _pricingSnapshot: pricingSnapshot, // Para debug/admin
    };

    console.log("[v0] POST /api/simulator/analyze: ✓ Análise completa -", {
      status: analysis.status,
      price: analysis.estimatedPriceWithVat,
      difficulty: analysis.difficultyLevel,
      pricingSnapshot: pricingSnapshot?.timestamp,
    });

    return Response.json(responseWithMetadata);
  } catch (error) {
    console.error("[v0] POST /api/simulator/analyze: ❌ Erro", error);
    return Response.json(
      {
        error: "Erro ao analisar pedido",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
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
3. Se falta quantidade de sacos ou estado do entulho → "needs_more_info"
4. Se falta zona/localidade → "needs_more_info"
5. Se não conseguir calcular com segurança → "onsite_required"
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
