import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  Instagram,
  Lock,
  MessageCircle,
  Square,
  Wallet,
} from "lucide-react";

import CookiePreferencesLink from "@/components/CookiePreferencesLink";
import { BUSINESS_INSTAGRAM, BUSINESS_PHONE } from "@/lib/seo-data";

const ANDROID_APP_URL = "https://expo.dev/artifacts/eas/91zzW2jq9WrtksvBVCCjWm.apk";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Ola! Gostava de pedir um orcamento a CLYON.",
  )}`;
  const serviceCities = [
    "Lisboa",
    "Almada",
    "Amadora",
    "Seixal",
    "Barreiro",
    "Oeiras",
    "Cascais",
    "Setubal",
    "Loures",
    "Sintra",
    "Montijo",
    "Odivelas",
  ];
  const extraServices = [
    "Recolha de moveis",
    "Esvaziamento de casas",
    "Limpeza pos-obra",
    "Recolha de entulho",
  ];

  return (
    <>
      <section className="border-t border-slate-200 bg-slate-100">
        <div className="mx-auto grid w-full max-w-[1380px] gap-6 px-6 py-7 lg:grid-cols-[1.1fr_2fr] xl:px-8">
          <div>
            <p className="text-[1.05rem] font-semibold text-slate-800">Outras áreas de apoio da CLYON</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Estrutura operacional preparada para recolhas, limpezas, apoio rápido e cobertura regional em vários pontos da Grande Lisboa.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {extraServices.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.5)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden border-t border-cyan-200/20 bg-[#062737] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_20%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.14),transparent_18%),linear-gradient(180deg,rgba(9,37,53,0.92)_0%,rgba(7,31,46,0.98)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

        <div className="relative mx-auto max-w-[1380px] px-6 py-16 xl:px-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr_0.9fr_0.8fr_1.3fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_24px_60px_-34px_rgba(8,145,178,0.45)] backdrop-blur-sm">
              <img
                src="/logo-clyon-icon.webp"
                alt="CLYON"
                className="mb-4 h-11 w-auto"
                width="205"
                height="84"
              />
              <p className="max-w-sm text-[1.02rem] leading-8 text-cyan-50/88">
                Recolha e limpeza profissional em Lisboa, Margem Sul e Setubal com
                resposta rapida e execucao sem stress.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contactos" className="site-btn-primary">
                  Falar connosco
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Link>
                <Link href="/colaboradores" className="site-btn-secondary">
                  Area de Colaboradores
                </Link>
                <a href={ANDROID_APP_URL} target="_blank" rel="noreferrer" className="site-btn-secondary">
                  Baixar App Android
                  <ArrowDownToLine className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Servicos
              </h3>
              <ul className="space-y-3 text-[0.98rem] text-cyan-50/82">
                <li>
                  <Link href="/recolha-de-moveis" className="transition-colors hover:text-white">
                    Recolha de moveis
                  </Link>
                </li>
                <li>
                  <Link href="/simulador" className="transition-colors hover:text-white">
                    Solicitar servico
                  </Link>
                </li>
                <li>
                  <Link href="/servicos" className="transition-colors hover:text-white">
                    Os nossos servicos
                  </Link>
                </li>
                <li>
                  <Link href="/precos" className="transition-colors hover:text-white">
                    Precos orientativos
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
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Empresa
              </h3>
              <ul className="space-y-3 text-[0.98rem] text-cyan-50/82">
                <li>
                  <Link href="/sobre-nos" className="transition-colors hover:text-white">
                    Sobre nos
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
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Cobertura
              </h3>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-[0.98rem] text-cyan-50/82">
                {serviceCities.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Contacto rapido
              </h3>
              <div className="space-y-3 text-[0.98rem] text-cyan-50/82">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
                >
                  <MessageCircle className="h-4 w-4 text-cyan-300" />
                  WhatsApp direto
                </a>
                <Link
                  href="/contactos"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
                >
                  <ArrowRight className="h-4 w-4 text-cyan-300" />
                  Pedir orçamento
                </Link>
                <Link
                  href="/colaboradores"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
                >
                  <Lock className="h-4 w-4 text-cyan-300" />
                  Área de colaboradores
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Pagamentos
              </h3>
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
                Politica de Privacidade
              </Link>
              <Link href="/privacidade" className="text-sm text-cyan-50/68 transition-colors hover:text-white">
                Politica de Cookies
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
