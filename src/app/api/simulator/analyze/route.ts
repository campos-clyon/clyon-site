import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextRequest } from "next/server";
import type { OrderData, EstimateResult } from "../../../simulador/types";

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

    // Construir prompt para Gemini
    const formattedData = formatOrderDataForPrompt(order);
    const prompt = buildAnalysisPrompt(formattedData);

    console.log("[v0] POST /api/simulator/analyze: Chamando Gemini com modelo:", modelName);

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log("[v0] POST /api/simulator/analyze: Resposta Gemini recebida (", responseText.length, "chars)");

    // Parse resposta JSON do Gemini
    const analysis = parseGeminiResponse(responseText);

    console.log("[v0] POST /api/simulator/analyze: ✓ Análise completa -", {
      status: analysis.status,
      price: analysis.estimatedPriceWithVat,
      difficulty: analysis.difficultyLevel,
    });

    return Response.json(analysis);
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
  ];

  return lines.join("\n");
}

function buildAnalysisPrompt(formattedData: string): string {
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
  "missingFields": ["array", "de", "campos faltantes"]
}

REGRAS DE PREÇO:
- Recolha de móveis: €80-150 base + €20-40 por item pesado + €10/km
- Recolha de monos: €60-100 base + €15/km
- Recolha de entulho: €100-200 base + €20/km
- Esvaziamento: €300-800 dependendo do volume + €20/km
- Mudança: €400-1200 base + €30/km
- IVA (23%): sempre incluído no cálculo final

REGRAS DE DIFICULDADE:
- Nível 1-2: Sem complicações (porta, elevador disponível, estacionamento próximo)
- Nível 3: Acesso moderado (andares, sem elevador, estacionamento longe)
- Nível 4: Acesso difícil (escadas, muitos andares, sem elevador)
- Nível 5: Muito difícil (acesso muito complicado, múltiplas limitações)

CRITÉRIOS PARA "onsite_required":
- Se faltarem informações críticas (andar não especificado, acesso desconhecido, volume indefinido)
- Se o volume for muito grande ou indefinido

CRITÉRIOS PARA "needs_more_info":
- Se a descrição for muito vaga ou incompleta

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
