import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Clock3, MapPin, MessageCircle, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contactos para Recolha, Limpeza e Mudanças | CLYON",
  description:
    "Contacte a CLYON para recolha de entulho, móveis, monos, limpeza pós-obra, mudanças e orçamento rápido em Lisboa, Margem Sul e Setúbal.",
  alternates: { canonical: "https://clyon.pt/contactos" },
};

const services = [
  "Recolha de entulho",
  "Recolha de móveis",
  "Recolha de monos",
  "Limpeza pós-obra",
  "Mudanças",
  "Camião com motorista",
];

export const revalidate = 86400;

export default function ContactosPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_24%),linear-gradient(90deg,rgba(236,254,255,0.95)_0%,rgba(255,255,255,1)_52%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-22 sm:px-6 lg:px-8 lg:pb-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.96fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                Contactos
              </div>
              <h1 className="mt-5 max-w-[12ch] text-[2.55rem] font-bold leading-[1.02] tracking-tight text-slate-950 sm:text-[4.1rem]">
                Fale connosco de forma simples e rápida.
              </h1>
            </div>
            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.2)]">
              <p className="text-base leading-8 text-slate-600">
                Se já sabe o serviço ou só precisa de orientação, respondemos com
                rapidez e ajudamos a perceber o melhor caminho para avançar.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <h2 className="text-2xl font-bold text-slate-950">Contacto direto</h2>
              <div className="mt-7 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">
                      Telefone
                    </p>
                    <a href="tel:+351931632622" className="mt-2 block text-xl font-bold text-slate-950">
                      +351 931 632 622
                    </a>
                    <p className="mt-1 text-sm leading-7 text-slate-600">
                      Ideal para pedidos rápidos, validações e marcações.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">
                      Morada
                    </p>
                    <p className="mt-2 text-sm leading-8 text-slate-600">
                      Rua dos Jasmins 3
                      <br />
                      Belverde, Amora
                      <br />
                      2845-513 Portugal
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">
                      Horário
                    </p>
                    <p className="mt-2 text-sm leading-8 text-slate-600">
                      Segunda a sábado: 08:00 - 20:00
                      <br />
                      Domingo: atendimento por mensagem
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="tel:+351931632622"
                className="mt-8 inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Ligar agora
              </a>
            </div>

            <div className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.18)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">
                    Serviços
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-950">
                    O que podemos tratar consigo
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <div
                    key={service}
                    className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    {service}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[28px] bg-[linear-gradient(135deg,#062737_0%,#083344_100%)] p-6 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Precisa de orçamento?
                </p>
                <h3 className="mt-3 text-3xl font-bold leading-tight">
                  Comece pelo simulador e confirme tudo connosco depois.
                </h3>
                <p className="mt-3 text-sm leading-8 text-slate-300">
                  É a forma mais rápida de organizar o pedido e receber uma resposta
                  clara.
                </p>
                <Link
                  href="/simulador"
                  className="mt-5 inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
                >
                  Abrir simulador
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
