import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const SYSTEM_INSTRUCTION = `És um orçamentista experiente e simpático da empresa de recolhas e logística Clyon, a operar em Portugal. O teu objetivo é dar estimativas de preços para recolha de materiais (móveis, entulho, plásticos, ferro, etc.).

Regras rigorosas:

1. Faz apenas uma ou duas perguntas de cada vez. Sê conversacional e amigável.

2. Precisas de saber:
   - O que é para recolher (pede fotos ou descrição detalhada)
   - A morada/cidade
   - As condições de acesso (se há elevador, andares, se são escadas, etc.)

3. Quando tiveres estes dados, calcula uma estimativa de volume e dá um preço em intervalo (ex: entre 80€ e 120€).

4. REGRA DE OURO: Nunca confirmes o serviço, nunca digas que está agendado e não tomes decisões finais. A Clyon toma as decisões finais.

5. A tua última ação deve ser SEMPRE: dizer que o orçamento preliminar está pronto, resumir o que foi recolhido (tipo de material, morada, condições) e pedir o número de WhatsApp do cliente para que a equipa de coordenação humana faça a aprovação final e o agendamento.

Mantém sempre um tom profissional mas amigável e confiante. Foca-te em recolher informação de forma natural conversacional.`;

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
    console.error("[chat-simulador] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
