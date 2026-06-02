/**
 * Analytics utilities for GA4 tracking via gtag
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

// Lead form events
export function trackLeadFormStart(formLocation: string): void {
  trackEvent("lead_form_start", {
    form_location: formLocation,
  });
}

export function trackLeadFormSubmit(formLocation: string, serviceType?: string): void {
  trackEvent("lead_form_submit", {
    form_location: formLocation,
    service_type: serviceType,
  });
}

// WhatsApp events
export function trackWhatsAppClick(location: string, context?: string): void {
  trackEvent("whatsapp_click", {
    click_location: location,
    context: context,
  });
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
  trackEvent("cta_click", {
    cta_name: ctaName,
    cta_location: ctaLocation,
  });
}

// Phone call events
export function trackPhoneCall(location: string): void {
  trackEvent("phone_call_click", {
    click_location: location,
  });
}

// Page-specific events
export function trackServicePageView(serviceName: string, cityName?: string): void {
  trackEvent("service_page_view", {
    service_name: serviceName,
    city_name: cityName,
  });
}
