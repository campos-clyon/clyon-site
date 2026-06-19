import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `És o orçamentista virtual da CLYON, empresa de recolha de móveis, monos, entulho, esvaziamentos e mudanças em Portugal.

CAMPOS NECESSÁRIOS PARA O ORÇAMENTO (verifica quais faltam):
1. Tipo de serviço (recolha de móveis / monos / entulho / esvaziamento / mudança)
2. Descrição do que precisa recolher ou transportar
3. Andar onde está o material
4. Se tem elevador (e se os itens cabem)
5. Estacionamento para a carrinha perto da porta
6. Nome, telefone e morada do cliente

REGRAS:
- Extrai TUDO o que o cliente já forneceu na mensagem. NÃO voltes a perguntar o que já sabes.
- Após extrair, verifica os campos em falta da lista acima.
- Pergunta APENAS sobre o próximo campo em falta — uma pergunta de cada vez.
- Nunca respondas com erros, desculpas ou mensagens de "não consigo calcular". A tua função é recolher informação.
- Quando tiveres os campos 1-5 preenchidos, pede os dados de contacto escrevendo [ABRIR_FORMULARIO] numa linha separada.
- Nunca dês preços concretos.
- Sê direto e simpático, sem emojis em excesso.

EXEMPLOS DO QUE PERGUNTAR QUANDO FALTA INFO:
- Falta andar → "Em que andar se encontra o material?"
- Falta elevador → "Existe elevador? Se sim, os itens cabem?"  
- Falta estacionamento → "A carrinha consegue estacionar perto da entrada?"
- Falta tudo menos serviço → "Pode descrever o que precisa de recolher?"`;


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
      { error: "GEMINI_KEY_MISSING" },
      { status: 503 }
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
