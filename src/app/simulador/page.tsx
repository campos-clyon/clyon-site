import type { Metadata } from "next";

import SimuladorClient from "./SimuladorClient";

type CategoriaId = "entulho" | "moveis" | "monos" | "limpeza" | "mudancas" | "camiao";

const categoriaIds = new Set<CategoriaId>(["entulho", "moveis", "monos", "limpeza", "mudancas", "camiao"]);

export const metadata: Metadata = {
  title: "Simulador de Preços - Calcule o Custo do Seu Contentor | CLYON",
  description:
    "Calcule online o preço de recolha de entulho, móveis ou limpeza pós-obra em Lisboa e Setúbal. Orçamento instantâneo, preços desde 120EUR!",
  alternates: {
    canonical: "https://clyon.pt/simulador",
  },
  openGraph: {
    title: "Simulador de Preços - Calcule o Custo do Seu Contentor | CLYON",
    description:
      "Calcule o preço da sua recolha em Lisboa e Setúbal. Orçamento instantâneo online!",
    url: "https://clyon.pt/simulador",
  },
};

export const revalidate = 86400;

type SimuladorPageProps = {
  searchParams?: Promise<{ categoria?: string }>;
};

export default async function SimuladorPage({ searchParams }: SimuladorPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoriaParam = resolvedSearchParams?.categoria;
  const initialCategoriaId: CategoriaId | null =
    categoriaParam && categoriaIds.has(categoriaParam as CategoriaId)
      ? (categoriaParam as CategoriaId)
      : null;

  return <SimuladorClient initialCategoriaId={initialCategoriaId} />;
}
