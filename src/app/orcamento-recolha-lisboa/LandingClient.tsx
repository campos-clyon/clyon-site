"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Sofa,
  Sparkles,
  Trash2,
  Truck,
  Users,
  XCircle,
} from "lucide-react";

const PHONE_DISPLAY = "+351 931 632 622";
const PHONE_TEL = "+351931632622";
const WHATSAPP_BASE = "https://wa.me/351931632622";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

type DataLayerEvent = Record<string, unknown>;

function pushDataLayer(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

function trackWhatsApp(location: string) {
  pushDataLayer({ event: "click_whatsapp", location });
}

function trackCall(location: string) {
  pushDataLayer({ event: "click_call", location });
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

function captureUtms() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const stored: Record<string, string> = {};
  let hasNew = false;
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      stored[key] = value;
      hasNew = true;
    }
  });
  if (hasNew) {
    try {
      localStorage.setItem("clyon_utms", JSON.stringify(stored));
    } catch {
      /* ignore */
    }
  }
}

function getStoredUtms(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("clyon_utms");
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

const SERVICE_OPTIONS = [
  "Recolha de entulho",
  "Recolha de móveis",
  "Recolha de monos/volumosos",
  "Esvaziamento de casa",
  "Limpeza pós-obra",
  "Outro",
];

const ACCESS_OPTIONS = [
  "Rés-do-chão",
  "Com elevador",
  "Sem elevador",
  "Escadas estreitas",
  "Acesso difícil",
];

const URGENCY_OPTIONS = ["Hoje", "Amanhã", "Esta semana", "Sem urgência"];

const AREAS = [
  "Lisboa",
  "Amadora",
  "Odivelas",
  "Loures",
  "Oeiras",
  "Cascais",
  "Sintra",
  "Almada",
  "Seixal",
  "Barreiro",
  "Montijo",
  "Moita",
  "Setúbal",
  "Sesimbra",
  "Palmela",
  "Quinta do Conde",
  "Fernão Ferro",
  "Amora",
  "Corroios",
];

const FAQ_ITEMS = [
  {
    q: "Como peço orçamento?",
    a: "Envie fotos do material, indique a morada e diga se há escadas, elevador ou acesso difícil.",
  },
  {
    q: "A equipa carrega os materiais?",
    a: "Sim. A equipa trata do carregamento e transporte, conforme o serviço contratado.",
  },
  {
    q: "Fazem recolha urgente?",
    a: "Sim, mediante disponibilidade. Serviços urgentes podem ter custo adicional.",
  },
  {
    q: "Recolhem entulho de obra?",
    a: "Sim, desde que não envolva materiais perigosos, amianto, químicos ou resíduos contaminados.",
  },
  {
    q: "Posso enviar fotos pelo WhatsApp?",
    a: "Sim. É a forma mais rápida para receber uma estimativa.",
  },
  {
    q: "Quais zonas atendem?",
    a: "Lisboa, Grande Lisboa, Margem Sul e Setúbal.",
  },
  {
    q: "O orçamento é gratuito?",
    a: "Sim, o pedido de orçamento é gratuito. O serviço de recolha é pago.",
  },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return <MessageCircle className={className} aria-hidden="true" />;
}

export default function LandingClient() {
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    captureUtms();
    pushDataLayer({ event: "page_view_landing" });
  }, []);

  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white text-slate-900">
      <TopBar />
      <Hero heroRef={heroRef} />
      <HowItWorks />
      <ServicesSection />
      <QualificationSection />
      <PricingGuide />
      <TrustSection />
      <AreasSection />
      <FAQSection />
      <FinalCTA />
      <StickyMobileCTA visible={showStickyBar} />
      <FloatingWhatsAppButton />
      <div className="h-20 md:h-0" aria-hidden="true" />
    </div>
  );
}

/* ----------------------------- Top Bar ----------------------------- */
function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            CLYON
          </span>
          <span className="hidden text-xs font-medium text-slate-500 sm:inline">
            Lisboa • Margem Sul • Setúbal
          </span>
        </div>
        <a
          href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Olá CLYON, gostaria de pedir um orçamento.")}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsApp("top_bar")}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}

/* ------------------------------ Hero ------------------------------ */
function Hero({ heroRef }: { heroRef: React.RefObject<HTMLDivElement | null> }) {
  const badges = [
    { icon: MessageCircle, label: "Orçamento rápido por WhatsApp" },
    { icon: Truck, label: "Carregamento incluído" },
    { icon: MapPin, label: "Lisboa, Margem Sul e Setúbal" },
  ];

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-start lg:py-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Orçamento rápido por WhatsApp
          </span>
          <h1 className="mt-4 text-balance text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Recolha de Entulho, Móveis e Monos em Lisboa e Setúbal
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Envie fotos pelo WhatsApp, indique a morada e receba um orçamento
            rápido para recolha, carregamento e transporte.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm"
              >
                <badge.icon className="h-4 w-4 text-cyan-600" />
                {badge.label}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Olá CLYON, gostaria de pedir um orçamento. Vou enviar fotos do material.")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsApp("hero")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-md transition hover:bg-emerald-600"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Enviar Fotos no WhatsApp
            </a>
            <a
              href={`tel:${PHONE_TEL}`}
              onClick={() => trackCall("hero")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
            >
              <Phone className="h-5 w-5" />
              Ligar Agora
            </a>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Resposta mediante disponibilidade da equipa. Envie fotos para uma
            estimativa mais precisa.
          </p>
        </div>

        <div className="lg:pl-4">
          <LeadForm />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- Lead Form ---------------------------- */
function LeadForm() {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    localidade: "",
    servico: "",
    acesso: "",
    urgencia: "",
    descricao: "",
  });
  const formStarted = useRef(false);

  function handleFirstInteraction() {
    if (!formStarted.current) {
      formStarted.current = true;
      pushDataLayer({ event: "form_start", form_name: "orcamento_recolha" });
    }
  }

  function update(field: keyof typeof form, value: string) {
    handleFirstInteraction();
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const utms = getStoredUtms();
    pushDataLayer({
      event: "lead_form_submit",
      form_name: "orcamento_recolha",
      service_type: form.servico || undefined,
      urgency: form.urgencia || undefined,
      ...utms,
    });

    const message = [
      "Olá CLYON, gostaria de pedir um orçamento.",
      `Nome: ${form.nome}`,
      `Telefone: ${form.telefone}`,
      `Localidade: ${form.localidade}`,
      `Serviço: ${form.servico}`,
      `Acesso: ${form.acesso}`,
      `Urgência: ${form.urgencia}`,
      `Descrição: ${form.descricao}`,
    ].join("\n");

    trackWhatsApp("lead_form");
    window.open(
      `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100";
  const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_0.75rem_center] bg-no-repeat pr-10`;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
          <Camera className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Peça o seu orçamento
          </h2>
          <p className="text-xs text-slate-500">Resposta rápida por WhatsApp</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            required
            placeholder="Nome"
            aria-label="Nome"
            value={form.nome}
            onChange={(e) => update("nome", e.target.value)}
            className={inputClass}
          />
          <input
            type="tel"
            required
            placeholder="Telefone"
            aria-label="Telefone"
            value={form.telefone}
            onChange={(e) => update("telefone", e.target.value)}
            className={inputClass}
          />
        </div>

        <input
          type="text"
          required
          placeholder="Localidade"
          aria-label="Localidade"
          value={form.localidade}
          onChange={(e) => update("localidade", e.target.value)}
          className={inputClass}
        />

        <select
          required
          aria-label="Tipo de serviço"
          value={form.servico}
          onChange={(e) => update("servico", e.target.value)}
          className={`${selectClass} ${form.servico ? "text-slate-900" : "text-slate-400"}`}
        >
          <option value="" disabled>
            Tipo de serviço
          </option>
          {SERVICE_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="text-slate-900">
              {opt}
            </option>
          ))}
        </select>

        <textarea
          placeholder="O que precisa recolher?"
          aria-label="Descrição"
          rows={2}
          value={form.descricao}
          onChange={(e) => update("descricao", e.target.value)}
          className={`${inputClass} resize-none`}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <select
            aria-label="Tipo de acesso"
            value={form.acesso}
            onChange={(e) => update("acesso", e.target.value)}
            className={`${selectClass} ${form.acesso ? "text-slate-900" : "text-slate-400"}`}
          >
            <option value="" disabled>
              Tipo de acesso
            </option>
            {ACCESS_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="text-slate-900">
                {opt}
              </option>
            ))}
          </select>

          <select
            aria-label="Urgência"
            value={form.urgencia}
            onChange={(e) => update("urgencia", e.target.value)}
            className={`${selectClass} ${form.urgencia ? "text-slate-900" : "text-slate-400"}`}
          >
            <option value="" disabled>
              Urgência
            </option>
            {URGENCY_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="text-slate-900">
                {opt}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-emerald-600"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Receber Orçamento
        </button>
        <p className="text-center text-xs text-slate-500">
          Ao enviar, abre o WhatsApp com os seus dados preenchidos.
        </p>
      </div>
    </form>
  );
}

/* --------------------------- Section Title --------------------------- */
function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="mt-2 text-balance text-2xl font-extrabold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-pretty text-base leading-relaxed text-slate-600">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* --------------------------- How It Works --------------------------- */
function HowItWorks() {
  const steps = [
    {
      icon: Camera,
      title: "Envie fotos",
      text: "Mostre o volume e o tipo de material.",
    },
    {
      icon: MapPin,
      title: "Informe a morada",
      text: "Diga a localidade e o tipo de acesso.",
    },
    {
      icon: BadgeCheck,
      title: "Receba o orçamento",
      text: "A CLYON avalia o serviço e envia uma estimativa clara.",
    },
    {
      icon: Truck,
      title: "Agende a recolha",
      text: "A equipa vai ao local, carrega e transporta.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionTitle eyebrow="Simples e rápido" title="Como funciona" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <span className="absolute right-5 top-5 text-3xl font-extrabold text-slate-100">
              {index + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <step.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Services --------------------------- */
function ServicesSection() {
  const services = [
    {
      icon: Trash2,
      title: "Recolha de Entulho",
      text: "Remoção de sacos de obra, restos de remodelação, madeira, tijolo, azulejo, cimento e materiais semelhantes.",
    },
    {
      icon: Sofa,
      title: "Recolha de Móveis",
      text: "Retirada de sofás, camas, colchões, armários, mesas, cadeiras e móveis usados.",
    },
    {
      icon: Package,
      title: "Recolha de Monos",
      text: "Remoção de objectos volumosos, tralha acumulada, materiais de garagem, arrecadação ou apartamento.",
    },
    {
      icon: Truck,
      title: "Esvaziamento de Casas",
      text: "Ideal para heranças, mudanças, imóveis para venda, apartamentos acumulados ou limpezas completas.",
    },
    {
      icon: Sparkles,
      title: "Limpeza Pós-Obra",
      text: "Apoio na remoção de resíduos e limpeza após remodelações, obras e intervenções.",
    },
  ];

  function handleCardCta(service: string) {
    pushDataLayer({ event: "service_card_click", service_name: service });
    trackWhatsApp("service_card");
  }

  return (
    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="O que recolhemos"
          title="Serviços de recolha e esvaziamento"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <service.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {service.title}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                {service.text}
              </p>
              <a
                href={`${WHATSAPP_BASE}?text=${encodeURIComponent(`Olá CLYON, gostaria de um orçamento para ${service.title}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCardCta(service.title)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 transition hover:gap-2.5"
              >
                Pedir orçamento
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Qualification --------------------------- */
function QualificationSection() {
  const included = [
    "Recolha no local",
    "Carregamento pela equipa",
    "Transporte",
    "Orçamento mediante fotos",
    "Atendimento em Lisboa, Margem Sul e Setúbal",
  ];
  const notIncluded = [
    "Amianto",
    "Químicos",
    "Resíduos perigosos",
    "Materiais contaminados",
    "Demolição pesada",
    "Lixo doméstico misturado sem triagem",
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionTitle
        eyebrow="Pré-qualificação"
        title="Para um orçamento mais preciso, envie fotos"
        subtitle="O preço depende do volume, peso, localização, distância até à carrinha, necessidade de desmontagem, urgência e tipo de acesso."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            Incluído
          </h3>
          <ul className="mt-4 space-y-2.5">
            {included.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <XCircle className="h-5 w-5 text-red-500" />
            Não recolhemos
          </h3>
          <ul className="mt-4 space-y-2.5">
            {notIncluded.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-slate-700"
              >
                <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Pricing Guide --------------------------- */
function PricingGuide() {
  const cards = [
    {
      title: "Entulho",
      text: "Valor sob avaliação por volume e acesso.",
      icon: Trash2,
    },
    {
      title: "Móveis e monos",
      text: "Orçamento conforme quantidade e transporte.",
      icon: Sofa,
    },
    {
      title: "Esvaziamento",
      text: "Ideal para casas, garagens e arrecadações.",
      icon: Truck,
    },
    {
      title: "Pós-obra",
      text: "Avaliação conforme área e resíduos.",
      icon: Sparkles,
    },
  ];

  return (
    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="Valores orientativos"
          title="Quanto custa a recolha?"
          subtitle="Cada serviço é avaliado conforme volume, localização e acesso. Envie fotos para receber um orçamento ajustado ao seu caso."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <card.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {card.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {card.text}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500">
          Os valores apresentados em orçamento podem não incluir IVA, quando
          aplicável.
        </p>
        <div className="mt-8 flex justify-center">
          <a
            href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Olá CLYON, gostaria de um orçamento. Vou enviar fotos.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("pricing")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-emerald-600"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Enviar Fotos para Orçamento
          </a>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Trust --------------------------- */
function TrustSection() {
  const items = [
    { icon: MapPin, label: "Empresa local" },
    { icon: Clock, label: "Atendimento rápido" },
    { icon: Users, label: "Equipa profissional" },
    { icon: Truck, label: "Serviço com carregamento" },
    { icon: MessageCircle, label: "WhatsApp direto" },
    { icon: ShieldCheck, label: "Cobertura Lisboa, Margem Sul e Setúbal" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <SectionTitle
        eyebrow="Confiança"
        title="Recolha profissional com orçamento simples"
        subtitle="A CLYON ajuda particulares e empresas a libertar espaço com recolha profissional e orçamento simples."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-800">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------- Areas --------------------------- */
function AreasSection() {
  return (
    <section className="bg-slate-900 py-14">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
          Áreas atendidas
        </span>
        <h2 className="mt-2 text-balance text-2xl font-extrabold text-white sm:text-3xl">
          Atendimento em Lisboa, Margem Sul e Setúbal
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          {AREAS.map((area) => (
            <span
              key={area}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white"
            >
              {area}
            </span>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-xl text-sm text-slate-300">
          Se a sua localidade não estiver na lista, envie mensagem para
          confirmar disponibilidade.
        </p>
      </div>
    </section>
  );
}

/* --------------------------- FAQ --------------------------- */
function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  function toggle(index: number) {
    const next = open === index ? null : index;
    setOpen(next);
    if (next !== null) {
      pushDataLayer({
        event: "faq_open",
        question: FAQ_ITEMS[index].q,
      });
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <SectionTitle eyebrow="Dúvidas frequentes" title="Perguntas e respostas" />
      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = open === index;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-900 sm:text-base">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-cyan-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen ? (
                <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                  {item.a}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* --------------------------- Final CTA --------------------------- */
function FinalCTA() {
  return (
    <section className="bg-slate-900 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl">
          Precisa libertar espaço?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-relaxed text-slate-300">
          Envie fotos agora e receba uma estimativa para recolha de entulho,
          móveis, monos ou limpeza pós-obra.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Olá CLYON, gostaria de pedir um orçamento. Vou enviar fotos do material.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsApp("final_cta")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-600"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Enviar Fotos no WhatsApp
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            onClick={() => trackCall("final_cta")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
          >
            <Phone className="h-5 w-5" />
            Ligar para a CLYON
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-400">{PHONE_DISPLAY}</p>
      </div>
    </section>
  );
}

/* --------------------------- Sticky Mobile CTA --------------------------- */
function StickyMobileCTA({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.2)] transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a
        href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Olá CLYON, gostaria de pedir um orçamento.")}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsApp("sticky_mobile")}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
      >
        <WhatsAppIcon className="h-5 w-5" />
        WhatsApp
      </a>
      <a
        href={`tel:${PHONE_TEL}`}
        onClick={() => trackCall("sticky_mobile")}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white"
      >
        <Phone className="h-5 w-5" />
        Ligar
      </a>
    </div>
  );
}

/* --------------------------- Floating WhatsApp --------------------------- */
function FloatingWhatsAppButton() {
  return (
    <a
      href={`${WHATSAPP_BASE}?text=${encodeURIComponent("Olá CLYON, gostaria de pedir um orçamento.")}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp("floating_button")}
      aria-label="Contactar via WhatsApp"
      className="fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 md:flex"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
