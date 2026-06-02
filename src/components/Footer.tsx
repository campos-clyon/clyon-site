"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { trackWhatsAppClick, trackPhoneCall } from "@/lib/analytics";
import { BUSINESS_INSTAGRAM, BUSINESS_PHONE, BUSINESS_EMAIL } from "@/lib/seo-data";

const services = [
  { name: "Recolha de Móveis", href: "/recolha-de-moveis" },
  { name: "Recolha de Entulho", href: "/recolha-de-entulho" },
  { name: "Esvaziamento de Casas", href: "/esvaziamento-de-casas" },
  { name: "Limpeza Pós-Obra", href: "/limpeza-pos-obra" },
  { name: "Mudanças", href: "/mudancas" },
  { name: "Preços", href: "/precos" },
];

const regions = [
  { name: "Lisboa", href: "/recolha-moveis-lisboa" },
  { name: "Almada", href: "/recolha-moveis-almada" },
  { name: "Seixal", href: "/recolha-moveis-seixal" },
  { name: "Setúbal", href: "/recolha-moveis-setubal" },
  { name: "Cascais", href: "/recolha-moveis-cascais" },
  { name: "Amadora", href: "/recolha-moveis-amadora" },
];

const company = [
  { name: "Sobre Nós", href: "/sobre-nos" },
  { name: "Trabalhos", href: "/trabalhos" },
  { name: "Avaliações", href: "/avaliacoes" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Contactos", href: "/contactos" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const phoneHref = `tel:${BUSINESS_PHONE.replace(/\s+/g, "")}`;
  const whatsappNumber = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  return (
    <footer className="bg-slate-900">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-clyon-icon.webp"
                alt="CLYON"
                width={160}
                height={56}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
              Recolha de móveis, entulho, esvaziamentos e mudanças em Lisboa, Margem Sul e Setúbal. Resposta rápida e orçamento grátis.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href={phoneHref}
                onClick={() => trackPhoneCall("footer")}
                className="flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-cyan-500" />
                +351 934 748 005
              </a>
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                className="flex items-center gap-3 text-sm text-slate-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-cyan-500" />
                {BUSINESS_EMAIL}
              </a>
              <div className="flex items-start gap-3 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500" />
                <span>Belverde, Amora, 2845-513</span>
              </div>
            </div>

            {/* Social & WhatsApp */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={BUSINESS_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Serviços</h3>
            <ul className="mt-5 space-y-3">
              {services.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Regiões</h3>
            <ul className="mt-5 space-y-3">
              {regions.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Empresa</h3>
            <ul className="mt-5 space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            © {currentYear} CLYON. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacidade" className="text-sm text-slate-500 transition-colors hover:text-white">
              Privacidade
            </Link>
            <Link href="/cookies" className="text-sm text-slate-500 transition-colors hover:text-white">
              Cookies
            </Link>
            <CookiePreferencesLink />
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick("floating")}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:bg-emerald-600 hover:shadow-xl"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </footer>
  );
}
