import Link from "next/link";
import { ArrowRight, MessageCircle, Phone } from "lucide-react";

import { BUSINESS_PHONE } from "@/lib/seo-data";

interface CTABlockProps {
  title?: string;
  description?: string;
  primaryText?: string;
  primaryHref?: string;
  showWhatsApp?: boolean;
  showPhone?: boolean;
  variant?: "default" | "compact" | "centered";
  className?: string;
  whatsappMessage?: string;
}

export default function CTABlock({
  title = "Pronto para começar?",
  description = "Peça um orçamento grátis e receba resposta em 24 horas.",
  primaryText = "Pedir Orçamento Grátis",
  primaryHref = "/contactos",
  showWhatsApp = true,
  showPhone = false,
  variant = "default",
  className = "",
  whatsappMessage = "Olá! Gostava de pedir um orçamento à CLYON.",
}: CTABlockProps) {
  const whatsappNumber = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const phoneHref = `tel:${BUSINESS_PHONE.replace(/\s+/g, "")}`;

  if (variant === "compact") {
    return (
      <div className={`flex flex-col gap-3 sm:flex-row ${className}`}>
        <Link
          href={primaryHref}
          className="site-btn-primary site-btn-lively min-w-[200px] px-6 py-3.5 text-white"
        >
          <span className="text-white">{primaryText}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        {showWhatsApp && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(37,211,102,0.75)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-white">WhatsApp</span>
          </a>
        )}
        {showPhone && (
          <a
            href={phoneHref}
            className="site-btn-secondary site-btn-lively min-w-[160px] px-6 py-3.5"
          >
            <Phone className="h-4 w-4" />
            <span>Ligar</span>
          </a>
        )}
      </div>
    );
  }

  if (variant === "centered") {
    return (
      <div
        className={`rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white px-6 py-10 text-center shadow-[0_24px_60px_-20px_rgba(14,116,144,0.12)] sm:px-10 ${className}`}
      >
        <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {title}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-base text-slate-600">
          {description}
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="site-btn-primary site-btn-lively min-w-[220px] px-8 py-4 text-lg text-white"
          >
            <span className="text-white">{primaryText}</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          {showWhatsApp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-[0_18px_40px_-22px_rgba(37,211,102,0.75)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-white">WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
          {title}
        </h3>
        <p className="mt-1 text-base text-slate-600">{description}</p>
      </div>
      <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="site-btn-primary site-btn-lively px-6 py-3.5 text-white"
        >
          <span className="text-white">{primaryText}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
        {showWhatsApp && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 font-semibold text-white shadow-[0_18px_40px_-22px_rgba(37,211,102,0.75)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-white">WhatsApp</span>
          </a>
        )}
      </div>
    </div>
  );
}
