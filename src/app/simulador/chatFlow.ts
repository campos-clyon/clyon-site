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
  if (text.toLowerCase().includes("sim, funciona")) return "yes";
  if (text.toLowerCase().includes("pequeno")) return "small";
  if (text.toLowerCase().includes("não tem")) return "no";
  return "unknown";
}

export function parseParking(text: string): OrderData["parkingDistance"] {
  if (text.toLowerCase().includes("mesmo à porta")) return "door";
  if (text.toLowerCase().includes("20 metros")) return "under_20m";
  if (text.toLowerCase().includes("30 metros")) return "over_30m";
  if (text.toLowerCase().includes("difícil")) return "difficult";
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
