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
    
    if (!settings || settings.length === 0) {
      console.warn("[pricing-helper] Nenhuma configuração de preços encontrada, usando defaults");
      return getDefaultPricingRules();
    }

    // Converter array para mapa utilizável
    const settingsMap = createSimulatorSettingsMap(settings);
    
    // Formatar para Gemini (texto legível)
    return formatPricingRulesForGemini(settingsMap);
  } catch (error) {
    console.error("[pricing-helper] Erro ao carregar configurações:", error);
    return getDefaultPricingRules();
  }
}

/**
 * Devolve um mapa estruturado dos preços atuais para cálculos backend
 */
export async function getActivePricingMap(): Promise<SimulatorSettingsMap> {
  try {
    const settings = await getSimulatorSettings();
    return createSimulatorSettingsMap(settings);
  } catch (error) {
    console.error("[pricing-helper] Erro ao carregar mapa de preços:", error);
    return createSimulatorSettingsMap([]);
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
