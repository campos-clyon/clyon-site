import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HardHat,
  MapPin,
  Phone,
  Recycle,
  Truck,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import CTABlock from "@/components/CTABlock";
import FAQSection from "@/components/service/FAQSection";
import PricingTable from "@/components/service/PricingTable";
import TrustBadges from "@/components/TrustBadges";
import { getCitiesByRegion } from "@/lib/city-content";
import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  CITIES,
  SITE_URL,
  getCityServiceSlug,
} from "@/lib/seo-data";

export const metadata: Metadata = {
  title: "Recolha de Entulho e Aluguer de Contentores em Lisboa e Setúbal | CLYON",
  description:
    "Recolha de entulho e aluguer de contentores em Lisboa e Setúbal. Entrega em 24h, preços desde 120EUR, 163 avaliações 5 estrelas. Orçamento grátis!",
  alternates: { canonical: `${SITE_URL}/recolha-de-entulho` },
  openGraph: {
    title: "Recolha de Entulho e Contentores em Lisboa e Setúbal | CLYON",
    description:
      "Recolha de entulho e aluguer de contentores. Entrega em 24h, preços desde 120EUR em Lisboa e Setúbal.",
    url: `${SITE_URL}/recolha-de-entulho`,
  },
};

const keyCities = ["lisboa", "almada", "seixal", "setubal", "sintra", "cascais", "oeiras", "amadora"]
  .map((slug) => CITIES.find((city) => city.slug === slug))
  .filter((city): city is (typeof CITIES)[number] => Boolean(city));

const pricingRows = [
  { service: "Contentor 3m³ (pequenas obras)", priceFrom: "120€", priceTo: "180€", description: "Ideal para remodelações de WC ou cozinha" },
  { service: "Contentor 5m³ (obras médias)", priceFrom: "180€", priceTo: "280€", description: "Para obras de apartamento T1/T2" },
  { service: "Contentor 8m³ (grandes obras)", priceFrom: "280€", priceTo: "400€", description: "Para demolições e renovações completas" },
  { service: "Sacos de entulho (até 10 sacos)", priceFrom: "80€", priceTo: "120€", description: "Pequenas quantidades em saco" },
  { service: "Recolha avulsa (carrada)", priceFrom: "150€", priceTo: "250€", description: "Sem contentor, carregamento direto" },
];

const faqs = [
  {
    question: "Quanto tempo demora a entrega do contentor?",
    answer: "Na maioria das zonas de Lisboa e Setúbal conseguimos entregar o contentor em 24 horas. Em situações urgentes, podemos entregar no mesmo dia mediante disponibilidade.",
  },
  {
    question: "Quanto tempo posso ficar com o contentor?",
    answer: "O período standard é de 3 a 5 dias úteis. Se precisar de mais tempo, podemos combinar uma extensão com um custo adicional por dia.",
  },
  {
    question: "Que tipo de entulho posso colocar no contentor?",
    answer: "Pode colocar restos de obra como tijolos, cimento, azulejos, telhas, gesso cartonado e madeira. Não aceitamos amianto, resíduos perigosos ou lixo doméstico misturado.",
  },
  {
    question: "Preciso de licença para colocar o contentor na rua?",
    answer: "Se o contentor ficar em espaço público (passeio ou estrada), é necessária licença da câmara. Se ficar dentro da propriedade, não precisa de licença. Podemos ajudar com o processo.",
  },
  {
    question: "Fazem recolha de entulho sem contentor?",
    answer: "Sim, fazemos recolha avulsa onde a nossa equipa carrega o entulho diretamente para a carrinha. É ideal para pequenas quantidades ou quando não há espaço para contentor.",
  },
];

const includedItems = [
  "Restos de obra (tijolos, cimento, azulejos)",
  "Telhas, pedras e materiais de construção",
  "Gesso cartonado e isolamentos",
  "Madeiras de obra e carpintarias",
  "Sanitários e louças partidas",
  "Ferragens e materiais metálicos",
];

const differentiators = [
  "Entrega de contentor em 24 horas na maioria das zonas",
  "Vários tamanhos disponíveis (3m³, 5m³, 8m³)",
  "Recolha pontual e encaminhamento para reciclagem",
  "Apoio no pedido de licença à câmara quando necessário",
  "Equipa para carregamento de entulho em sacos ou monte",
  "Cobertura em Lisboa, Margem Sul e Setúbal",
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Recolha de Entulho e Aluguer de Contentores",
  description: "Serviço de recolha de entulho e aluguer de contentores para obras em Lisboa e Setúbal.",
  provider: {
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    telephone: BUSINESS_PHONE,
  },
  areaServed: keyCities.map((city) => ({ "@type": "City", name: city.name })),
  offers: {
    "@type": "Offer",
    priceSpecification: {
      "@type": "PriceSpecification",
      price: "120",
      priceCurrency: "EUR",
      minPrice: "120",
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export const revalidate = 86400;

export default function RecolhaEntulhoPage() {
  const lisboaCities = getCitiesByRegion("lisboa");
  const margemSulCities = getCitiesByRegion("margem-sul");
  const setubalCities = getCitiesByRegion("setubal");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-amber-50/50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_32%)]" />
<div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
  <Breadcrumb
    items={[
      { label: "Serviços", href: "/servicos" },
      { label: "Recolha de Entulho" },
    ]}
    className="mb-6"
  />
  <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
  <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm">
                <HardHat className="h-4 w-4" />
                Recolha de entulho em Lisboa e Setúbal
              </div>
              <h1 className="mt-5 max-w-[16ch] text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Recolha de Entulho e Aluguer de Contentores
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Entregamos contentores de 3m³ a 8m³ em 24 horas, recolhemos quando
                estiver cheio e encaminhamos para reciclagem. Também fazemos recolha
                avulsa de entulho em sacos ou monte.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contactos"
                  className="site-btn-primary min-w-[220px] px-6 py-3.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Pedir Orçamento Grátis
                </Link>
                <a
                  href={`tel:${BUSINESS_PHONE}`}
                  className="site-btn-secondary min-w-[220px] border-slate-300 text-slate-900 hover:bg-slate-50"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar {BUSINESS_PHONE}
                </a>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Preços desde <span className="font-semibold text-amber-600">120EUR</span> para contentor 3m³
              </p>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-amber-100 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(180,83,9,0.14)]">
              <TrustBadges variant="grid" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-amber-100 bg-amber-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-950">Entrega em</p>
                  <p className="mt-2 text-2xl font-bold text-amber-600">24 horas</p>
                </div>
                <div className="rounded-[22px] border border-amber-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Tamanhos</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">3m³, 5m³ e 8m³</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Clock3, title: "Entrega rápida", desc: "Contentor entregue em 24h na maioria das zonas de Lisboa e Setúbal." },
            { icon: Truck, title: "Vários tamanhos", desc: "Contentores de 3m³ a 8m³ para obras pequenas, médias ou grandes." },
            { icon: Recycle, title: "Destino legal", desc: "Encaminhamento para reciclagem com guia de transporte e destino final." },
          ].map((item) => (
            <div key={item.title} className="rounded-[28px] border border-amber-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(180,83,9,0.12)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* O que recolhemos + Diferenciadores */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-amber-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(180,83,9,0.1)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">O que aceitamos</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Tipos de entulho</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {includedItems.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-[18px] border border-amber-100 bg-amber-50/70 p-4 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-7 text-white">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">Porquê a CLYON</p>
            <h2 className="mt-3 text-2xl font-bold">Serviço completo de entulho</h2>
            <div className="mt-6 space-y-3">
              {differentiators.map((item) => (
                <div key={item} className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <PricingTable
            title="Preços de Recolha de Entulho"
            subtitle="Valores orientativos para Lisboa e Setúbal"
            rows={pricingRows}
          />
        </div>
      </section>

      {/* Zonas de cobertura */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-4 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Recolha de Entulho por Zona
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-center text-slate-600">
            Clique na sua cidade para ver preços e detalhes específicos.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Lisboa */}
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Grande Lisboa</h3>
              <div className="flex flex-wrap gap-2">
                {lisboaCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${getCityServiceSlug("recolha-entulho", city.slug)}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-amber-100 hover:text-amber-700"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Margem Sul */}
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                Margem Sul
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Base CLYON</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {margemSulCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${getCityServiceSlug("recolha-entulho", city.slug)}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-amber-100 hover:text-amber-700"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Setúbal */}
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Setúbal</h3>
              <div className="flex flex-wrap gap-2">
                {setubalCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${getCityServiceSlug("recolha-entulho", city.slug)}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-amber-100 hover:text-amber-700"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/areas-de-atuacao" className="inline-flex items-center gap-2 text-amber-600 transition-colors hover:text-amber-700">
              Ver todas as áreas de atuação
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Links principais */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="rounded-[30px] border border-amber-100 bg-amber-50/50 p-7">
          <h2 className="text-2xl font-bold text-slate-950">Páginas mais procuradas</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {keyCities.slice(0, 8).map((city) => (
              <Link
                key={city.slug}
                href={`/${getCityServiceSlug("recolha-entulho", city.slug)}`}
                className="rounded-[20px] border border-amber-100 bg-white px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-amber-700">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-wide">{city.regionLabel}</span>
                </div>
                <h3 className="mt-2 font-bold text-slate-900">Entulho em {city.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50">
        <FAQSection title="Perguntas sobre Recolha de Entulho" faqs={faqs} includeSchema={false} />
      </section>

      {/* CTA Final */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <CTABlock
            variant="centered"
            title="Precisa de recolher entulho?"
            description="Peça um orçamento grátis. Entregamos o contentor em 24h e recolhemos quando estiver cheio."
            whatsappMessage="Olá! Preciso de um contentor para entulho. Podem dar-me um orçamento?"
          />
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}
