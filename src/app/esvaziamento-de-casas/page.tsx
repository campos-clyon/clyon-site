import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, Package, Phone, Sparkles, Trash2, Truck, Users } from "lucide-react";
import CTABlock from "@/components/CTABlock";
import Breadcrumb from "@/components/Breadcrumb";

const SITE_URL = "https://clyon.pt";

export const metadata: Metadata = {
  title: "Esvaziamento de Casas e Apartamentos | Lisboa, Amadora e Setúbal",
  description:
    "Serviço de esvaziamento de casas, apartamentos, garagens e arrecadações. Remoção de móveis, monos, eletrodomésticos e limpeza associada. Orçamento rápido com a CLYON.",
  alternates: { canonical: `${SITE_URL}/esvaziamento-de-casas` },
  openGraph: {
    title: "Esvaziamento de Casas e Apartamentos | Lisboa, Amadora e Setúbal",
    description:
      "Serviço completo de esvaziamento de casas com remoção de móveis, monos e limpeza. Orçamento rápido.",
    url: `${SITE_URL}/esvaziamento-de-casas`,
  },
};

const faqs = [
  {
    question: "O que está incluído no esvaziamento de casa?",
    answer: "Incluímos a remoção de móveis, eletrodomésticos, monos, objetos volumosos e recheios completos. Fazemos carregamento, transporte e encaminhamento responsável. A limpeza final pode ser adicionada ao serviço.",
  },
  {
    question: "Quanto custa esvaziar uma casa?",
    answer: "O valor depende do volume, acessos, andar, elevador e necessidade de limpeza. Para apartamento T1/T2, o valor costuma começar nos 300-500EUR. Envie fotos para orçamento rápido e personalizado.",
  },
  {
    question: "Fazem esvaziamento de casas de herança?",
    answer: "Sim, é um dos pedidos mais comuns. Tratamos do esvaziamento completo, incluindo remoção de móveis, objetos pessoais, eletrodomésticos e limpeza associada quando necessário.",
  },
  {
    question: "Retiram os móveis de dentro da casa?",
    answer: "Sim, a nossa equipa entra no imóvel, desmonta o necessário, carrega tudo e transporta. Não precisa de colocar nada no exterior.",
  },
  {
    question: "Também fazem limpeza após o esvaziamento?",
    answer: "Sim, oferecemos limpeza associada ao esvaziamento. Pode ser limpeza básica (varrer, remover restos) ou limpeza mais completa dependendo do estado do imóvel.",
  },
  {
    question: "Quanto tempo demora um esvaziamento?",
    answer: "Depende do volume e acessos. Um apartamento T2 costuma demorar meio dia. Casas maiores ou com muito recheio podem precisar de um dia completo.",
  },
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Esvaziamento de Casas",
  description: "Serviço de esvaziamento de casas, apartamentos, garagens e arrecadações em Lisboa, Margem Sul e Setúbal.",
  provider: {
    "@type": "LocalBusiness",
    name: "CLYON",
    telephone: "+351910919588",
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lisboa",
      addressRegion: "Lisboa",
      addressCountry: "PT",
    },
    areaServed: ["Lisboa", "Amadora", "Almada", "Setúbal", "Sintra", "Oeiras", "Cascais"],
  },
  areaServed: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 38.7223, longitude: -9.1393 },
    geoRadius: "50000",
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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Esvaziamento de Casas", item: `${SITE_URL}/esvaziamento-de-casas` },
  ],
};

const whatWeRemove = [
  "Móveis de todos os tipos (sofás, camas, armários, mesas, cadeiras)",
  "Eletrodomésticos (frigoríficos, máquinas de lavar, fogões, micro-ondas)",
  "Monos e objetos volumosos (colchões, carpetes, espelhos, quadros)",
  "Recheios completos de apartamentos e moradias",
  "Objetos de garagem, arrecadação e cave",
  "Restos de mudança e objetos acumulados",
];

const forWhom = [
  { icon: Home, title: "Heranças", desc: "Esvaziamento de imóveis herdados com remoção de recheio completo." },
  { icon: Users, title: "Venda de imóvel", desc: "Preparar casa ou apartamento para venda, visitas ou escritura." },
  { icon: Package, title: "Fim de arrendamento", desc: "Libertar o imóvel para devolução ao senhorio ou nova ocupação." },
  { icon: Sparkles, title: "Remodelação", desc: "Esvaziar divisões ou imóvel completo antes de obras." },
  { icon: Trash2, title: "Casas acumuladas", desc: "Remoção de objetos e móveis em imóveis com excesso de coisas." },
  { icon: Truck, title: "Mudança incompleta", desc: "Retirar o que ficou para trás após uma mudança." },
];

const zones = [
  { name: "Lisboa", cities: ["Benfica", "Lumiar", "Alvalade", "Areeiro", "Olivais", "Parque das Nações"] },
  { name: "Amadora", cities: ["Reboleira", "Damaia", "Alfragide", "Venteira", "Mina de Água"] },
  { name: "Margem Sul", cities: ["Almada", "Seixal", "Barreiro", "Montijo", "Moita"] },
  { name: "Setúbal", cities: ["Setúbal", "Palmela", "Sesimbra"] },
  { name: "Linha de Cascais", cities: ["Cascais", "Oeiras", "Estoril", "Carcavelos"] },
  { name: "Sintra", cities: ["Sintra", "Queluz", "Cacém", "Agualva"] },
];

export default function EsvaziamentoDeCasasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="bg-slate-50">
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-slate-50 pb-12 pt-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: "Início", href: "/" },
                { label: "Esvaziamento de Casas" },
              ]}
            />

            <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Serviço completo
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
                  Esvaziamento de casas e apartamentos em Lisboa, Amadora e Setúbal
                </h1>
                <p className="mt-5 text-lg leading-8 text-slate-600">
                  A CLYON faz esvaziamento completo de casas, apartamentos, garagens e arrecadações. 
                  Retiramos móveis, eletrodomésticos, monos e recheios com carregamento, transporte e 
                  encaminhamento responsável. Limpeza associada disponível.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/simulador"
                    className="inline-flex h-12 items-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Simular orçamento
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="https://wa.me/351910919588?text=Olá! Preciso de esvaziamento de casa. Podem dar-me um orçamento?"
                    className="inline-flex h-12 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-6 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="tel:+351910919588"
                    className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Phone className="h-4 w-4" />
                    Ligar agora
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                  Valores de referência
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    { type: "Apartamento T0/T1", price: "300€ – 500€" },
                    { type: "Apartamento T2/T3", price: "500€ – 800€" },
                    { type: "Moradia ou T4+", price: "800€ – 1500€" },
                    { type: "Garagem ou arrecadação", price: "150€ – 400€" },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-700">{item.type}</span>
                      <span className="font-semibold text-emerald-600">{item.price}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Valores orientativos. O preço final depende do volume, acessos, andar e limpeza.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Para quem */}
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Para quem é este serviço
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Quando pedir esvaziamento de casa
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {forWhom.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                  <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O que retiramos */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Remoção completa
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              O que retiramos no esvaziamento
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {whatWeRemove.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Processo simples
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Como funciona o esvaziamento
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {[
                { step: "01", title: "Envie o pedido", desc: "Fotos do imóvel, localização e acesso. WhatsApp ou formulário." },
                { step: "02", title: "Receba orçamento", desc: "Resposta rápida com valor, data disponível e condições." },
                { step: "03", title: "Execução no local", desc: "A equipa chega, carrega tudo e transporta para destino." },
                { step: "04", title: "Limpeza (opcional)", desc: "Limpeza básica ou completa após a remoção." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-slate-200 bg-white p-5">
                  <span className="text-2xl font-bold text-emerald-600">{item.step}</span>
                  <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferença entre recolha e esvaziamento */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Qual a diferença
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Recolha de móveis vs esvaziamento completo
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/50 p-6">
                <h3 className="font-semibold text-slate-900">Recolha de móveis</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Ideal quando precisa de retirar alguns móveis específicos: um sofá, uma cama, um armário. 
                  A equipa retira os itens indicados, carrega e transporta.
                </p>
                <Link href="/recolha-de-moveis" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:underline">
                  Ver serviço de recolha de móveis <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6">
                <h3 className="font-semibold text-slate-900">Esvaziamento completo</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Indicado quando precisa de libertar o imóvel por completo: todos os móveis, eletrodomésticos, 
                  monos e objetos. Inclui remoção total e pode incluir limpeza.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                  Está nesta página
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Zonas atendidas */}
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Cobertura
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Zonas onde fazemos esvaziamento
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <div key={zone.name} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{zone.cities.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Links internos */}
        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Serviços relacionados
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Outros serviços da CLYON
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/esvaziamento-de-casas-amadora", label: "Esvaziamento na Amadora", desc: "Serviço local" },
                { href: "/recolha-de-moveis", label: "Recolha de móveis", desc: "Sofás, camas, armários" },
                { href: "/recolha-de-monos-amadora", label: "Recolha de monos", desc: "Volumosos e sucata" },
                { href: "/retirar-moveis-velhos", label: "Retirar móveis velhos", desc: "Desmontagem incluída" },
                { href: "/recolha-moveis-lisboa", label: "Móveis em Lisboa", desc: "Cobertura total" },
                { href: "/recolha-moveis-almada", label: "Móveis em Almada", desc: "Margem Sul" },
                { href: "/simulador", label: "Simular orçamento", desc: "Cálculo online" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <span className="font-semibold text-slate-900 group-hover:text-emerald-700">{link.label}</span>
                  <p className="mt-1 text-sm text-slate-500">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Dúvidas frequentes
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Perguntas sobre esvaziamento de casas
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-16 pt-8">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <CTABlock
              variant="centered"
              title="Precisa de esvaziar uma casa ou apartamento?"
              description="Peça um orçamento grátis. Enviamos equipa para carregar, transportar e limpar."
              whatsappMessage="Olá! Preciso de esvaziamento de casa. Podem dar-me um orçamento?"
            />
          </div>
        </section>
      </main>
    </>
  );
}
