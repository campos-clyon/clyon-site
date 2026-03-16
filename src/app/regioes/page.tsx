import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { REGIONS, SERVICES, SITE_URL, getRegionCities } from "@/lib/seo-data";

const simulatorCategoryMap: Record<string, string> = {
  "recolha-entulho": "entulho",
  "recolha-moveis": "moveis",
  "recolha-monos": "monos",
  "esvaziamento-casas": "moveis",
  "limpeza-pos-obra": "limpeza",
  mudancas: "mudancas",
  "camiao-com-motorista": "camiao",
};

export const metadata: Metadata = {
  title: "RegiÃƒÂµes de AtuaÃƒÂ§ÃƒÂ£o em Lisboa, Margem Sul e SetÃƒÂºbal | CLYON",
  description:
    "ConheÃƒÂ§a as regiÃƒÂµes de atuaÃƒÂ§ÃƒÂ£o da CLYON e encontre pÃƒÂ¡ginas locais fortes para recolha de entulho, mÃƒÂ³veis, monos, mudanÃƒÂ§as e limpeza pÃƒÂ³s-obra.",
  alternates: {
    canonical: `${SITE_URL}/regioes`,
  },
};

export const revalidate = 86400;

export default function RegioesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-100 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.20),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-18">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700 shadow-sm">
              <MapPin className="h-4 w-4" />
              Cobertura regional
            </div>
            <h1 className="mt-5 max-w-[14ch] text-4xl font-bold leading-[1.14] tracking-tight text-slate-950 md:text-6xl md:leading-[1.08]">
              RegiÃƒÂµes e cidades onde a CLYON jÃƒÂ¡ atua.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Esta pÃƒÂ¡gina organiza a presenÃƒÂ§a da CLYON em Lisboa, Margem Sul e SetÃƒÂºbal, com hubs por regiÃƒÂ£o e pÃƒÂ¡ginas
              locais preparadas para captar pesquisas por serviÃƒÂ§o e cidade.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {REGIONS.map((region) => {
            const cities = getRegionCities(region.slug);

            return (
              <article
                key={region.slug}
                className="rounded-[30px] border border-cyan-100 bg-white p-7 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.14)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  {region.shortLabel}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">{region.name}</h2>
                <p className="mt-4 text-base leading-8 text-slate-600">{region.intro}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[22px] border border-cyan-100 bg-cyan-50/80 p-4">
                    <p className="text-sm font-semibold text-slate-950">Localidades mapeadas</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {cities.length} zonas prioritÃƒÂ¡rias nesta regiÃƒÂ£o.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-cyan-100 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-950">Exemplos de cidades</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {cities.slice(0, 4).map((city) => city.name).join(", ")}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/regioes/${region.slug}`}
                  className="mt-6 inline-flex items-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(6,182,212,0.75)] transition hover:-translate-y-0.5 hover:bg-cyan-400"
                >
                  <span className="text-white">Ver regiÃƒÂ£o</span>
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-[30px] border border-cyan-100 bg-slate-950 p-7 text-white shadow-[0_24px_60px_-34px_rgba(2,6,23,0.45)]">
                  <span className="text-white">Ver regi?o</span>
          <h2 className="mt-3 text-3xl font-bold">Base local preparada para captar intenÃƒÂ§ÃƒÂ£o comercial</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((service) => (
              <Link
                key={service.slug}
                href={`/simulador?categoria=${simulatorCategoryMap[service.slug] ?? "moveis"}`}
                className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-white"
              >
                {service.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
