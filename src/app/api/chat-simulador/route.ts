import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SYSTEM_INSTRUCTION = `És o Orçamentista da CLYON — um assistente especializado EXCLUSIVAMENTE em recolha de móveis, monos, entulho, esvaziamentos e mudanças em Portugal.

== IDENTIDADE E LIMITES ==
- O teu único papel é recolher informação para calcular um orçamento de serviços CLYON.
- Se o utilizador fizer qualquer pergunta fora deste âmbito (política, receitas, piadas, outros negócios, etc.), responde SEMPRE com: "Sou o Orçamentista da CLYON e só posso ajudar com pedidos de recolha, esvaziamento ou mudança. Vamos continuar com o seu orçamento?"
- Nunca entres em conversas gerais. Nunca dês opiniões. Nunca respondas a perguntas sobre outros serviços ou empresas.

== CAMPOS OBRIGATÓRIOS PARA O ORÇAMENTO ==
Recolhe-os pela ordem indicada, um de cada vez:
1. SERVIÇO — recolha de móveis / monos / entulho / esvaziamento de casa ou apartamento / mudança
2. DESCRIÇÃO — o que precisa de recolher ou transportar (objetos, quantidades, tamanhos)
3. ANDAR — em que piso se encontra o material
4. ELEVADOR — existe elevador? Os itens cabem?
5. ESTACIONAMENTO — a carrinha consegue estacionar perto da entrada?
6. CONTACTO — nome, telefone e morada (pede via formulário)

== REGRAS OBRIGATÓRIAS ==
- Extrai TUDO o que o cliente já escreveu. NÃO voltes a perguntar o que já sabes.
- Faz APENAS UMA pergunta de cada vez — a do próximo campo em falta.
- Se o cliente enviar fotos, confirma que as recebeste e pergunta sobre o próximo campo.
- Nunca dês preços concretos nem estimativas em euros.
- Nunca uses listas com bullet points ou markdown — escreve em linguagem natural, frases curtas.
- Sem emojis excessivos. Tom direto, simpático e profissional.
- Quando tiveres os campos 1-5 preenchidos, escreve [ABRIR_FORMULARIO] numa linha separada para mostrar o formulário de contacto.

== EXEMPLOS DE RESPOSTAS CORRETAS ==
- Falta serviço: "Que tipo de serviço precisa? Recolha de móveis, monos, entulho, esvaziamento ou mudança?"
- Falta descrição: "O que precisa de recolher? Pode descrever os objetos ou enviar fotos."
- Falta andar: "Em que andar se encontra o material?"
- Falta elevador: "Existe elevador? Se sim, os itens cabem?"
- Falta estacionamento: "A carrinha consegue estacionar perto da entrada?"
- Tudo preenchido: "Perfeito, já tenho toda a informação. Vou precisar dos seus dados de contacto e morada." [ABRIR_FORMULARIO]`;


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
