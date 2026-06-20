import { generateText } from "ai";
import type { ModelMessage } from "ai";
import { NextRequest, NextResponse } from "next/server";

// Modelo via Vercel AI Gateway — sem quota do tier gratuito
const MODEL = process.env.CHAT_MODEL || "google/gemini-2.0-flash";

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


type MsgPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

type IncomingMessage = {
  role: "user" | "assistant";
  content: string | MsgPart[];
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      messages: IncomingMessage[];
      order?: Record<string, unknown>;
    };
    const { messages, order } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    // Contexto do pedido já recolhido — passado ao Gemini para não repetir perguntas
    const knownFields: string[] = [];
    if (order) {
      if (order.serviceType) knownFields.push(`Serviço: ${order.serviceType}`);
      if (order.description) knownFields.push(`Descrição: ${order.description}`);
      if (order.floor) knownFields.push(`Andar: ${order.floor}`);
      if (order.hasElevator && order.hasElevator !== "unknown") knownFields.push(`Elevador: ${order.hasElevator}`);
      if (order.parkingDistance && order.parkingDistance !== "unknown") knownFields.push(`Estacionamento: ${order.parkingDistance}`);
      if (order.urgency) knownFields.push(`Urgência: ${order.urgency}`);
      if (order.city) knownFields.push(`Cidade: ${order.city}`);
      const receiver = order.receiver as { name?: string; phone?: string } | undefined;
      if (receiver?.name) knownFields.push(`Nome: ${receiver.name}`);
      if (receiver?.phone) knownFields.push(`Telefone: ${receiver.phone}`);
    }

    const systemWithContext = knownFields.length > 0
      ? `${SYSTEM_INSTRUCTION}\n\nDADOS JÁ RECOLHIDOS (não voltes a perguntar sobre estes campos):\n${knownFields.join("\n")}`
      : SYSTEM_INSTRUCTION;

    // Converter para formato simples compatível com AI SDK
    // Histórico: texto apenas. Última mensagem: pode ter imagens inline.
    const rawMessages = messages.map((msg, idx) => {
      const role = msg.role === "assistant" ? "assistant" : "user";
      const isLast = idx === messages.length - 1;

      if (typeof msg.content === "string") {
        return { role, content: msg.content };
      }

      const parts = msg.content as MsgPart[];

      if (isLast) {
        // Última mensagem — preservar imagens para o Gemini ver
        const content = parts.map((part) => {
          if ("inlineData" in part) {
            return { type: "image", image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` };
          }
          return { type: "text", text: (part as { text: string }).text };
        });
        return { role, content };
      }

      // Mensagens do histórico — extrair só o texto
      const text = parts
        .filter((p): p is { text: string } => "text" in p)
        .map((p) => p.text)
        .join(" ");
      return { role, content: text || "(imagem)" };
    });

    // A API exige que o histórico comece com 'user'
    const firstUserIdx = rawMessages.findIndex((m) => m.role === "user");
    const safeMessages = (firstUserIdx >= 0 ? rawMessages.slice(firstUserIdx) : rawMessages) as ModelMessage[];

    const { text } = await generateText({
      model: MODEL,
      system: systemWithContext,
      messages: safeMessages,
    });

    return NextResponse.json({ message: text ?? "", role: "assistant" });
  } catch (error) {
    console.error("[chat-simulador] Erro:", error);
    return NextResponse.json(
      {
        error: "AI_REQUEST_FAILED",
        customerMessage: "Não consegui processar o pedido agora. Tente novamente ou contacte a CLYON diretamente.",
      },
      { status: 500 }
    );
  }
}
