import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Recycle,
  Shield,
  Sofa,
  Truck,
  Users,
  Zap,
} from "lucide-react";

import Breadcrumb from "@/components/Breadcrumb";
import FurnitureSeoLinks from "@/components/FurnitureSeoLinks";
import ImageCarousel from "@/components/ImageCarousel";
import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  CITIES,
  SITE_URL,
  getCityServiceSlug,
} from "@/lib/seo-data";
import { getHeroCarouselImages } from "@/lib/work-gallery";

export const metadata: Metadata = {
  title: "Recolha de Móveis em Lisboa, Margem Sul e Setúbal",
  description:
    "Recolha de móveis usados, sofás, camas, armários e eletrodomésticos em Lisboa, Margem Sul e Setúbal. Desmontagem, carregamento e transporte. Peça orçamento rápido.",
  keywords: [
    "recolha de móveis",
    "recolha de móveis lisboa",
    "recolha de móveis usados",
    "recolha gratuita de móveis usados",
    "recolha de sofá lisboa",
    "retirar móveis velhos",
    "recolha de móveis setúbal",
    "recolha de móveis almada",
    "remoção de móveis",
    "levar móveis velhos",
  ],
  alternates: {
    canonical: `${SITE_URL}/recolha-de-moveis`,
  },
  openGraph: {
    title: "Recolha de Móveis em Lisboa, Margem Sul e Setúbal",
    description:
      "Recolha de móveis usados, sofás, camas, armários e eletrodomésticos. Desmontagem, carregamento porta a porta e destino responsável.",
    url: `${SITE_URL}/recolha-de-moveis`,
    locale: "pt_PT",
    type: "website",
  },
};

const keyCities = [
  "lisboa",
  "amadora",
  "sintra",
  "oeiras",
  "cascais",
  "almada",
  "seixal",
  "setubal",
]
  .map((slug) => CITIES.find((city) => city.slug === slug))
  .filter((city): city is (typeof CITIES)[number] => Boolean(city));

const areaServedCities = [
  "Lisboa",
  "Amadora",
  "Sintra",
  "Oeiras",
  "Cascais",
  "Almada",
  "Seixal",
  "Barreiro",
  "Setúbal",
];

const benefits = [
  { icon: Clock3, title: "Resposta rápida", desc: "Orçamento em minutos, recolha em 24-48h quando disponível" },
  { icon: Users, title: "Desmontagem quando necessário", desc: "A equipa desmonta armários, camas e móveis grandes" },
  { icon: Truck, title: "Carregamento porta a porta", desc: "Retirada a partir do interior do imóvel" },
  { icon: Recycle, title: "Destino responsável", desc: "Triagem, doação ou encaminhamento correto" },
];

const includedItems = [
  "Sofás, chaise longues e cadeirões",
  "Camas, estrados, colchões e mesinhas de cabeceira",
  "Armários, roupeiros, cómodas e aparadores",
  "Mesas, cadeiras, secretárias e móvel de TV",
  "Frigoríficos, máquinas de lavar e pequenos eletrodomésticos",
  "Recheios completos de apartamentos, moradias, escritórios e lojas",
];

const pricingTable = [
  { item: "Sofá (2-3 lugares)", price: "sob avaliação" },
  { item: "Cama de casal com estrado", price: "sob avaliação" },
  { item: "Armário grande", price: "sob avaliação" },
  { item: "Eletrodoméstico (frigorífico, máquina)", price: "sob avaliação" },
  { item: "Recolha de vários móveis", price: "orçamento personalizado" },
];

const faqs = [
  {
    q: "Quanto custa a recolha de móveis?",
    a: "O preço depende do volume, peso, acessos, necessidade de desmontagem e distância. A forma mais rápida de fechar o valor certo é enviar fotos e a morada para receber um orçamento imediato.",
  },
  {
    q: "Recolhem móveis usados no mesmo dia?",
    a: "Sim. Quando há disponibilidade operacional, a recolha pode ser feita no próprio dia ou no dia seguinte, sobretudo em Lisboa, Amadora, Sintra, Oeiras, Cascais, Almada e Setúbal.",
  },
  {
    q: "Também recolhem eletrodomésticos?",
    a: "Sim. Recolhemos frigoríficos, máquinas de lavar, fogões, micro-ondas e outros equipamentos volumosos, desde que o pedido seja identificado no orçamento.",
  },
  {
    q: "O que acontece aos móveis recolhidos?",
    a: "Sempre que o estado dos móveis permita, fazemos triagem para doação ou reaproveitamento. O restante segue para encaminhamento responsável e descarte legal.",
  },
  {
    q: "Fazem desmontagem de armários e camas?",
    a: "Sim. Quando necessário, a equipa desmonta móveis e trata da retirada a partir do interior do imóvel. Indique essa necessidade no pedido para o orçamento refletir o trabalho.",
  },
  {
    q: "Qual é a diferença entre a CLYON e a recolha municipal?",
    a: "A recolha municipal funciona bem para alguns pedidos gratuitos e agendados, mas costuma ser mais limitada em horários, volume, desmontagem e apoio dentro do imóvel. A CLYON entra quando o cliente precisa de rapidez, carregamento completo e resolução total.",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: BUSINESS_NAME,
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Serviços",
      item: `${SITE_URL}/servicos`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Recolha de Móveis",
      item: `${SITE_URL}/recolha-de-moveis`,
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}/#organization`,
  name: BUSINESS_NAME,
  description: "Recolha de móveis, entulho, monos, esvaziamento de casas, mudanças e limpeza pós-obra em Lisboa, Margem Sul e Setúbal.",
  url: SITE_URL,
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Belverde",
    addressLocality: "Amora",
    addressRegion: "Setúbal",
    postalCode: "2845-513",
    addressCountry: "PT",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 38.6266,
    longitude: -9.1092,
  },
  areaServed: areaServedCities.map((city) => ({
    "@type": "City",
    name: city,
  })),
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "19:00",
  },
  priceRange: "€€",
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Recolha de Móveis",
  serviceType: "Recolha de móveis usados e eletrodomésticos",
  url: `${SITE_URL}/recolha-de-moveis`,
  description:
    "Serviço de recolha de móveis usados com desmontagem, carregamento porta a porta, transporte e encaminhamento responsável em Lisboa, Margem Sul e Setúbal.",
  provider: {
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    telephone: BUSINESS_PHONE,
    url: SITE_URL,
  },
  areaServed: areaServedCities.map((city) => ({
    "@type": "City",
    name: city,
  })),
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE_URL}/recolha-de-moveis`,
    servicePhone: BUSINESS_PHONE,
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "EUR",
    price: "35",
    priceValidUntil: "2026-12-31",
    availability: "https://schema.org/InStock",
  },
};

export const revalidate = 86400;

export default async function RecolhaDeMoveisPage() {
  const carouselImages = await getHeroCarouselImages();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
          <Breadcrumb
            items={[
              { label: "Serviços", href: "/servicos" },
              { label: "Recolha de Móveis" },
            ]}
            className="mb-6"
          />
          
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600">
                <Sofa className="h-4 w-4 text-cyan-600" />
                Serviço profissional
              </div>
              
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Recolha de móveis em Lisboa, Margem Sul e Setúbal
              </h1>
              
              <p className="mt-5 text-lg leading-8 text-slate-600">
                Recolhemos <strong>móveis usados</strong>, <strong>sofás</strong>, <strong>camas</strong>, <strong>armários</strong>, <strong>colchões</strong> e <strong>eletrodomésticos</strong> com desmontagem quando necessária, carregamento porta a porta e destino responsável. Cobertura em <strong>Lisboa</strong>, <strong>Margem Sul</strong> e <strong>Setúbal</strong>.
              </p>

              {/* Benefits above the fold */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                      <benefit.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{benefit.title}</p>
                      <p className="text-xs text-slate-500">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/simulador"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-6 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Pedir Orçamento Grátis
                </Link>
                <a
                  href={`tel:${BUSINESS_PHONE}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4" />
                  Ligar Agora
                </a>
                <a
                  href="https://wa.me/351934748005?text=Ol%C3%A1!%20Preciso%20de%20recolha%20de%20m%C3%B3veis."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-emerald-500 bg-emerald-500 px-6 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Right side - Carousel with background */}
            <div 
              className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-cover bg-center"
              style={{
                backgroundImage: "url('/hero-entulho-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="overflow-hidden rounded-2xl bg-black/30 backdrop-blur-sm shadow-2xl shadow-slate-900/10">
                <div className="aspect-[4/3]">
                  <ImageCarousel images={carouselImages} autoPlayInterval={5000} />
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
                <div className="rounded-full bg-white/95 px-4 py-2 backdrop-blur-sm shadow-lg">
                  <p className="text-xs font-semibold text-slate-900">Equipa Profissional</p>
                  <p className="text-xs text-slate-600">Lisboa e Setúbal</p>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 z-10">
                <div className="rounded-full bg-emerald-50 px-3.5 py-2.5 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Resposta Rápida</p>
                      <p className="text-xs text-slate-600">Em 11 minutos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-200" />
      </section>

      {/* O que recolhemos */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              O que recolhemos
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Móveis usados, recheios e volumes grandes
            </h2>
            <div className="mt-4 space-y-2">
              {includedItems.map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              Preços de referência
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Exemplos de valores para recolha de móveis
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Valores orientativos. O orçamento final depende de volume, acessos, andares e necessidade de desmontagem.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900">Item</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-900">Preço</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pricingTable.map((row) => (
                    <tr key={row.item}>
                      <td className="px-4 py-3 text-slate-700">{row.item}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-600">{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Section: Recolha gratuita vs privada */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Recolha gratuita, doação ou recolha privada: qual escolher?
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Muitas pesquisas por &quot;recolha de móveis usados&quot; ou &quot;recolha gratuita de móveis&quot; incluem intenções diferentes: doação, recolha municipal, reaproveitamento ou serviço profissional. É importante perceber quando cada opção faz sentido.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">Recolha municipal / gratuita</h3>
              <p className="mt-2 text-sm text-slate-600">
                Funciona bem para pedidos simples, agendados com antecedência, em que os móveis estão no exterior e não há urgência. Limitações: horários fixos, sem desmontagem, volume limitado, pode demorar semanas.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900">Doação / reaproveitamento</h3>
              <p className="mt-2 text-sm text-slate-600">
                Ideal se os móveis estão em bom estado e há tempo para contactar instituições ou publicar anúncios. Requer que a peça seja funcional e que o interessado vá buscar.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
              <h3 className="font-semibold text-cyan-800">Recolha privada (CLYON)</h3>
              <p className="mt-2 text-sm text-cyan-700">
                A escolha certa quando precisa de rapidez, desmontagem, carregamento a partir do interior do imóvel, transporte e retirada completa. Resolve tudo num só pedido, sem depender de terceiros.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-900 p-5 text-white">
            <p className="text-sm font-semibold">Quando escolher a CLYON:</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              <li>• Precisa de recolha de móveis usados nos próximos dias</li>
              <li>• Tem armários, camas ou móveis grandes que precisam de desmontagem</li>
              <li>• Os móveis estão em andares altos ou acessos difíceis</li>
              <li>• Quer libertar o espaço sem gerir múltiplos contactos</li>
              <li>• Precisa de retirar móveis velhos de dentro do imóvel</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Páginas por tipo de móvel */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Serviços especializados
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Recolha por tipo de móvel ou equipamento
        </h2>
        <p className="mt-2 max-w-3xl text-base text-slate-600">
          Além da recolha geral de móveis, temos páginas específicas para cada tipo de item. Escolha o que precisa de recolher.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { href: "/recolha-de-sofas", label: "Recolha de Sofás", desc: "Sofás, chaise longues, cadeirões" },
            { href: "/recolha-de-camas", label: "Recolha de Camas", desc: "Camas, estrados, colchões" },
            { href: "/recolha-de-armarios", label: "Recolha de Armários", desc: "Armários, roupeiros, cómodas" },
            { href: "/recolha-de-eletrodomesticos", label: "Eletrodomésticos", desc: "Frigoríficos, máquinas" },
            { href: "/recolha-gratuita-de-moveis-usados", label: "Gratuita vs Privada", desc: "Quando escolher" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
            >
              <h3 className="font-semibold text-slate-900 group-hover:text-cyan-700">
                {item.label}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Cidades */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Cobertura local
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Recolha de móveis nas principais zonas
        </h2>
        <p className="mt-2 max-w-3xl text-base text-slate-600">
          Atendemos pedidos em Lisboa, Grande Lisboa, Margem Sul e Setúbal. Clique na sua zona para ver mais detalhes e pedir orçamento.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {keyCities.map((city) => (
            <Link
              key={city.slug}
              href={`/${getCityServiceSlug("recolha-moveis", city.slug)}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-cyan-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-600">
                <MapPin className="h-3.5 w-3.5" />
                {city.regionLabel}
              </div>
              <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-cyan-700">
                Recolha de móveis em {city.name}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Ver preços e pedir orçamento
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Links internos SEO */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <FurnitureSeoLinks currentPage="/recolha-de-moveis" />
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
          Perguntas frequentes
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Dúvidas sobre recolha de móveis usados
        </h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">{faq.q}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8">
        <div className="rounded-2xl bg-slate-900 p-8 text-center lg:p-12">
          <h2 className="text-2xl font-bold text-white lg:text-3xl">
            Precisa de recolha de móveis hoje?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Envie fotos e morada para receber orçamento rápido. Quanto mais informação nos der, mais preciso será o valor.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-8 font-semibold text-white transition hover:bg-cyan-400"
            >
              Simular Orçamento
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${BUSINESS_PHONE}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-8 font-semibold text-white transition hover:bg-white/20"
            >
              <Phone className="h-4 w-4" />
              Ligar Agora
            </a>
          </div>
        </div>
      </section>

      {/* Schema.org Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </div>
  );
}
