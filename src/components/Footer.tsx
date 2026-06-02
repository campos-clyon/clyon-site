"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { trackWhatsAppClick, trackPhoneCall } from "@/lib/analytics";
import { BUSINESS_INSTAGRAM, BUSINESS_PHONE, BUSINESS_EMAIL } from "@/lib/seo-data";

const servicos = [
  { nome: "Recolha de Móveis", url: "/recolha-de-moveis" },
  { nome: "Recolha de Entulho", url: "/recolha-de-entulho" },
  { nome: "Esvaziamento de Casas", url: "/esvaziamento-de-casas" },
  { nome: "Limpeza Pós-Obra", url: "/limpeza-pos-obra" },
  { nome: "Mudanças", url: "/mudancas" },
  { nome: "Preços", url: "/precos" },
];

const regioes = [
  { nome: "Lisboa", url: "/recolha-moveis-lisboa" },
  { nome: "Almada", url: "/recolha-moveis-almada" },
  { nome: "Seixal", url: "/recolha-moveis-seixal" },
  { nome: "Setúbal", url: "/recolha-moveis-setubal" },
  { nome: "Cascais", url: "/recolha-moveis-cascais" },
  { nome: "Amadora", url: "/recolha-moveis-amadora" },
];

const empresa = [
  { nome: "Sobre Nós", url: "/sobre-nos" },
  { nome: "Trabalhos", url: "/trabalhos" },
  { nome: "Avaliações", url: "/avaliacoes" },
  { nome: "Blog", url: "/blog" },
  { nome: "FAQ", url: "/faq" },
  { nome: "Contactos", url: "/contactos" },
];

export default function Footer() {
  const anoAtual = new Date().getFullYear();
  const telHref = `tel:${BUSINESS_PHONE.replace(/\s+/g, "")}`;
  const numeroWhatsapp = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  return (
    <footer className="bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/">
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

            <div className="mt-6 space-y-3">
              <a
                href={telHref}
                onClick={() => trackPhoneCall("footer")}
                className="flex items-center gap-3 text-sm text-white"
              >
                <Phone className="h-4 w-4 text-cyan-500" />
                +351 934 748 005
              </a>
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                className="flex items-center gap-3 text-sm text-white"
              >
                <Mail className="h-4 w-4 text-cyan-500" />
                geral@clyon.pt
              </a>
              <div className="flex items-start gap-3 text-sm text-white">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500" />
                Belverde, Amora, 2845-513
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <a
                href={urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
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

          {/* Serviços Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Serviços</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/recolha-de-moveis" className="text-sm text-white hover:text-cyan-400">
                  Recolha de Móveis
                </Link>
              </li>
              <li>
                <Link href="/recolha-de-entulho" className="text-sm text-white hover:text-cyan-400">
                  Recolha de Entulho
                </Link>
              </li>
              <li>
                <Link href="/esvaziamento-de-casas" className="text-sm text-white hover:text-cyan-400">
                  Esvaziamento de Casas
                </Link>
              </li>
              <li>
                <Link href="/limpeza-pos-obra" className="text-sm text-white hover:text-cyan-400">
                  Limpeza Pós-Obra
                </Link>
              </li>
              <li>
                <Link href="/mudancas" className="text-sm text-white hover:text-cyan-400">
                  Mudanças
                </Link>
              </li>
              <li>
                <Link href="/precos" className="text-sm text-white hover:text-cyan-400">
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Regiões Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Regiões</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/recolha-moveis-lisboa" className="text-sm text-white hover:text-cyan-400">
                  Lisboa
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-almada" className="text-sm text-white hover:text-cyan-400">
                  Almada
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-seixal" className="text-sm text-white hover:text-cyan-400">
                  Seixal
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-setubal" className="text-sm text-white hover:text-cyan-400">
                  Setúbal
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-cascais" className="text-sm text-white hover:text-cyan-400">
                  Cascais
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-amadora" className="text-sm text-white hover:text-cyan-400">
                  Amadora
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Empresa</h3>
            <ul className="mt-5 space-y-3">
              <li>
                <Link href="/sobre-nos" className="text-sm text-white hover:text-cyan-400">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/trabalhos" className="text-sm text-white hover:text-cyan-400">
                  Trabalhos
                </Link>
              </li>
              <li>
                <Link href="/avaliacoes" className="text-sm text-white hover:text-cyan-400">
                  Avaliações
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-white hover:text-cyan-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-white hover:text-cyan-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contactos" className="text-sm text-white hover:text-cyan-400">
                  Contactos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            © {anoAtual} CLYON. Todos os direitos reservados.
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
        href={urlWhatsapp}
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
