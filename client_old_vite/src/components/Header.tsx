import { Link } from "wouter";
import { Menu, X, ArrowRight, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Serviços", href: "/servicos" },
    { label: "Trabalhos", href: "/trabalhos" },
    { label: "Avaliações", href: "/avaliacoes" },
    { label: "Sobre Nós", href: "/sobre-nos" },
    { label: "Contacto", href: "/contactos" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-100/80 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8">
        {/* Logo real */}
        <Link href="/">
          <div className="cursor-pointer flex-shrink-0">
            <picture>
              <source srcSet="/logo-clyon-icon.webp" type="image/webp" />
              <img
                src="/logo-clyon-icon.webp"
                alt="CLYON"
                className="h-11 w-auto"
                width="205"
                height="84"
              />
            </picture>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-cyan-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link href="/trabalhos" className="hidden rounded-2xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 md:inline-flex">
            Ver Trabalhos
          </Link>
          <Link href="/simulador">
            <button className="rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-600 flex items-center gap-2">
              Pedir Orçamento
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-cyan-600 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-cyan-100 bg-white/95 backdrop-blur">
          <nav className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 space-y-2">
              <Link href="/simulador">
                <button
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-white bg-cyan-500 shadow-lg shadow-cyan-200 transition hover:bg-cyan-600"
                  onClick={() => setMenuOpen(false)}
                >
                  <ArrowRight className="w-4 h-4" />
                  Pedir Orçamento
                </button>
              </Link>
              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-cyan-700 border border-cyan-200 hover:bg-cyan-50 transition"
                onClick={() => { window.open("https://wa.me/351931632622", "_blank"); setMenuOpen(false); }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
