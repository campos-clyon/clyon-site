import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/genai";

const genai = new GoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

interface FormData {
  serviceType?: string;
  description?: string;
  volume?: string;
  heavyItems?: string[];
  needsDismantling?: string;
  files?: unknown[];
  address?: {
    formattedAddress?: string;
    city?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
    placeId?: string;
  };
  distanceFromBase?: {
    distanceKm?: number;
    durationText?: string;
    distanceMeters?: number;
    durationSeconds?: number;
  };
  floor?: string;
  hasElevator?: string;
  parkingDistance?: string;
  difficultAccess?: string;
  accessNotes?: string;
  urgency?: string;
  preferredDate?: string;
  preferredTime?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    contactPreference?: string;
  };
}

interface AnalysisResult {
  ok: boolean;
  status: "estimated" | "needs_more_info" | "onsite_required";
  estimatedPriceWithoutVat: number | null;
  vatAmount: number | null;
  estimatedPriceWithVat: number | null;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  summary: string;
  assumptions: string[];
  missingFields: string[];
  customerMessage: string;
  internalNotes: string[];
}

// CLYON Pricing Rules Prompt
const CLYON_PRICING_RULES = `
CLYON PRICING SPECIALIST - JUNK REMOVAL & TRANSPORT (Portugal)
Current date: ${new Date().toISOString()}

PRICING RULES (ALL PRICES WITHOUT VAT - VAT 23% will be calculated separately):

WASTE (bags ~50L each):
- Base price: 3€ per bag
- Minimum charge: 90€ (even if less than 30 bags)
- Example: 50 bags = 150€ without VAT

FURNITURE/LARGE ITEMS (per item):
- Sofa: 60€
- Bed/Mattress: 50-55€
- Large wardrobe/cabinet: 70€
- Fridge/Freezer: 50-60€
- Washing machine: 55€
- Generic furniture item: 25-40€
- Minimum base service: 80€

DISTANCE ZONES (one-way from Almada base):
- Zone A (Almada, Caparica, Seixal): 0€ extra
- Zone B (Lisbon proper, Oeiras, Amadora, Cascais): +25€
- Zone C (Sintra, Mafra, Setúbal, outlying areas): +45€

ACCESS DIFFICULTY SURCHARGES:
- No elevator + 3+ floors + heavy items: +40€
- Difficult parking (>40m walk): +30€
- Very narrow stairs/tight access: +20€
- Requires dismantling simple items: +15€
- Requires dismantling complex items: +40€

URGENCY SURCHARGES:
- Same-day service: +40€
- Next-day service: +20€
- Flexible scheduling: 0€

MINIMUM SERVICE CHARGE: 95€ total

VOLUME GUIDE (for estimation):
- "Poucos objetos" (few items): 1-5 small items, ~25-40€
- "1/4 carrinha": ~80-120€
- "1/2 carrinha": ~150-250€
- "3/4 carrinha": ~300-400€
- "Carrinha cheia": ~400-600€
- "Mais de uma carrinha": 600€+

ANALYSIS APPROACH:
1. Evaluate service type and description
2. Estimate volume based on items listed
3. Add surcharges for access difficulty, distance, urgency
4. Ensure minimum charge is met
5. Return difficulty level (1=easy, 5=very complex)
6. Flag for onsite analysis if: volume unclear, mixed waste types, extremely heavy items, or complex access
7. List missing information that would improve accuracy

OUTPUT FORMAT:
Return ONLY valid JSON, no markdown, no explanations. Use this exact structure:
{
  "status": "estimated|onsite_required|needs_more_info",
  "estimatedPriceWithoutVat": <number or null>,
  "vatAmount": <number or null>,
  "estimatedPriceWithVat": <number or null>,
  "difficultyLevel": <1-5>,
  "summary": "<brief summary of service, volume, and conditions>",
  "assumptions": ["<assumption 1>", "<assumption 2>", ...],
  "missingFields": ["<field if info insufficient>"],
  "customerMessage": "Portuguese message to show customer",
  "internalNotes": ["<internal note 1>", "<internal note 2>", ...]
}
`;

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] POST /api/simulator/analyze: Starting...");
    const { formData } = await req.json();

    if (!formData) {
      console.log("[v0] POST /api/simulator/analyze: ❌ formData missing");
      return NextResponse.json({ error: "formData required" }, { status: 400 });
    }

    const form: FormData = formData;

    // Validate minimum required fields
    if (!form.customer?.name || !form.customer?.phone || !form.serviceType) {
      console.log("[v0] POST /api/simulator/analyze: ❌ Required fields missing");
      return NextResponse.json(
        { error: "Missing required: customer name, phone, or serviceType" },
        { status: 400 }
      );
    }

    console.log("[v0] POST /api/simulator/analyze: ✓ Validated form data");
    console.log("[v0] POST /api/simulator/analyze: Customer=", form.customer.name, "Service=", form.serviceType);

    // Build prompt for Gemini
    const userPrompt = `
Analyze this customer service request and provide a pricing estimate:

CUSTOMER INFO:
- Name: ${form.customer.name}
- Phone: ${form.customer.phone}
- Email: ${form.customer.email || "Not provided"}

SERVICE REQUEST:
- Service Type: ${form.serviceType}
- Description: ${form.description || "No description provided"}
- Estimated Volume: ${form.volume || "Not specified"}
- Heavy Items: ${form.heavyItems?.join(", ") || "None mentioned"}
- Needs Dismantling: ${form.needsDismantling || "Not specified"}

LOCATION:
- Address: ${form.address?.formattedAddress || "Not provided"}
- City: ${form.address?.city || "Not provided"}
- Floor: ${form.floor || "Not specified"}
- Has Elevator: ${form.hasElevator || "Not specified"}
- Parking Distance: ${form.parkingDistance || "Not specified"}
- Difficult Access: ${form.difficultAccess || "Not specified"}
- Access Notes: ${form.accessNotes || "None"}

SERVICE DETAILS:
- Distance from base: ${form.distanceFromBase?.distanceKm || "Unknown"} km (${form.distanceFromBase?.durationText || "Unknown"})
- Urgency: ${form.urgency || "Flexible"}
- Preferred Date: ${form.preferredDate || "Flexible"}
- Files/Photos: ${form.files?.length || 0} files uploaded

Based on CLYON pricing rules, provide a structured analysis and estimate.
If information is insufficient or volume is very large, recommend onsite analysis.
Return ONLY the JSON object, no explanations.
`;

    // Call Gemini
    const model = genai.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    });

    console.log("[v0] POST /api/simulator/analyze: Calling Gemini with model=", process.env.GEMINI_MODEL || "gemini-2.0-flash");

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: CLYON_PRICING_RULES,
            },
            {
              text: userPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    });

    console.log("[v0] POST /api/simulator/analyze: ✓ Gemini responded");

    // Extract text from response
    const responseText =
      response.response.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.response.text;

    if (!responseText) {
      console.error("[v0] POST /api/simulator/analyze: ❌ No text in Gemini response");
      return NextResponse.json(
        { error: "Gemini did not return content" },
        { status: 500 }
      );
    }

    console.log("[v0] POST /api/simulator/analyze: Parsing Gemini response...");

    // Parse JSON from response
    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error("[v0] POST /api/simulator/analyze: ❌ Failed to parse JSON:", e);
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1]);
      } else {
        throw e;
      }
    }

    // Validate analysis structure
    if (!analysis.status || !["estimated", "needs_more_info", "onsite_required"].includes(analysis.status)) {
      throw new Error("Invalid status in analysis");
    }

    // Calculate VAT if price provided
    if (analysis.estimatedPriceWithoutVat !== null) {
      analysis.vatAmount = analysis.estimatedPriceWithoutVat * 0.23;
      analysis.estimatedPriceWithVat = analysis.estimatedPriceWithoutVat + analysis.vatAmount;
    }

    console.log("[v0] POST /api/simulator/analyze: ✓ Analysis complete", {
      status: analysis.status,
      price: analysis.estimatedPriceWithVat,
      difficulty: analysis.difficultyLevel,
    });

    return NextResponse.json({
      ok: true,
      ...analysis,
    });
  } catch (err: any) {
    console.error("[v0] POST /api/simulator/analyze: ❌ Error:", err.message, err.stack);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Analysis failed",
      },
      { status: 500 }
    );
  }
}
