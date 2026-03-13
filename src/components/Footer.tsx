import Link from "next/link";
import { ArrowRight, Lock, Square, Wallet } from "lucide-react";

export default function Footer() {
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
                Recolha e limpeza profissional em Lisboa, Margem Sul e Setúbal com
                resposta rápida e execução sem stress.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/contactos"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_16px_36px_-18px_rgba(34,211,238,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Falar connosco
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/colaboradores"
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  Área de Colaboradores
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Serviços
              </h3>
              <ul className="space-y-3 text-[0.98rem] text-cyan-50/82">
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
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Empresa
              </h3>
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
                  <Link href="/contactos" className="transition-colors hover:text-white">
                    Contactos
                  </Link>
                </li>
              </ul>
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
            <p className="text-sm text-cyan-50/68">
              © CLYON 2025 - Todos os direitos reservados
            </p>
            <Link
              href="/privacidade"
              className="text-sm text-cyan-50/68 transition-colors hover:text-white"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>

      <Link
        href="/contactos"
        className="fixed bottom-6 right-6 z-50 flex h-14 min-w-14 items-center justify-center rounded-full bg-cyan-500 px-4 shadow-lg shadow-cyan-300/40 transition-transform hover:scale-105 active:scale-95"
        aria-label="Abrir contactos"
      >
        <ArrowRight className="h-6 w-6 text-white" />
      </Link>
    </>
  );
}
