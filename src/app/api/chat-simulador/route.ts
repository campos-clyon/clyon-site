import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY ?? "");

const SYSTEM_INSTRUCTION = `És o orçamentista virtual da Clyon. Vai direto ao assunto.

Se o cliente mandar fotos, avalia o volume rapidamente. Tens de fazer perguntas pertinentes, UMA DE CADA VEZ:
1) Qual é o andar?
2) Tem elevador onde os itens caibam?
3) Tem lugar para estacionar a carrinha perto da porta?

Quando tiveres a resposta a estas questões logísticas E as fotos, NÃO dês o preço ainda. Deves escrever EXATAMENTE e APENAS a palavra-chave [ABRIR_FORMULARIO]. Não escrevas mais nada nessa mensagem.

Se o cliente fornecer os dados (nome, contacto, morada), processa essa informação e dá o teu orçamento final estimado em formato de intervalo de preço (exemplo: "80€ a 120€"), finalizando de forma profissional.`;

type Message = {
  role: "user" | "assistant";
  content: string | { inlineData: { mimeType: string; data: string } }[];
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
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
