import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
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
import { CITIES, REGIONS, getCityServiceSlug } from "@/lib/seo-data";
import { getHeroCarouselImages } from "@/lib/work-gallery";

export const metadata: Metadata = {
  title: "Recolha de Monos, Entulho e Moveis em Lisboa e Margem Sul | CLYON",
  description:
    "Recolha de monos, moveis e entulho em Lisboa, Margem Sul e Setubal. Orcamento rapido, servico profissional e encaminhamento responsavel com resposta no mesmo dia quando disponivel.",
  alternates: {
    canonical: "https://clyon.pt",
  },
  openGraph: {
    title: "Recolha de Monos, Entulho e Moveis em Lisboa e Margem Sul | CLYON",
    description:
      "Recolha de monos, moveis, entulho, limpeza pos-obra e mudancas em Lisboa, Margem Sul e Setubal.",
    url: "https://clyon.pt",
  },
};

const services = [
  {
    name: "Recolha de Entulho",
    description: "Retiramos restos de obra, sacos e materiais mistos com resposta rapida.",
    icon: Trash2,
    href: "/servicos",
  },
  {
    name: "Recolha de Moveis",
    description: "Sofas, camas, armarios, eletrodomesticos e recheios com desmontagem e carga.",
    icon: HomeIcon,
    href: "/recolha-de-moveis",
  },
  {
    name: "Limpeza Pos-Obra",
    description: "Acabamento final para deixar casa, loja ou escritorio pronto a usar.",
    icon: Zap,
    href: "/servicos",
  },
  {
    name: "Mudancas e Apoio",
    description: "Transporte, carga, descarga e apoio logistico com equipa organizada.",
    icon: Truck,
    href: "/servicos",
  },
];

const priceHighlights = [
  "Sofa ou cadeirao: desde 35 EUR",
  "Cama, estrado e colchao: desde 45 EUR",
  "Armario grande: desde 55 EUR",
  "Varios moveis num pedido: desde 180 EUR",
];

const collectedItems = [
  "Moveis velhos, recheios, sofas e colchoes",
  "Eletrodomesticos e volumes grandes",
  "Entulho de obra e restos de remodelacao",
  "Monos, sucata e acumulacao em arrecadacoes",
  "Limpeza pos-obra e apoio em mudancas",
  "Pedidos de esvaziamento com recolha completa",
];

const steps = [
  "Envie fotos, morada e indique acessos, andar e elevador.",
  "Receba uma resposta rapida com orcamento claro e janela disponivel.",
  "A equipa chega ao local, carrega, transporta e encaminha o material.",
];

const homeFaqs = [
  {
    question: "Quanto custa a recolha de monos ou moveis?",
    answer:
      "O valor depende do volume, acessos, tipo de material, urgencia e necessidade de desmontagem. A forma mais rapida de receber um valor certo e enviar fotos e morada.",
  },
  {
    question: "Recolhem no mesmo dia?",
    answer:
      "Quando existe disponibilidade operacional, sim. Muitos pedidos em Lisboa, Grande Lisboa, Margem Sul e Setubal conseguem resposta no proprio dia ou no dia seguinte.",
  },
  {
    question: "Retiram sofas, colchoes e eletrodomesticos?",
    answer:
      "Sim. A CLYON retira sofas, camas, colchoes, armarios, eletrodomesticos e outros volumes grandes, desde que o pedido seja identificado no orcamento.",
  },
  {
    question: "Fazem desmontagem?",
    answer:
      "Sim. Quando necessario, a equipa desmonta moveis e trata da retirada a partir do interior do imovel.",
  },
  {
    question: "Atendem empresas e condominios?",
    answer:
      "Sim. A operacao atende particulares, senhorios, empresas, equipas de obra e condominios com necessidade de recolha, limpeza ou esvaziamento.",
  },
  {
    question: "O destino dos residuos e legal?",
    answer:
      "Sempre que possivel, a equipa separa materiais para reaproveitamento ou encaminhamento adequado. O restante segue para destino responsavel.",
  },
];

const testimonials = [
  {
    service: "Recolha de Entulho",
    name: "Carlos F.",
    text: "Excelente servico, rapido e com otima relacao qualidade-preco. Trabalho impecavel e equipa simpatica.",
  },
  {
    service: "Recolha de Moveis",
    name: "Patricia S.",
    text: "Comunicacao clara, recolha organizada e tudo resolvido sem complicacoes.",
  },
  {
    service: "Mudancas Completas",
    name: "Maria T.",
    text: "Muito eficientes, cuidadosos e com boa relacao qualidade-preco.",
  },
];

const proofPoints = [
  "Resposta comercial rapida",
  "Equipa profissional e organizada",
  "Cobertura forte em Lisboa, Margem Sul e Setubal",
  "Fluxo simples do pedido ate a recolha",
];

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default async function HomePage() {
  noStore();
  const workImages = await getHeroCarouselImages();
  const regionCoverage = REGIONS.map((region) => ({
    ...region,
    cities: CITIES.filter((city) => city.region === region.slug).slice(0, 4),
  }));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.18),_transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_0.9fr] lg:gap-10">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                Lideres em satisfacao no Fixando, com avaliacoes 5 estrelas
              </div>

              <h1 className="text-[3.15rem] font-bold leading-[1.02] tracking-tight text-slate-950 md:text-[3.7rem] xl:text-[3.9rem]">
                <span className="block">Recolha de entulho,</span>
                <span className="mt-2 block text-cyan-500">moveis e monos</span>
                <span className="block text-cyan-500">rapida e sem stress.</span>
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 md:text-[1.05rem]">
                Entulho, moveis velhos, limpeza pos-obra e apoio em mudancas com
                atendimento rapido, orcamento claro e execucao profissional em Lisboa,
                Margem Sul e Setubal.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/simulador" className="site-btn-primary px-8">Simular Orcamento</Link>
                <Link href="/trabalhos" className="site-btn-secondary px-8">
                  Ver Trabalhos Reais
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "5.0★", label: "avaliacao media" },
                  { value: "11 min", label: "tempo medio de resposta" },
                  { value: "Mesmo dia", label: "em muitos pedidos" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[22px] border border-cyan-100 bg-white/90 px-5 py-4 shadow-[0_16px_40px_-30px_rgba(14,116,144,0.24)]">
                    <div className="text-2xl font-bold text-slate-950">{stat.value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:self-start lg:pt-[28px]">
              <div className="w-full overflow-hidden rounded-[30px] shadow-[0_28px_70px_-34px_rgba(14,116,144,0.28)] lg:w-[111%] lg:-ml-[5%]">
                <div className="h-[435px] overflow-hidden rounded-[30px]">
                  <ImageCarousel images={workImages} autoPlayInterval={5000} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => (
              <article key={service.name} className="group overflow-hidden rounded-[30px] border border-cyan-200/90 bg-white shadow-[0_24px_70px_-36px_rgba(8,145,178,0.26)] transition duration-300 hover:-translate-y-1">
                <div className="flex h-28 items-center justify-center border-b border-cyan-100/90 bg-gradient-to-br from-cyan-100 via-cyan-50 to-cyan-100/80">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-200/90 bg-white/85">
                    <service.icon className="h-8 w-8 text-cyan-700" />
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-[1.45rem] font-bold leading-tight text-slate-950">{service.name}</h2>
                  <p className="mt-3 text-[0.95rem] leading-7 text-slate-600">{service.description}</p>
                  <Link href={service.href} className="mt-4 inline-flex items-center rounded-full bg-slate-50 px-3.5 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50">
                    {service.href === "/recolha-de-moveis" ? "Ver pagina principal" : "Pedir orcamento"}
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[34px] border border-cyan-100 bg-white p-8 shadow-[0_22px_60px_-34px_rgba(14,116,144,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Precos orientativos</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">Valores de referencia sem esconder o jogo.</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {priceHighlights.map((item) => (
                  <div key={item} className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-slate-700">{item}</div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/precos" className="site-btn-primary px-6">Ver precos</Link>
                <Link href="/recolha-de-moveis" className="site-btn-secondary px-6">Recolha de moveis</Link>
              </div>
            </div>

            <div className="rounded-[34px] border border-cyan-100 bg-white p-8 shadow-[0_22px_60px_-34px_rgba(14,116,144,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">O que recolhemos</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">Do sofa ao entulho, com carga e encaminhamento.</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {collectedItems.map((item) => (
                  <div key={item} className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-slate-700">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step} className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-xl font-bold text-white">{index + 1}</div>
                <p className="text-base leading-8 text-slate-600">{step}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Perguntas frequentes</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">Duvidas tipicas antes de pedir.</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/faq" className="site-btn-secondary px-6">Ver FAQ completa</Link>
              <Link href="/regioes" className="site-btn-primary px-6">Ver zonas atendidas</Link>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {homeFaqs.map((faq) => (
              <article key={faq.question} className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(14,116,144,0.16)]">
                <h3 className="text-lg font-bold leading-tight text-slate-950">{faq.question}</h3>
                <p className="mt-4 text-sm leading-8 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Cobertura regional</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">Presenca local em Lisboa, Margem Sul e Setubal.</h2>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_22px_55px_-34px_rgba(14,116,144,0.18)]">
            <div className="grid gap-6 lg:grid-cols-3">
              {regionCoverage.map((region) => (
                <div key={region.slug} className="rounded-[24px] border border-cyan-100 bg-cyan-50/70 p-5">
                  <h3 className="text-lg font-bold text-slate-950">{region.shortLabel}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {region.cities.map((city) => (
                      <Link key={city.slug} href={`/${getCityServiceSlug("recolha-entulho", city.slug)}`} className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50">
                        {city.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((review) => (
              <article key={review.name} className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(14,116,144,0.16)]">
                <MessageSquareQuote className="h-7 w-7 text-cyan-600" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">{review.service}</p>
                <p className="mt-4 text-base leading-8 text-slate-600">{review.text}</p>
                <p className="mt-5 text-sm font-semibold text-slate-950">{review.name}</p>
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
                <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">Menos complicacao, mais execucao.</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {proofPoints.map((item) => (
                  <div key={item} className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-5">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#062737_0%,#083344_100%)] px-8 py-10 text-white">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-cyan-200">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">Pedido imediato</span>
                  </div>
                  <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Pronto para libertar espaco hoje?</h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                    Simule o pedido, confirme os detalhes connosco e receba uma resposta clara para recolha, limpeza ou mudanca.
                  </p>
                </div>
                <Link href="/simulador" className="site-btn-primary px-7 py-4 text-base">
                  Simular orcamento
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
    </div>
  );
}
