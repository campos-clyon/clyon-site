import type { Metadata } from "next";

import SimuladorClient from "./SimuladorClient";

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

export default function SimuladorPage() {
  return <SimuladorClient />;
}
