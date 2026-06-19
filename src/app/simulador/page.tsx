import type { Metadata } from "next";
import SimuladorChatClient from "./SimuladorChatClient";

export const metadata: Metadata = {
  title: "Simulador de Preços — Calcule o Custo da Sua Recolha",
  description:
    "Chat interativo com a IA orçamentista da Clyon. Obtenha uma estimativa de preço para a sua recolha de móveis, entulho, monos ou limpeza em Lisboa e Setúbal.",
  alternates: {
    canonical: "https://clyon.pt/simulador",
  },
  openGraph: {
    title: "Simulador de Preços — Calcule o Custo da Sua Recolha",
    description:
      "Chat com IA para obter orçamento instantâneo da sua recolha em Lisboa e Setúbal!",
    url: "https://clyon.pt/simulador",
  },
};

export const revalidate = 86400;

export default function SimuladorPage() {
  return <SimuladorChatClient />;
}
