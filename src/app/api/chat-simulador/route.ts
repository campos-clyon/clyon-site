import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `És o orçamentista virtual da CLYON, empresa de recolha de móveis, monos, entulho, esvaziamentos e mudanças em Portugal.

REGRA PRINCIPAL: Quando o cliente envia texto com informação, EXTRAI TUDO o que já foi fornecido antes de fazer qualquer pergunta. NÃO perguntes o que já sabes.

Informação que precisas para fazer um orçamento:
- Tipo de serviço (recolha de móveis, monos, entulho, esvaziamento, mudança)
- Descrição do que precisa recolher/transportar
- Andar (e se tem elevador)
- Acesso para estacionar a carrinha
- Nome, telefone e morada do cliente

COMPORTAMENTO:
1. Se o cliente já forneceu toda a info de uma vez → resume o que entendeste e escreve EXATAMENTE [ABRIR_FORMULARIO] para confirmar os contactos/morada
2. Se falta info → faz UMA pergunta de cada vez sobre o que falta, pela ordem: tipo de serviço → descrição → andar/elevador → estacionamento → contactos
3. Se o cliente manda fotos → analisa o volume e comenta brevemente o que vês, depois pergunta o que falta
4. Nunca uses emojis em excesso. Sê direto e profissional mas simpático.
5. Nunca dês preços concretos — apenas quando te for pedida uma estimativa.
6. A palavra-chave [ABRIR_FORMULARIO] deve aparecer numa linha separada quando precisares dos dados de contacto/morada.`;

type MessagePart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

type Message = {
  role: "user" | "assistant";
  content: string | MessagePart[];
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    return NextResponse.json(
      {
        error: "API key não configurada",
        customerMessage:
          "Não consegui calcular a estimativa agora. A equipa CLYON pode confirmar o valor manualmente.",
      },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as { messages: Message[]; order?: Record<string, unknown> };
    const { messages, order } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Injectar contexto do order já recolhido como mensagem de sistema adicional
    const knownFields: string[] = [];
    if (order) {
      if (order.serviceType) knownFields.push(`Serviço: ${order.serviceType}`);
      if (order.description) knownFields.push(`Descrição: ${order.description}`);
      if (order.floor) knownFields.push(`Andar: ${order.floor}`);
      if (order.hasElevator) knownFields.push(`Elevador: ${order.hasElevator}`);
      if (order.parkingDistance) knownFields.push(`Estacionamento: ${order.parkingDistance}`);
      if (order.urgency) knownFields.push(`Urgência: ${order.urgency}`);
      if (order.city) knownFields.push(`Cidade: ${order.city}`);
      if ((order.receiver as { name?: string })?.name) knownFields.push(`Nome: ${(order.receiver as { name?: string }).name}`);
    }

    const apiKey =
      process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "";
    const ai = new GoogleGenAI({ apiKey });

    // Converter histórico para o formato do novo SDK
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: Array.isArray(msg.content)
        ? (msg.content as MessagePart[]).map((part) => {
            if ("inlineData" in part) {
              return {
                inlineData: {
                  mimeType: part.inlineData.mimeType,
                  data: part.inlineData.data,
                },
              };
            }
            return { text: (part as { text: string }).text || "" };
          })
        : [{ text: String(msg.content) }],
    }));

    // Gemini exige que o histórico comece com role 'user' — remover mensagens
    // 'model' iniciais (como a saudação automática da IA)
    const historyRaw = contents.slice(0, -1);
    const firstUserIdx = historyRaw.findIndex((m) => m.role === "user");
    const safeHistory = firstUserIdx === -1 ? [] : historyRaw.slice(firstUserIdx);

    const lastMsg = contents[contents.length - 1];

    const systemWithContext = knownFields.length > 0
      ? `${SYSTEM_INSTRUCTION}\n\nDADOS JÁ RECOLHIDOS (não perguntes sobre estes):\n${knownFields.join("\n")}`
      : SYSTEM_INSTRUCTION;

    const response = await ai.models.generateContent({
      model: MODEL,
      config: {
        systemInstruction: systemWithContext,
      },
      contents: [
        ...safeHistory,
        { role: lastMsg.role, parts: lastMsg.parts },
      ],
    });

    const responseText = response.text ?? "";

    return NextResponse.json({ message: responseText, role: "assistant" });
  } catch (error) {
    console.error("[chat-simulador] Erro detalhado do Gemini:", error);
    return NextResponse.json(
      {
        error: "GEMINI_REQUEST_FAILED",
        customerMessage:
          "Não consegui calcular a estimativa agora. Pode continuar a enviar os detalhes e a equipa CLYON confirma o valor.",
      },
      { status: 500 }
    );
  }
}
