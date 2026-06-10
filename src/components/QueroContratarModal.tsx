"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import { trackLeadFormStart, trackLeadFormSubmit } from "@/lib/analytics";

const TIPOS_SERVICO = [
  "Recolha de móveis",
  "Esvaziamento de casa/apartamento",
  "Recolha de monos/volumosos",
  "Recolha de entulho",
  "Limpeza pós-obra",
  "Outro",
] as const;

const PREFERENCIAS_CONTACTO = [
  "WhatsApp",
  "Chamada",
  "Email",
  "SMS",
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  nome: string;
  telefone: string;
  email: string;
  localidade: string;
  tipoServico: string;
  preferenciaContacto: string;
  mensagem: string;
  consentimento: boolean;
}

const EMPTY_FORM: FormData = {
  nome: "",
  telefone: "",
  email: "",
  localidade: "",
  tipoServico: "",
  preferenciaContacto: "",
  mensagem: "",
  consentimento: false,
};

export default function QueroContratarModal({ open, onClose }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const trackedOpen = useRef(false);

  // Focar no primeiro campo e registar evento ao abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => firstFieldRef.current?.focus(), 50);
      if (!trackedOpen.current) {
        trackLeadFormStart("quero_contratar_header");
        // Registar evento interno
        void fetch("/api/leads/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "click_cta_quero_contratar",
            pagePath: window.location.pathname,
            pageUrl: window.location.href,
          }),
        }).catch(() => null);
        trackedOpen.current = true;
      }
    } else {
      trackedOpen.current = false;
    }
  }, [open]);

  // Fechar com ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Bloquear scroll do body enquanto o modal está aberto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose],
  );

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormData, string>> = {};
    if (!form.nome.trim()) next.nome = "Nome obrigatório.";
    if (!form.telefone.trim()) next.telefone = "Telefone obrigatório.";
    if (!form.email.trim()) next.email = "Email obrigatório.";
    else if (!form.email.includes("@")) next.email = "Email inválido.";
    if (!form.localidade.trim()) next.localidade = "Localidade obrigatória.";
    if (!form.tipoServico) next.tipoServico = "Selecione o tipo de serviço.";
    if (!form.preferenciaContacto) next.preferenciaContacto = "Selecione a preferência de contacto.";
    if (!form.consentimento) next.consentimento = "O consentimento é obrigatório.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const utmParams = typeof window !== "undefined"
      ? Object.fromEntries(new URLSearchParams(window.location.search).entries())
      : {};

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome.trim(),
          telefone: form.telefone.trim(),
          email: form.email.trim(),
          localidade: form.localidade.trim(),
          tipoServico: form.tipoServico,
          preferenciaContacto: form.preferenciaContacto,
          mensagem: form.mensagem.trim() || null,
          pagePath: window.location.pathname,
          pageUrl: window.location.href,
          utmSource: utmParams.utm_source ?? null,
          utmMedium: utmParams.utm_medium ?? null,
          utmCampaign: utmParams.utm_campaign ?? null,
          gclid: utmParams.gclid ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors({ nome: data.error ?? "Erro ao enviar. Tente novamente." });
        setLoading(false);
        return;
      }

      // Tracking GA4
      trackLeadFormSubmit("quero_contratar_header", form.tipoServico);

      // Evento interno
      void fetch("/api/leads/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "form_submit_quero_contratar",
          pagePath: window.location.pathname,
          pageUrl: window.location.href,
          serviceType: form.tipoServico,
          location: form.localidade,
          contactPreference: form.preferenciaContacto,
          utmSource: utmParams.utm_source ?? null,
          utmMedium: utmParams.utm_medium ?? null,
          utmCampaign: utmParams.utm_campaign ?? null,
          gclid: utmParams.gclid ?? null,
        }),
      }).catch(() => null);

      setSuccess(true);
      setLoading(false);

      // Se preferência for WhatsApp, abrir chat após 1.5s
      if (form.preferenciaContacto === "WhatsApp") {
        const phoneDigits = form.telefone.replace(/\D/g, "");
        const msg = encodeURIComponent(
          `Olá! Enviei um pedido através do site CLYON.\nNome: ${form.nome}\nServiço: ${form.tipoServico}\nLocalidade: ${form.localidade}`,
        );
        setTimeout(() => {
          window.open(`https://wa.me/351965785395?text=${msg}`, "_blank", "noopener,noreferrer");
        }, 1500);
      }
    } catch {
      setErrors({ nome: "Erro ao enviar. Verifique a ligação e tente novamente." });
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset state after transition
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setSuccess(false);
      setLoading(false);
    }, 300);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        {/* Header do modal */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 rounded-t-3xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-5">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-white">
              Pedir contacto da CLYON
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-cyan-100">
              Preencha os seus dados e a equipa CLYON entra em contacto consigo para recolha de móveis, esvaziamento de casas, monos ou outros serviços.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar modal"
            className="mt-0.5 flex-shrink-0 rounded-xl bg-white/20 p-2 text-white transition hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6">
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-800">Pedido enviado com sucesso</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                A equipa CLYON irá entrar em contacto consigo brevemente.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-6 rounded-2xl bg-cyan-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Nome */}
              <div>
                <label htmlFor="lead-nome" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nome completo <span className="text-rose-500">*</span>
                </label>
                <input
                  ref={firstFieldRef}
                  id="lead-nome"
                  type="text"
                  autoComplete="name"
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  placeholder="O seu nome"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300 ${errors.nome ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white focus:border-cyan-400"}`}
                />
                {errors.nome && <p className="mt-1 text-xs text-rose-600">{errors.nome}</p>}
              </div>

              {/* Telefone + Email (lado a lado em ecrãs > sm) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="lead-telefone" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Telefone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lead-telefone"
                    type="tel"
                    autoComplete="tel"
                    value={form.telefone}
                    onChange={(e) => set("telefone", e.target.value)}
                    placeholder="912 345 678"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300 ${errors.telefone ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white focus:border-cyan-400"}`}
                  />
                  {errors.telefone && <p className="mt-1 text-xs text-rose-600">{errors.telefone}</p>}
                </div>

                <div>
                  <label htmlFor="lead-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300 ${errors.email ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white focus:border-cyan-400"}`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                </div>
              </div>

              {/* Localidade */}
              <div>
                <label htmlFor="lead-localidade" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Localidade <span className="text-rose-500">*</span>
                </label>
                <input
                  id="lead-localidade"
                  type="text"
                  autoComplete="address-level2"
                  value={form.localidade}
                  onChange={(e) => set("localidade", e.target.value)}
                  placeholder="Cidade ou município"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-300 ${errors.localidade ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white focus:border-cyan-400"}`}
                />
                {errors.localidade && <p className="mt-1 text-xs text-rose-600">{errors.localidade}</p>}
              </div>

              {/* Tipo de serviço */}
              <div>
                <label htmlFor="lead-servico" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Tipo de serviço <span className="text-rose-500">*</span>
                </label>
                <select
                  id="lead-servico"
                  value={form.tipoServico}
                  onChange={(e) => set("tipoServico", e.target.value)}
                  className={`w-full appearance-none rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-cyan-300 ${!form.tipoServico ? "text-slate-400" : "text-slate-800"} ${errors.tipoServico ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white focus:border-cyan-400"}`}
                >
                  <option value="" disabled>Selecione o tipo de serviço</option>
                  {TIPOS_SERVICO.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.tipoServico && <p className="mt-1 text-xs text-rose-600">{errors.tipoServico}</p>}
              </div>

              {/* Preferência de contacto */}
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Preferência de contacto <span className="text-rose-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {PREFERENCIAS_CONTACTO.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => set("preferenciaContacto", pref)}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${
                        form.preferenciaContacto === pref
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-600"
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
                {errors.preferenciaContacto && (
                  <p className="mt-1 text-xs text-rose-600">{errors.preferenciaContacto}</p>
                )}
              </div>

              {/* Mensagem (opcional) */}
              <div>
                <label htmlFor="lead-mensagem" className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Mensagem{" "}
                  <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="lead-mensagem"
                  rows={3}
                  value={form.mensagem}
                  onChange={(e) => set("mensagem", e.target.value)}
                  placeholder="Descreva o que necessita, quantidade aproximada, urgência..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300"
                />
              </div>

              {/* Consentimento */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consentimento}
                    onChange={(e) => set("consentimento", e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-cyan-600"
                  />
                  <span className="text-sm leading-relaxed text-slate-600">
                    Autorizo a CLYON a entrar em contacto comigo sobre este pedido.{" "}
                    <span className="text-rose-500">*</span>
                  </span>
                </label>
                {errors.consentimento && (
                  <p className="mt-1 text-xs text-rose-600">{errors.consentimento}</p>
                )}
              </div>

              {/* Botão de envio */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  "Enviar pedido"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
