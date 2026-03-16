import type { Metadata } from "next";

import SimuladorClient from "./SimuladorClient";

type CategoriaId = "entulho" | "moveis" | "monos" | "limpeza" | "mudancas" | "camiao";

const categoriaIds = new Set<CategoriaId>(["entulho", "moveis", "monos", "limpeza", "mudancas", "camiao"]);

export const metadata: Metadata = {
  title: "Simulador de Orçamento para Recolha e Mudanças | CLYON",
  description:
    "Simule o seu pedido de recolha, limpeza ou mudança com a CLYON. Introduza a morada, calcule a distância e receba uma estimativa inicial clara.",
  alternates: {
    canonical: "https://clyon.pt/simulador",
  },
  openGraph: {
    title: "Simulador de Orçamento para Recolha e Mudanças | CLYON",
    description:
      "Escolha o serviço, use sugestões automáticas de moradas e calcule a distância antes de gerar a estimativa.",
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
