import { getSimulatorSettings } from "./db";
import type { SimulatorSettingKey, SimulatorSettingsMap } from "./simulator-settings";
import { createSimulatorSettingsMap } from "./simulator-settings";
import type { LaborCost } from "../app/simulador/types";

/**
 * Carrega todas as configurações de preços ativas do backoffice
 * E devolve um objeto formatado pronto para o Gemini
 */
export async function getActivePricingRulesForGemini() {
  try {
    const settings = await getSimulatorSettings();
    console.log("[pricing-helper] Configurações carregadas:", settings?.length ?? 0, "itens");
    
    if (!settings || settings.length === 0) {
      console.warn("[pricing-helper] Nenhuma configuração de preços encontrada, usando defaults");
      return getDefaultPricingRules();
    }

    // Converter array para mapa utilizável
    const settingsMap = createSimulatorSettingsMap(settings);
    
    // Formatar para Gemini (texto legível)
    const result = formatPricingRulesForGemini(settingsMap);
    console.log("[pricing-helper] ✓ Preçário formatado para Gemini (" + result.length + " chars)");
    return result;
  } catch (error) {
    console.error("[pricing-helper] ❌ Erro ao carregar configurações:", error);
    console.log("[pricing-helper] Usando defaults como fallback");
    return getDefaultPricingRules();
  }
}

/**
 * Devolve um mapa estruturado dos preços atuais para cálculos backend
 */
export async function getActivePricingMap(): Promise<SimulatorSettingsMap> {
  try {
    const settings = await getSimulatorSettings();
    console.log("[pricing-helper] getActivePricingMap: Carregados", settings?.length ?? 0, "itens");
    const map = createSimulatorSettingsMap(settings);
    console.log("[pricing-helper] ✓ Mapa de preços criado");
    return map;
  } catch (error) {
    console.error("[pricing-helper] ❌ Erro ao carregar mapa de preços:", error);
    const fallback = createSimulatorSettingsMap([]);
    console.log("[pricing-helper] Usando fallback com defaults");
    return fallback;
  }
}

/**
 * Formata as regras de preço em texto legível para o Gemini
 */
function formatPricingRulesForGemini(settingsMap: SimulatorSettingsMap): string {
  return `PREÇÁRIO ATUAL CLYON (Junho 2026):

ENTULHO:
- Saco já ensacado: ${settingsMap.entulho_saco_ensacado}€ por saco
- Saco no chão/por ensacar: ${settingsMap.entulho_saco_chao}€ por saco
- Distância: ${settingsMap.entulho_distancia_km}€ por km

MÓVEIS/MONOS:
- Item pequeno (<1m): ${settingsMap.moveis_item_pequeno}€
- Item médio (1-2m): ${settingsMap.moveis_item_medio}€
- Item grande (>2m): ${settingsMap.moveis_item_grande}€
- Distância móveis: ${settingsMap.moveis_distancia_km}€ por km
- Base por carga: ${settingsMap.moveis_carga_base}€

ACESSOS:
- Apartamento com elevador: ${settingsMap.apartamento_com_elevador_por_andar}€ por andar
- Apartamento sem elevador: ${settingsMap.apartamento_sem_elevador_por_andar}€ por andar
- Acesso difícil: +${settingsMap.acesso_dificil_extra}€

MUDANÇAS:
- Distância: ${settingsMap.mudancas_distancia_km}€ por km

OUTROS:
- Hora base: ${settingsMap.hora_base}€/hora
- Multiplicador entulho: ${settingsMap.entulho_multiplicador}x
- Multiplicador mudanças: ${settingsMap.mudancas_multiplicador}x

REGRA OBRIGATÓRIA PARA ENTULHO:
Usar APENAS os preços acima.
Fórmula: (quantidade de sacos × preço_saco) + (distância_km × ${settingsMap.entulho_distancia_km}) + acrescimos_acesso
Nunca inventar valores.
Se faltar quantidade de sacos, devolver status "needs_more_info".

MÃO DE OBRA (OBRIGATÓRIA em todos os serviços):
- Equipa fixa: 3 pessoas
- Valor hora por pessoa: 9€
- Mínimo: 1 hora
- Fórmula: horas_estimadas × 3 × 9€

Guia de horas:
- Trabalho simples (1 sofá, R/C, acesso fácil): 1h
- Trabalho médio (vários móveis, 1º-2º andar): 1.5h a 2h
- Trabalho complexo (mudança, muitos itens, sem elevador, acesso difícil): 3h ou mais
- Entulho até 30 sacos: 1h; 31-80 sacos: 1.5h; 81-150 sacos: 2.5h; >150 sacos: 3.5h

A mão de obra deve ser somada ANTES de calcular o IVA:
  total_sem_iva = itens + distância + acesso + mão_de_obra
  iva = total_sem_iva × 0.23
  total_com_iva = total_sem_iva + iva

Deves incluir no JSON os campos:
  "labor": { "estimatedHours": X, "peopleCount": 3, "hourlyRatePerPerson": 9, "laborCost": X }`;
}

/**
 * Devolve as regras padrão (fallback)
 */
function getDefaultPricingRules(): string {
  return `PREÇÁRIO CLYON (defaults):

ENTULHO:
- Saco já ensacado: 1.90€ por saco
- Saco no chão/por ensacar: 2.20€ por saco
- Distância: 2€ por km

MÓVEIS/MONOS:
- Item pequeno: 5€
- Item médio: 7€
- Item grande: 13€
- Distância móveis: 2.5€ por km

ACESSOS:
- Apartamento com elevador: 3€ por andar
- Apartamento sem elevador: 6€ por andar
- Acesso difícil: +30€

REGRA ENTULHO:
Usar APENAS os preços acima.
Fórmula: (quantidade de sacos × preço_saco) + (distância_km × 2) + acrescimos

MÃO DE OBRA (OBRIGATÓRIA):
- Equipa fixa: 3 pessoas | Valor hora: 9€ | Mínimo: 1h
- Fórmula: horas_estimadas × 3 × 9€
- Simples: 1h | Médio: 1.5-2h | Complexo: 3h+
- Somar ANTES do IVA. Incluir campo "labor" no JSON.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATIVA RÁPIDA LOCAL (sem Gemini)
// Devolve resultado em < 50ms a partir do preçário em memória.
// ─────────────────────────────────────────────────────────────────────────────

export interface FastEstimateInput {
  serviceType?: string;
  entulhoState?: string;
  entulhoQuantidade?: string;
  floor?: string;
  hasElevator?: string;
  parkingDistance?: string;
  needsDismantling?: string | boolean;
  distanceFromBase?: { distanceKm?: number };
  movingDistance?: { distanceKm?: number };
  originAccess?: { floor?: string; hasElevator?: string; parkingDistance?: string; difficultAccess?: boolean };
  destinationAccess?: { floor?: string; hasElevator?: string; parkingDistance?: string; difficultAccess?: boolean };
  /** Lista de itens pesados descritos pelo cliente (ex: "sofá 3 lugares", "frigorífico") */
  heavyItems?: string[];
  description?: string;
}

export interface FastEstimateResult {
  ok: boolean;
  source: "local_fast_estimate";
  status: "estimated" | "onsite_required" | "needs_more_info";
  estimatedPriceWithoutVat: number | null;
  vatAmount: number | null;
  estimatedPriceWithVat: number | null;
  labor?: LaborCost;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  summary: string;
  assumptions: string[];
  missingFields: string[];
  customerMessage: string;
  internalNotes: string[];
  analysisSource: "local_fast_estimate";
}

/**
 * Classifica um item descrito em texto como "pequeno", "medio" ou "grande".
 * Heurística baseada em palavras-chave comuns em pedidos CLYON.
 */
function classifyItem(description: string): "pequeno" | "medio" | "grande" {
  const d = description.toLowerCase();

  // Itens grandes (>2m): sofás, camas, roupeiros, frigoríficos, máquinas, etc.
  const large = [
    "sofá", "sofa", "roupeiro", "guarda-roupa", "guarda roupa", "frigorífico", "frigorifico",
    "máquina de lavar", "maquina de lavar", "cama dupla", "cama casal", "cama king",
    "cama queen", "armário", "armario", "secretária grande", "secretaria grande",
    "estante grande", "aparador", "vitrine", "piano", "camas", "sofas", "cama de casal",
    "estante", "escrivaninha grande", "tv grande", "televisão grande",
  ];
  // Itens médios (1-2m): cadeiras, mesas pequenas, caixas, gavetas, etc.
  const medium = [
    "cadeira", "mesa", "gaveta", "comoda", "cómoda", "criado", "prateleira",
    "caixote", "caixa grande", "microondas", "forno", "ar condicionado", "cadeiras",
    "secretária pequena", "secretaria pequena", "banqueta", "poltrona",
  ];

  if (large.some((kw) => d.includes(kw))) return "grande";
  if (medium.some((kw) => d.includes(kw))) return "medio";
  return "pequeno";
}

function floorNumber(floor?: string): number {
  if (!floor || floor === "rés-do-chão") return 0;
  if (floor === "4º+") return 4;
  return parseInt(floor.replace(/[^\d]/g, ""), 10) || 0;
}

function accessExtra(
  floor?: string,
  hasElevator?: string,
  difficultAccess?: boolean,
  pricing?: SimulatorSettingsMap
): { cost: number; notes: string[] } {
  const notes: string[] = [];
  let cost = 0;
  const n = floorNumber(floor);
  const elevPricePerFloor = pricing?.apartamento_com_elevador_por_andar ?? 3;
  const noElevPricePerFloor = pricing?.apartamento_sem_elevador_por_andar ?? 6;
  const difficultExtra = pricing?.acesso_dificil_extra ?? 30;

  if (n > 0) {
    const hasElev = hasElevator === "yes" || hasElevator === "small";
    const perFloor = hasElev ? elevPricePerFloor : noElevPricePerFloor;
    cost += n * perFloor;
    notes.push(`${n} andares ${hasElev ? "com" : "sem"} elevador: +${(n * perFloor).toFixed(2)}€`);
  }
  if (difficultAccess) {
    cost += difficultExtra;
    notes.push(`Acesso difícil: +${difficultExtra}€`);
  }
  return { cost, notes };
}

// ─── Mão de obra ─────────────────────────────────────────────────────────────
// Regras fixas CLYON:
//   equipa = 3 pessoas
//   valor hora por pessoa = 9€
//   mínimo = 1 hora
// ─────────────────────────────────────────────────────────────────────────────

const LABOR_PEOPLE = 3 as const;
const LABOR_HOURLY_RATE = 9 as const;
const LABOR_MIN_HOURS = 1;

/**
 * Estima horas de trabalho com base no tipo de serviço e condições de acesso.
 * Nunca devolve menos de LABOR_MIN_HOURS (1h).
 */
export function estimateLaborHours(input: FastEstimateInput): number {
  let hours = LABOR_MIN_HOURS;

  const svc = input.serviceType;

  if (svc === "mudanca") {
    // Mudança: base 2h + acesso origem/destino
    hours = 2;
    const origFloor = floorNumber(input.originAccess?.floor);
    const destFloor = floorNumber(input.destinationAccess?.floor);
    const origNoElev = input.originAccess?.hasElevator === "no";
    const destNoElev = input.destinationAccess?.hasElevator === "no";
    if (origFloor >= 3 && origNoElev) hours += 1;
    if (destFloor >= 3 && destNoElev) hours += 1;
    if (input.originAccess?.difficultAccess || input.destinationAccess?.difficultAccess) hours += 0.5;
    const distKm = input.movingDistance?.distanceKm ?? 0;
    if (distKm > 30) hours += 0.5;

  } else if (svc === "recolha_entulho") {
    // Entulho: baseado na quantidade de sacos
    const qtd = parseInt((input.entulhoQuantidade ?? "").replace(/[^\d]/g, ""), 10) || 0;
    if (qtd <= 30) hours = 1;
    else if (qtd <= 80) hours = 1.5;
    else if (qtd <= 150) hours = 2.5;
    else hours = 3.5;
    // Entulho no chão — precisa ensacar (+0.5h)
    if (input.entulhoState === "chao" || input.entulhoState === "misto") hours += 0.5;

  } else {
    // Recolha de móveis/monos/outro
    const floor = floorNumber(input.floor);
    const noElev = input.hasElevator === "no";
    const itemCount = input.heavyItems?.length ?? 0;

    // Base: 1h para 1-2 itens, +0.5h por cada 2 itens adicionais
    if (itemCount <= 2) {
      hours = 1;
    } else if (itemCount <= 4) {
      hours = 1.5;
    } else {
      hours = 2;
    }

    // Acesso por andar
    if (floor >= 3) hours += 0.5;
    if (noElev && floor >= 3) hours += 0.5;
    if (input.parkingDistance === "difficult") hours += 0.5;

    // Desmontagem
    if (input.needsDismantling === "medium") hours += 0.5;
    else if (input.needsDismantling === "complex" || input.needsDismantling === "true" || input.needsDismantling === true) hours += 1;
  }

  // Garantir mínimo de 1h
  return Math.max(LABOR_MIN_HOURS, Math.round(hours * 2) / 2); // arredondar a 0.5h
}

/**
 * Calcula o custo de mão de obra com as regras fixas CLYON.
 * equipa = 3 pessoas, 9€/hora/pessoa, mínimo 1 hora.
 */
export function calculateLaborCost(hours: number): LaborCost {
  const clampedHours = Math.max(LABOR_MIN_HOURS, hours);
  return {
    estimatedHours: clampedHours,
    peopleCount: LABOR_PEOPLE,
    hourlyRatePerPerson: LABOR_HOURLY_RATE,
    laborCost: Math.round(clampedHours * LABOR_PEOPLE * LABOR_HOURLY_RATE * 100) / 100,
  };
}

export async function calculateFastEstimate(input: FastEstimateInput): Promise<FastEstimateResult> {
  const pricing = await getActivePricingMap();

  const missing: string[] = [];
  const assumptions: string[] = [];
  const notes: string[] = ["Estimativa rápida local (sem Gemini)"];

  let basePrice = 0;

  // ── Entulho ─────────────────────────────────────────────────────────────────
  if (input.serviceType === "recolha_entulho") {
    const quantStr = input.entulhoQuantidade ?? "";
    const qtd = parseInt(quantStr.replace(/[^\d]/g, ""), 10);
    if (!qtd || isNaN(qtd)) {
      missing.push("quantidade de sacos de entulho");
    } else {
      const state = input.entulhoState;
      const priceSaco =
        state === "ensacado"
          ? (pricing.entulho_saco_ensacado ?? 1.9)
          : state === "chao"
          ? (pricing.entulho_saco_chao ?? 2.2)
          : state === "misto"
          ? ((pricing.entulho_saco_ensacado ?? 1.9) + (pricing.entulho_saco_chao ?? 2.2)) / 2
          : (pricing.entulho_saco_ensacado ?? 1.9);

      basePrice += qtd * priceSaco;
      assumptions.push(`${qtd} sacos × ${priceSaco.toFixed(2)}€/saco`);

      const distKm = input.distanceFromBase?.distanceKm ?? 0;
      if (distKm > 0) {
        const distCost = distKm * (pricing.entulho_distancia_km ?? 2);
        basePrice += distCost;
        assumptions.push(`${distKm} km × ${pricing.entulho_distancia_km ?? 2}€/km`);
      }

      const acc = accessExtra(input.floor, input.hasElevator, !!input.needsDismantling, pricing);
      basePrice += acc.cost;
      assumptions.push(...acc.notes);
    }

  // ── Mudança ──────────────────────────────────────────────────────────────────
  } else if (input.serviceType === "mudanca") {
    const distKm = input.movingDistance?.distanceKm ?? 0;
    if (distKm > 0) {
      const distCost = distKm * (pricing.mudancas_distancia_km ?? 2);
      basePrice += distCost;
      assumptions.push(`Percurso ${distKm} km × ${pricing.mudancas_distancia_km ?? 2}€/km`);
    } else {
      assumptions.push("Percurso não calculado, estimativa baseada em acesso");
    }

    // Acesso na origem
    const orig = accessExtra(
      input.originAccess?.floor,
      input.originAccess?.hasElevator,
      input.originAccess?.difficultAccess,
      pricing
    );
    basePrice += orig.cost;
    if (orig.notes.length) assumptions.push(...orig.notes.map((n) => `Origem: ${n}`));

    // Acesso no destino
    const dest = accessExtra(
      input.destinationAccess?.floor,
      input.destinationAccess?.hasElevator,
      input.destinationAccess?.difficultAccess,
      pricing
    );
    basePrice += dest.cost;
    if (dest.notes.length) assumptions.push(...dest.notes.map((n) => `Destino: ${n}`));

    // Base mínima para mudança
    const baseMin = 80;
    if (basePrice < baseMin) {
      assumptions.push(`Valor mínimo de mudança aplicado: ${baseMin}€`);
      basePrice = baseMin;
    }

  // ── Outros serviços (recolha de móveis, monos, esvaziamento, etc.) ──────────
  } else {
    const distKm = input.distanceFromBase?.distanceKm ?? 0;
    const pricePerKm = pricing.moveis_distancia_km ?? 2.5;
    const cargaBase = pricing.moveis_carga_base ?? 2; // base operacional mínima

    // Custo por item — usa heavyItems quando disponível
    let itemsCost = 0;
    const itemsCountBySize = { pequeno: 0, medio: 0, grande: 0 };

    if (input.heavyItems && input.heavyItems.length > 0) {
      for (const item of input.heavyItems) {
        const size = classifyItem(item);
        itemsCountBySize[size]++;
        const price =
          size === "grande"
            ? (pricing.moveis_item_grande ?? 13)
            : size === "medio"
            ? (pricing.moveis_item_medio ?? 7)
            : (pricing.moveis_item_pequeno ?? 5);
        itemsCost += price;
        assumptions.push(`${item}: ${price}€ (item ${size})`);
      }
    } else {
      // Sem lista de itens — estimar a partir da descrição ou usar mínimo
      itemsCost = cargaBase;
      assumptions.push(`Sem itens especificados — base mínima: ${cargaBase}€`);
    }

    // Custo de distância
    const distCost = distKm * pricePerKm;
    if (distKm > 0) {
      assumptions.push(`Distância: ${distKm} km × ${pricePerKm}€/km = ${distCost.toFixed(2)}€`);
    }

    basePrice = itemsCost + distCost;

    // Custo de acesso
    const acc = accessExtra(
      input.floor,
      input.hasElevator,
      input.needsDismantling === "complex" || input.needsDismantling === true,
      pricing
    );
    basePrice += acc.cost;
    assumptions.push(...acc.notes);

    notes.push(
      `Itens: ${itemsCost.toFixed(2)}€ (G:${itemsCountBySize.grande} M:${itemsCountBySize.medio} P:${itemsCountBySize.pequeno}), dist: ${distCost.toFixed(2)}€, acesso: ${acc.cost.toFixed(2)}€`
    );
  }

  // ── Determinar status ────────────────────────────────────────────────────────
  if (missing.length > 0) {
    return {
      ok: true,
      source: "local_fast_estimate",
      status: "needs_more_info",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: 2,
      summary: "Faltam dados para calcular estimativa.",
      assumptions,
      missingFields: missing,
      customerMessage: "A equipa CLYON irá confirmar os dados e entrar em contacto com uma proposta.",
      internalNotes: notes,
      analysisSource: "local_fast_estimate",
    };
  }

  if (basePrice <= 0) {
    return {
      ok: true,
      source: "local_fast_estimate",
      status: "onsite_required",
      estimatedPriceWithoutVat: null,
      vatAmount: null,
      estimatedPriceWithVat: null,
      difficultyLevel: 3,
      summary: "Não foi possível calcular estimativa com os dados fornecidos.",
      assumptions,
      missingFields: [],
      customerMessage: "A equipa CLYON irá analisar os dados e entrar em contacto com uma proposta.",
      internalNotes: [...notes, "Preço calculado = 0, provavelmente dados insuficientes."],
      analysisSource: "local_fast_estimate",
    };
  }

  // ── Mão de obra ─────────────────────────────────────────────────────────────
  const laborHours = estimateLaborHours(input);
  const labor = calculateLaborCost(laborHours);
  basePrice = Math.round((basePrice + labor.laborCost) * 100) / 100;
  assumptions.push(
    `Mão de obra: ${labor.estimatedHours}h × ${labor.peopleCount} pessoas × ${labor.hourlyRatePerPerson}€/h = ${labor.laborCost}€`
  );
  notes.push(`Labor: ${labor.estimatedHours}h, ${labor.peopleCount}p, ${labor.hourlyRatePerPerson}€/h → ${labor.laborCost}€`);

  const vatRate = 0.23;
  const vat = Math.round(basePrice * vatRate * 100) / 100;
  const withVat = Math.round((basePrice + vat) * 100) / 100;

  // Dificuldade estimada
  const totalFloors =
    floorNumber(input.floor) +
    floorNumber(input.originAccess?.floor) +
    floorNumber(input.destinationAccess?.floor);
  const diff: 1 | 2 | 3 | 4 | 5 =
    totalFloors >= 6 ? 4 : totalFloors >= 4 ? 3 : totalFloors >= 2 ? 2 : 1;

  return {
    ok: true,
    source: "local_fast_estimate",
    status: "estimated",
    estimatedPriceWithoutVat: Math.round(basePrice * 100) / 100,
    vatAmount: vat,
    estimatedPriceWithVat: withVat,
    labor,
    difficultyLevel: diff,
    summary: `Estimativa rápida calculada com base no preçário atual CLYON.`,
    assumptions,
    missingFields: [],
    customerMessage: `Inclui estimativa de mão de obra: ${labor.estimatedHours}h com equipa de ${labor.peopleCount} pessoas.`,
    internalNotes: [...notes, `Total s/IVA: ${basePrice.toFixed(2)}€, IVA 23%: ${vat}€, Total: ${withVat}€`],
    analysisSource: "local_fast_estimate",
  };
}

/**
 * Snapshot do preçário para guardar junto ao pedido
 */
export async function createPricingSnapshot() {
  try {
    const settingsMap = await getActivePricingMap();
    return {
      timestamp: new Date().toISOString(),
      source: "backoffice_simulator_values",
      entulho_saco_ensacado: settingsMap.entulho_saco_ensacado,
      entulho_saco_chao: settingsMap.entulho_saco_chao,
      entulho_distancia_km: settingsMap.entulho_distancia_km,
      apartamento_com_elevador_por_andar: settingsMap.apartamento_com_elevador_por_andar,
      apartamento_sem_elevador_por_andar: settingsMap.apartamento_sem_elevador_por_andar,
      acesso_dificil_extra: settingsMap.acesso_dificil_extra,
    };
  } catch (error) {
    console.error("[pricing-helper] Erro ao criar snapshot:", error);
    return null;
  }
}
