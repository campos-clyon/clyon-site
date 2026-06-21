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

REGRAS DE PREÇO - PRECÁRIO CLYON ATUALIZADO (Junho 2026):

ZONAS BASE (sem IVA):
- Zona A (Amora/Fernão Ferro e proximidades): 220€
- Zona B (Lisboa com acesso razoável): 250€
- Zona C (Lisboa difícil ou regiões longe): 270€

ENTULHO (IMPORTANTE):
- Até 20 sacos: 3€ por saco + minimo da zona se deslocacao dedicada
- 20 a 50 sacos: minimo da zona + (3€ x número de sacos)
- Sem elevador: +25€ a +50€ por andar
- Com elevador: aplicar minimo da zona + valor de sacos

EXEMPLOS CORRETOS:
- 20 sacos em Lisboa (zona B): 250€ + (20 x 3€) = 310€ sem IVA
- 20 sacos Lisboa sem elevador rés-do-chão: 250€ + (20 x 3€) + 15€ = 325€ sem IVA
- 40 sacos em Lisboa: 250€ + (40 x 3€) = 370€ sem IVA

OUTROS SERVIÇOS:
- Recolha de móveis: 220/250/270€ base + acrescimos por peso/escadas
- Recolha de monos: 220/250/270€ base
- Esvaziamento de T1: 450€-1.100€ dependendo conteúdo
- Esvaziamento de T2: sob orçamento
- Mudança completa: 400€-1.200€ base

ACRESCIMOS (ao base):
- Sem elevador carga pesada: +25€ a +50€ por andar
- Distância longa até carrinha (>20m): +20€ a +80€
- Desmontagem simples: +30€ a +50€
- Desmontagem média: +60€ a +120€
- Triagem/separação de lixo: +40€ a +150€
- Urgência (mesmo dia): +30€ a +60€
- IVA (23%): sempre separado e destacado

REGRAS DE DIFICULDADE:
- Nível 1: Acesso fácil (porta, elevador, estacionamento próximo) - usar base
- Nível 2: Normal (acesso razoável, alguns acrescimos) - base + até 50€
- Nível 3: Médio (escadas, alguma distância, peso moderado) - base + 50€ a 150€
- Nível 4: Difícil (sem elevador, muito peso, triagem, estacionamento longe) - base + 150€ a 300€
- Nível 5: Muito difícil (mais de 1 carrinha, acesso muito ruim) - sob orçamento

CRITÉRIOS PARA "onsite_required":
- Se faltarem informações críticas (andar não especificado, acesso desconhecido)
- Apenas para situações realmente complexas (>1 carrinha, obra muito pesada)

CRITÉRIOS PARA "needs_more_info":
- Se a descrição for muito vaga (não mencionar número de sacos, tipo de objetos, etc)

INSTRUÇÕES CRÍTICAS:
1. SEMPRE usar base de zona (220€, 250€ ou 270€) como ponto de partida
2. Para ENTULHO em sacos: base + (número de sacos × 3€) + acrescimos por acesso
3. Não calcular valores fixos altos sem justificativa clara
4. Se há informações completas: status = "estimated" (não "onsite_required")
5. Validar que o preço faz sentido comparado com exemplos do precário

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
