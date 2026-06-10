import { NextRequest, NextResponse } from "next/server";
import { createLeadEvent } from "@/lib/db";

const VALID_EVENT_TYPES = new Set([
  "click_cta_quero_contratar",
  "click_whatsapp",
  "click_call",
  "click_email",
  "click_sms",
  "click_cta_pedir_orcamento",
  "click_cta_ligar_agora",
  "form_submit_quero_contratar",
]);

// POST /api/leads/events — registar evento de tracking de contacto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventType, pagePath, pageUrl, serviceType,
      location, contactPreference, utmSource, utmMedium, utmCampaign, gclid,
    } = body;

    if (!eventType || typeof eventType !== "string") {
      return NextResponse.json({ error: "eventType é obrigatório." }, { status: 400 });
    }

    const sanitizedType = String(eventType).slice(0, 80);

    // Aceitar qualquer eventType que comece por prefixos válidos, ou que esteja na lista
    const isValid =
      VALID_EVENT_TYPES.has(sanitizedType) ||
      sanitizedType.startsWith("click_") ||
      sanitizedType.startsWith("form_");

    if (!isValid) {
      console.warn("[api/leads/events] Tipo de evento não reconhecido:", sanitizedType);
      // Gravar mesmo assim — não bloquear o cliente
    }

    console.log("[api/leads/events] POST recebido:", sanitizedType, "path:", pagePath);

    await createLeadEvent({
      eventType: sanitizedType,
      pagePath: pagePath ? String(pagePath).slice(0, 255) : null,
      pageUrl: pageUrl ? String(pageUrl).slice(0, 500) : null,
      serviceType: serviceType ? String(serviceType).slice(0, 80) : null,
      location: location ? String(location).slice(0, 120) : null,
      contactPreference: contactPreference ? String(contactPreference).slice(0, 30) : null,
      utmSource: utmSource ? String(utmSource).slice(0, 120) : null,
      utmMedium: utmMedium ? String(utmMedium).slice(0, 120) : null,
      utmCampaign: utmCampaign ? String(utmCampaign).slice(0, 120) : null,
      gclid: gclid ? String(gclid).slice(0, 255) : null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/leads/events] POST error:", error);
    // Retornar 200 para não bloquear o utilizador — evento de tracking não deve causar erro visível
    return NextResponse.json({ success: true });
  }
}
