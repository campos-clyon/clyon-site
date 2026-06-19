import { NextRequest, NextResponse } from "next/server";
import { calculateLocalEstimate, detectZone } from "@/app/simulador/pricingRules";
import type { OrderData, EstimateResult } from "@/app/simulador/types";

async function generateEstimateWithGemini(order: OrderData): Promise<EstimateResult | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
És um orçamentista sénior da empresa CLYON em Portugal. Com base nos dados abaixo, calcula uma estimativa de preço para o serviço de recolha/transporte.

DADOS DO PEDIDO:
${JSON.stringify(order, null, 2)}

PREÇÁRIO BASE CLYON (valores sem IVA, IVA = 23%):
- Zona A (Amora, Fernão Ferro): base 220€
- Zona B (Lisboa normal): base 250€  
- Zona C (Lisboa difícil, regiões distantes): base 270€
- Zona D: orçamento personalizado

EXTRAS:
- Urgente hoje: +30€ a +60€
- Sem elevador, carga leve: +15€ a +25€ por andar
- Sem elevador, carga pesada: +25€ a +50€ por andar
- Desmontagem simples: +30€ a +50€
- Desmontagem média: +60€ a +120€
- Estacionamento difícil: +30€ a +80€

Responde APENAS com JSON válido neste formato exato:
{
  "status": "estimated" | "needs_more_info" | "onsite_required",
  "estimatedPriceWithoutVat": number | null,
  "vatAmount": number | null,
  "estimatedPriceWithVat": number | null,
  "difficultyLevel": 1 | 2 | 3 | 4 | 5,
  "summary": string,
  "assumptions": string[],
  "missingFields": string[],
  "customerMessage": string,
  "internalNotes": string[]
}

Usa linguagem natural em português de Portugal no customerMessage. Nunca diz que o valor é definitivo — usa "estimativa", "valor previsto" ou "sujeito a confirmação".
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as EstimateResult;
    return parsed;
  } catch (err) {
    console.error("[simulator/estimate] Gemini error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order: OrderData = body.order ?? {};

    // Garantir zona detectada
    if (!order.locationZone && (order.city || order.address?.city)) {
      order.locationZone = detectZone(order.city ?? order.address?.city);
    }

    // Tentar Gemini primeiro; fallback para cálculo local
    const geminiResult = await generateEstimateWithGemini(order);
    const result = geminiResult ?? calculateLocalEstimate(order);

    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[simulator/estimate] Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
