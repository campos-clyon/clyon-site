import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home as HomeIcon,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";

import ImageCarousel from "@/components/ImageCarousel";

export const metadata: Metadata = {
  title: "Recolha de Entulho, Móveis e Monos em Lisboa e Margem Sul | CLYON",
  description:
    "Recolha de entulho, móveis velhos, monos, limpeza pós-obra e mudanças em Lisboa, Margem Sul e Setúbal. Orçamento rápido em 11 minutos.",
  keywords: [
    "recolha de móveis lisboa",
    "recolha de entulho lisboa",
    "recolha de monos margem sul",
    "limpeza pós-obra setúbal",
    "mudanças margem sul",
  ],
  alternates: {
    canonical: "https://clyon.pt",
  },
  openGraph: {
    title: "Recolha de Entulho, Móveis e Monos em Lisboa e Margem Sul | CLYON",
    description:
      "Recolha de entulho, móveis, monos, limpeza pós-obra e mudanças em Lisboa, Margem Sul e Setúbal.",
    url: "https://clyon.pt",
  },
};

const services = [
  {
    name: "Recolha de Entulho",
    description:
      "Remoção rápida e organizada para obras, remodelações e limpezas pesadas.",
    icon: Trash2,
  },
  {
    name: "Recolha de Móveis",
    description:
      "Retiramos móveis antigos, eletrodomésticos e volumes grandes sem complicações.",
    icon: HomeIcon,
  },
  {
    name: "Limpeza Pós-Obra",
    description:
      "Acabamentos impecáveis para deixar o espaço pronto a usar no mesmo dia.",
    icon: Zap,
  },
  {
    name: "Mudanças e Apoio",
    description:
      "Equipa de apoio para transporte, desmontagem e organização da mudança.",
    icon: Truck,
  },
  {
    name: "Recolha de Monos",
    description: "Limpeza de sótãos, caves e garagens com organização e eficiência.",
    icon: Trash2,
  },
  {
    name: "Camião com Motorista",
    description: "Solução flexível para transporte de qualquer volume ou carga.",
    icon: Truck,
  },
];

const steps = [
  {
    title: "Descreva o serviço em menos de 1 minuto",
    desc: "Conte-nos o que precisa: móveis, entulho, mudança completa ou limpeza pós-obra.",
    duration: "< 1 minuto",
    color: "bg-cyan-500",
    durationColor: "text-cyan-600",
  },
  {
    title: "Receba uma resposta rápida com orçamento claro",
    desc: "Em menos de 11 minutos recebe uma estimativa transparente, sem surpresas nem ruído.",
    duration: "< 11 minutos",
    color: "bg-cyan-600",
    durationColor: "text-cyan-700",
  },
  {
    title: "Agende o melhor horário e deixe connosco",
    desc: "Escolha a data e a hora. A nossa equipa vai até si e trata do resto com cuidado.",
    duration: "Mesmo dia",
    color: "bg-slate-900",
    durationColor: "text-slate-700",
  },
];

const stats = [
  { value: "5.0★", label: "avaliação média" },
  { value: "11 min", label: "tempo médio de resposta" },
  { value: "Mesmo dia", label: "disponibilidade em muitos pedidos" },
];

const workImages = [
  {
    url: "/images/service-1.webp",
    alt: "Recolha de entulho",
    title: "Recolha de Entulho",
    subtitle: "Fotos reais dos nossos trabalhos",
  },
  {
    url: "/images/service-2.webp",
    alt: "Recolha de móveis",
    title: "Recolha de Móveis",
    subtitle: "Remoção segura e profissional",
  },
  {
    url: "/images/service-3.webp",
    alt: "Mudanças completas",
    title: "Mudanças Completas",
    subtitle: "Transporte profissional",
  },
  {
    url: "/images/service-4.webp",
    alt: "Limpeza de quintais",
    title: "Limpeza de Quintais",
    subtitle: "Espaços limpos e organizados",
  },
];

const featuredTestimonials = [
  {
    service: "Recolha de Entulho",
    name: "Carlos F.",
    date: "20 Nov 2025",
    rating: "5★",
    text: "Excelente serviço, rápido e com ótima relação qualidade-preço. Trabalho impecável e equipa muito simpática do início ao fim.",
  },
  {
    service: "Recolha de Móveis",
    name: "Patrícia S.",
    date: "6 Nov 2025",
    rating: "5★",
    text: "Muito satisfeita com a conclusão do serviço. Comunicação clara, recolha organizada e tudo resolvido com sucesso, sem complicações.",
  },
  {
    service: "Mudanças Completas",
    name: "Maria T.",
    date: "27 Nov 2025",
    rating: "5★",
    text: "Muito eficientes, com boa relação qualidade-preço e bastante cuidado em todo o processo. Fiquei extremamente satisfeita com o serviço.",
  },
];

const cities = [
  "Lisboa",
  "Benfica",
  "Lumiar",
  "Olivais",
  "Alvalade",
  "Almada",
  "Seixal",
  "Barreiro",
  "Moita",
  "Setúbal",
  "Palmela",
  "Sesimbra",
];

const reviews = [
  {
    name: "C. Santos",
    text: "Rápidos, educados e com orçamento claro desde o primeiro contacto.",
  },
  {
    name: "P. Martins",
    text: "Recolheram móveis antigos e deixaram tudo limpo. Processo simples.",
  },
  {
    name: "R. Almeida",
    text: "Serviço muito profissional, resposta rápida e marcação sem stress.",
  },
];

const differentiators = [
  "Resposta comercial rápida",
  "Equipa profissional e organizada",
  "Cobertura forte em Lisboa e Margem Sul",
  "Explicação clara de acesso, volume e distância",
  "Trabalhos reais e prova social visível",
  "Fluxo simples do pedido até à recolha",
];

export const revalidate = 86400;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.18),_transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_0.9fr]">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                Líderes em satisfação no Fixando, com avaliações 5 estrelas
              </div>

              <h1 className="max-w-none text-[3.15rem] font-bold leading-[1.02] tracking-tight text-slate-950 md:text-[3.7rem] xl:text-[3.9rem]">
                <span className="block">Recolha de entulho,</span>
                <span className="mt-2 block text-cyan-500">móveis e monos</span>
                <span className="block text-cyan-500">rápida e sem stress.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 md:text-[1.05rem]">
                Entulho, móveis velhos, limpeza pós-obra e apoio em mudanças com
                atendimento rápido, orçamento claro e execução profissional em Lisboa,
                Margem Sul e Setúbal.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/simulador"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-500 px-8 py-3 shadow-xl shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-600"
                >
                  <span className="text-[0.95rem] font-semibold text-white">
                    Simular Orçamento
                  </span>
                </Link>
                <Link
                  href="/trabalhos"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-cyan-200 bg-white px-8 py-3 text-[0.95rem] font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                >
                  Ver Trabalhos Reais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[22px] border border-cyan-100 bg-white/90 px-5 py-4 shadow-[0_16px_40px_-30px_rgba(14,116,144,0.24)]"
                  >
                    <div className="text-2xl font-bold text-slate-950">{stat.value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-cyan-100 bg-white p-4 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.22)]">
              <div className="h-[390px] overflow-hidden rounded-[26px]">
                <ImageCarousel images={workImages} autoPlayInterval={5000} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Serviços principais
              </p>
              <h2 className="mt-3 max-w-[13ch] text-[2.7rem] font-bold leading-[1.04] text-slate-950 sm:text-[3.55rem]">
                Menos ruído, mais clareza sobre o que a CLYON resolve.
              </h2>
            </div>
            <p className="max-w-lg text-[0.95rem] leading-7 text-slate-600">
              Soluções rápidas, profissionais e pensadas para simplificar o dia a dia
              em Lisboa, Margem Sul e Setúbal.
            </p>
          </div>

          <div className="mt-8 grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.name}
                className="overflow-hidden rounded-[30px] border border-cyan-100 bg-white shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]"
              >
                <div className="flex h-24 items-center justify-center bg-cyan-50/90">
                  <service.icon className="h-8 w-8 text-cyan-600" />
                </div>
                <div className="p-4">
                  <h3 className="text-[1.55rem] font-bold leading-tight text-slate-950">{service.name}</h3>
                  <p className="mt-2.5 text-[0.9rem] leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <Link
                    href="/simulador"
                    className="mt-3 inline-flex items-center text-[0.9rem] font-semibold text-cyan-700 transition hover:text-cyan-500"
                  >
                    Pedir orçamento
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-50 py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(34,211,238,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
              Como funciona
            </div>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Simples. Rápido. <span className="text-cyan-500">Sem stress.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Do primeiro contacto à recolha final, tudo resolvido em 3 passos.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white ${step.color}`}>
                  {index + 1}
                </div>
                <p className={`text-sm font-semibold uppercase tracking-[0.16em] ${step.durationColor}`}>
                  {step.duration}
                </p>
                <h3 className="mt-4 text-2xl font-bold leading-tight text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-slate-600">{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Trabalhos reais
              </p>
              <h2 className="mt-4 max-w-[12ch] text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                Veja o que fazemos no terreno.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                Avaliações reais de clientes, com mensagens, datas e notas sobre
                recolhas, limpezas e mudanças em Lisboa, Margem Sul e Setúbal.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "163", label: "avaliações 5★" },
                { value: "11 min", label: "tempo médio de resposta" },
                { value: "Mesmo dia", label: "em muitos pedidos" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-cyan-100 bg-cyan-50/70 p-5"
                >
                  <div className="text-3xl font-bold text-slate-950">{item.value}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredTestimonials.map((review) => (
              <article
                key={`${review.name}-${review.date}`}
                className="rounded-[30px] border border-cyan-100 bg-white p-6 shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                      {review.rating}
                    </p>
                    <h3 className="mt-3 text-[1.55rem] font-bold leading-tight text-slate-950">
                      {review.service}
                    </h3>
                  </div>
                  <div className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                    {review.date}
                  </div>
                </div>

                <p className="mt-5 text-[0.98rem] leading-8 text-slate-600">
                  {review.text}
                </p>

                <div className="mt-6 border-t border-cyan-100 pt-4">
                  <p className="text-sm font-semibold text-slate-950">{review.name}</p>
                  <p className="mt-1 text-sm text-slate-500">Avaliação verificada</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Cobertura regional
            </p>
            <h2 className="mt-4 max-w-[12ch] text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Presença local destacada como prova de confiança.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              A nossa área de atuação cobre toda a Grande Lisboa, Margem Sul e
              Setúbal, com equipas prontas a intervir no mesmo dia.
            </p>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]">
            <div className="flex flex-wrap gap-3">
              {cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700"
                >
                  {city}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#03131d_0%,#062737_100%)] p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                Não encontrou a sua zona?
              </p>
              <h3 className="mt-3 text-3xl font-bold leading-tight">
                Confirme disponibilidade por contacto direto.
              </h3>
              <p className="mt-3 text-sm leading-8 text-slate-300">
                Diz-nos a zona e o tipo de serviço. Respondemos rapidamente com
                disponibilidade e orientação.
              </p>
              <Link
                href="/contactos"
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Falar connosco
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Prova social
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                Avaliações que mostram confiança real.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-slate-600">
              A confiança constrói-se com rapidez, execução cuidada e comunicação
              clara antes, durante e depois do serviço.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.name}
                className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(14,116,144,0.16)]"
              >
                <MessageSquareQuote className="h-7 w-7 text-cyan-600" />
                <p className="mt-5 text-base leading-8 text-slate-600">{review.text}</p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-slate-950">
                  {review.name}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-[34px] border border-cyan-100 bg-white p-8 shadow-[0_22px_60px_-34px_rgba(14,116,144,0.18)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  <ShieldCheck className="h-4 w-4" />
                  Por que escolher a CLYON
                </div>
                <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">
                  Menos complicação, mais execução.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {differentiators.map((item) => (
                  <div key={item} className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-5">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 lg:pb-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="rounded-[34px] bg-[linear-gradient(135deg,#062737_0%,#083344_100%)] px-8 py-10 text-white shadow-[0_26px_70px_-30px_rgba(2,6,23,0.45)] lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                    Pedido imediato
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                  Pronto para libertar espaço hoje?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Simule o pedido, confirme os detalhes connosco e receba uma resposta
                  clara para recolha, limpeza ou mudança.
                </p>
              </div>
              <Link
                href="/simulador"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-7 py-4 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
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
