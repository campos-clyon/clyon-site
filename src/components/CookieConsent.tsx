"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, Settings2 } from "lucide-react";

import {
  COOKIE_CONSENT_KEY,
  COOKIE_PREFERENCES_KEY,
  CookieConsentState,
  CookiePreferences,
  defaultCookiePreferences,
  getAcceptedCookiePreferences,
} from "@/lib/cookie-consent";

function saveConsent(status: CookieConsentState["status"], preferences: CookiePreferences) {
  const payload: CookieConsentState = {
    status,
    updatedAt: new Date().toISOString(),
    preferences,
  };

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload));
  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
  document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(status)}; path=/; max-age=${60 * 60 * 24 * 180}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("clyon-cookie-consent-updated", { detail: payload }));
}

function readConsent() {
  const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CookieConsentState;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultCookiePreferences);

  useEffect(() => {
    const consent = readConsent();
    if (!consent) {
      setVisible(true);
      return;
    }

    setPreferences(consent.preferences);
  }, []);

  const handleReject = () => {
    saveConsent("rejected", defaultCookiePreferences);
    setPreferences(defaultCookiePreferences);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleAccept = () => {
    const acceptedPreferences = getAcceptedCookiePreferences();
    saveConsent("accepted", acceptedPreferences);
    setPreferences(acceptedPreferences);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    saveConsent("custom", preferences);
    setVisible(false);
    setShowPreferences(false);
  };

  return (
    <>
      {visible ? (
        <div className="fixed inset-x-0 bottom-0 z-[70] px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-[30px] border border-cyan-100 bg-white p-5 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.28)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  <Cookie className="h-4 w-4" />
                  Cookies
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-950">Utilizamos cookies para melhorar a experiência no site.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Os cookies essenciais mantêm o site funcional. Pode também permitir cookies de análise e marketing
                  para melhorar medições e campanhas. Consulte a{" "}
                  <Link href="/privacidade" className="font-semibold text-cyan-700 hover:text-cyan-600">
                    política de privacidade e cookies
                  </Link>
                  .
                </p>

                {showPreferences ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <PreferenceCard
                      title="Necessários"
                      description="Sempre activos para funcionamento básico."
                      enabled
                      locked
                      onToggle={() => undefined}
                    />
                    <PreferenceCard
                      title="Analítica"
                      description="Medição de visitas e desempenho das páginas."
                      enabled={preferences.analytics}
                      onToggle={() =>
                        setPreferences((state) => ({
                          ...state,
                          analytics: !state.analytics,
                        }))
                      }
                    />
                    <PreferenceCard
                      title="Marketing"
                      description="Apoio a campanhas e remarketing futuro."
                      enabled={preferences.marketing}
                      onToggle={() =>
                        setPreferences((state) => ({
                          ...state,
                          marketing: !state.marketing,
                        }))
                      }
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                {showPreferences ? (
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400"
                  >
                    Guardar preferências
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPreferences(true)}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Settings2 className="mr-2 h-4 w-4" />
                    Gerir cookies
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReject}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Recusar opcionais
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_-18px_rgba(16,185,129,0.65)] transition hover:bg-emerald-400"
                >
                  Aceitar cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="fixed bottom-28 left-4 z-[60] inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.32)] backdrop-blur transition hover:bg-cyan-50"
          aria-label="Gerir cookies"
        >
          <Cookie className="h-4 w-4 text-cyan-700" />
          Cookies
        </button>
      )}
    </>
  );
}

function PreferenceCard({
  title,
  description,
  enabled,
  onToggle,
  locked = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  locked?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-cyan-100 bg-slate-50/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-xs leading-6 text-slate-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          disabled={locked}
          className={`relative h-7 w-12 rounded-full transition ${
            enabled ? "bg-emerald-500" : "bg-slate-300"
          } ${locked ? "cursor-not-allowed opacity-80" : ""}`}
          aria-pressed={enabled}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
