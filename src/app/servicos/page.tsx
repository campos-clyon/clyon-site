import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Home,
  Sparkles,
  Trash2,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Serviços de Recolha, Limpeza e Mudanças | CLYON",
  description:
    "Conheça os serviços da CLYON: recolha de entulho, recolha de móveis, recolha de monos, limpeza pós-obra, mudanças e camião com motorista em Lisboa, Margem Sul e Setúbal.",
  alternates: { canonical: "https://clyon.pt/servicos" },
  openGraph: {
    title: "Serviços de Recolha, Limpeza e Mudanças | CLYON",
    description:
      "Soluções rápidas e profissionais para recolha, limpeza e mudanças em Lisboa, Margem Sul e Setúbal.",
    url: "https://clyon.pt/servicos",
  },
};

const services = [
  {
    title: "Recolha de Entulho",
    description:
      "Remoção organizada para obras, remodelações e limpezas pesadas com resposta rápida.",
    icon: Trash2,
  },
  {
    title: "Recolha de Móveis",
    description:
      "Retiramos móveis antigos, recheios e volumes grandes com transporte profissional.",
    icon: Home,
  },
  {
    title: "Recolha de Monos",
    description:
      "Recolha de objetos volumosos, sucata e resíduos diversos com destino responsável.",
    icon: Wrench,
  },
  {
    title: "Limpeza Pós-Obra",
    description:
      "Limpeza final para deixar o espaço pronto a usar com bom acabamento e rapidez.",
    icon: Zap,
  },
  {
    title: "Mudanças",
    description:
      "Apoio a mudanças residenciais e comerciais com equipas experientes e processo claro.",
    icon: Truck,
  },
  {
    title: "Camião com Motorista",
    description:
      "Transporte profissional para cargas, despejos e apoio logístico pontual.",
    icon: Truck,
  },
];

export const revalidate = 86400;

export default function ServicosPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(90deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,1)_52%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-22 sm:px-6 lg:px-8 lg:pb-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                Serviços
              </div>
              <h1 className="mt-5 max-w-[12ch] text-[2.65rem] font-bold leading-[1.02] tracking-tight text-slate-950 sm:text-[4.2rem]">
                Serviços fortes para recolha, limpeza e mudanças.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                A CLYON organiza o pedido, responde rapidamente e executa com clareza
                em Lisboa, Margem Sul e Setúbal.
              </p>
            </div>
            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.2)]">
              <p className="text-base leading-8 text-slate-600">
                Aqui encontra os serviços principais da marca, com copy clara, foco
                local e ligação direta ao simulador e à página de contactos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="overflow-hidden rounded-[30px] border border-cyan-100 bg-white shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]"
              >
                <div className="flex h-36 items-center justify-center bg-cyan-50/90">
                  <service.icon className="h-12 w-12 text-cyan-600" />
                </div>
                <div className="p-7">
                  <h2 className="text-2xl font-bold text-slate-950">{service.title}</h2>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {service.description}
                  </p>
                  <Link
                    href="/simulador"
                    className="mt-5 inline-flex items-center text-base font-semibold text-cyan-700 transition hover:text-cyan-500"
                  >
                    Pedir orçamento
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white pb-16 lg:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[34px] bg-[linear-gradient(135deg,#062737_0%,#083344_100%)] px-8 py-10 text-white shadow-[0_26px_70px_-30px_rgba(2,6,23,0.45)] lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-cyan-200">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                    Pedido rápido
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                  Já sabe o serviço? Então pode avançar agora.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Use o simulador para organizar o pedido e fale connosco para fechar
                  os detalhes com clareza.
                </p>
              </div>
              <Link
                href="/simulador"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-7 py-4 text-base font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Abrir simulador
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
