import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Recycle,
  ShieldCheck,
  Star,
  Truck,
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

function isFurnitureService(serviceSlug: string) {
  return serviceSlug === "recolha-moveis";
}

function buildTitle(serviceName: string, cityName: string, serviceSlug: string) {
  if (isFurnitureService(serviceSlug)) {
    return `Recolha de Móveis em ${cityName} | Sofás, Armários e Recheios | CLYON`;
  }

  return `${serviceName} em ${cityName} | Orçamento Rápido | CLYON`;
}

function buildDescription(
  serviceName: string,
  cityName: string,
  regionLabel: string,
  serviceSlug: string,
) {
  if (isFurnitureService(serviceSlug)) {
    return `Recolha de móveis em ${cityName}, ${regionLabel}, com desmontagem, carregamento, transporte e descarte legal. Retiramos sofás, camas, armários, eletrodomésticos e recheios com resposta rápida.`;
  }

  return `${serviceName} em ${cityName}, ${regionLabel}. Resposta rápida, orçamento em 11 minutos, serviço profissional e agendamento no mesmo dia quando disponível.`;
}

function getServiceIntro(serviceName: string, cityName: string, regionLabel: string, serviceSlug: string) {
  if (isFurnitureService(serviceSlug)) {
    return `Fazemos recolha de móveis em ${cityName} para apartamentos, moradias, lojas e escritórios. Retiramos sofás, camas, armários, mesas, colchões e eletrodomésticos com desmontagem quando necessária, carregamento porta a porta e encaminhamento responsável em ${regionLabel}.`;
  }

  return `${serviceName} em ${cityName} com resposta rápida, orçamento claro e execução cuidada. Trabalhamos em contexto residencial e comercial, com apoio local em ${regionLabel}.`;
}

function getIncludedItems(serviceName: string, cityName: string, serviceSlug: string) {
  if (isFurnitureService(serviceSlug)) {
    return [
      `Sofás, chaise longues e cadeirões em ${cityName}`,
      "Camas, estrados, colchões e mesinhas",
      "Armários, roupeiros, cómodas e aparadores",
      "Mesas, cadeiras, secretárias e móveis de TV",
      "Frigoríficos, máquinas de lavar e fogões",
      "Recheios completos de apartamentos e moradias",
    ];
  }

  return [
    `${serviceName} com triagem e planeamento prévio`,
    "Carga e transporte profissional",
    "Equipa preparada para acessos difíceis",
    "Apoio por telefone e contacto direto",
    "Cobertura local e regional",
    "Agendamento rápido conforme disponibilidade",
  ];
}

function getExcludedItems(serviceSlug: string) {
  if (isFurnitureService(serviceSlug)) {
    return [
      "Resíduos perigosos, tintas e químicos",
      "Materiais contaminados ou infestados",
      "Demolição pesada de estruturas fixas",
      "Objetos não validados no orçamento",
    ];
  }

  return [
    "Resíduos perigosos ou químicos",
    "Pedidos fora da área de cobertura confirmada",
    "Intervenções não descritas no orçamento",
    "Serviços que exijam licenças externas não validadas",
  ];
}

function getPricingCopy(serviceName: string, cityName: string, serviceSlug: string) {
  if (isFurnitureService(serviceSlug)) {
    return [
      "Sofá de 2 a 3 lugares: 35 EUR a 55 EUR",
      "Cama de casal com estrado: 25 EUR a 45 EUR",
      "Armário grande: 45 EUR a 75 EUR",
      "Mesa com cadeiras: 35 EUR a 55 EUR",
      `Recolha de vários móveis em ${cityName}: 180 EUR a 350 EUR`,
    ];
  }

  return [
    `O valor de ${serviceName.toLowerCase()} em ${cityName} depende do volume e dos acessos.`,
    "Pedidos com escadas, pouca manobra ou urgência podem alterar o valor final.",
    "Quanto mais claro for o pedido, mais preciso será o orçamento.",
  ];
}

function getFaqs(serviceName: string, cityName: string, regionLabel: string, serviceSlug: string, relatedCities: { name: string }[]) {
  if (isFurnitureService(serviceSlug)) {
    return [
      {
        q: `Quanto custa a recolha de móveis em ${cityName}?`,
        a: `O preço depende da quantidade de móveis, acessos, desmontagem e distância. Em ${cityName}, o mais rápido é enviar fotos e morada para receber um orçamento imediato e ajustado ao pedido.`,
      },
      {
        q: `Recolhem sofás, camas e armários em ${cityName}?`,
        a: `Sim. Retiramos sofás, colchões, camas, armários, cómodas, mesas, cadeiras e outros volumes grandes, desde que o pedido seja identificado no orçamento.`,
      },
      {
        q: `Também recolhem eletrodomésticos em ${cityName}?`,
        a: `Sim. Frigoríficos, máquinas de lavar, fogões, micro-ondas e equipamentos semelhantes podem ser recolhidos e encaminhados de forma responsável.`,
      },
      {
        q: `A CLYON faz recolha de móveis no mesmo dia em ${cityName}?`,
        a: `Quando existe disponibilidade operacional, sim. Em ${cityName} conseguimos muitas vezes responder no próprio dia ou no dia seguinte.`,
      },
      {
        q: `Que outrás zonas próximas de ${cityName} também atendem?`,
        a: `Além de ${cityName}, a CLYON trabalha regularmente em ${relatedCities.map((item) => item.name).join(", ")} e noutrás zonas da ${regionLabel}.`,
      },
    ];
  }

  return [
    {
      q: `Quanto custa ${serviceName.toLowerCase()} em ${cityName}?`,
      a: `O valor depende do volume, acessibilidade, tipologia do serviço e recursos necessários. A CLYON responde com orçamento rápido para ${serviceName.toLowerCase()} em ${cityName}.`,
    },
    {
      q: `A CLYON faz ${serviceName.toLowerCase()} no mesmo dia em ${cityName}?`,
      a: `Em muitos pedidos conseguimos responder e agendar no mesmo dia em ${cityName}, especialmente quando o acesso e o volume são claros desde o primeiro contacto.`,
    },
    {
      q: `Que zonas próximas de ${cityName} também atendem?`,
      a: `Além de ${cityName}, a CLYON trabalha regularmente em ${relatedCities.map((item) => item.name).join(", ")} e noutrás zonas da ${regionLabel}.`,
    },
    {
      q: `Como pedir ${serviceName.toLowerCase()} em ${cityName}?`,
      a: `Basta enviar fotos, morada, detalhes de acesso e objetivo do serviço. Quanto mais informação recebermos, mais rápido conseguimos fechar orçamento e disponibilidade.`,
    },
  ];
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
  const title = buildTitle(service.name, city.name, service.slug);
  const description = buildDescription(
    service.name,
    city.name,
    city.regionLabel,
    service.slug,
  );
  const canonical = `${SITE_URL}/${getCityServiceSlug(service.slug, city.slug)}`;

  return {
    title,
    description,
    keywords: [
      ...service.keywords,
      `${service.primaryKeyword} ${city.name.toLowerCase()}`,
      `${service.primaryKeyword} ${city.regionLabel.toLowerCase()}`,
      `${service.shortName} ${city.name.toLowerCase()}`,
      isFurnitureService(service.slug) ? "recolha de móveis" : "orçamento recolha",
      isFurnitureService(service.slug) ? "tirar móveis velhos" : "serviço no mesmo dia",
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
  const title = buildTitle(service.name, city.name, service.slug);
  const description = buildDescription(
    service.name,
    city.name,
    city.regionLabel,
    service.slug,
  );
  const intro = getServiceIntro(service.name, city.name, city.regionLabel, service.slug);
  const includedItems = getIncludedItems(service.name, city.name, service.slug);
  const excludedItems = getExcludedItems(service.slug);
  const pricingCopy = getPricingCopy(service.name, city.name, service.slug);
  const faqs = getFaqs(
    service.name,
    city.name,
    city.regionLabel,
    service.slug,
    relatedCities,
  );

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

  const nearbyLinks = relatedCities.map((relatedCity) => ({
    href: `/${getCityServiceSlug(service.slug, relatedCity.slug)}`,
    label: `${service.name} em ${relatedCity.name}`,
  }));

  const supportLinks = isFurnitureService(service.slug)
    ? [
        { href: "/recolha-de-moveis", label: "Página principal de recolha de móveis" },
        { href: `/${getCityServiceSlug("recolha-monos", city.slug)}`, label: `Recolha de monos em ${city.name}` },
        { href: `/${getCityServiceSlug("esvaziamento-casas", city.slug)}`, label: `Esvaziamento de casas em ${city.name}` },
        { href: `/${getCityServiceSlug("recolha-entulho", city.slug)}`, label: `Recolha de entulho em ${city.name}` },
      ]
    : [
        { href: "/servicos", label: "Todos os serviços" },
        { href: "/simulador", label: "Pedir orçamento" },
        { href: "/contactos", label: "Falar connosco" },
        { href: `/${getCityServiceSlug("recolha-moveis", city.slug)}`, label: `Recolha de móveis em ${city.name}` },
      ];

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
                {isFurnitureService(service.slug)
                  ? `Recolha de Móveis em ${city.name}`
                  : `${service.name} em ${city.name}`}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{intro}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/simulador"
                  className="site-btn-primary min-w-[220px] px-6 py-3.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Pedir orçamento
                </Link>
                <Link
                  href={CONTACT_PATH}
                  className="site-btn-secondary min-w-[220px] border-slate-300 text-slate-900 hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4" />
                  Falar connosco
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] border border-cyan-100 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Cobertura local
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Resposta reforçada em {city.name}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Trabalhamos em {city.name} e zonas próximas com resposta rápida,
                orçamento claro e recolha cuidada. Retiramos os volumes validados,
                protegemos os acessos e deixamos o espaço pronto para a etapa
                seguinte, seja renovação, mudança, arrendamento ou simples libertação
                de área.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-950">Tempo médio</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">11 minutos</p>
                </div>
                <div className="rounded-[22px] border border-cyan-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-950">Área servida</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {city.name} e {relatedCities.map((item) => item.name).join(", ")}
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
              title: "Orçamento rápido",
              desc: `Triagem rápida para ${service.shortName} em ${city.name} com resposta prática e comercial.`,
            },
            {
              icon: Truck,
              title: "Execução completa",
              desc: "A equipa trata de carregar, transportar e fechar o serviço com clareza.",
            },
            {
              icon: ShieldCheck,
              title: "Processo seguro",
              desc: "Confirmamos volume, acessos, horários e encaminhamento antes da marcação.",
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              O que está incluído
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Serviço completo para recolha em {city.name}
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
              O que não entra
            </p>
            <h2 className="mt-3 text-3xl font-bold">Evita ruído no orçamento</h2>
            <div className="mt-6 space-y-3">
              {excludedItems.map((item) => (
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
              Referências úteis para {city.name}
            </h2>
            <div className="mt-5 space-y-3">
              {pricingCopy.map((item) => (
                <div key={item} className="rounded-[22px] bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-950">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Como funciona
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Da marcação à retirada final, sem complicações
            </h2>
            <div className="mt-6 space-y-5">
              {[
                "Envie fotos, morada e detalhes de acesso.",
                "Receba um orçamento rápido e confirme a melhor janela disponível.",
                "A equipa chega, protege o acesso, carrega e trata do transporte.",
                "O material segue para triagem, doação ou descarte responsável.",
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Porque a CLYON em {city.name}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Um serviço pensado para resolver de forma rápida e segura
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Se precisa de retirar volumes, libertar espaço e evitar o esforço de
              carregar, desmontar e transportar sozinho, esta é a solução mais
              simples. A nossa equipa organiza a recolha, trata do acesso e dá o
              encaminhamento adequado ao que sai do imóvel.
            </p>
            {isFurnitureService(service.slug) && (
              <div className="mt-5 rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-5">
                <div className="flex items-start gap-3">
                  <Recycle className="mt-1 h-5 w-5 text-cyan-700" />
                  <p className="text-sm leading-7 text-slate-700">
                    Se o cliente em {city.name} estiver a comparar com recolha
                    municipal, a vantagem da CLYON está na rapidez, desmontagem,
                    carregamento completo e resolução total dentro do imóvel.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Serviços relacionados
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Apoio adicional para pedidos maiores ou mistos
            </h2>
            <div className="mt-6 space-y-3">
              {[...supportLinks, ...nearbyLinks].slice(0, 6).map((item) => (
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
            Perguntas frequentes locais
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
          <div className="flex items-start gap-3">
            <Star className="mt-1 h-5 w-5 text-cyan-600" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                CTA local
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">
                Precisa de {service.shortName} em {city.name}?
              </h2>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
            Diga-nos o que pretende retirar, quantos volumes tem e como é o acesso ao
            imóvel. Com essa informação conseguimos responder mais depressa e marcar
            a recolha com maior precisão.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/simulador"
              className="site-btn-primary min-w-[220px] px-6 py-3.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simular agora
            </Link>
            <a
              href={`tel:${BUSINESS_PHONE}`}
              className="site-btn-secondary min-w-[220px] border-slate-300 text-slate-900 hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" />
              Ligar {BUSINESS_PHONE}
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
