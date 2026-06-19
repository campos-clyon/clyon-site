import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `És o orçamentista virtual da Clyon. Vai direto ao assunto.

Se o cliente mandar fotos, avalia o volume rapidamente. Tens de fazer perguntas pertinentes, UMA DE CADA VEZ:
1) Qual é o andar?
2) Tem elevador onde os itens caibam?
3) Tem lugar para estacionar a carrinha perto da porta?

Quando tiveres a resposta a estas questões logísticas E as fotos, NÃO dês o preço ainda. Deves escrever EXATAMENTE e APENAS a palavra-chave [ABRIR_FORMULARIO]. Não escrevas mais nada nessa mensagem.

Se o cliente fornecer os dados (nome, contacto, morada), processa essa informação e dá o teu orçamento final estimado em formato de intervalo de preço (exemplo: "80€ a 120€"), finalizando de forma profissional.`;

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
    const { messages } = (await request.json()) as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
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

    const response = await ai.models.generateContent({
      model: MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
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
