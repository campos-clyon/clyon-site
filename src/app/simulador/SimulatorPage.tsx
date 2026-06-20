"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, EstimateResult, OrderData, UploadedFile, DistanceFromBase, DistanceStatus } from "./types";
import {
  getProgressStep,
  parseDismantling,
  parseElevator,
  parseFloor,
  parseParking,
  parseServiceType,
  parseUrgency,
} from "./chatFlow";
import { calculateLocalEstimate, detectZone } from "./pricingRules";

import ChatMessageComponent from "./components/ChatMessage";
import QuickReplyChips from "./components/QuickReplyChips";
import UploadDropzone from "./components/UploadDropzone";
import ContactAccessForm from "./components/ContactAccessForm";
import OrderSummaryCard from "./components/OrderSummaryCard";
import EstimateCard from "./components/EstimateCard";
import ProgressSteps from "./components/ProgressSteps";

// ─── Storage ────────────────────────────────────────────────────────────────
const SIMULATOR_STORAGE_KEYS = [
  "clyon_simulator_draft",
  "clyon_simulator_reset",
  "clyon-simulator",
  "clyon-simulator-draft",
  "simulator-order",
  "simulator-messages",
];

function clearSimulatorStorage() {
  if (typeof window === "undefined") return;
  SIMULATOR_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}



// ─── Helpers ────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeAssistantMessage(content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: uid(), role: "assistant", content, timestamp: new Date(), ...extra };
}

const WELCOME_MESSAGE = "Qual é o serviço que precisa? Pode escrever tudo de uma vez — por exemplo: \"recolha de sofá em Lisboa, 2.º andar com elevador, para amanhã\". Também pode enviar fotos.";

// Pergunta pelo próximo campo em falta — usado como fallback quando Gemini falha
function getNextMissingFieldQuestion(order: OrderData): string {
  if (!order.serviceType) return "Que tipo de serviço precisa? (recolha de móveis, monos, entulho, esvaziamento ou mudança)";
  if (!order.description && (!order.files || order.files.length === 0)) return "O que precisa de recolher ou transportar? Pode descrever ou enviar fotos.";
  if (!order.floor) return "Em que andar se encontra o material? (ex: rés-do-chão, 1, 2, 3...)";
  if (!order.hasElevator || order.hasElevator === "unknown") return "Tem elevador? (sim / não / sim mas é pequeno)";
  if (!order.parkingDistance || order.parkingDistance === "unknown") return "A carrinha consegue estacionar perto da entrada? (sim / não / até 20 metros)";
  if (!order.urgency) return "Qual a urgência? (amanhã, esta semana, flexível)";
  return "Para finalizar, preciso dos seus dados de contacto e morada:";
}

function createInitialMessages(): ChatMessage[] {
  return [makeAssistantMessage(WELCOME_MESSAGE)];
}

// ─── Extracção de campos do texto livre (client-side, sem IA) ───────────────
// Complementa a extracção feita pelo Gemini no backend
function extractOrderFieldsFromText(text: string, current: OrderData): Partial<OrderData> {
  const t = text.toLowerCase();
  const updates: Partial<OrderData> = {};

  if (!current.serviceType) {
    const st = parseServiceType(text);
    if (st) updates.serviceType = st as OrderData["serviceType"];
  }
  if (!current.description && text.length > 15) {
    updates.description = text.trim();
  }
  if (!current.floor) {
    const fl = parseFloor(text);
    if (fl) updates.floor = fl;
  }
  if (!current.hasElevator || current.hasElevator === "unknown") {
    const el = parseElevator(text);
    if (el && el !== "unknown") updates.hasElevator = el;
  }
  if (!current.parkingDistance || current.parkingDistance === "unknown") {
    const pk = parseParking(text);
    if (pk && pk !== "unknown") updates.parkingDistance = pk;
  }
  if (!current.needsDismantling) {
    const dm = parseDismantling(text);
    if (dm && dm !== "unknown") updates.needsDismantling = dm;
  }
  if (!current.urgency) {
    const ug = parseUrgency(text);
    if (ug && ug !== "no") updates.urgency = ug;
  }
  // Tentar extrair nome + telefone
  if (!current.receiver?.name) {
    const nameMatch = text.match(/nome[:\s]+([A-ZÁÉÍÓÚÀÃÕÂÊÔÇ][a-záéíóúàãõâêôç]+(?:\s+[A-ZÁÉÍÓÚÀÃÕÂÊÔÇ][a-záéíóúàãõâêôç]+)+)/i);
    if (nameMatch) {
      const phone = text.match(/(?:telef[^\d]*|tel[:\s]+|contacto[:\s]+)?(\+351\s?)?([289][0-9]{8}|9[1236][0-9]{7})/);
      const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      updates.receiver = {
        name: nameMatch[1].trim(),
        phone: phone ? phone[0].replace(/\D/g, "").replace(/^351/, "") : "",
        email: email ? email[0] : undefined,
      };
    }
  }
  // Tentar extrair cidade/morada
  if (!current.city) {
    const cityMatch = text.match(/(?:localidade|cidade|morada|local)[:\s]+([A-ZÁÉÍÓÚÀÃÕÂÊÔÇÜ][^,.\n]+)/i);
    if (cityMatch) {
      updates.city = cityMatch[1].trim();
      updates.locationZone = detectZone(cityMatch[1].trim());
      updates.address = { formattedAddress: cityMatch[1].trim() };
      updates.addressStatus = "manual_confirmed";
      updates.distanceStatus = "idle"; // garantir que o useEffect de distância dispara
    }
  }

  return updates;
}

// ─── Merge seguro do patch — nunca apaga campos preenchidos com undefined ─────
function mergeOrderPatch(current: OrderData, patch: Partial<OrderData>): OrderData {
  const next: OrderData = { ...current, ...patch };
  // Merge profundo de sub-objectos
  next.address = { ...current.address, ...(patch.address ?? {}) };
  next.receiver = { ...current.receiver, ...(patch.receiver ?? {}) };
  if (patch.distanceFromBase || current.distanceFromBase) {
    next.distanceFromBase = { ...current.distanceFromBase, ...(patch.distanceFromBase ?? {}) };
  }
  // Limpar valores string vazios para não sobrescrever dados existentes
  (Object.keys(next) as Array<keyof OrderData>).forEach((k) => {
    if (next[k] === "" || next[k] === undefined) {
      const cur = current[k];
      if (cur !== undefined && cur !== "") (next as Record<string, unknown>)[k] = cur;
    }
  });
  return next;
}

// ─── Componente ─────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<OrderData>({});
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
  // Histórico de mensagens para a IA (formato {role, content})
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  // A IA sinalizou que já há dados suficientes para gerar estimativa
  const [aiCanGenerate, setAiCanGenerate] = useState(false);
  // Guardar pedido na base de dados
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // ─── Hidratação ────────────────────────────────────────────────────────────
  useEffect(() => {
    
    if (typeof window === "undefined") {
      setMessages(createInitialMessages());
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("novo") === "1") {
      clearSimulatorStorage();
      window.history.replaceState({}, "", "/simulador");
      setMessages(createInitialMessages());
      return;
    }

    // Limpar sempre ao carregar — F5 ou Novo pedido reiniciam o estado por completo
    clearSimulatorStorage();
    setMessages(createInitialMessages());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  // ─── Scroll interno ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // ─── Cálculo automático de distância quando morada chega via chat ──────────
  useEffect(() => {
    const addr = order.address;
    const isReady = order.addressStatus === "selected" || order.addressStatus === "manual_confirmed";
    const notYetCalculated = !order.distanceStatus || order.distanceStatus === "idle" || order.distanceStatus === "error";
    if (!isReady || !notYetCalculated) return;
    if (!addr?.formattedAddress && !addr?.lat) return;

    setOrder((prev) => ({ ...prev, distanceStatus: "calculating" }));

    const destination = addr.lat
      ? { lat: addr.lat, lng: addr.lng, formattedAddress: addr.formattedAddress }
      : { formattedAddress: addr.formattedAddress };

    fetch("/api/maps/distance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setOrder((prev) => ({
            ...prev,
            distanceStatus: "calculated",
            distanceFromBase: {
              distanceMeters: data.distanceMeters,
              distanceKm: data.distanceKm,
              durationSeconds: data.durationSeconds,
              durationText: data.durationText,
              calculatedAt: new Date().toISOString(),
            },
          }));
        } else {
          setOrder((prev) => ({ ...prev, distanceStatus: "error" }));
        }
      })
      .catch(() => setOrder((prev) => ({ ...prev, distanceStatus: "error" })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.addressStatus, order.address?.formattedAddress, order.address?.lat]);

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const resetSimulator = () => {
    clearSimulatorStorage();
    pendingFiles.forEach((f) => { if (f.previewUrl) URL.revokeObjectURL(f.previewUrl); });

    setOrder({});
    setMessages(createInitialMessages());
    setEstimate(null);
    setEstimateLoading(false);
    setPendingFiles([]);
    setShowUpload(false);
    setInput("");
    setIsTyping(false);
    setChatHistory([]);
    setAiCanGenerate(false);
    setSavingOrder(false);
    setOrderSaved(false);
    setShowResetConfirm(false);
    setResetVersion((v) => v + 1);

    requestAnimationFrame(() => {
      if (messagesContainerRef.current) messagesContainerRef.current.scrollTop = 0;
    });
  };

  // ─── Enviar mensagem — usa /api/simulator/chat (resposta JSON estruturada) ──
  const handleSend = async (text: string, files?: UploadedFile[]) => {
    const trimmed = text.trim();
    if (!trimmed && (!files || files.length === 0)) return;

    // 1. Mensagem do utilizador no chat
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
      files: files && files.length > 0 ? files : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPendingFiles([]);
    setShowUpload(false);
    setIsTyping(true);

    // 2. Extracção local instantânea (sem IA) para mostrar dados no resumo imediatamente
    const localExtract = extractOrderFieldsFromText(trimmed, order);
    let updatedOrder = mergeOrderPatch(order, localExtract);
    if (files && files.length > 0) {
      updatedOrder = { ...updatedOrder, files: [...(updatedOrder.files ?? []), ...files] };
    }
    setOrder(updatedOrder);

    // 3. Actualizar histórico para enviar à IA
    type MsgPart = { text?: string; inlineData?: { mimeType: string; data: string } };
    type ApiMsg = { role: "user" | "assistant"; content: string | MsgPart[] };

    const newHistory: ApiMsg[] = [
      ...chatHistory,
      { role: "user" as const, content: trimmed },
    ];

    // Substituir última msg por multimodal se houver fotos
    if (files && files.length > 0) {
      const parts: MsgPart[] = [];
      if (trimmed) parts.push({ text: trimmed });
      for (const f of files) {
        if (f.base64 && f.mimeType) parts.push({ inlineData: { mimeType: f.mimeType, data: f.base64 } });
      }
      if (parts.length > 0) newHistory[newHistory.length - 1] = { role: "user", content: parts };
    }

    setChatHistory(newHistory.map((m) => ({
      role: m.role,
      content: typeof m.content === "string" ? m.content : (m.content as MsgPart[]).filter((p) => p.text).map((p) => p.text).join(" "),
    })));

    // 4. Chamar /api/simulator/chat
    try {
      const res = await fetch("/api/simulator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          orderData: updatedOrder,
          latestUserMessage: trimmed,
          hasUploadedFiles: (files?.length ?? 0) > 0,
        }),
      });

      setIsTyping(false);

      if (!res.ok) {
        // Fallback local se a IA não responder
        const fb = getNextMissingFieldQuestion(updatedOrder);
        const showForm = fb.includes("contacto e morada");
        setMessages((prev) => [...prev, makeAssistantMessage(fb, { showContactForm: showForm })]);
        return;
      }

      const data = await res.json();

      // 5. Aplicar orderPatch vindo da IA (merge seguro)
      if (data.orderPatch && Object.keys(data.orderPatch).length > 0) {
        setOrder((prev) => mergeOrderPatch(prev, data.orderPatch));
      }

      // 6. Mostrar mensagem da IA com quickReplies e flags
      const aiText: string = data.assistantMessage ?? "Pode continuar a descrever o serviço.";
      const quickReplies: string[] = Array.isArray(data.quickReplies) ? data.quickReplies : [];
      const showContactForm: boolean = data.shouldOpenContactForm === true;
      const showUploadHint: boolean = data.shouldAskForPhotos === true;
      if (data.canGenerateEstimate === true) setAiCanGenerate(true);

      setMessages((prev) => [
        ...prev,
        makeAssistantMessage(aiText, {
          quickReplies: quickReplies.length > 0 ? quickReplies : undefined,
          showContactForm,
          showUpload: showUploadHint,
        }),
      ]);

    } catch {
      setIsTyping(false);
      const fb = getNextMissingFieldQuestion(updatedOrder);
      const showForm = fb.includes("contacto e morada");
      setMessages((prev) => [...prev, makeAssistantMessage(fb, { showContactForm: showForm })]);
    }
  };

  // ─── Formul��rio de contacto ────────────────────────────────────────────────
  const handleContactSubmit = (data: {
    receiver: OrderData["receiver"];
    address: { formattedAddress?: string; city?: string; postalCode?: string; lat?: number; lng?: number; placeId?: string };
    addressText: string;
    distanceFromBase?: DistanceFromBase;
    distanceStatus?: DistanceStatus;
  }) => {
    const resolvedAddress = {
      ...data.address,
      formattedAddress: data.address.formattedAddress || data.addressText || undefined,
    };

    const updatedOrder: OrderData = {
      ...order,
      receiver: data.receiver,
      address: resolvedAddress,
      addressStatus: "selected",
      city: resolvedAddress.city ?? data.addressText ?? order.city,
      locationZone: detectZone(resolvedAddress.city ?? data.addressText ?? order.city),
      distanceFromBase: data.distanceFromBase,
      distanceStatus: data.distanceStatus ?? "idle",
    };
    setOrder(updatedOrder);

    const summaryParts = [
      `Contacto: ${data.receiver?.name}, ${data.receiver?.phone}`,
      data.receiver?.email ? `E-mail: ${data.receiver.email}` : "",
      `Morada: ${data.addressText || resolvedAddress.formattedAddress}`,
    ].filter(Boolean);

    const userMsg: ChatMessage = {
      id: uid(), role: "user", content: summaryParts.join(". "), timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessages((prev) => [
      ...prev,
      makeAssistantMessage("Obrigado! Já tenho todos os dados. A calcular a estimativa com base no preçário CLYON..."),
    ]);
  };

  // Ref sempre actualizada com o order mais recente — evita stale closure nos useEffects
  const orderRef = useRef(order);
  useEffect(() => { orderRef.current = order; }, [order]);

  // ─── Gerar estimativa ──────────────────────────────────────────────────────
  const handleGenerateEstimate = async (orderOverride?: OrderData) => {
    const currentOrder = orderOverride ?? orderRef.current;
    setEstimateLoading(true);
    setEstimate(null);
    try {
      const res = await fetch("/api/simulator/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentOrder }),
      });
      const data = await res.json();
      setEstimate(res.ok ? data : calculateLocalEstimate(currentOrder));
    } catch {
      setEstimate(calculateLocalEstimate(currentOrder));
    } finally {
      setEstimateLoading(false);
    }
  };

  // ─── Upload de ficheiros via input hidden ──────────────────────────────────
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = Array.from(e.target.files ?? []);
    const MAX = 10 * 1024 * 1024;
    const uploaded: UploadedFile[] = rawFiles
      .filter((f) => f.size <= MAX)
      .map((f) => ({
        id: uid(),
        file: f,
        name: f.name,
        size: f.size,
        mimeType: f.type,
        previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      }));

    // Converter para base64
    uploaded.forEach((uf) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = (ev.target?.result as string)?.split(",")[1];
        setPendingFiles((prev) =>
          prev.map((p) => (p.id === uf.id ? { ...p, base64: b64 } : p))
        );
      };
      reader.readAsDataURL(uf.file as File);
    });

    setPendingFiles((prev) => [...prev, ...uploaded]);
    if (e.target) e.target.value = "";
  };

  // ─── Canais de teclado ─────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input, pendingFiles.length > 0 ? pendingFiles : undefined);
    }
  };

  // ─── Computed ──────────────────────────────────────────────────────────────
  const addressReady =
    order.addressStatus === "selected" ||
    order.addressStatus === "manual_confirmed" ||
    !!(order.address?.formattedAddress) ||
    !!order.city;

  const canGenerate =
    aiCanGenerate ||
    (!!order.serviceType &&
      !!(order.description || (order.files && order.files.length > 0)) &&
      addressReady &&
      !!order.receiver?.name &&
      !!order.receiver?.phone);

  // ─── Guardar pedido na base de dados ────────────────────────────────────────
  const handleSaveOrder = async () => {
    if (savingOrder || orderSaved) return;
    setSavingOrder(true);
    try {
      const res = await fetch("/api/simulador/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order, estimate, chatHistory }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log("[v0] Pedido criado:", data);
        setOrderSaved(true);
        
        const confirmationMsg = data.message || 
          `Pedido #${data.id} enviado com sucesso para a equipa CLYON.${
            data.assignedTo ? ` Assistente atribuída: ${data.assignedTo}.` : " Será atribuído em breve."
          }`;
        
        setMessages((prev) => [
          ...prev,
          makeAssistantMessage(confirmationMsg),
        ]);
      } else {
        const error = await res.json();
        console.error("[v0] Erro ao criar pedido:", error);
      }
    } catch (err) {
      console.error("[v0] Erro ao guardar pedido:", err);
    } finally {
      setSavingOrder(false);
    }
  };

  // ─── Auto-gerar estimativa quando o resumo fica completo ──────────────────
  useEffect(() => {
    if (canGenerate && !estimate && !estimateLoading) {
      // Passar order directamente para evitar stale closure
      handleGenerateEstimate(order);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGenerate, order]);

  const progressStep = getProgressStep(order);

  // ─── Drawer mobile (resumo + estimativa) ──────────────────────────────────
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Contar itens preenchidos para badge no botão
  const filledCount = [
    order.serviceType, order.description || (order.files?.length ?? 0) > 0 ? "x" : null,
    order.address?.formattedAddress, order.floor,
    order.hasElevator && order.hasElevator !== "unknown" ? order.hasElevator : null,
    order.parkingDistance && order.parkingDistance !== "unknown" ? order.parkingDistance : null,
    order.receiver?.name, order.urgency,
  ].filter(Boolean).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100dvh-76px)] bg-[#F7FBFF] overflow-hidden flex flex-col">

      {/* Hero */}
      <div className="bg-white border-b border-[#E2E8F0] flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Linha 1: ícone + título + badge */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.026 19.222A10.787 10.787 0 0012 21c2.695 0 5.17-.986 7.02-2.606" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[15px] font-bold text-[#102033]">Simulador de Preços</h1>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EFF8FF] text-[#0487D9] border border-[#BAE6FD] whitespace-nowrap">
                    Estimativa sem compromisso
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] hidden sm:block">
                  Descreva o serviço, envie fotos e indique a morada. A CLYON calcula uma estimativa com base no preçário.
                </p>
              </div>
            </div>
          </div>
          {/* Linha 2: stepper — largura total, adapta-se ao ecrã */}
          <ProgressSteps currentStep={progressStep} />
        </div>
      </div>

      {/* Layout principal */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-3">
          <div className="h-full flex flex-col lg:flex-row gap-3">

            {/* Coluna chat — ocupa tudo no mobile */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">

                {/* Cabeçalho */}
                <div className="px-4 py-2.5 border-b border-[#F1F5F9] flex items-center gap-2.5 flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">S</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#102033]">Orçamentista CLYON</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      <span className="text-[10px] text-[#64748B]">Online</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] text-[11px] font-medium text-[#64748B] hover:border-[#0487D9] hover:text-[#0487D9] transition-colors bg-white flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Novo pedido
                  </button>
                </div>

                {/* Mensagens — flex-1 com scroll */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4"
                >
                  {messages.map((msg, idx) => (
                    <div key={msg.id}>
                      <ChatMessageComponent message={msg} />
                      {msg.role === "assistant" && msg.quickReplies && idx === messages.length - 1 && !isTyping && (
                        <div className="ml-9 mt-1.5">
                          <QuickReplyChips options={msg.quickReplies} onSelect={(val) => handleSend(val)} />
                        </div>
                      )}
                      {msg.role === "assistant" && msg.showContactForm && idx === messages.length - 1 && !isTyping && (
                        <div className="ml-9 mt-2">
                          <ContactAccessForm
                            key={`contact-${resetVersion}`}
                            onSubmit={handleContactSubmit}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">S</span>
                      </div>
                      <div className="bg-white border border-[#E2E8F0] rounded-xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                        <div className="flex gap-1 items-center h-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:0ms]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:150ms]" />
                          <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview de ficheiros pendentes */}
                {pendingFiles.length > 0 && (
                  <div className="px-3 pt-2 flex flex-wrap gap-2 border-t border-[#F1F5F9]">
                    {pendingFiles.map((f) => (
                      <div key={f.id} className="relative group">
                        {f.previewUrl ? (
                          <img src={f.previewUrl} alt={f.name} className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0]" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.879V15.12a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setPendingFiles((p) => p.filter((x) => x.id !== f.id))}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Barra de input — sempre colada ao fundo */}
                <div className="px-3 py-2 border-t border-[#F1F5F9] flex-shrink-0">
                  <div className="flex items-end gap-1.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] px-2 py-1.5 focus-within:border-[#0487D9] focus-within:ring-2 focus-within:ring-[#0487D9]/20 transition-all">
                    {/* Botão "+" para fotos */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#0487D9] hover:bg-[#EFF8FF] transition-colors"
                      title="Adicionar fotos ou vídeos (até 10MB)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>


                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileInputChange}
                    />

                    {/* Textarea */}
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        // Auto-resize
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Descreva o serviço ou coloque aqui toda a informação..."
                      rows={1}
                      className="flex-1 resize-none bg-transparent text-[13px] text-[#102033] placeholder:text-[#B0BEC5] focus:outline-none leading-relaxed py-1"
                      style={{ minHeight: "28px", maxHeight: "120px" }}
                    />

                    {/* Botão enviar */}
                    <button
                      type="button"
                      onClick={() => handleSend(input, pendingFiles.length > 0 ? pendingFiles : undefined)}
                      disabled={!input.trim() && pendingFiles.length === 0}
                      className="flex-shrink-0 w-7 h-7 rounded-lg bg-[#0487D9] hover:bg-[#036BB0] disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-[#CBD5E1] mt-1 ml-1">
                    Pode escrever tudo de uma vez ou usar o <span className="font-medium">+</span> para adicionar fotos
                  </p>

                  {/* Footer de estimativa mobile — só aparece quando há estimativa ou está a calcular */}
                  {(estimate || estimateLoading) && (
                    <div className="lg:hidden mt-2 w-full rounded-xl border border-[#BAE6FD] bg-[#F0F9FF] overflow-hidden">
                      {estimateLoading ? (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <svg className="w-3.5 h-3.5 text-[#0487D9] animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span className="text-[11px] text-[#0487D9] font-medium">A calcular estimativa...</span>
                        </div>
                      ) : estimate?.estimatedPriceWithVat != null ? (
                        <div className="flex items-center justify-between px-3 py-2.5 gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wide leading-none mb-0.5">Estimativa</p>
                            <p className="text-[15px] font-bold text-[#0487D9] leading-none">
                              {estimate.estimatedPriceWithVat.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })}
                              <span className="text-[10px] font-normal text-[#94A3B8] ml-1">c/ IVA</span>
                            </p>
                            {estimate.estimatedPriceWithoutVat != null && (
                              <p className="text-[10px] text-[#94A3B8] leading-none mt-0.5">
                                {estimate.estimatedPriceWithoutVat.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })} s/ IVA
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMobileDrawer(true)}
                            className="flex-shrink-0 text-[11px] font-semibold text-[#0487D9] border border-[#BAE6FD] bg-white rounded-lg px-2.5 py-1.5 hover:bg-[#EFF8FF] transition-colors whitespace-nowrap"
                          >
                            Ver detalhes
                          </button>
                        </div>
                      ) : estimate?.status === "onsite_required" ? (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <svg className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-[11px] text-[#92400E] font-medium">Requer visita presencial</span>
                          <button type="button" onClick={() => setShowMobileDrawer(true)} className="ml-auto flex-shrink-0 text-[11px] font-semibold text-[#0487D9] border border-[#BAE6FD] bg-white rounded-lg px-2.5 py-1.5 hover:bg-[#EFF8FF] transition-colors whitespace-nowrap">
                            Ver detalhes
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Coluna lateral — visível apenas lg+ */}
            <div className="hidden lg:block lg:w-[340px] flex-shrink-0 min-h-0 overflow-y-auto space-y-3 pb-3">
              <OrderSummaryCard key={`summary-${resetVersion}`} order={order} />
              <EstimateCard
                key={`estimate-${resetVersion}`}
                estimate={estimate}
                loading={estimateLoading}
                canGenerate={canGenerate}
                onGenerate={handleGenerateEstimate}
                onReset={() => setShowResetConfirm(true)}
                onSaveOrder={handleSaveOrder}
                savingOrder={savingOrder}
                orderSaved={orderSaved}
                order={order}
              />
            </div>



            {/* Drawer mobile — só estimativa detalhada */}
            {showMobileDrawer && (
              <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileDrawer(false)} />
                <div className="relative bg-[#F7FBFF] rounded-t-2xl max-h-[85dvh] overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-[14px] font-bold text-[#102033]">Estimativa de preço</h2>
                    <button
                      type="button"
                      onClick={() => setShowMobileDrawer(false)}
                      className="w-7 h-7 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <EstimateCard
                    key={`estimate-mob-${resetVersion}`}
                    estimate={estimate}
                    loading={estimateLoading}
                    canGenerate={canGenerate}
                    onGenerate={handleGenerateEstimate}
                    onReset={() => setShowResetConfirm(true)}
                    onSaveOrder={handleSaveOrder}
                    savingOrder={savingOrder}
                    orderSaved={orderSaved}
                    order={order}
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Modal de confirmação de reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-[#102033]">Começar novo pedido?</h2>
            </div>
            <p className="text-sm text-[#64748B] leading-relaxed mb-5">
              Tem a certeza que deseja começar um novo pedido? Os dados atuais serão apagados.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] hover:border-[#CBD5E1] hover:text-[#102033] transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={resetSimulator} className="flex-1 py-2.5 px-4 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold transition-colors shadow-sm">
                Sim, começar novo pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
