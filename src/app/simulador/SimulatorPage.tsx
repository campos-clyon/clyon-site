"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, EstimateResult, OrderData, UploadedFile, DistanceFromBase, DistanceStatus } from "./types";
import {
  getNextChatStep,
  getProgressStep,
  parseDismantling,
  parseElevator,
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
const SIMULATOR_DRAFT_KEY = "clyon_simulator_draft";
const SIMULATOR_RESET_FLAG = "clyon_simulator_reset";
const SIMULATOR_STORAGE_KEYS = [
  SIMULATOR_DRAFT_KEY,
  SIMULATOR_RESET_FLAG,
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

function markReset() {
  if (typeof window === "undefined") return;
  // Escreve a flag de forma síncrona antes de qualquer setState
  // A hidratação verifica esta flag e ignora o draft mesmo que ainda exista
  localStorage.setItem(SIMULATOR_RESET_FLAG, "1");
  clearSimulatorStorage(); // limpa tudo incluindo a flag logo a seguir
  // Re-escreve apenas a flag para que a próxima hidratação a encontre
  localStorage.setItem(SIMULATOR_RESET_FLAG, "1");
}

// ─── Estado inicial ─────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function createInitialOrder(): OrderData {
  return {};
}

function createInitialMessages(): ChatMessage[] {
  const firstStep = getNextChatStep({});
  return [
    {
      id: uid(),
      role: "assistant",
      content: firstStep?.question ?? "Qual é o tipo de serviço que precisa?",
      timestamp: new Date(),
      quickReplies: firstStep?.quickReplies,
    },
  ];
}

function makeAssistantMessage(content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: uid(), role: "assistant", content, timestamp: new Date(), ...extra };
}

// ─── Componente ─────────────────────────────────────────────────────────────
export default function SimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<OrderData>(createInitialOrder());
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ReturnType<typeof getNextChatStep>>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // resetVersion força desmontagem/remontagem de filhos com estado interno
  const [resetVersion, setResetVersion] = useState(0);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Guards para evitar que o auto-save reescreva o storage durante/após reset
  const hasHydratedRef = useRef(false);
  const isResettingRef = useRef(false);

  // ─── Hidratação inicial (corre uma única vez) ──────────────────────────────
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    if (typeof window === "undefined") {
      setMessages(createInitialMessages());
      setCurrentStep(getNextChatStep({}));
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("novo") === "1") {
      clearSimulatorStorage();
      window.history.replaceState({}, "", "/simulador");
      setMessages(createInitialMessages());
      setOrder(createInitialOrder());
      setEstimate(null);
      setCurrentStep(getNextChatStep({}));
      return;
    }

    // Se existe a flag de reset, ignorar qualquer draft e limpar tudo
    const wasReset = localStorage.getItem(SIMULATOR_RESET_FLAG) === "1";
    if (wasReset) {
      clearSimulatorStorage();
    } else {
      const saved = localStorage.getItem(SIMULATOR_DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.order && Object.keys(parsed.order).length > 0) {
            setOrder(parsed.order);
          }
          if (parsed.estimate) {
            setEstimate(parsed.estimate);
          }
        } catch {
          // draft inválido — ignorar
        }
      }
    }

    setMessages(createInitialMessages());
    setCurrentStep(getNextChatStep({}));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-save (nunca escreve durante reset) ───────────────────────────────
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    if (isResettingRef.current) return;
    if (Object.keys(order).length === 0 && !estimate) return;

    localStorage.setItem(
      SIMULATOR_DRAFT_KEY,
      JSON.stringify({ order, estimate })
    );
  }, [order, estimate]);

  // ─── Scroll interno ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // ─── Reset ─────────────────────────────────────────────────────────────────
  const resetSimulator = () => {
    // 1. Bloquear auto-save e marcar reset de forma 100% síncrona
    //    Tem de ser ANTES de qualquer setState.
    isResettingRef.current = true;
    markReset(); // escreve flag + limpa storage de forma síncrona

    // 2. Revogar Object URLs de fotos pendentes
    pendingFiles.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });

    // 3. Resetar todos os estados num único flush
    const initialOrder = createInitialOrder();
    const initialMessages = createInitialMessages();
    const initialStep = getNextChatStep({});

    setOrder(initialOrder);
    setMessages(initialMessages);
    setEstimate(null);
    setEstimateLoading(false);
    setPendingFiles([]);
    setShowUpload(false);
    setInput("");
    setIsTyping(false);
    setCurrentStep(initialStep);
    setShowResetConfirm(false);

    // 4. Incrementar resetVersion — desmonta e remonta filhos com estado interno
    setResetVersion((v) => v + 1);

    // 5. Após o flush dos setStates, limpar storage uma segunda vez
    //    (cobre o caso de o auto-save ter escrito entre o passo 1 e o render)
    //    e liberar o guard.
    requestAnimationFrame(() => {
      clearSimulatorStorage();
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0;
      }
      isResettingRef.current = false;
    });
  };

  // ─── Chat helpers ──────────────────────────────────────────────────────────
  const addAssistantMessage = (content: string, extra?: Partial<ChatMessage>) => {
    setMessages((prev) => [...prev, makeAssistantMessage(content, extra)]);
  };

  const advanceChat = (updatedOrder: OrderData) => {
    const next = getNextChatStep(updatedOrder);
    setCurrentStep(next);

    setTimeout(() => {
      setIsTyping(false);
      if (!next) {
        addAssistantMessage(
          "Obrigado. Já tenho os dados principais. Clique em 'Gerar estimativa' no painel lateral para calcular o valor com base no preçário CLYON."
        );
      } else {
        addAssistantMessage(next.question, {
          quickReplies: next.quickReplies,
          showContactForm: next.showContactForm,
          showUpload: next.showUpload,
        });
        if (next.showUpload) setShowUpload(true);
      }
    }, 700);
  };

  const handleUserReply = (text: string, files?: UploadedFile[]) => {
    const trimmed = text.trim();
    if (!trimmed && (!files || files.length === 0)) return;

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

    let updatedOrder = { ...order };

    if (currentStep) {
      switch (currentStep.step) {
        case "service_type":
          updatedOrder.serviceType = parseServiceType(trimmed) as OrderData["serviceType"];
          break;
        case "description":
          updatedOrder.description = trimmed || undefined;
          if (files && files.length > 0) updatedOrder.files = [...(updatedOrder.files ?? []), ...files];
          break;
        case "floor":
          updatedOrder.floor = trimmed;
          break;
        case "elevator":
          updatedOrder.hasElevator = parseElevator(trimmed);
          break;
        case "parking":
          updatedOrder.parkingDistance = parseParking(trimmed);
          break;
        case "dismantling":
          updatedOrder.needsDismantling = parseDismantling(trimmed);
          break;
        case "heavy_items":
          updatedOrder.heavyItems = trimmed === "Não" ? [] : [trimmed];
          break;
        case "urgency":
          updatedOrder.urgency = parseUrgency(trimmed);
          break;
      }
    } else if (files && files.length > 0) {
      updatedOrder.files = [...(updatedOrder.files ?? []), ...files];
    }

    setOrder(updatedOrder);
    advanceChat(updatedOrder);
  };

  const handleContactSubmit = (data: {
    receiver: OrderData["receiver"];
    address: { formattedAddress?: string; city?: string; postalCode?: string; lat?: number; lng?: number; placeId?: string };
    addressText: string;
    distanceFromBase?: DistanceFromBase;
    distanceStatus?: DistanceStatus;
  }) => {
    const updatedOrder: OrderData = {
      ...order,
      receiver: data.receiver,
      address: data.address,
      addressStatus: "selected",
      city: data.address.city ?? order.city,
      locationZone: detectZone(data.address.city ?? order.city),
      distanceFromBase: data.distanceFromBase,
      distanceStatus: data.distanceStatus ?? "idle",
    };
    setOrder(updatedOrder);

    const summaryParts = [
      `Contacto: ${data.receiver?.name}, ${data.receiver?.phone}`,
      data.receiver?.email ? `E-mail: ${data.receiver.email}` : "",
      `Morada: ${data.addressText}`,
    ].filter(Boolean);

    if (data.distanceStatus === "calculated" && data.distanceFromBase?.distanceKm) {
      summaryParts.push(
        `Distância: ${data.distanceFromBase.distanceKm} km da base CLYON, aproximadamente ${data.distanceFromBase.durationText} de viagem.`
      );
    }

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: summaryParts.join(". "),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    if (data.distanceStatus === "calculated" && data.distanceFromBase?.distanceKm) {
      setTimeout(() => {
        addAssistantMessage(
          `Distância calculada: ${data.distanceFromBase!.distanceKm} km da base CLYON, aproximadamente ${data.distanceFromBase!.durationText} de viagem.`
        );
      }, 400);
    } else if (data.distanceStatus === "error") {
      setTimeout(() => {
        addAssistantMessage(
          "Não consegui calcular a distância automaticamente. A equipa CLYON confirma manualmente."
        );
      }, 400);
    }

    setIsTyping(true);
    advanceChat(updatedOrder);
  };

  const handleGenerateEstimate = async () => {
    setEstimateLoading(true);
    setEstimate(null);
    try {
      const res = await fetch("/api/simulator/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (res.ok) {
        const data = await res.json();
        setEstimate(data);
      } else {
        setEstimate(calculateLocalEstimate(order));
      }
    } catch {
      setEstimate(calculateLocalEstimate(order));
    } finally {
      setEstimateLoading(false);
    }
  };

  const addressReady =
    order.addressStatus === "selected" ||
    order.addressStatus === "manual_confirmed" ||
    !!(order.address?.formattedAddress) ||
    !!order.city;

  const canGenerate =
    !!order.serviceType &&
    !!(order.description || (order.files && order.files.length > 0)) &&
    addressReady &&
    !!order.floor &&
    !!order.hasElevator &&
    !!order.parkingDistance &&
    !!order.receiver?.name &&
    !!order.receiver?.phone;

  const progressStep = getProgressStep(order);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserReply(input, pendingFiles.length > 0 ? pendingFiles : undefined);
    }
  };

  return (
    <div className="h-screen bg-[#F7FBFF] overflow-hidden flex flex-col">
      {/* Hero compacto */}
      <div className="bg-white border-b border-[#E2E8F0] flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.026 19.222A10.787 10.787 0 0012 21c2.695 0 5.17-.986 7.02-2.606" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[15px] font-bold text-[#102033]">Simulador de Preços</h1>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EFF8FF] text-[#0487D9] border border-[#BAE6FD]">
                    Estimativa sem compromisso
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] hidden sm:block">
                  Descreva o serviço, envie fotos e indique a morada. A CLYON calcula uma estimativa com base no preçário.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ProgressSteps currentStep={progressStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-3">
          <div className="h-full flex flex-col lg:flex-row gap-3">

            {/* Coluna chat */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">

                {/* Cabeçalho do chat */}
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
                    title="Começar novo pedido"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Novo pedido
                  </button>
                </div>

                {/* Área de mensagens */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4"
                >
                  {messages.map((msg, idx) => (
                    <div key={msg.id}>
                      <ChatMessageComponent message={msg} />
                      {msg.role === "assistant" && msg.quickReplies && idx === messages.length - 1 && !isTyping && (
                        <div className="ml-9 mt-1.5">
                          <QuickReplyChips options={msg.quickReplies} onSelect={(val) => handleUserReply(val)} />
                        </div>
                      )}
                      {msg.role === "assistant" && msg.showUpload && idx === messages.length - 1 && !isTyping && (
                        <div className="ml-9 mt-2">
                          <UploadDropzone
                            key={`upload-inline-${resetVersion}`}
                            files={pendingFiles}
                            onAdd={(f) => setPendingFiles((prev) => [...prev, ...f])}
                            onRemove={(id) => setPendingFiles((prev) => prev.filter((f) => f.id !== id))}
                          />
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

                {/* Input */}
                <div className="px-3 py-2.5 border-t border-[#F1F5F9] flex-shrink-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUpload((v) => !v)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] text-[#64748B] hover:border-[#0487D9] hover:text-[#0487D9] transition-colors bg-white"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Adicionar fotos ou vídeos
                      <span className="text-[#94A3B8]">até 10MB</span>
                    </button>
                    {pendingFiles.length > 0 && (
                      <span className="text-[11px] text-[#0487D9] font-medium">
                        {pendingFiles.length} {pendingFiles.length === 1 ? "ficheiro" : "ficheiros"}
                      </span>
                    )}
                  </div>

                  {showUpload && (
                    <UploadDropzone
                      key={`upload-bar-${resetVersion}`}
                      files={pendingFiles}
                      onAdd={(f) => setPendingFiles((prev) => [...prev, ...f])}
                      onRemove={(id) => setPendingFiles((prev) => prev.filter((f) => f.id !== id))}
                    />
                  )}

                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Descreva o que precisa recolher..."
                      rows={1}
                      className="flex-1 resize-none rounded-xl border border-[#E2E8F0] px-3 py-2 text-[13px] text-[#102033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]/30 focus:border-[#0487D9] transition-colors bg-white leading-relaxed"
                      style={{ maxHeight: "100px" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleUserReply(input, pendingFiles.length > 0 ? pendingFiles : undefined)}
                      disabled={!input.trim() && pendingFiles.length === 0}
                      className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#0487D9] hover:bg-[#036BB0] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna lateral */}
            <div className="lg:w-[340px] flex-shrink-0 min-h-0 overflow-y-auto space-y-3 pb-3">
              <OrderSummaryCard
                key={`summary-${resetVersion}`}
                order={order}
              />
              <EstimateCard
                key={`estimate-${resetVersion}`}
                estimate={estimate}
                loading={estimateLoading}
                canGenerate={canGenerate}
                onGenerate={handleGenerateEstimate}
                onReset={() => setShowResetConfirm(true)}
                order={order}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Modal de confirmação */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E2E8F0] text-[13px] font-medium text-[#64748B] hover:border-[#CBD5E1] hover:text-[#102033] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={resetSimulator}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-semibold transition-colors shadow-sm"
              >
                Sim, começar novo pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
