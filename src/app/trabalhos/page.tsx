import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageSquareQuote, Sparkles } from "lucide-react";

const workItems = [
  {
    title: "Recolha de Entulho",
    desc: "Remoção organizada para obras e remodelações com destino responsável.",
    image: "/images/service-1.webp",
  },
  {
    title: "Recolha de Móveis",
    desc: "Retiramos móveis antigos e grandes volumes sem complicações.",
    image: "/images/service-2.webp",
  },
  {
    title: "Mudanças Completas",
    desc: "Apoio profissional no transporte e reorganização do espaço.",
    image: "/images/service-3.webp",
  },
  {
    title: "Limpeza Pós-Obra",
    desc: "Acabamento final para entregar o imóvel pronto a usar.",
    image: "/images/service-4.webp",
  },
];

const testimonials = [
  {
    service: "Recolha de Entulho",
    name: "Inês A.",
    date: "20 Nov 2025",
    rating: "5★",
    text: "Excelente serviço, rápido e com uma ótima relação qualidade-preço. Trabalho impecável e equipa muito simpática.",
  },
  {
    service: "Recolha de Móveis",
    name: "Adalberto F.",
    date: "6 Nov 2025",
    rating: "5★",
    text: "Retiraram os móveis antigos com cuidado e sem complicações. Processo simples, rápido e bem organizado.",
  },
  {
    service: "Mudanças Completas",
    name: "Maria T.",
    date: "27 Nov 2025",
    rating: "5★",
    text: "Muito eficientes, com boa relação qualidade-preço. Fiquei extremamente satisfeita com o serviço prestado.",
  },
  {
    service: "Limpeza Pós-Obra",
    name: "Christian M.",
    date: "12 Dez 2025",
    rating: "5★",
    text: "A casa ficou pronta a usar no mesmo dia. Boa comunicação, bom ritmo de trabalho e acabamento muito cuidado.",
  },
];

const stats = [
  { value: "163", label: "avaliações 5★" },
  { value: "11 min", label: "tempo médio de resposta" },
  { value: "Mesmo dia", label: "em muitos pedidos" },
];

export const revalidate = 86400;

export default function TrabalhosPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_20%),radial-gradient(circle_at_85%_15%,rgba(8,145,178,0.28),transparent_26%),linear-gradient(135deg,#03131d_0%,#062737_55%,#083344_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-22 sm:px-6 lg:px-8 lg:pb-16">
          <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Trabalhos reais
              </div>
              <h1 className="mt-5 max-w-[13ch] text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-[4.3rem]">
                Veja o que fazemos no terreno.
              </h1>
              <p className="mt-5 max-w-2xl text-[1.02rem] leading-8 text-slate-300">
                Fotos reais, intervenções rápidas e um processo simples para recolha,
                limpeza e mudanças em Lisboa, Margem Sul e Setúbal.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/simulador"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3.5 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Pedir orçamento
                </Link>
                <Link
                  href="/contactos"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Falar connosco
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                >
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Avaliações
              </p>
              <h2 className="mt-3 text-4xl font-bold text-slate-950">
                Casos reais com resultado visível.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-slate-600">
              Mensagens reais de clientes, com nota, data e contexto do serviço
              prestado pela CLYON.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {testimonials.map((item) => (
              <article
                key={`${item.name}-${item.date}`}
                className="rounded-[28px] border border-cyan-100 bg-white p-5 shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      {item.rating}
                    </p>
                    <h3 className="mt-3 text-[1.45rem] font-bold leading-tight text-slate-950">
                      {item.service}
                    </h3>
                  </div>
                  <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {item.date}
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <MessageSquareQuote className="mt-1 h-5 w-5 flex-shrink-0 text-cyan-600" />
                  <p className="text-[0.94rem] leading-7 text-slate-600">
                    {item.text}
                  </p>
                </div>

                <div className="mt-5 border-t border-cyan-100 pt-4">
                  <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Avaliação verificada</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] border border-cyan-100 bg-white p-8 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <div className="inline-flex items-center rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Como entregamos
                </div>
                <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                  Trabalho real, comunicação simples e resposta profissional.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Pedido claro com triagem rápida",
                  "Confirmação do serviço sem surpresas",
                  "Execução no local com foco em limpeza",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[24px] border border-cyan-100 bg-cyan-50/70 p-5"
                  >
                    <div className="mb-3 text-sm font-semibold text-cyan-700">
                      0{index + 1}
                    </div>
                    <p className="text-sm leading-7 text-slate-700">{item}</p>
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
                <div className="inline-flex items-center gap-2 text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                    Próximo trabalho
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                  Quer ver o seu pedido resolvido assim também?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Fale connosco e receba uma proposta rápida para recolha, limpeza ou
                  mudança com execução profissional.
                </p>
              </div>
              <Link
                href="/simulador"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-7 py-4 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Pedir orçamento
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
