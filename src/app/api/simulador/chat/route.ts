import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import {
  extractContactDataRegex,
  getMissingFields,
  generateExtractionPrompt,
  parseGeminiResponse,
  mergeOrderPatch,
  removeUndefined,
  normalizeResponse,
  type OrderData,
} from "@/lib/simulator-chat-utils";

interface ChatRequest {
  message: string;
  currentOrder?: OrderData;
}

interface ChatResponse {
  response: string;
  extractedData: Partial<OrderData>;
  missingFields: string[];
  shouldOpenContactForm: boolean;
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse | { error: string }>> {
  try {
    const body = (await req.json()) as ChatRequest;
    const { message, currentOrder = {} } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    // Procura campos em falta para contextualizar melhor
    const missingFields = getMissingFields(currentOrder);

    // Tenta extrair dados com Gemini se houver falta de campos
    let extractedData: Partial<OrderData> = {};

    if (missingFields.length > 0) {
      try {
        // Usa Gemini para extração inteligente
        const prompt = generateExtractionPrompt(message, missingFields);
        const geminiResponse = await generateText({
          model: google("gemini-1.5-flash"),
          prompt,
          temperature: 0.1, // Baixa temperatura para respostas mais determinísticas
        });

        extractedData = parseGeminiResponse(geminiResponse.text, missingFields);
      } catch (err) {
        // Fallback para regex se Gemini falhar
        if (process.env.NODE_ENV === "development") {
          console.warn("[Simulator Chat] Gemini error, falling back to regex:", err);
        }
        extractedData = extractContactDataRegex(message);
      }
    } else {
      // Se todos os campos já estão preenchidos, apenas tenta extrair mais dados
      extractedData = extractContactDataRegex(message);
    }

    // Faz merge com os dados existentes
    const mergedOrder = mergeOrderPatch(currentOrder, removeUndefined(extractedData));
    const updatedMissingFields = getMissingFields(mergedOrder);

    // Gera resposta contextualizada
    let response = "";

    if (updatedMissingFields.length === 0) {
      response =
        "Ótimo! Tenho todos os dados que preciso. Pode rever os dados no formulário abaixo e confirmar para avançar com o seu pedido.";
    } else {
      // Gera pergunta sobre o próximo campo em falta
      const nextField = updatedMissingFields[0];
      const fieldQuestions: Record<string, string> = {
        name: "Qual é o seu nome?",
        phone: "Qual é o seu número de telemóvel? (9 dígitos)",
        email: "Qual é o seu endereço de email?",
        street: "Qual é o endereço completo (rua, número, localidade)?",
        floor: "Em que andar fica? (ex: R/C, 1º, 2º)",
        hasElevator: "Tem elevador no prédio?",
        parkingDistance: "Tem estacionamento próximo (até 20m)?",
        serviceType: "Que tipo de serviço precisa? (recolha de móveis, mudanças, etc.)",
        urgency: "É urgente ou tem tempo flexível?",
      };

      response = fieldQuestions[nextField] || `Por favor, indique: ${nextField}`;
    }

    const shouldOpenContactForm = updatedMissingFields.length === 0;

    return NextResponse.json({
      response,
      extractedData: removeUndefined(extractedData),
      missingFields: updatedMissingFields,
      shouldOpenContactForm,
    });
  } catch (error) {
    console.error("[Simulator Chat] Error:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem. Por favor, tente novamente." },
      { status: 500 }
    );
  }
}
