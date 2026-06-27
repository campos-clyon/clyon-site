import { getSimulatorSettings } from "./db";
import type { SimulatorSettingKey, SimulatorSettingsMap } from "./simulator-settings";
import { createSimulatorSettingsMap } from "./simulator-settings";

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
Se faltar quantidade de sacos, devolver status "needs_more_info".`;
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
Fórmula: (quantidade de sacos × preço_saco) + (distância_km × 2) + acrescimos`;
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
}

export interface FastEstimateResult {
  ok: boolean;
  source: "local_fast_estimate";
  status: "estimated" | "onsite_required" | "needs_more_info";
  estimatedPriceWithoutVat: number | null;
  vatAmount: number | null;
  estimatedPriceWithVat: number | null;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  summary: string;
  assumptions: string[];
  missingFields: string[];
  customerMessage: string;
  internalNotes: string[];
  analysisSource: "local_fast_estimate";
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

  // ── Outros serviços ──────────────────────────────────────────────────────────
  } else {
    const distKm = input.distanceFromBase?.distanceKm ?? 0;
    const distCost = distKm * (pricing.moveis_distancia_km ?? 2.5);
    const baseLoad = pricing.moveis_carga_base ?? 30;
    basePrice = baseLoad + distCost;
    assumptions.push(`Base: ${baseLoad}€ + ${distKm} km × ${pricing.moveis_distancia_km ?? 2.5}€/km`);

    const acc = accessExtra(input.floor, input.hasElevator, input.needsDismantling === "simple" || input.needsDismantling === true, pricing);
    basePrice += acc.cost;
    assumptions.push(...acc.notes);
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
    difficultyLevel: diff,
    summary: `Estimativa rápida calculada com base no preçário atual CLYON.`,
    assumptions,
    missingFields: [],
    customerMessage: "Esta estimativa será confirmada pela equipa CLYON após análise dos dados.",
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
