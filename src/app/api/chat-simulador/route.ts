import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");

const SYSTEM_INSTRUCTION = `És um orçamentista experiente, prático e simpático da empresa de recolhas e logística Clyon, em Portugal. O teu objetivo é dar estimativas de preços para recolha de materiais, móveis, entulho ou plásticos.

Regras de operação:

1. Sê muito conversacional e direto. Faz apenas UMA ou DUAS perguntas por mensagem. Não sobrecarregues o cliente.

2. Os três dados obrigatórios que precisas de descobrir ao longo da conversa são: A) O que é para recolher (pede fotos ou descrição para estimar o volume); B) A morada (cidade/bairro); C) As condições de acesso (se é rés-do-chão, se há elevador onde caibam as coisas, ou se tem escadas).

3. Assim que tiveres estes três dados, faz uma estimativa de volume mentalmente e dá um PREÇO EM INTERVALO (exemplo: "O valor estimado para esta recolha ficará entre 80€ e 120€").

4. REGRA DE SEGURANÇA (CRÍTICA): Nunca confirmes o serviço como fechado, nunca digas que está agendado e não tomes decisões finais.

5. A tua última ação após dar o preço estimado deve ser SEMPRE esta: avisa que o orçamento preliminar está pronto e pede o número de WhatsApp ou telemóvel do cliente, explicando que a equipa de coordenação humana vai aprovar o valor final e combinar o agendamento logístico das carrinhas.`;

type Message = {
  role: "user" | "assistant";
  content: string | { inlineData: { mimeType: string; data: string } }[];
};

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json() as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Converter para formato esperado pelo Gemini
    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // Converter histórico de mensagens
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: Array.isArray(msg.content)
        ? msg.content.map((part: any) => {
            if (part.inlineData) {
              return {
                inlineData: {
                  mimeType: part.inlineData.mimeType,
                  data: part.inlineData.data,
                },
              };
            }
            return { text: part.text || "" };
          })
        : [{ text: String(msg.content) }],
    }));

    const chat = model.startChat({ history: contents.slice(0, -1) });

    // Última mensagem do utilizador (pode ter texto + imagens)
    const lastMessage = messages[messages.length - 1];
    const lastContent = Array.isArray(lastMessage.content)
      ? lastMessage.content.map((part: any) => {
          if (part.inlineData) {
            return {
              inlineData: {
                mimeType: part.inlineData.mimeType,
                data: part.inlineData.data,
              },
            };
          }
          return { text: part.text || "" };
        })
      : [{ text: String(lastMessage.content) }];

    const result = await chat.sendMessage(lastContent);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({
      message: responseText,
      role: "assistant",
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[chat-simulador] Error:", errorMsg);
    return NextResponse.json(
      {
        error: "Falha ao gerar resposta",
        details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
      },
      { status: 500 }
    );
  }
}
