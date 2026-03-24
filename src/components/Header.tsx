"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Servicos", href: "/servicos" },
    { label: "Trabalhos", href: "/trabalhos" },
    { label: "Avaliacoes", href: "/avaliacoes" },
    { label: "Sobre Nos", href: "/sobre-nos" },
    { label: "Contactos", href: "/contactos" },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/40 bg-white/95 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.28)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1470px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex-shrink-0 cursor-pointer">
          <Image
            src="/logo-clyon-icon.webp"
            alt="CLYON - Recolha de Moveis e Entulho"
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
          <Link href="/simulador" className="site-btn-primary px-4 py-2.5 sm:px-5">
            <span className="!text-sm !font-semibold !text-white">Simular</span>
            <ArrowRight className="hidden h-4 w-4 text-white sm:block" />
          </Link>

          <button
            className="inline-flex rounded-xl border border-cyan-200 bg-white p-2.5 text-slate-600 transition-colors hover:text-cyan-600 lg:hidden"
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
                onClick={() => setMenuOpen(false)}
              >
                <span className="!text-base !font-semibold !text-[#047faa]">{link.label}</span>
              </Link>
            ))}

            <Link
              href="/simulador"
              className="site-btn-primary mt-2 flex w-full py-3"
              onClick={() => setMenuOpen(false)}
            >
              <ArrowRight className="h-4 w-4" />
              Simular
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
