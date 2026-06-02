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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white/98 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-clyon-icon.webp"
            alt="CLYON - Recolha de Móveis e Entulho"
            className="h-11 w-auto sm:h-12"
            width={205}
            height={84}
            priority
            sizes="205px"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="text-[0.9375rem] font-medium text-slate-600 transition-colors hover:text-cyan-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick("header")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </a>
          <Link
            href="/simulador"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-700"
          >
            Pedir Orçamento
          </Link>
        </div>

        <button
          className="inline-flex rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:border-cyan-200 hover:text-cyan-600 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-cyan-600"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 grid gap-3 pt-4 border-t border-slate-100">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackWhatsAppClick("header_mobile");
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3.5 text-base font-semibold text-white transition-all hover:bg-emerald-600"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
              <Link
                href="/simulador"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3.5 text-base font-semibold text-white transition-all hover:bg-cyan-700"
              >
                Pedir Orçamento Grátis
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
