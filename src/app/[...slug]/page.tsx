import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Star,
} from "lucide-react";
import { notFound } from "next/navigation";

import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  CONTACT_PATH,
  SITE_URL,
  getAllCityServiceSlugs,
  getCityServiceSlug,
  getRegion,
  getRelatedCities,
  parseCityServiceSlug,
} from "@/lib/seo-data";

type Props = {
  params: Promise<{ slug: string[] }>;
};

function buildTitle(serviceName: string, cityName: string) {
  return `${serviceName} em ${cityName} com Orçamento Rápido`;
}

function buildDescription(serviceName: string, cityName: string, regionLabel: string) {
  return `${serviceName} em ${cityName}, ${regionLabel}. Resposta rápida, orçamento em 11 minutos, serviço profissional e recolha no mesmo dia quando disponível.`;
}

export function generateStaticParams() {
  return getAllCityServiceSlugs().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCityServiceSlug(slug);

  if (!parsed) {
    return { title: "Página não encontrada | CLYON" };
  }

  const { city, service } = parsed;
  const title = buildTitle(service.name, city.name);
  const description = buildDescription(service.name, city.name, city.regionLabel);
  const canonical = `${SITE_URL}/${getCityServiceSlug(service.slug, city.slug)}`;

  return {
    title,
    description,
    keywords: [
      ...service.keywords,
      `${service.primaryKeyword} ${city.name.toLowerCase()}`,
      `${service.primaryKeyword} ${city.regionLabel.toLowerCase()}`,
      `${service.shortName} ${city.name.toLowerCase()}`,
      "orçamento recolha",
      "serviço no mesmo dia",
      BUSINESS_NAME,
    ],
    alternates: {
      canonical,
      languages: { "pt-PT": canonical },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: "pt_PT",
      type: "article",
    },
  };
}

export const revalidate = 86400;
export const dynamicParams = false;

export default async function ServiceCityPage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseCityServiceSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { city, service } = parsed;
  const region = getRegion(city.region);
  const relatedCities = getRelatedCities(city.slug, 4);

  if (!region) {
    notFound();
  }

  const pageUrl = `${SITE_URL}/${getCityServiceSlug(service.slug, city.slug)}`;
  const title = buildTitle(service.name, city.name);
  const description = buildDescription(service.name, city.name, city.regionLabel);

  const faqs = [
    {
      q: `Quanto custa ${service.name.toLowerCase()} em ${city.name}?`,
      a: `O valor depende do volume, acessibilidade, tipologia do serviço e recursos necessários. A CLYON responde com orçamento rápido para ${service.name.toLowerCase()} em ${city.name}.`,
    },
    {
      q: `A CLYON faz ${service.name.toLowerCase()} no mesmo dia em ${city.name}?`,
      a: `Em muitos pedidos conseguimos responder e agendar no mesmo dia em ${city.name}, especialmente quando o acesso e o volume são claros desde o primeiro contacto.`,
    },
    {
      q: `Que zonas próximas de ${city.name} também atendem?`,
      a: `Além de ${city.name}, a CLYON trabalha regularmente em ${relatedCities
        .map((item) => item.name)
        .join(", ")} e noutras zonas da ${city.regionLabel}.`,
    },
  ];

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
        name: "Regiões",
        item: `${SITE_URL}/regioes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: region.name,
        item: `${SITE_URL}/regioes/${region.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${service.name} em ${city.name}`,
        item: pageUrl,
      },
    ],
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: title,
    description,
    provider: {
      "@type": "LocalBusiness",
      name: BUSINESS_NAME,
      telephone: BUSINESS_PHONE,
      areaServed: {
        "@type": "City",
        name: city.name,
      },
    },
    areaServed: [
      {
        "@type": "City",
        name: city.name,
      },
      {
        "@type": "AdministrativeArea",
        name: city.regionLabel,
      },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: pageUrl,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.14),_transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
                <MapPin className="h-4 w-4" />
                {city.name}, {city.regionLabel}
              </div>
              <h1 className="mt-5 max-w-[15ch] text-4xl font-bold tracking-tight text-slate-950 md:text-6xl">
                {service.name} em {city.name} com resposta rápida.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {service.longDescription} Atendemos {city.name} com foco em clareza no
                orçamento, execução profissional e recolha no mesmo dia quando possível.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/simulador"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  Pedir orçamento
                </Link>
                <Link
                  href={CONTACT_PATH}
                  className="inline-flex items-center justify-center rounded-2xl border border-cyan-200 bg-white px-6 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50"
                >
                  Falar connosco
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-cyan-100 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Cobertura local
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Operação reforçada em {city.name}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                A nossa equipa atende {city.name} e zonas próximas com foco em rapidez,
                comunicação clara e execução cuidada. A página existe para captar procura
                local forte e transformar essa procura em pedido real.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-950">Zona principal</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{city.name}</p>
                </div>
                <div className="rounded-[22px] border border-cyan-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Região</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {city.regionLabel}
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
              icon: Clock,
              title: "Orçamento em 11 minutos",
              desc: `Triagem rápida para ${service.shortName} em ${city.name} com resposta prática e comercial.`,
            },
            {
              icon: Star,
              title: "Processo claro",
              desc: "Explicamos volume, acesso, distância e recursos necessários antes da marcação.",
            },
            {
              icon: CheckCircle2,
              title: "Execução profissional",
              desc: "Equipas preparadas para recolha, limpeza e transporte com foco em rapidez e confiança.",
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Serviço local
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              {service.name} forte para quem procura em {city.name}
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Esta página existe para responder diretamente a pesquisas como{" "}
              <strong>
                "{service.primaryKeyword} {city.name.toLowerCase()}"
              </strong>{" "}
              e também intenções próximas na {city.regionLabel}. Quanto mais claro for o
              pedido, mais rápido conseguimos confirmar volume, acesso e disponibilidade.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Trabalhamos em prédios, moradias, lojas, escritórios, garagens e imóveis em
              transição. Fazemos recolha organizada, resposta comercial prática e apoio
              humano por telefone e contacto direto no site.
            </p>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-slate-950 p-7 text-white shadow-[0_24px_60px_-34px_rgba(2,6,23,0.45)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              Zonas próximas
            </p>
            <h2 className="mt-3 text-3xl font-bold">Mais páginas locais para o Google</h2>
            <div className="mt-6 space-y-3">
              {relatedCities.map((relatedCity) => (
                <Link
                  key={relatedCity.slug}
                  href={`/${getCityServiceSlug(service.slug, relatedCity.slug)}`}
                  className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  <span>
                    {service.name} em {relatedCity.name}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-cyan-100 bg-cyan-50/70 p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Perguntas frequentes locais
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
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
            Pedido local
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            Precisa de {service.shortName} em {city.name}?
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Use o simulador da {BUSINESS_NAME} para acelerar o pedido e depois valide tudo
            connosco por telefone ou pela página de contactos. É a forma mais simples de
            transformar pesquisa local em pedido confirmado.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
            >
              Simular agora
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
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </div>
  );
}

