import Link from "next/link";
import { ArrowDownToLine, ArrowRight, Instagram, Lock, MessageCircle, Square, Wallet } from "lucide-react";

import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { BUSINESS_INSTAGRAM, BUSINESS_PHONE } from "@/lib/seo-data";

const ANDROID_APP_URL = "https://expo.dev/artifacts/eas/91zzW2jq9WrtksvBVCCjWm.apk";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  return (
    <>
      <footer className="relative overflow-hidden border-t border-cyan-200/20 bg-[#062737] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_20%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.14),transparent_18%),linear-gradient(180deg,rgba(9,37,53,0.92)_0%,rgba(7,31,46,0.98)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.9fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_-34px_rgba(8,145,178,0.45)] backdrop-blur-sm">
              <img
                src="/logo-clyon-icon.webp"
                alt="CLYON"
                className="mb-4 h-11 w-auto"
                width="205"
                height="84"
              />
              <p className="max-w-sm text-[1.02rem] leading-8 text-cyan-50/88">
                Recolha e limpeza profissional em Lisboa, Margem Sul e Setúbal com resposta rápida e execução sem
                stress.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contactos" className="site-btn-primary">
                  Falar connosco
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Link>
                <Link href="/colaboradores" className="site-btn-secondary">
                  Área de Colaboradores
                </Link>
                <a href={ANDROID_APP_URL} target="_blank" rel="noreferrer" className="site-btn-secondary">
                  Baixar App Android
                  <ArrowDownToLine className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Serviços</h3>
              <ul className="space-y-3 text-[0.98rem] text-cyan-50/82">
                <li>
                  <Link href="/recolha-de-moveis" className="transition-colors hover:text-white">
                    Recolha de móveis
                  </Link>
                </li>
                <li>
                  <Link href="/simulador" className="transition-colors hover:text-white">
                    Solicitar serviço
                  </Link>
                </li>
                <li>
                  <Link href="/servicos" className="transition-colors hover:text-white">
                    Os nossos serviços
                  </Link>
                </li>
                <li>
                  <Link href="/regioes" className="transition-colors hover:text-white">
                    Cobertura regional
                  </Link>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Empresa</h3>
              <ul className="space-y-3 text-[0.98rem] text-cyan-50/82">
                <li>
                  <Link href="/sobre-nos" className="transition-colors hover:text-white">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="transition-colors hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="transition-colors hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contactos" className="transition-colors hover:text-white">
                    Contactos
                  </Link>
                </li>
                <li>
                  <a
                    href={BUSINESS_INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-flex items-center gap-2 transition-colors hover:text-white"
                    aria-label="Instagram da CLYON"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">Pagamentos</h3>
              <ul className="space-y-3 text-[0.98rem] text-cyan-50/82">
                <li className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 text-cyan-300" /> Revolut
                </li>
                <li className="flex items-center gap-3">
                  <Square className="h-4 w-4 text-cyan-300" /> MB WAY
                </li>
                <li className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-cyan-300" /> Novo Banco
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 md:flex-row">
            <p className="text-sm text-cyan-50/68">© CLYON {currentYear} - Todos os direitos reservados</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/privacidade" className="text-sm text-cyan-50/68 transition-colors hover:text-white">
                Política de Privacidade
              </Link>
              <Link href="/privacidade" className="text-sm text-cyan-50/68 transition-colors hover:text-white">
                Política de Cookies
              </Link>
              <CookiePreferencesLink />
            </div>
          </div>
        </div>
      </footer>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="group fixed bottom-6 right-6 z-50 inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/40 bg-[linear-gradient(135deg,#25d366_0%,#16b857_100%)] text-white shadow-[0_18px_42px_-16px_rgba(37,211,102,0.72)] ring-1 ring-emerald-200/30 transition duration-200 hover:scale-[1.06] hover:shadow-[0_22px_52px_-14px_rgba(37,211,102,0.82)] active:scale-[0.98] animate-[whatsapp-bounce_2.2s_ease-in-out_infinite]"
        aria-label="Falar no WhatsApp"
      >
        <style>{`
          @keyframes whatsapp-bounce {
            0%, 100% { transform: translateY(0); }
            18% { transform: translateY(-4px); }
            30% { transform: translateY(0); }
            42% { transform: translateY(-8px); }
            54% { transform: translateY(0); }
          }
        `}</style>
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.24),transparent_62%)]" />
        <span className="absolute -inset-2 rounded-full bg-emerald-300/25 blur-xl transition-opacity duration-200 group-hover:opacity-100" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/14 ring-1 ring-white/18">
          <MessageCircle className="h-5 w-5 text-white" />
        </span>
      </a>
    </>
  );
}
