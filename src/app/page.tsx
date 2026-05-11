import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Home as HomeIcon,
  MapPin,
  MessageSquareQuote,
  Package,
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";

import ImageCarousel from "@/components/ImageCarousel";
import RotatingHeroCopy from "@/components/RotatingHeroCopy";
import { getHeroCarouselImages } from "@/lib/work-gallery";

export const metadata: Metadata = {
  title: "CLYON — Recolha de Móveis, Entulho, Monos e Esvaziamento de Casas em Lisboa e Setúbal",
  description:
    "Recolha de móveis, entulho, monos, esvaziamento de casas e limpeza pós-obra em Lisboa, Margem Sul e Setúbal. Resposta em 24h, 163 avaliações 5 estrelas. Orçamento grátis!",
  alternates: {
    canonical: "https://clyon.pt",
  },
  openGraph: {
    title: "CLYON — Recolha de Móveis, Entulho, Monos e Esvaziamento de Casas em Lisboa e Setúbal",
    description:
      "Recolha de móveis, entulho, monos, esvaziamento de casas e limpeza pós-obra em Lisboa e Setúbal. Resposta em 24h. Orçamento grátis!",
    url: "https://clyon.pt",
  },
};

const services = [
  {
    name: "Recolha de Móveis",
    description: "Sofás, camas, armários, eletrodomésticos e recheios com desmontagem e carga.",
    icon: HomeIcon,
    href: "/recolha-moveis-lisboa",
  },
  {
    name: "Recolha de Monos",
    description: "Volumes grandes, sucata, despejos e objectos antigos com resposta rápida.",
    icon: Package,
    href: "/recolha-monos-lisboa",
  },
  {
    name: "Recolha de Entulho",
    description: "Retiramos restos de obra, sacos e materiais mistos com resposta rápida.",
    icon: Trash2,
    href: "/recolha-entulho-lisboa",
  },
  {
    name: "Mudanças",
    description: "Transporte, carga, descarga e apoio com equipa organizada.",
    icon: Truck,
    href: "/mudancas-lisboa",
  },
];

const priceHighlights = [
  "Sofá ou cadeirão: desde 35 EUR",
  "Cama, estrado e colchão: desde 45 EUR",
  "Armário grande: desde 55 EUR",
  "Vários móveis num pedido: desde 180 EUR",
];

const collectedItems = [
  "Móveis velhos, recheios, sofás e colchões",
  "Eletrodomésticos e volumes grandes",
  "Entulho de obra e restos de remodelação",
  "Monos, sucata e acumulação em arrecadações",
  "Limpeza pós-obra e apoio em mudanças",
  "Pedidos de esvaziamento com recolha completa",
];

const steps = [
  {
    step: "01",
    title: "Enviar o pedido",
    description: "Envie fotos, morada e indique acessos, andar e elevador.",
    icon: Camera,
  },
  {
    step: "02",
    title: "Receber a resposta",
    description: "Receba uma resposta rápida com orçamento claro e janela disponível.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "Executar a recolha",
    description: "A equipa chega ao local, carrega, transporta e encaminha o material.",
    icon: Truck,
  },
];

const homeFaqs = [
  {
    question: "Quanto custa a recolha de monos ou móveis?",
    answer:
      "O valor depende do volume, acessos, tipo de material, urgência e necessidade de desmontagem. A forma mais rápida de receber um valor certo é enviar fotos e morada.",
  },
  {
    question: "Recolhem no mesmo dia?",
    answer:
      "Quando existe disponibilidade operacional, sim. Muitos pedidos em Lisboa, Grande Lisboa, Margem Sul e Setúbal conseguem resposta no próprio dia ou no dia seguinte.",
  },
  {
    question: "Retiram sofás, colchões e eletrodomésticos?",
    answer:
      "Sim. A CLYON retira sofás, camas, colchões, armários, eletrodomésticos e outros volumes grandes, desde que o pedido seja identificado no orçamento.",
  },
  {
    question: "Fazem desmontagem?",
    answer:
      "Sim. Quando necessário, a equipa desmonta móveis e trata da retirada a partir do interior do imóvel.",
  },
  {
    question: "Atendem empresas e condomínios?",
    answer:
      "Sim. A operação atende particulares, senhorios, empresas, equipas de obra e condomínios com necessidade de recolha, limpeza ou esvaziamento.",
  },
  {
    question: "O destino dos resíduos é legal?",
    answer:
      "Sempre que possível, a equipa separa materiais para reaproveitamento ou encaminhamento adequado. O restante segue para destino responsável.",
  },
];

const testimonials = [
  {
    service: "Recolha de Entulho",
    name: "Carlos F.",
    text: "Excelente serviço, rápido e com ótima relação qualidade-preço. Trabalho impecável e equipa simpática.",
  },
  {
    service: "Recolha de Móveis",
    name: "Patrícia S.",
    text: "Comunicação clara, recolha organizada e tudo resolvido sem complicações.",
  },
  {
    service: "Mudanças Completas",
    name: "Maria T.",
    text: "Muito eficientes, cuidadosos e com boa relação qualidade-preço.",
  },
];

const proofPoints = [
  "Resposta comercial rápida",
  "Equipa profissional e organizada",
  "Cobertura forte em Lisboa, Margem Sul e Setúbal",
  "Fluxo simples do pedido até à recolha",
];

const lisbonSearchLinks = [
  {
    href: "/recolha-moveis-lisboa",
    title: "Recolha de móveis em Lisboa",
    text: "Retirada de sofás, camas, armários e eletrodomésticos com apoio completo dentro da cidade.",
  },
  {
    href: "/recolha-moveis-benfica",
    title: "Recolha de móveis em Benfica",
    text: "Serviço local para pedidos em Benfica com recolha rápida, carga e encaminhamento responsável.",
  },
  {
    href: "/recolha-moveis-lumiar",
    title: "Recolha de móveis no Lumiar",
    text: "Apoio no Lumiar para retirar móveis usados, colchões e volumes grandes sem complicações.",
  },
];

const coastalSearchLinks = [
  {
    href: "/recolha-moveis-cascais",
    title: "Recolha de móveis em Cascais",
    text: "Retiramos móveis, recheios e eletrodomésticos em Cascais com rapidez e cuidado no acesso.",
  },
  {
    href: "/recolha-moveis-oeiras",
    title: "Recolha de móveis em Oeiras",
    text: "Cobertura em Oeiras para recolha de sofás, camas, armários e outros volumes pesados.",
  },
  {
    href: "/recolha-moveis-sintra",
    title: "Recolha de móveis em Sintra",
    text: "Equipa preparada para recolhas em Sintra com desmontagem, carregamento e transporte incluídos.",
  },
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

export const revalidate = 3600;

export default async function HomePage() {
  const workImages = await getHeroCarouselImages();

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Hero */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                163 avaliações 5 estrelas
              </div>

              <h1 className="text-[2.25rem] font-bold leading-tight tracking-tight text-slate-900 md:text-[2.75rem]">
                Recolha de Entulho, Móveis, Monos e Esvaziamento de Casas em Lisboa e Setúbal
              </h1>

              <div className="mt-5">
                <RotatingHeroCopy />
              </div>

              <p className="mt-4 text-[1.0625rem] leading-7 text-slate-600">
                Recolha rápida de móveis, entulho, monos, esvaziamento de casas e limpeza pós-obra em Lisboa, Margem Sul e Setúbal.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link 
                  href="/simulador" 
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-cyan-600 px-6 text-[0.9375rem] font-semibold text-white transition hover:bg-cyan-700"
                >
                  Pedir Orçamento Grátis
                </Link>
                <a
                  href="https://wa.me/351931632622?text=Ol%C3%A1!%20Gostava%20de%20pedir%20um%20or%C3%A7amento%20%C3%A0%20CLYON."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500 px-6 text-[0.9375rem] font-semibold text-white transition hover:bg-emerald-600"
                >
                  <svg className="h-[1.125rem] w-[1.125rem]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              <div className="mt-8 flex items-center gap-7 sm:mt-10 sm:gap-9">
                {[
                  { value: "163", label: "avaliações" },
                  { value: "24h", label: "resposta" },
                  { value: "Grátis", label: "orçamento" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[1.625rem] font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="overflow-hidden rounded-2xl bg-slate-200 shadow-lg">
                <div className="aspect-[4/3]">
                  <ImageCarousel images={workImages} autoPlayInterval={5000} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200" />
      </section>

      {/* Onde Operamos */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
              <MapPin className="h-4 w-4" />
              Cobertura geográfica
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Onde Operamos</h2>
            <p className="mt-2 text-slate-600">Mais de 24 localidades cobertas em Lisboa, Margem Sul e Setúbal.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: "Grande Lisboa", slug: "lisboa", cities: ["Lisboa", "Amadora", "Sintra", "Cascais", "Oeiras"], highlight: "Mais procurado" },
              { name: "Margem Sul", slug: "margem-sul", cities: ["Almada", "Seixal", "Barreiro", "Moita", "Montijo"], highlight: "Base CLYON" },
              { name: "Setúbal", slug: "setubal", cities: ["Setúbal", "Palmela", "Sesimbra"], highlight: null },
            ].map((region) => (
              <div key={region.slug} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <MapPin className="h-5 w-5 text-slate-600" />
                  </div>
                  {region.highlight && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                      {region.highlight}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{region.name}</h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {region.cities.map((city) => (
                    <span key={city} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {city}
                    </span>
                  ))}
                </div>
                <Link href={`/regioes/${region.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700">
                  Ver serviços
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicos */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div key={service.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50">
                  <service.icon className="h-6 w-6 text-cyan-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                <Link href={service.href} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700">
                  Ver em Lisboa
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lisboa Destaque */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                Mais procurado em Lisboa
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recolha de móveis em Lisboa com resposta rápida.
              </h2>
              <p className="mt-2 text-slate-600">
                Retiramos sofás, camas, armários, colchões e eletrodomésticos em Lisboa com desmontagem e carregamento.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {lisbonSearchLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/recolha-moveis-lisboa" className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700">
                Ver Lisboa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cascais Destaque */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                Linha de Cascais
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recolha de móveis na linha de Cascais.
              </h2>
              <p className="mt-2 text-slate-600">
                Atuamos em Cascais, Oeiras e Sintra para retirar móveis usados, recheios e volumes grandes.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {coastalSearchLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/recolha-moveis-cascais" className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700">
                Ver Cascais
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Precos e O que recolhemos */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                Preços orientativos
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Valores de referência.</h2>
              <div className="mt-6 space-y-3">
                {priceHighlights.map((item) => (
                  <div key={item} className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</div>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Link href="/precos" className="inline-flex h-10 items-center justify-center rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700">
                  Ver preços
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                O que recolhemos
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Do sofá ao entulho.</h2>
              <div className="mt-6 space-y-3">
                {collectedItems.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
              Como funciona
            </div>
            <h2 className="text-3xl font-bold text-slate-900">3 passos simples.</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-600 text-white">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{step.step}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
              Perguntas frequentes
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Dúvidas típicas.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {homeFaqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <Link href="/faq" className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Ver FAQ completa
            </Link>
          </div>
        </div>
      </section>

      {/* Testemunhos */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((review) => (
              <div key={review.name} className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <MessageSquareQuote className="h-6 w-6 text-cyan-600" />
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-cyan-600">{review.service}</div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{review.text}</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Porque escolher */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                  <ShieldCheck className="h-4 w-4" />
                  Porque escolher a CLYON
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Menos complicação, mais execução.</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {proofPoints.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-lg bg-slate-50 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Final */}
            <div className="mt-8 rounded-xl bg-slate-900 p-8 text-white">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 text-cyan-400">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Pedido imediato</span>
                  </div>
                  <h2 className="text-2xl font-bold">Pronto para libertar espaço hoje?</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Simule o pedido, confirme os detalhes e receba uma resposta clara.
                  </p>
                </div>
                <Link href="/simulador" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-5 text-sm font-semibold text-white transition hover:bg-cyan-400">
                  Simular orçamento
                  <ArrowRight className="h-4 w-4" />
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
