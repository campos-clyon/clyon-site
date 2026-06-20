// Mapeamento de respostas comuns para valores padrão
export const responseMapping: Record<string, Record<string, string>> = {
  floor: {
    "r/c": "terreo",
    "res-do-chao": "terreo",
    "terreo": "terreo",
    "0": "terreo",
    "piso": "terreo",
  },
  hasElevator: {
    "nao": "no",
    "sem": "no",
    "nao tenho": "no",
    "sim": "yes",
    "tem": "yes",
    "tenho": "yes",
    "elevador": "yes",
  },
  parkingDistance: {
    "sim": "under_20m",
    "tem": "under_20m",
    "tenho": "under_20m",
    "tem espaco": "under_20m",
    "tem estacionamento": "under_20m",
    "proximo": "under_20m",
    "nao": "far_away",
    "nao tenho": "far_away",
    "longe": "far_away",
    "muito longe": "far_away",
  },
  urgency: {
    "nao": "flexible",
    "nao tenho urgencia": "flexible",
    "flexivel": "flexible",
    "sem urgencia": "flexible",
    "normal": "flexible",
    "sim": "urgent",
    "urgente": "urgent",
    "precisa": "urgent",
    "rapido": "urgent",
  },
  serviceType: {
    "recolha de moveis": "recolha_moveis",
    "recolha de monos": "recolha_monos",
    "moveis": "recolha_moveis",
    "monos": "recolha_monos",
    "recolha de entulho": "recolha_entulho",
    "entulho": "recolha_entulho",
    "mudanca": "mudancas",
    "mudancas": "mudancas",
    "limpeza pos-obra": "limpeza_pos_obra",
    "limpeza": "limpeza_pos_obra",
  },
};

// Remove valores nulos/vazios do objeto
export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

// Merge profundo seguro - não sobrescreve valores existentes
export function mergeOrderPatch(
  current: Record<string, any>,
  patch: Record<string, any>
): Record<string, any> {
  const result = { ...current };

  for (const [key, value] of Object.entries(patch)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    // Se o campo não existe ou está vazio, atualiza
    if (!result[key] || result[key] === "" || result[key] === null || result[key] === undefined) {
      result[key] = value;
    }
    // Se ambos são objetos, faz merge recursivo
    else if (typeof result[key] === "object" && typeof value === "object" && !Array.isArray(result[key]) && !Array.isArray(value)) {
      result[key] = mergeOrderPatch(result[key], value);
    }
    // Caso contrário, mantém o valor existente
  }

  return result;
}

// Retorna apenas os campos que faltam ser preenchidos
export interface OrderData {
  category?: string;
  receiver?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  address?: {
    street?: string;
    floor?: string;
    hasElevator?: string;
    parkingDistance?: string;
  };
  service?: {
    type?: string;
    urgency?: string;
  };
  [key: string]: any;
}

export function getMissingFields(order: OrderData): string[] {
  const missing: string[] = [];

  if (!order.receiver?.name) missing.push("name");
  if (!order.receiver?.phone) missing.push("phone");
  if (!order.receiver?.email) missing.push("email");
  if (!order.address?.street) missing.push("street");
  if (!order.address?.floor) missing.push("floor");
  if (!order.address?.hasElevator) missing.push("hasElevator");
  if (!order.address?.parkingDistance) missing.push("parkingDistance");
  if (!order.service?.type) missing.push("serviceType");
  if (!order.service?.urgency) missing.push("urgency");

  return missing;
}

// Extrair dados de contacto usando regex como fallback
export function extractContactDataRegex(message: string): Partial<OrderData> {
  const result: Partial<OrderData> = {
    receiver: {},
    address: {},
    service: {},
  };

  // Procura por padrões de nome (letras maiúsculas, acentos, hífens)
  const nameMatch = message.match(/(?:nome[:\s]+)?([A-ZÀ-ÿ][a-zà-ÿ\s\-]{2,})/i);
  if (nameMatch) {
    result.receiver!.name = nameMatch[1].trim();
  }

  // Procura por padrões de telefone português (9 dígitos começando com 9)
  const phoneMatch = message.match(/(?:tel|telefone|telemóvel|telemovel|número|numero)[:\s]*([\d\s]{9,})/i) ||
                     message.match(/\b(9[1236]\d{1}\s?\d{3}\s?\d{3})\b/);
  if (phoneMatch) {
    result.receiver!.phone = phoneMatch[1].replace(/\s/g, "");
  }

  // Procura por padrões de email
  const emailMatch = message.match(/([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch) {
    result.receiver!.email = emailMatch[1];
  }

  // Procura por morada
  const addressMatch = message.match(/(?:morada|endereço|rua|av|avenida)[:\s]+([^,.\n]+(?:[,.][\s\n]*[^,.\n]+)?)/i);
  if (addressMatch) {
    result.address!.street = addressMatch[1].trim();
  }

  // Procura por andar (números seguidos de º, º, andar, piso)
  const floorMatch = message.match(/(\d+)\s*(?:º|o)\s*(?:andar|piso)|(?:andar|piso)[:\s]*(\d+|[A-Za-z\-]+)/i);
  if (floorMatch) {
    const floorValue = floorMatch[1] || floorMatch[2];
    const normalized = normalizeResponse("floor", floorValue);
    if (normalized) {
      result.address!.floor = normalized;
    }
  }

  return removeUndefined(result);
}

// Normaliza respostas comuns para valores padrão
export function normalizeResponse(field: string, value: string): string | undefined {
  if (!value) return undefined;

  const lowercased = value.toLowerCase().trim();
  const mapping = responseMapping[field];

  if (!mapping) return value;

  // Procura por matches exatos
  if (lowercased in mapping) {
    return mapping[lowercased];
  }

  // Procura por matches parciais (substrings)
  for (const [key, mapped] of Object.entries(mapping)) {
    if (lowercased.includes(key) || key.includes(lowercased)) {
      return mapped;
    }
  }

  return value;
}

// Gera prompt para Gemini extrair dados
export function generateExtractionPrompt(message: string, missingFields: string[]): string {
  const fieldDescriptions: Record<string, string> = {
    name: "Nome completo da pessoa",
    phone: "Número de telefone português (9 dígitos)",
    email: "Endereço de email",
    street: "Endereço completo (rua, número, localidade)",
    floor: "Número do andar (incluindo R/C para rés-do-chão)",
    hasElevator: "Se tem ou não elevador (sim/não)",
    parkingDistance: "Se tem estacionamento próximo (sim/não/longe)",
    serviceType: "Tipo de serviço (recolha móveis, monos, entulho, mudanças, limpeza)",
    urgency: "Nível de urgência (flexível/urgente)",
  };

  const fieldsToExtract = missingFields.map((f) => `- ${f}: ${fieldDescriptions[f] || f}`).join("\n");

  return `Você é um assistente de extração de dados para uma empresa de recolhas e mudanças.
Analise a mensagem do cliente e extraia os seguintes dados FALTANTES:

${fieldsToExtract}

Mensagem do cliente: "${message}"

Responda em formato JSON com apenas os campos encontrados. Use valores naturais e normalizados.
Exemplos:
- Para andar: "R/C", "1º", "2º", etc.
- Para elevador: "sim" ou "não"
- Para estacionamento: "sim", "não" ou "longe"
- Para serviço: "recolha de móveis", "mudanças", etc.
- Para urgência: "flexível" ou "urgente"

Retorne APENAS o JSON válido, sem explicações.`;
}

// Converte respostas de Gemini em dados estruturados
export function parseGeminiResponse(response: string, missingFields: string[]): Partial<OrderData> {
  try {
    // Tenta extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    const data = JSON.parse(jsonMatch[0]);
    const result: Partial<OrderData> = {
      receiver: {},
      address: {},
      service: {},
    };

    // Mapeia os campos encontrados
    if (data.name) result.receiver!.name = data.name;
    if (data.phone) result.receiver!.phone = data.phone;
    if (data.email) result.receiver!.email = data.email;
    if (data.street) result.address!.street = data.street;
    if (data.floor) result.address!.floor = normalizeResponse("floor", data.floor);
    if (data.hasElevator) result.address!.hasElevator = normalizeResponse("hasElevator", data.hasElevator);
    if (data.parkingDistance) result.address!.parkingDistance = normalizeResponse("parkingDistance", data.parkingDistance);
    if (data.serviceType) result.service!.type = normalizeResponse("serviceType", data.serviceType);
    if (data.urgency) result.service!.urgency = normalizeResponse("urgency", data.urgency);

    return removeUndefined(result);
  } catch {
    return {};
  }
}
