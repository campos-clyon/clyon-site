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
  ShieldCheck,
  Sparkles,
  Trash2,
  Truck,
  Zap,
} from "lucide-react";

import ImageCarousel from "@/components/ImageCarousel";
import { getCityServiceSlug } from "@/lib/seo-data";
import { getHeroCarouselImages } from "@/lib/work-gallery";

export const metadata: Metadata = {
  title: "CLYON - Recolha de Entulho e Aluguer de Contentores em Lisboa e Setúbal",
  description:
    "Recolha de entulho, móveis e monos em Lisboa e Setúbal. Entrega em 24h, preços desde 120EUR, 163 avaliações 5 estrelas. Pedir orçamento grátis agora!",
  alternates: {
    canonical: "https://clyon.pt",
  },
  openGraph: {
    title: "CLYON - Recolha de Entulho e Aluguer de Contentores em Lisboa e Setúbal",
    description:
      "Recolha de entulho, móveis, monos, limpeza pós-obra e mudanças em Lisboa e Setúbal. Entrega em 24h, preços desde 120EUR!",
    url: "https://clyon.pt",
  },
};

const services = [
  {
    name: "Recolha de Entulho",
    description: "Retiramos restos de obra, sacos e materiais mistos com resposta rápida.",
    icon: Trash2,
    href: "/recolha-entulho-lisboa",
  },
  {
    name: "Recolha de Móveis",
    description: "Sofás, camas, armários, eletrodomésticos e recheios com desmontagem e carga.",
    icon: HomeIcon,
    href: "/recolha-moveis-lisboa",
  },
  {
    name: "Limpeza Pós-Obra",
    description: "Acabamento final para deixar casa, loja ou escritório pronto a usar.",
    icon: Zap,
    href: "/limpeza-pos-obra-lisboa",
  },
  {
    name: "Mudanças e Apoio",
    description: "Transporte, carga, descarga e apoio logístico com equipa organizada.",
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
  "Eletrodomesticos e volumes grandes",
  "Entulho de obra e restos de remodelação",
  "Monos, sucata e acumulação em arrecadações",
  "Limpeza pós-obra e apoio em mudanças",
  "Pedidos de esvaziamento com recolha completa",
];

const steps = [
  {
    step: "01",
    title: "Enviar o pedido",
    cue: "Começo simples",
    description: "Envie fotos, morada e indique acessos, andar e elevador.",
    icon: Camera,
  },
  {
    step: "02",
    title: "Receber a resposta",
    cue: "Validação rápida",
    description: "Receba uma resposta rápida com orçamento claro e janela disponível.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "Executar a recolha",
    cue: "Fecho no local",
    description: "A equipa chega ao local, carrega, transporta e encaminha o material.",
    icon: Truck,
  },
];

const homeFaqs = [
  {
    question: "Quanto custa a recolha de monos ou móveis?",
    answer:
      "O valor depende do volume, acessos, tipo de material, urgência e necessidade de desmontagem. A forma mais rápida de receber um valor certo e enviar fotos e morada.",
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
    name: "Patricia S.",
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
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.18),_transparent_36%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_0.9fr] lg:gap-10">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 shadow-sm">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                163 avaliações 5 estrelas no Fixando
              </div>

              <h1 className="text-[3.15rem] font-bold leading-[1.02] tracking-tight text-slate-950 md:text-[3.7rem] xl:text-[3.9rem]">
                <span className="block">Recolha de Entulho</span>
                <span className="mt-2 block text-cyan-500">e Aluguer de</span>
                <span className="block text-cyan-500">Contentores</span>
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 md:text-[1.05rem]">
                Entrega em 24h, preços desde 120EUR e 163 avaliações 5 estrelas.
                Recolha de entulho, móveis, limpeza pós-obra e mudanças em Lisboa e Setúbal.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/contactos" className="site-btn-primary site-btn-lively min-h-[4.7rem] px-[3.25rem] py-[1.24rem] text-[1.48rem]">
                  <span>Pedir Orçamento Grátis</span>
                </Link>
                <a
                  href="https://wa.me/351931632622?text=Ol%C3%A1!%20Gostava%20de%20pedir%20um%20or%C3%A7amento%20%C3%A0%20CLYON."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-btn-lively inline-flex min-h-[4.7rem] items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500 bg-emerald-500 px-[3.25rem] py-[1.24rem] text-[1.48rem] font-semibold text-white shadow-[0_18px_40px_-22px_rgba(37,211,102,0.75)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span>Falar no WhatsApp</span>
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "163", label: "avaliações 5 estrelas" },
                  { value: "24h", label: "entrega disponível" },
                  { value: "120EUR", label: "preço desde" },
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

      {/* Secção Onde Operamos - Nova */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                <MapPin className="h-4 w-4" />
                Cobertura geográfica
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
                Onde Operamos
              </h2>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Mais de 24 localidades cobertas em Lisboa, Margem Sul e Setúbal com resposta rápida.
              </p>
            </div>
            <Link href="/areas-de-atuacao" className="site-btn-secondary px-6">
              Ver todas as áreas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { name: "Grande Lisboa", slug: "lisboa", cities: ["Lisboa", "Amadora", "Sintra", "Cascais", "Oeiras", "Loures", "Odivelas"], highlight: "Mais procurado" },
              { name: "Margem Sul", slug: "margem-sul", cities: ["Almada", "Seixal", "Barreiro", "Moita", "Montijo", "Alcochete"], highlight: "Base CLYON" },
              { name: "Setúbal", slug: "setubal", cities: ["Setúbal", "Palmela", "Sesimbra"], highlight: null },
            ].map((region) => (
              <div key={region.slug} className="relative rounded-[28px] border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/50 p-6 shadow-[0_20px_50px_-30px_rgba(14,116,144,0.14)]">
                {region.highlight && (
                  <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {region.highlight}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                    <MapPin className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{region.name}</h3>
                    <p className="text-sm text-slate-500">{region.cities.length} localidades</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {region.cities.slice(0, 5).map((city) => (
                    <span key={city} className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 shadow-sm">
                      {city}
                    </span>
                  ))}
                  {region.cities.length > 5 && (
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-600">
                      +{region.cities.length - 5}
                    </span>
                  )}
                </div>
                <Link href={`/regioes/${region.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 hover:text-cyan-700">
                  Ver serviços na região
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Hubs de serviço */}
          <div className="mt-10 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-bold text-slate-900">Serviços mais procurados por região</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Recolha de Móveis", href: "/recolha-de-moveis" },
                { name: "Recolha de Entulho", href: "/recolha-de-entulho" },
                { name: "Limpeza Pós-Obra", href: "/limpeza-pos-obra" },
                { name: "Esvaziamento de Casas", href: "/esvaziamento-casas" },
              ].map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  className="group rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="font-semibold text-slate-900 group-hover:text-cyan-600">{service.name}</span>
                  <ArrowRight className="ml-2 inline h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-cyan-600" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 rounded-[32px] border border-cyan-100 bg-cyan-50/80 p-7 shadow-[0_18px_50px_-34px_rgba(14,116,144,0.22)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Mais procurado em Lisboa
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Recolha de móveis em Lisboa com resposta rápida e apoio completo.
                </h2>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  Retiramos sofás, camas, armários, colchões e eletrodomésticos em Lisboa
                  com desmontagem, carregamento e encaminhamento responsável. Se precisa
                  de libertar espaço sem complicações, a equipa trata do pedido do início ao fim.
                </p>
              </div>
              <Link href="/recolha-moveis-lisboa" className="site-btn-primary px-6">
                Abrir Lisboa
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {lisbonSearchLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[24px] border border-cyan-100 bg-white p-5 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                    <ArrowRight className="h-4 w-4 text-cyan-700" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-10 rounded-[32px] border border-cyan-100 bg-white p-7 shadow-[0_18px_50px_-34px_rgba(14,116,144,0.16)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  Linha de Cascais
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">
                  Recolha de móveis na linha de Cascais com apoio local e execução cuidada.
                </h2>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  Atuamos em Cascais, Oeiras e Sintra para retirar móveis usados, recheios,
                  colchões e volumes grandes com resposta rápida, transporte organizado e
                  solução completa no local.
                </p>
              </div>
              <Link href="/recolha-moveis-cascais" className="site-btn-primary px-6">
                Abrir Cascais
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {coastalSearchLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[24px] border border-cyan-100 bg-cyan-50/60 p-5 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                    <ArrowRight className="h-4 w-4 text-cyan-700" />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </Link>
              ))}
            </div>
          </div>

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
                    Ver em Lisboa
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">Preços orientativos</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">Valores de referência sem esconder o jogo.</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {priceHighlights.map((item) => (
                  <div key={item} className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-slate-700">{item}</div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/precos" className="site-btn-primary px-6">Ver preços</Link>
                <Link href="/recolha-de-moveis" className="site-btn-secondary px-6">Recolha de móveis</Link>
              </div>
            </div>

            <div className="rounded-[34px] border border-cyan-100 bg-white p-8 shadow-[0_22px_60px_-34px_rgba(14,116,144,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">O que recolhemos</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">Do sofá ao entulho, com carga e encaminhamento.</h2>
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Como funciona</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                Do primeiro contacto até à recolha, com evolução clara em 3 etapas.
              </h2>
            </div>
            <div className="process-status-pill rounded-full border border-cyan-200 bg-white/85 px-5 py-3 text-sm font-semibold text-cyan-800 shadow-[0_14px_30px_-24px_rgba(8,145,178,0.35)]">
              <span className="process-status-pill__item">Pedido enviado</span>
              <span className="mx-2 text-cyan-300">•</span>
              <span className="process-status-pill__item">Orçamento confirmado</span>
              <span className="mx-2 text-cyan-300">•</span>
              <span className="process-status-pill__item">Recolha concluída</span>
            </div>
          </div>

          <div className="process-demo relative mt-10">
            <div className="grid gap-6 lg:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.step}
                  className="process-card relative overflow-hidden rounded-[32px] border border-cyan-100/90 bg-white/92 p-7 shadow-[0_24px_70px_-38px_rgba(14,116,144,0.22)] backdrop-blur-[2px]"
                  style={{ animationDelay: `${index * 2.4}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="process-card__icon flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 text-white shadow-[0_18px_36px_-22px_rgba(8,145,178,0.72)]">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className="rounded-full border border-cyan-100 bg-cyan-50/90 px-3 py-1 text-xs font-bold tracking-[0.24em] text-cyan-700">
                      {step.step}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">{step.cue}</p>
                    <h3 className="mt-3 text-[1.6rem] font-bold leading-tight text-slate-950">{step.title}</h3>
                    <p className="mt-4 text-base leading-8 text-slate-600">{step.description}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-cyan-100">
                      <div
                        className="process-card__bar h-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                        style={{
                          ["--target-width" as never]:
                            step.step === "01" ? "34%" : step.step === "02" ? "68%" : "100%",
                        }}
                      />
                    </div>
                    <span className="process-card__percent text-xs font-bold tracking-[0.18em] text-cyan-700">
                      {step.step === "01" ? "33%" : step.step === "02" ? "66%" : "100%"}
                    </span>
                  </div>

                  <div className="process-card__done mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Etapa concluída
                  </div>
                </article>
              ))}
            </div>

            <div className="process-clean-message pointer-events-none mx-auto mt-8 flex max-w-max items-center gap-3 rounded-full border border-emerald-200 bg-white/95 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700 shadow-[0_24px_54px_-30px_rgba(16,185,129,0.4)]">
              <Sparkles className="h-4 w-4" />
              Espaço limpo
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Perguntas frequentes</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">Dúvidas típicas antes de pedir.</h2>
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
                <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-950">Menos complicação, mais execução.</h2>
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
                  <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Pronto para libertar espaço hoje?</h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                    Simule o pedido, confirme os detalhes connosco e receba uma resposta clara para recolha, limpeza ou mudança.
                  </p>
                </div>
                <Link href="/simulador" className="site-btn-primary px-7 py-4 text-base">
                  Simular orçamento
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
