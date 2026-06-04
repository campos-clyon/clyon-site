"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Menu,
  MessageCircle,
  X,
  Sofa,
  HardHat,
  Package,
  Home,
  Sparkles,
  TreePine,
  Truck,
  Refrigerator,
  Zap,
} from "lucide-react";

import { trackWhatsAppClick } from "@/lib/analytics";
import { BUSINESS_PHONE } from "@/lib/seo-data";

const solucoesMenu = [
  {
    title: "Serviços principais",
    items: [
      {
        label: "Recolha de Móveis",
        description: "Sofás, camas, armários, colchões e recheios.",
        href: "/recolha-de-moveis",
        icon: Sofa,
      },
      {
        label: "Recolha de Entulho",
        description: "Sacos de obra, restos de remodelação e resíduos.",
        href: "/servicos#entulho",
        icon: HardHat,
      },
      {
        label: "Recolha de Monos",
        description: "Volumes grandes, objetos antigos e acumulados.",
        href: "/servicos#monos",
        icon: Package,
      },
    ],
  },
  {
    title: "Limpeza e esvaziamento",
    items: [
      {
        label: "Esvaziamento de Casas",
        description: "Retirada completa de móveis, recheios e objetos.",
        href: "/servicos#esvaziamento",
        icon: Home,
      },
      {
        label: "Limpeza Pós-Obra",
        description: "Apoio após remodelações, obras e mudanças.",
        href: "/servicos#limpeza-pos-obra",
        icon: Sparkles,
      },
      {
        label: "Limpeza de Quintais",
        description: "Lixo verde, resíduos exteriores e espaços.",
        href: "/servicos#quintais",
        icon: TreePine,
      },
    ],
  },
  {
    title: "Operações",
    items: [
      {
        label: "Mudanças",
        description: "Transporte, carga e descarga com equipa.",
        href: "/servicos#mudancas",
        icon: Truck,
      },
      {
        label: "Eletrodomésticos",
        description: "Recolha de máquinas, frigoríficos e equipamentos.",
        href: "/recolha-de-eletrodomesticos",
        icon: Refrigerator,
      },
      {
        label: "Serviço Urgente",
        description: "Pedidos rápidos em Lisboa, Margem Sul e Setúbal.",
        href: "/recolha-de-moveis-urgente",
        icon: Zap,
      },
    ],
  },
];

const navLinks = [
  { label: "Trabalhos", href: "/trabalhos" },
  { label: "Avaliações", href: "/avaliacoes" },
  { label: "Sobre Nós", href: "/sobre-nos" },
  { label: "Contactos", href: "/contactos" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solucoesOpen, setSolucoesOpen] = useState(false);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const whatsappNumber = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setSolucoesOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-clyon-icon.webp"
            alt="CLYON - Recolha de Móveis e Entulho"
            className="h-10 w-auto sm:h-11"
            width={205}
            height={84}
            priority
            sizes="205px"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {/* Soluções dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setSolucoesOpen(!solucoesOpen)}
              onMouseEnter={() => setSolucoesOpen(true)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[0.9375rem] font-medium transition-colors ${
                solucoesOpen
                  ? "bg-slate-50 text-cyan-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
              }`}
            >
              Soluções
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  solucoesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Mega Menu Dropdown */}
            {solucoesOpen && (
              <div
                ref={dropdownRef}
                onMouseLeave={() => setSolucoesOpen(false)}
                className="absolute left-1/2 top-full z-50 mt-2 w-[800px] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                  <div className="grid grid-cols-3 gap-6">
                    {solucoesMenu.map((column) => (
                      <div key={column.title}>
                        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {column.title}
                        </h3>
                        <div className="space-y-1">
                          {column.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setSolucoesOpen(false)}
                              className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-cyan-50"
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-cyan-100 group-hover:text-cyan-600">
                                <item.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-800 group-hover:text-cyan-700">
                                  {item.label}
                                </div>
                                <div className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom CTA */}
                  <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        Não encontra o que procura?
                      </p>
                      <p className="text-xs text-slate-500">
                        Fale connosco para um orçamento personalizado.
                      </p>
                    </div>
                    <Link
                      href="/contactos"
                      onClick={() => setSolucoesOpen(false)}
                      className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
                    >
                      Contactar
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2.5 text-[0.9375rem] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-cyan-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
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
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-700"
          >
            Quero contratar
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition-colors hover:border-cyan-200 hover:text-cyan-600 lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4">
            {/* Soluções Accordion */}
            <div className="mb-1">
              <button
                onClick={() => setMobileAccordionOpen(!mobileAccordionOpen)}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>Soluções</span>
                <ChevronDown
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                    mobileAccordionOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {mobileAccordionOpen && (
                <div className="mt-1 space-y-4 rounded-xl bg-slate-50 p-4">
                  {solucoesMenu.map((column) => (
                    <div key={column.title}>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {column.title}
                      </h4>
                      <div className="space-y-1">
                        {column.items.map((item) => (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => {
                              setMenuOpen(false);
                              setMobileAccordionOpen(false);
                            }}
                            className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-white"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-cyan-600">
                              <item.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-700">
                                {item.label}
                              </div>
                              <div className="text-xs text-slate-500">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Other nav links */}
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

            {/* Mobile CTA buttons */}
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
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
                Quero contratar
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
