/**
 * trackContactEvent — envia evento de contacto para /api/leads/events
 *
 * Usa navigator.sendBeacon quando disponível (não bloqueia navegação).
 * Fallback para fetch com keepalive: true.
 * Em caso de falha, apenas regista no console em desenvolvimento.
 */

interface TrackEventPayload {
  eventType: string;
  serviceType?: string;
  location?: string;
  contactPreference?: string;
}

export function trackContactEvent(payload: TrackEventPayload): void {
  if (typeof window === "undefined") return;

  const utmParams = Object.fromEntries(new URLSearchParams(window.location.search));

  const body = JSON.stringify({
    eventType: payload.eventType,
    pagePath: window.location.pathname,
    pageUrl: window.location.href,
    serviceType: payload.serviceType ?? null,
    location: payload.location ?? null,
    contactPreference: payload.contactPreference ?? null,
    utmSource: utmParams.utm_source ?? null,
    utmMedium: utmParams.utm_medium ?? null,
    utmCampaign: utmParams.utm_campaign ?? null,
    gclid: utmParams.gclid ?? null,
  });

  const url = "/api/leads/events";

  // Preferir sendBeacon — funciona mesmo quando o utilizador navega para fora
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    const sent = navigator.sendBeacon(url, blob);
    if (sent) return;
  }

  // Fallback: fetch com keepalive
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((err) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("[trackContactEvent] Falha ao enviar evento:", payload.eventType, err);
    }
  });
}
