"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Serviços", href: "/servicos" },
    { label: "Trabalhos", href: "/trabalhos" },
    { label: "Avaliações", href: "/avaliacoes" },
    { label: "Sobre Nós", href: "/sobre-nos" },
    { label: "Contactos", href: "/contactos" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/40 bg-white/95 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.28)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0 cursor-pointer">
          <Image
            src="/logo-clyon-icon.webp"
            alt="CLYON - Recolha de Móveis e Entulho"
            className="h-[40px] w-auto scale-x-105 sm:h-[46px]"
            width={205}
            height={84}
            priority
            sizes="205px"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 text-[14.5px] font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-cyan-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <button
            className="inline-flex rounded-xl border border-cyan-200 bg-white p-2.5 text-slate-600 transition-colors hover:text-cyan-600 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/trabalhos" className="site-btn-secondary hidden px-4 py-2 lg:inline-flex">
            <span className="!text-sm !font-semibold !text-[#047faa]">Ver Trabalhos</span>
          </Link>

          <Link href="/simulador" className="site-btn-primary px-4 py-2.5 sm:px-5">
            <span className="!text-sm !font-semibold !text-white">Simular</span>
            <ArrowRight className="hidden h-4 w-4 text-white sm:block" />
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-cyan-100/60 bg-white/95 backdrop-blur lg:hidden">
          <nav className="space-y-1 px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-cyan-50 hover:text-cyan-600"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2 pt-3">
              <Link href="/simulador" className="site-btn-primary flex w-full py-3" onClick={() => setMenuOpen(false)}>
                <ArrowRight className="h-4 w-4" />
                Simular
              </Link>
              <button
                className="site-btn-secondary flex w-full py-3"
                onClick={() => {
                  window.location.href = "/contactos";
                  setMenuOpen(false);
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Contactos
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
