import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nós | CLYON",
  description:
    "Conheça a CLYON, a equipa por trás dos serviços de recolha, limpeza e mudanças em Lisboa, Margem Sul e Setúbal.",
  alternates: {
    canonical: "https://clyon.pt/sobre-nos",
  },
  openGraph: {
    title: "Sobre Nós | CLYON",
    description:
      "Uma equipa focada em rapidez, clareza no orçamento e execução profissional.",
    url: "https://clyon.pt/sobre-nos",
  },
};

const values = [
  "Resposta rápida e humana",
  "Orçamento claro antes da marcação",
  "Execução profissional no local",
  "Cobertura forte em Lisboa, Margem Sul e Setúbal",
];

export const revalidate = 86400;

export default function SobreNosPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(90deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,1)_52%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-22 sm:px-6 lg:px-8 lg:pb-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                Sobre nós
              </div>
              <h1 className="mt-5 max-w-[12ch] text-[2.65rem] font-bold leading-[1.02] tracking-tight text-slate-950 sm:text-[4.2rem]">
                Menos ruído, mais execução no terreno.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                A CLYON nasceu para tornar a recolha, a limpeza e as mudanças mais
                simples, com comunicação clara, resposta rápida e equipas prontas para
                agir.
              </p>
            </div>
            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.2)]">
              <p className="text-base leading-8 text-slate-600">
                Trabalhamos com foco em orçamento transparente, experiência fluida e
                boa presença local em Lisboa, Margem Sul e Setúbal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                Como trabalhamos
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Organizamos cada pedido com triagem simples, orçamento claro e
                execução profissional. O objetivo é reduzir fricção para o cliente e
                resolver rápido.
              </p>
            </div>

            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                O que valorizamos
              </h2>
              <div className="mt-4 space-y-3">
                {values.map((value) => (
                  <div key={value} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 text-cyan-600" />
                    <p className="text-base leading-7 text-slate-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 lg:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] bg-[linear-gradient(135deg,#062737_0%,#083344_100%)] px-8 py-10 text-white shadow-[0_26px_70px_-30px_rgba(2,6,23,0.45)] lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Quer trabalhar connosco no seu próximo pedido?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Pode começar pelo simulador ou falar diretamente com a nossa equipa.
                </p>
              </div>
              <Link
                href="/simulador"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-7 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Simular orçamento
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
