export type SimulatorSettingKey =
  | "moveis_item_pequeno"
  | "moveis_item_medio"
  | "moveis_item_grande"
  | "moveis_distancia_km"
  | "moveis_carga_base"
  | "moveis_carga_multiplicador"
  | "entulho_saco_chao_extra"
  | "entulho_distancia_km"
  | "mudancas_distancia_km"
  | "apartamento_com_elevador_por_andar"
  | "apartamento_sem_elevador_por_andar"
  | "acesso_dificil_extra"
  | "hora_base"
  | "entulho_multiplicador"
  | "mudancas_multiplicador";

export type SimulatorSettingDefinition = {
  key: SimulatorSettingKey;
  label: string;
  description: string;
  category: "moveis" | "entulho" | "mudancas" | "acessos" | "geral";
  unit: "eur" | "multiplier";
  value: number;
};

export const defaultSimulatorSettings: SimulatorSettingDefinition[] = [
  {
    key: "moveis_item_pequeno",
    label: "Movel pequeno",
    description: "Valor por unidade para peca pequena.",
    category: "moveis",
    unit: "eur",
    value: 5,
  },
  {
    key: "moveis_item_medio",
    label: "Movel medio",
    description: "Valor por unidade para peca media.",
    category: "moveis",
    unit: "eur",
    value: 7,
  },
  {
    key: "moveis_item_grande",
    label: "Movel grande",
    description: "Valor por unidade para peca grande.",
    category: "moveis",
    unit: "eur",
    value: 13,
  },
  {
    key: "moveis_distancia_km",
    label: "Custo por km em moveis",
    description: "Peso da distancia para recolha de moveis.",
    category: "moveis",
    unit: "eur",
    value: 2.5,
  },
  {
    key: "moveis_carga_base",
    label: "Base por carga",
    description: "Base operacional para modo por carga.",
    category: "moveis",
    unit: "eur",
    value: 2,
  },
  {
    key: "moveis_carga_multiplicador",
    label: "Multiplicador por carga",
    description: "Margem aplicada ao modo por carga.",
    category: "moveis",
    unit: "multiplier",
    value: 0.35,
  },
  {
    key: "entulho_saco_chao_extra",
    label: "Extra por saco no chao",
    description: "Acrescimo quando o entulho nao esta ensacado.",
    category: "entulho",
    unit: "eur",
    value: 1.5,
  },
  {
    key: "entulho_distancia_km",
    label: "Custo por km em entulho",
    description: "Peso da distancia para entulho e limpeza pos-obra.",
    category: "entulho",
    unit: "eur",
    value: 2.2,
  },
  {
    key: "mudancas_distancia_km",
    label: "Custo por km em mudancas",
    description: "Peso da distancia em mudancas e camiao com motorista.",
    category: "mudancas",
    unit: "eur",
    value: 2.5,
  },
  {
    key: "apartamento_com_elevador_por_andar",
    label: "Apartamento com elevador",
    description: "Acrescimo por andar com elevador.",
    category: "acessos",
    unit: "eur",
    value: 3,
  },
  {
    key: "apartamento_sem_elevador_por_andar",
    label: "Apartamento sem elevador",
    description: "Acrescimo por andar sem elevador.",
    category: "acessos",
    unit: "eur",
    value: 6,
  },
  {
    key: "acesso_dificil_extra",
    label: "Extra por acesso dificil",
    description: "Acrescimo fixo para acessos complexos.",
    category: "acessos",
    unit: "eur",
    value: 30,
  },
  {
    key: "hora_base",
    label: "Hora base por pessoa",
    description: "Valor base por hora e por pessoa.",
    category: "geral",
    unit: "eur",
    value: 9,
  },
  {
    key: "entulho_multiplicador",
    label: "Multiplicador entulho",
    description: "Margem final do calculo de entulho.",
    category: "entulho",
    unit: "multiplier",
    value: 1.3,
  },
  {
    key: "mudancas_multiplicador",
    label: "Multiplicador mudancas",
    description: "Margem final do calculo de mudancas.",
    category: "mudancas",
    unit: "multiplier",
    value: 1.4,
  },
];

export type SimulatorSettingsMap = Record<SimulatorSettingKey, number>;

export function createSimulatorSettingsMap(
  values?: Array<{ key: string; value: string | number }>,
): SimulatorSettingsMap {
  const map = Object.fromEntries(
    defaultSimulatorSettings.map((setting) => [setting.key, setting.value]),
  ) as SimulatorSettingsMap;

  for (const item of values ?? []) {
    if (item.key in map) {
      const parsed = Number(item.value);
      if (Number.isFinite(parsed)) {
        map[item.key as SimulatorSettingKey] = parsed;
      }
    }
  }

  return map;
}
