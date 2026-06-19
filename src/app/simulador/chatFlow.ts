import type { OrderData, ChatStep } from "./types";

export interface ChatFlowStep {
  step: ChatStep;
  question: string;
  quickReplies?: string[];
  showContactForm?: boolean;
  showUpload?: boolean;
}

export function getProgressStep(order: OrderData): number {
  if (order.receiver?.name && order.receiver?.phone) return 4;
  if (order.floor && order.hasElevator && order.parkingDistance) return 3;
  if (order.serviceType) return 2;
  return 1;
}

export function getNextChatStep(order: OrderData): ChatFlowStep | null {
  if (!order.serviceType) {
    return {
      step: "service_type",
      question: "Qual é o tipo de serviço que precisa?",
      quickReplies: [
        "Recolha de móveis",
        "Recolha de monos",
        "Recolha de entulho",
        "Esvaziamento de casa",
        "Esvaziamento de apartamento",
        "Mudança",
        "Outro serviço",
      ],
    };
  }

  if (!order.description && (!order.files || order.files.length === 0)) {
    return {
      step: "description",
      question: "O que precisa recolher ou transportar? Pode descrever os objetos ou enviar fotos e vídeos.",
      showUpload: true,
    };
  }

  if (!order.floor) {
    return {
      step: "floor",
      question: "Em que andar está o material?",
      quickReplies: [
        "Rés-do-chão",
        "1.º andar",
        "2.º andar",
        "3.º andar",
        "4.º andar ou superior",
        "Cave",
        "Garagem",
        "Arrecadação",
      ],
    };
  }

  if (!order.hasElevator) {
    return {
      step: "elevator",
      question: "Tem elevador onde os itens caibam?",
      quickReplies: [
        "Sim, funciona",
        "Sim, mas é pequeno",
        "Não tem elevador",
        "Não sei",
      ],
    };
  }

  if (!order.parkingDistance) {
    return {
      step: "parking",
      question: "A carrinha consegue estacionar perto da entrada?",
      quickReplies: [
        "Sim, mesmo à porta",
        "Sim, até 20 metros",
        "Mais de 30 metros",
        "Estacionamento difícil",
        "Não sei",
      ],
    };
  }

  if (!order.needsDismantling) {
    return {
      step: "dismantling",
      question: "O material precisa de desmontagem?",
      quickReplies: [
        "Não",
        "Sim, desmontagem simples",
        "Sim, desmontagem média",
        "Sim, desmontagem demorada",
        "Não sei",
      ],
    };
  }

  if (!order.heavyItems || order.heavyItems.length === 0) {
    return {
      step: "heavy_items",
      question: "Existem objetos pesados ou de grande volume?",
      quickReplies: [
        "Não",
        "Sofá grande",
        "Roupeiro",
        "Frigorífico",
        "Máquina de lavar",
        "Entulho pesado",
        "Outro",
      ],
    };
  }

  if (!order.urgency) {
    return {
      step: "urgency",
      question: "O serviço é urgente?",
      quickReplies: [
        "Não",
        "Sim, hoje",
        "Sim, amanhã",
        "Esta semana",
        "Tenho flexibilidade",
      ],
    };
  }

  if (!order.receiver?.name || !order.receiver?.phone) {
    return {
      step: "receiver",
      question: "Quem vai receber a equipa?",
      showContactForm: true,
    };
  }

  return null; // Completo
}

export function parseServiceType(text: string): string {
  const map: Record<string, string> = {
    "recolha de móveis": "recolha_moveis",
    "recolha de monos": "recolha_monos",
    "recolha de entulho": "recolha_entulho",
    "esvaziamento de casa": "esvaziamento_casa",
    "esvaziamento de apartamento": "esvaziamento_apartamento",
    "mudança": "mudanca",
    "outro serviço": "outro",
    "outro": "outro",
  };
  return map[text.toLowerCase().trim()] ?? "outro";
}

export function parseElevator(text: string): OrderData["hasElevator"] {
  const t = text.toLowerCase();
  if (t.includes("sim, funciona") || t === "sim" || /sim.*funciona|funciona.*sim/.test(t)) return "yes";
  if (t.includes("pequeno") || t.includes("mas é pequeno") || t.includes("cabe pouco")) return "small";
  if (t.includes("não tem") || t.includes("nao tem") || t === "não" || t === "nao") return "no";
  if (t.includes("sim")) return "yes"; // "sim" sozinho → tem elevador
  return "unknown";
}

export function parseParking(text: string): OrderData["parkingDistance"] {
  const t = text.toLowerCase();
  if (t.includes("mesmo à porta") || t.includes("mesmo a porta") || t.includes("porta")) return "door";
  if (t.includes("até 20") || t.includes("ate 20") || t.includes("20 metro") || t.includes("sim, até 20") || t.includes("sim ate 20")) return "under_20m";
  if (t.includes("30 metro") || t.includes("mais de 30") || t.includes("mais 30")) return "over_30m";
  if (t.includes("difícil") || t.includes("dificil") || t.includes("complicado") || t.includes("não há") || t.includes("nao ha")) return "difficult";
  // Resposta afirmativa genérica ("sim", "há lugar", "consegue", "dá")
  if (t === "sim" || /^sim[.!]?$/.test(t.trim()) || t.includes("há lugar") || t.includes("ha lugar") || t.includes("consegue") || t.includes("dá para") || t.includes("da para")) return "under_20m";
  return "unknown";
}

export function parseUrgency(text: string): OrderData["urgency"] {
  if (text.toLowerCase().includes("hoje")) return "today";
  if (text.toLowerCase().includes("amanhã")) return "tomorrow";
  if (text.toLowerCase().includes("semana")) return "this_week";
  if (text.toLowerCase().includes("flexibilidade") || text.toLowerCase().includes("não")) return "flexible";
  return "flexible";
}

export function parseDismantling(text: string): OrderData["needsDismantling"] {
  if (text.toLowerCase() === "não") return "no";
  if (text.toLowerCase().includes("simples")) return "simple";
  if (text.toLowerCase().includes("média")) return "medium";
  if (text.toLowerCase().includes("demorada")) return "complex";
  return "unknown";
}

export function parseFloor(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/rés.do.chão|r\/c|térreo|piso 0/.test(t)) return "Rés-do-chão";
  if (/1[ºo°]?\s*andar|piso 1/.test(t)) return "1.º andar";
  if (/2[ºo°]?\s*andar|piso 2/.test(t)) return "2.º andar";
  if (/3[ºo°]?\s*andar|piso 3/.test(t)) return "3.º andar";
  if (/4[ºo°]?\s*andar|piso 4/.test(t)) return "4.º andar";
  if (/5[ºo°]?\s*andar|piso [56789]/.test(t)) return "4.º andar ou superior";
  if (/cave/.test(t)) return "Cave";
  if (/garagem/.test(t)) return "Garagem";
  if (/andar/.test(t)) {
    const m = t.match(/(\d+)[ºo°]?\s*andar/);
    if (m) return `${m[1]}.º andar`;
  }
  return undefined;
}
