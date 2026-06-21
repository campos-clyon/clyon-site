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

CARGA BASE (sem IVA):
- Margem Sul (Caparica, Almada, Barreiro, Seixal, Moita, Montijo): 250€
- Lisboa (Lisboa, Amora, Fernão Ferro, Oeiras): 300€
- Cascais/Loures/Mafra: 300€

SACOS DE ENTULHO (preço por saco - SEM IVA):
- Margem Sul: 3€ por saco
- Lisboa: 3.20€ por saco
- Cascais/Loures: 3.20€ por saco

ITENS UNITÁRIOS (não sacos):
- Pequeno (<1m): 10€ por item
- Médio (1-2m): 15€ por item
- Grande (>2m): 20€ por item

CÁLCULO CORRETO PARA ENTULHO:
- Base = Preço da zona (250€ Margem Sul OU 300€ Lisboa)
- Sacos = Número de sacos × Preço por saco da zona
- Acrescimos por acesso difícil (elevador, estacionamento, etc)
- Total sem IVA = Base + (Sacos × Preço/saco) + Acrescimos
- EXEMPLO 50 SACOS LISBOA: 300€ + (50 × 3.20€) = 300€ + 160€ = 460€ sem IVA = 565,80€ com IVA
- EXEMPLO 50 SACOS MARGEM SUL: 250€ + (50 × 3€) = 250€ + 150€ = 400€ sem IVA = 492€ com IVA

OUTROS SERVIÇOS:
- Recolha de móveis: base da zona + (items × preço unitário) + acrescimos
- Recolha de monos: base da zona + acrescimos
- Esvaziamento de T1: sob orçamento
- Esvaziamento de T2: sob orçamento
- Mudança completa: sob orçamento

ACRESCIMOS (ao base):
- Sem elevador (por andar): +20€ a +40€
- Sem estacionamento próximo (>20m): +30€ a +50€
- Triagem/separação obrigatória: +50€ a +100€
- Desmontagem: +30€ a +80€
- Urgência (mesmo dia): +50€ a +100€

REGRAS DE DIFICULDADE:
- Nível 1: Fácil (elevador, estacionamento porta, sem desmontagem)
- Nível 2: Normal (sem elevador rés-do-chão OU estacionamento longe)
- Nível 3: Médio (sem elevador 1-2 andares + acrescimos moderados)
- Nível 4: Difícil (sem elevador >2 andares OU múltiplos acrescimos)
- Nível 5: Muito difícil (necessário orçamento in loco)

CRITÉRIOS PARA "onsite_required":
- Se faltarem informações críticas (localidade não identificada, acesso muito incerto)
- Apenas para situações realmente complexas

CRITÉRIOS PARA "needs_more_info":
- Se a descrição for muito vaga (não mencionar quantidade de sacos ou objetos)

INSTRUÇÕES CRÍTICAS PARA CÁLCULO CORRETO:
1. IDENTIFICAR LOCALIDADE: é Margem Sul, Lisboa ou Cascais/Loures?
   - Se Lisboa/Amora/Fernão Ferro/Oeiras → Base 300€, Saco 3.20€
   - Se Margem Sul → Base 250€, Saco 3€
   - Se Cascais/Loures/Mafra → Base 300€, Saco 3.20€

2. PARA ENTULHO EM SACOS:
   - Cálculo = Base_da_zona + (Número_sacos × Preço_saco_da_zona) + Acrescimos
   - Exemplo: 50 sacos Lisboa = 300€ + (50 × 3.20€) + acrescimos = resultado

3. ACRESCIMOS SÓ SE:
   - Sem elevador? +20€ a +40€ por andar
   - Estacionamento longe? +30€ a +50€
   - Outras dificuldades? calcular conforme

4. VALIDAR RESULTADO:
   - 50 sacos Lisboa deve dar ~565€ com IVA
   - 50 sacos Margem Sul deve dar ~492€ com IVA
   - Se diferente: revisar zona e preço por saco

5. SEMPRE RETORNAR:
   - estimatedPriceWithoutVat (sem IVA)
   - vatAmount (IVA 23%)
   - estimatedPriceWithVat (com IVA)

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
