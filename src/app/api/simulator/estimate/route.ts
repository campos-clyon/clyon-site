import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { calculateLocalEstimate, detectZone } from "@/app/simulador/pricingRules";
import type { OrderData, EstimateResult } from "@/app/simulador/types";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function generateEstimateWithGemini(
  order: OrderData
): Promise<EstimateResult | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
És um orçamentista sénior da empresa CLYON em Portugal.
Com base nos dados abaixo, calcula uma estimativa de preço para o serviço de recolha/transporte.

DADOS DO PEDIDO:
${JSON.stringify(order, null, 2)}

PREÇÁRIO BASE CLYON (valores sem IVA, IVA = 23%):
- Zona A (Amora, Fernão Ferro): base 220€
- Zona B (Lisboa normal): base 250€
- Zona C (Lisboa difícil, regiões distantes): base 270€
- Zona D: orçamento personalizado

MULTIPLICADOR DE VOLUME (aplicado ao preço base ANTES dos extras):
- Até 5 itens/sacos: ×1.0 (sem ajuste)
- 6–15 itens/sacos: ×1.15
- 16–30 itens/sacos: ×1.35
- 31–60 sacos/itens: ×1.60
- 61–100 sacos: ×2.0
- Mais de 100 sacos: ×2.6 (possível 2.ª viagem)
IMPORTANTE: Lê a descrição e extrai a quantidade. 50 sacos e 100 sacos TÊM valores diferentes.

EXTRAS (após o multiplicador):
- Urgente hoje: +30€ a +60€
- Sem elevador, carga leve: +15€ a +25€ por andar
- Sem elevador, carga pesada: +25€ a +50€ por andar
- Desmontagem simples: +30€ a +50€
- Desmontagem média: +60€ a +120€
- Estacionamento difícil: +30€ a +80€

Responde APENAS com JSON válido neste formato exato:
{
  "status": "estimated",
  "estimatedPriceWithoutVat": 220,
  "vatAmount": 50.6,
  "estimatedPriceWithVat": 270.6,
  "difficultyLevel": 2,
  "summary": "Recolha de mobiliário, 2.º andar com elevador, Lisboa.",
  "assumptions": ["Elevador funcional", "Acesso razoável à porta"],
  "missingFields": [],
  "customerMessage": "A estimativa prevista para este serviço é entre 220€ e 270€ + IVA, sujeito a confirmação.",
  "internalNotes": ["Verificar peso dos sofás"]
}

Usa linguagem natural em português de Portugal no customerMessage.
Nunca uses "valor definitivo" — usa sempre "estimativa" ou "sujeito a confirmação".
`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = (response.text ?? "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    return JSON.parse(jsonMatch[0]) as EstimateResult;
  } catch (err) {
    console.error("[simulator/estimate] Gemini error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order: OrderData = body.order ?? {};

    if (!order.locationZone && (order.city || order.address?.city)) {
      order.locationZone = detectZone(order.city ?? order.address?.city);
    }

    const geminiResult = await generateEstimateWithGemini(order);
    const result = geminiResult ?? calculateLocalEstimate(order);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[simulator/estimate] Error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: "ESTIMATE_FAILED",
        customerMessage:
          "Não consegui calcular a estimativa agora. Pode continuar a enviar os detalhes e a equipa CLYON confirma o valor.",
      },
      { status: 500 }
    );
  }
}
