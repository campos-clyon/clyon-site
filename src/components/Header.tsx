"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, MessageCircle, Phone, X } from "lucide-react";

import { trackWhatsAppClick, trackPhoneCall } from "@/lib/analytics";
import { BUSINESS_PHONE } from "@/lib/seo-data";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const phoneHref = `tel:${BUSINESS_PHONE.replace(/\s+/g, "")}`;
  const whatsappNumber = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  const navLinks = [
    { label: "Serviços", href: "/servicos" },
    { label: "Trabalhos", href: "/trabalhos" },
    { label: "Avaliações", href: "/avaliacoes" },
    { label: "Sobre Nós", href: "/sobre-nos" },
    { label: "Contactos", href: "/contactos" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/40 bg-white/95 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.28)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-3 px-4 py-4 sm:px-6 xl:px-8">
        <Link href="/" className="flex-shrink-0 cursor-pointer">
          <Image
            src="/logo-clyon-icon.webp"
            alt="CLYON - Recolha de Móveis e Entulho"
            className="h-[46px] w-auto scale-x-105 sm:h-[58px]"
            width={205}
            height={84}
            priority
            sizes="205px"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-9 text-[15px] font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-cyan-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-400"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={phoneHref}
              className="site-btn-primary site-btn-lively flex w-full py-3"
              aria-label={`Ligar para ${BUSINESS_PHONE}`}
            >
              <Phone className="h-4 w-4" />
              <span>Ligar</span>
            </a>

          <a
            href={phoneHref}
            onClick={() => trackPhoneCall("header")}
            className="site-btn-primary site-btn-lively px-4 py-3 sm:px-5"
            aria-label={`Ligar para ${BUSINESS_PHONE}`}
          >
            <Phone className="h-4 w-4 text-white" />
            <span className="hidden !text-sm !font-semibold !text-white sm:inline">Ligar</span>
          </a>

          <button
            className="inline-flex rounded-xl border border-cyan-200 bg-white p-3 text-slate-600 transition-colors hover:text-cyan-600 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-cyan-100/60 bg-white/95 backdrop-blur lg:hidden">
          <nav className="grid gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-2xl border border-cyan-200 bg-white px-4 py-3 transition-colors hover:bg-cyan-50"
              >
                <span className="!text-base !font-semibold !text-[#047faa]">{link.label}</span>
              </Link>
            ))}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackWhatsAppClick("header_mobile");
                setMenuOpen(false);
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-emerald-400"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={phoneHref}
              className="site-btn-primary site-btn-lively flex w-full py-3"
              onClick={() => {
                trackPhoneCall("header_mobile");
                setMenuOpen(false);
              }}
              aria-label={`Ligar para ${BUSINESS_PHONE}`}
            >
              <Phone className="h-4 w-4" />
              <span>Ligar</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
