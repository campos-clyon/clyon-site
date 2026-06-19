import type { OrderData, EstimateResult, DifficultyLevel, LocationZone } from "./types";

export const TAX_RATE = 0.23;

// Bases por zona (sem IVA)
const ZONE_BASE: Record<Exclude<LocationZone, "D">, number> = {
  A: 220,
  B: 250,
  C: 270,
};

function getZoneBase(zone: LocationZone | undefined): number | null {
  if (!zone || zone === "D") return null;
  return ZONE_BASE[zone];
}

// Determina zona com base na cidade/morada
export function detectZone(city: string | undefined): LocationZone {
  if (!city) return "B";
  const c = city.toLowerCase();
  if (
    c.includes("amora") ||
    c.includes("fernão ferro") ||
    c.includes("fernao ferro") ||
    c.includes("seixal") ||
    c.includes("corroios") ||
    c.includes("laranjeiro") ||
    c.includes("fogueteiro")
  ) return "A";
  if (
    c.includes("loures") ||
    c.includes("vila franca") ||
    c.includes("alverca") ||
    c.includes("cascais") ||
    c.includes("sintra") ||
    c.includes("setúbal") ||
    c.includes("setubal") ||
    c.includes("montijo") ||
    c.includes("barreiro") ||
    c.includes("almada")
  ) return "C";
  if (
    c.includes("lisboa") ||
    c.includes("oeiras") ||
    c.includes("amadora") ||
    c.includes("odivelas")
  ) return "B";
  return "D";
}

// Calcula dificuldade 1-5
function calcDifficulty(order: OrderData): DifficultyLevel {
  let score = 0;

  // Elevador
  if (order.hasElevator === "no") score += 2;
  else if (order.hasElevator === "small") score += 1;

  // Andar
  const floor = order.floor ?? "";
  if (floor.includes("4") || floor.includes("5") || floor.includes("superior")) score += 2;
  else if (floor.includes("3")) score += 1;
  else if (floor.includes("2")) score += 1;

  // Estacionamento
  if (order.parkingDistance === "difficult") score += 2;
  else if (order.parkingDistance === "over_30m") score += 1;

  // Desmontagem
  if (order.needsDismantling === "complex") score += 2;
  else if (order.needsDismantling === "medium") score += 1;

  // Itens pesados
  const heavy = order.heavyItems ?? [];
  if (heavy.length >= 3) score += 2;
  else if (heavy.length >= 1) score += 1;

  // Urgência
  if (order.urgency === "today") score += 1;

  if (score <= 1) return 1;
  if (score <= 3) return 2;
  if (score <= 5) return 3;
  if (score <= 7) return 4;
  return 5;
}

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: "Fácil",
  2: "Normal",
  3: "Médio",
  4: "Difícil",
  5: "Muito difícil",
};

function needsOnsiteVisit(order: OrderData): boolean {
  const svc = order.serviceType;
  if (
    svc === "esvaziamento_casa" ||
    svc === "esvaziamento_apartamento"
  ) return true;
  if ((order.heavyItems ?? []).some((h) => h.includes("entulho"))) return true;
  if (order.needsDismantling === "complex") return true;
  if (order.locationZone === "D") return true;
  return false;
}

export function calculateLocalEstimate(order: OrderData): EstimateResult {
  const missingFields: string[] = [];

  if (!order.serviceType) missingFields.push("Tipo de serviço");
  if (!order.description && (!order.files || order.files.length === 0))
    missingFields.push("Descrição ou fotos");
  if (!order.city && !order.address?.formattedAddress) missingFields.push("Localidade ou morada");
  if (!order.floor) missingFields.push("Andar");
  if (!order.hasElevator) missingFields.push("Elevador");
  if (!order.parkingDistance) missingFields.push("Estacionamento");
  if (!order.receiver?.name || !order.receiver?.phone) missingFields.push("Nome e contacto");

  if (missingFields.length > 0) {
    return {
      status: "needs_more_info",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: 2,
      summary: "Faltam dados para calcular a estimativa.",
      assumptions: [],
      missingFields,
      customerMessage:
        "Para calcular a estimativa precisamos de mais alguns detalhes: " +
        missingFields.join(", ") +
        ".",
      internalNotes: ["Dados insuficientes para estimar."],
    };
  }

  const zone = order.locationZone ?? detectZone(order.city);
  const difficulty = calcDifficulty(order);

  if (needsOnsiteVisit(order) || difficulty === 5) {
    return {
      status: "onsite_required",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: difficulty,
      summary: DIFFICULTY_LABELS[difficulty],
      assumptions: [],
      missingFields: [],
      customerMessage:
        "Este pedido necessita de validação presencial ou análise por vídeo, devido ao volume, acesso ou complexidade do serviço. A nossa equipa irá contactá-lo para combinar uma visita gratuita.",
      internalNotes: ["Recomendada visita presencial."],
    };
  }

  if (zone === "D") {
    return {
      status: "onsite_required",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: difficulty,
      summary: "Fora da zona padrão",
      assumptions: [],
      missingFields: [],
      customerMessage:
        "A morada indicada está fora da nossa área de cobertura padrão. Iremos contactá-lo para apresentar um orçamento personalizado.",
      internalNotes: ["Zona D — orçamento personalizado."],
    };
  }

  let base = getZoneBase(zone) ?? 250;
  const assumptions: string[] = [];
  const internalNotes: string[] = [];

  internalNotes.push(`Zona ${zone}, base ${base}€`);
  assumptions.push(
    `Localidade em Zona ${zone} (${zone === "A" ? "Amora / Fernão Ferro" : zone === "B" ? "Lisboa" : "Lisboa difícil / região mais distante"})`
  );

  // Ajuste por dificuldade
  if (difficulty === 2) {
    base += 30;
    assumptions.push("Acesso e volume razoáveis");
  } else if (difficulty === 3) {
    base += 100;
    assumptions.push("Acesso moderado — escadas, algum peso");
  } else if (difficulty === 4) {
    base += 200;
    assumptions.push("Acesso difícil — sem elevador, peso ou distância");
  }

  // Extras de urgência
  if (order.urgency === "today") {
    base += 45;
    assumptions.push("Serviço urgente (mesmo dia)");
  } else if (order.urgency === "tomorrow") {
    base += 20;
    assumptions.push("Serviço urgente (amanhã)");
  }

  // Extras de desmontagem
  if (order.needsDismantling === "simple") {
    base += 40;
    assumptions.push("Desmontagem simples incluída");
  } else if (order.needsDismantling === "medium") {
    base += 90;
    assumptions.push("Desmontagem média incluída");
  }

  // Dar intervalo (±10%)
  const low = Math.floor(base * 0.9 / 10) * 10;
  const high = Math.ceil(base * 1.1 / 10) * 10;

  const midPrice = (low + high) / 2;
  const vat = Math.round(midPrice * TAX_RATE);
  const total = midPrice + vat;

  const diffLabel = DIFFICULTY_LABELS[difficulty];

  return {
    status: "estimated",
    estimatedPriceWithoutVat: midPrice,
    vatAmount: vat,
    estimatedPriceWithVat: total,
    difficultyLevel: difficulty,
    summary: diffLabel,
    assumptions,
    missingFields: [],
    customerMessage:
      `Com base nas informações enviadas, a estimativa para este pedido é de ${low}€ a ${high}€ + IVA. ` +
      `O valor considera ${assumptions.join(", ")}. ` +
      `Caso existam volumes adicionais, peso excessivo ou acesso diferente do informado, a equipa confirma antes de iniciar.`,
    internalNotes,
  };
}
