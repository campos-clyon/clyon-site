import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Phone,
  Recycle,
  Sofa,
  Truck,
} from "lucide-react";

import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  CITIES,
  SITE_URL,
  getCityServiceSlug,
} from "@/lib/seo-data";

export const metadata: Metadata = {
  title: "Recolha de Móveis | Sofás, Armários, Camas e Eletrodomésticos | CLYON",
  description:
    "Recolha de móveis com desmontagem, carregamento, transporte e descarte legal em Lisboa, Amadora, Sintra, Oeiras, Cascais, Margem Sul e Setúbal. Orçamento rápido e recolha no mesmo dia quando disponível.",
  keywords: [
    "recolha de moveis",
    "recolha de móveis",
    "recolha de móveis lisboa",
    "recolha de móveis amadora",
    "remoção de móveis",
    "tirar móveis velhos",
    "recolha de sofás",
    "recolha de eletrodomésticos",
  ],
  alternates: {
    canonical: `${SITE_URL}/recolha-de-moveis`,
  },
  openGraph: {
    title: "Recolha de Móveis | Sofás, Armários, Camas e Eletrodomésticos | CLYON",
    description:
      "Serviço profissional para recolha de móveis velhos, recheios e volumes grandes com resposta rápida e descarte legal.",
    url: `${SITE_URL}/recolha-de-moveis`,
    locale: "pt_PT",
    type: "article",
  },
};

const keyCities = [
  "amadora",
  "lisboa",
  "sintra",
  "oeiras",
  "cascais",
  "almada",
  "seixal",
  "setubal",
]
  .map((slug) => CITIES.find((city) => city.slug === slug))
  .filter((city): city is (typeof CITIES)[number] => Boolean(city));

const includedItems = [
  "Sofás, chaise longues e cadeirões",
  "Camas, estrados, colchões e mesinhas",
  "Armários, roupeiros, cómodas e aparadores",
  "Mesas, cadeiras, secretárias e móvel de TV",
  "Frigoríficos, máquinas de lavar e pequenos eletrodomésticos",
  "Recheios completos de apartamentos, moradias, escritórios e lojas",
];

const differentiators = [
  "Orçamento rápido por telefone ou WhatsApp",
  "Desmontagem quando necessária e recolha porta a porta",
  "Triagem para doação, reutilização e reciclagem",
  "Atendimento em prédios sem elevador e acessos difíceis",
  "Cobertura forte em Lisboa, Grande Lisboa, Margem Sul e Setúbal",
  "Apoio complementar para monos, entulho e esvaziamento de casas",
];

const pricingExamples = [
  "Sofá de 2 a 3 lugares: 35 EUR a 55 EUR",
  "Cama de casal com estrado: 25 EUR a 45 EUR",
  "Armário grande: 45 EUR a 75 EUR",
  "Mesa com cadeiras: 35 EUR a 55 EUR",
  "Recolha de vários móveis num apartamento: 180 EUR a 350 EUR",
];

const faqs = [
  {
    q: "Quanto custa a recolha de móveis?",
    a: "O preço depende do volume, peso, acessos, necessidade de desmontagem e distância. A forma mais rápida de fechar o valor certo é enviar fotos e a morada para receber um orçamento imediato.",
  },
  {
    q: "Recolhem móveis no mesmo dia?",
    a: "Sim. Quando há disponibilidade operacional, a recolha pode ser feita no próprio dia ou no dia seguinte, sobretudo em Lisboa, Amadora, Sintra, Oeiras, Cascais e Margem Sul.",
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

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Recolha de Móveis",
  serviceType: "Recolha de móveis e eletrodomésticos",
  url: `${SITE_URL}/recolha-de-moveis`,
  description:
    "Serviço de recolha de móveis com desmontagem, carregamento, transporte e descarte legal em Lisboa, Grande Lisboa, Margem Sul e Setúbal.",
  provider: {
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    telephone: BUSINESS_PHONE,
    url: SITE_URL,
  },
  areaServed: keyCities.map((city) => ({
    "@type": "City",
    name: city.name,
  })),
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: `${SITE_URL}/recolha-de-moveis`,
    servicePhone: BUSINESS_PHONE,
  },
};

export const revalidate = 86400;

export default function RecolhaDeMoveisPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.14),_transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
                <Sofa className="h-4 w-4" />
                Recolha de móveis em Lisboa, Grande Lisboa e Margem Sul
              </div>
              <h1 className="mt-5 max-w-[14ch] text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                Recolha de móveis com resposta rápida e descarte responsável.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Recolhemos sofás, camas, armários, colchões, mesas, recheios
                completos e eletrodomésticos com desmontagem, carregamento,
                transporte e encaminhamento legal. O foco é resolver o pedido do
                início ao fim, sem deixar o cliente a gerir volume, acessos e
                descarte sozinho.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/simulador"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  Pedir orçamento
                </Link>
                <a
                  href={`tel:${BUSINESS_PHONE}`}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-200 bg-white px-6 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {BUSINESS_PHONE}
                </a>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-cyan-100 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Página-pilar da categoria
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Conteúdo para competir pela query principal
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Quem pesquisa por recolha de móveis normalmente quer uma solução
                rápida, local e completa. Esta página centraliza preço, cobertura,
                itens recolhidos, descarte legal e ligação direta para as páginas
                locais com maior prioridade, incluindo Amadora.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Tempo médio de resposta
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">11 minutos</p>
                </div>
                <div className="rounded-[22px] border border-cyan-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Cobertura principal
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Lisboa, Amadora, Sintra, Oeiras, Cascais, Almada e Setúbal
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Clock3,
              title: "Resposta comercial rápida",
              desc: "Triagem ágil para perceber volume, acessos, desmontagem e urgência logo no primeiro contacto.",
            },
            {
              icon: Truck,
              title: "Recolha completa",
              desc: "A equipa trata de carregar, transportar e encaminhar os móveis sem deixar etapas a meio.",
            },
            {
              icon: Recycle,
              title: "Descarte legal",
              desc: "Se houver reaproveitamento ou doação, a triagem é feita. O restante segue para encaminhamento responsável.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-cyan-100 bg-white p-6 shadow-[0_20px_50px_-34px_rgba(14,116,144,0.18)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              O que recolhemos
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Móveis, recheios e volumes grandes
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {includedItems.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-7 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-slate-950 p-7 text-white shadow-[0_24px_60px_-34px_rgba(2,6,23,0.45)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Sinais de confiança
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              O que o Google precisa de ver melhor
            </h2>
            <div className="mt-6 space-y-3">
              {differentiators.map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[30px] border border-cyan-100 bg-cyan-50/70 p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Preços orientativos
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Exemplos que ajudam a qualificar o pedido
            </h2>
            <div className="mt-5 space-y-3">
              {pricingExamples.map((item) => (
                <div key={item} className="rounded-[22px] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">{item}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">
              Estes valores servem apenas como referência. O orçamento final depende
              da quantidade de móveis, andares, elevador, desmontagem e distância.
            </p>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Processo simples, pensado para converter rápido
            </h2>
            <div className="mt-6 space-y-5">
              {[
                "Envie fotos, morada e indique se há elevador, escadas ou desmontagem.",
                "Receba um orçamento rápido e a melhor janela de recolha disponível.",
                "A equipa chega, protege acessos, carrega e retira tudo o que foi validado.",
                "Os móveis seguem para triagem, doação ou descarte legal conforme o estado.",
              ].map((step, index) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-600">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Zonas prioritárias
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            Páginas locais para ganhar cobertura orgânica
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
            A query genérica precisa de uma página forte, mas o crescimento real vem
            da combinação com páginas locais robustas. Amadora foi priorizada porque
            está a aparecer longe no Google e precisa de receber mais links internos
            e melhor conteúdo.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {keyCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${getCityServiceSlug("recolha-moveis", city.slug)}`}
                className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-5 transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <div className="flex items-center gap-2 text-cyan-700">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.16em]">
                    {city.regionLabel}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-950">
                  Recolha de móveis em {city.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Página local reforçada para captar pedidos qualificados em {city.name}.
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Concorrência real
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Porque os primeiros lugares estão acima
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Muitos resultados que ocupam o topo misturam três vantagens: páginas
              muito focadas na query, cobertura geográfica ampla e sinais de
              confiança acumulados com marca, backlinks e menções. Esta página fecha
              a parte on-page e de arquitetura interna, que é a parte que depende
              diretamente do site.
            </p>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Serviços complementares
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Links internos para fechar mais intenções
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { href: "/esvaziamento-casas-lisboa", label: "Esvaziamento de casas em Lisboa" },
                { href: "/recolha-monos-amadora", label: "Recolha de monos em Amadora" },
                { href: "/recolha-entulho-amadora", label: "Recolha de entulho em Amadora" },
                { href: "/servicos", label: "Todos os serviços" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between rounded-[22px] border border-cyan-100 bg-cyan-50/70 px-4 py-4 text-sm font-medium text-slate-800 transition hover:bg-cyan-50"
                >
                  <span>{item.label}</span>
                  <ArrowRight className="h-4 w-4 text-cyan-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-cyan-100 bg-cyan-50/70 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Perguntas frequentes
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-[22px] bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-950">{faq.q}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            CTA final
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            Precisa de recolha de móveis hoje?
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Use o simulador para acelerar o pedido ou ligue diretamente para validar
            disponibilidade. Quanto mais claro estiver o volume e o acesso, mais
            rápido conseguimos confirmar o serviço.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              Simular agora
            </Link>
            <Link
              href="/contactos"
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-200 bg-white px-6 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50"
            >
              Falar connosco
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </div>
  );
}
