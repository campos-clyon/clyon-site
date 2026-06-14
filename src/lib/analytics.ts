/**
 * Analytics utilities for GA4 tracking via gtag + BD interna via /api/leads/events
 * All events are conditionally fired only if gtag is available
 */

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Track a custom event to Google Analytics 4
 * Safe to call even if GA is not loaded - will silently skip
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/**
 * Gravar evento na BD interna via /api/leads/events
 * Usa sendBeacon para não bloquear a navegação
 */
function trackDB(eventType: string, location?: string, serviceType?: string): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    eventType,
    pagePath: window.location.pathname,
    pageUrl: window.location.href,
    location: location ?? null,
    serviceType: serviceType ?? null,
  });
  const url = "/api/leads/events";
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (sent) return;
  }
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

// Lead form events
export function trackLeadFormStart(formLocation: string): void {
  trackEvent("lead_form_start", { form_location: formLocation });
}

export function trackLeadFormSubmit(formLocation: string, serviceType?: string): void {
  trackEvent("lead_form_submit", { form_location: formLocation, service_type: serviceType });
  trackDB("form_submit_contacto", formLocation, serviceType);
}

// WhatsApp events
export function trackWhatsAppClick(location: string, context?: string): void {
  trackEvent("whatsapp_click", { click_location: location, context: context });
  trackDB("click_whatsapp", location, context);
}

// Simulator events
export function trackSimulatorStart(category?: string): void {
  trackEvent("simulator_start", {
    category: category,
  });
}

export function trackSimulatorStepComplete(step: number, stepName: string): void {
  trackEvent("simulator_step_complete", {
    step_number: step,
    step_name: stepName,
  });
}

export function trackSimulatorComplete(
  category: string,
  estimatedValue: number,
  city?: string
): void {
  trackEvent("simulator_complete", {
    category: category,
    estimated_value: estimatedValue,
    city: city,
  });
}

export function trackSimulatorWhatsApp(
  category: string,
  estimatedValue: number,
  hasPhone: boolean
): void {
  trackEvent("simulator_whatsapp", {
    category: category,
    estimated_value: estimatedValue,
    has_phone: hasPhone,
  });
}

// CTA events
export function trackCTAClick(ctaName: string, ctaLocation: string): void {
  trackEvent("cta_click", { cta_name: ctaName, cta_location: ctaLocation });
  trackDB("click_cta_pedir_orcamento", ctaLocation, ctaName);
}

// Phone call events
export function trackPhoneCall(location: string): void {
  trackEvent("phone_call_click", { click_location: location });
  trackDB("click_call", location);
}

// Page-specific events
export function trackServicePageView(serviceName: string, cityName?: string): void {
  trackEvent("service_page_view", {
    service_name: serviceName,
    city_name: cityName,
  });
}
