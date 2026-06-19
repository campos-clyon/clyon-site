"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, EstimateResult, OrderData, UploadedFile } from "./types";
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

const STORAGE_KEY = "clyon_simulator_draft";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeAssistantMessage(content: string, extra?: Partial<ChatMessage>): ChatMessage {
  return { id: uid(), role: "assistant", content, timestamp: new Date(), ...extra };
}

export default function SimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<OrderData>({});
  const [input, setInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ReturnType<typeof getNextChatStep>>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Inicializar chat com primeira mensagem
  useEffect(() => {
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        const { order: savedOrder } = JSON.parse(draft);
        setOrder(savedOrder ?? {});
      } catch {
        // ignorar draft inválido
      }
    }

    const firstStep = getNextChatStep({});
    const firstMsg = makeAssistantMessage(firstStep?.question ?? "Qual é o tipo de serviço que precisa?", {
      quickReplies: firstStep?.quickReplies,
    });
    setMessages([firstMsg]);
    setCurrentStep(firstStep);
  }, []);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Guardar rascunho
  useEffect(() => {
    if (Object.keys(order).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ order }));
    }
  }, [order]);

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

    // Actualizar order com base no step actual
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
      // Upload adicional
      updatedOrder.files = [...(updatedOrder.files ?? []), ...files];
    }

    setOrder(updatedOrder);
    advanceChat(updatedOrder);
  };

  const handleContactSubmit = (data: {
    receiver: OrderData["receiver"];
    address: { formattedAddress?: string; city?: string; postalCode?: string; lat?: number; lng?: number; placeId?: string };
    addressText: string;
  }) => {
    const updatedOrder: OrderData = {
      ...order,
      receiver: data.receiver,
      address: data.address,
      city: data.address.city ?? order.city,
      locationZone: detectZone(data.address.city ?? order.city),
    };
    setOrder(updatedOrder);

    const summary = [
      `Contacto: ${data.receiver?.name}, ${data.receiver?.phone}`,
      data.receiver?.email ? `E-mail: ${data.receiver.email}` : "",
      `Morada: ${data.addressText}`,
    ]
      .filter(Boolean)
      .join(". ");

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: summary,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    advanceChat(updatedOrder);
  };

  const handleGenerateEstimate = async () => {
    setEstimateLoading(true);
    setEstimate(null);

    // Tentar API com Gemini; se falhar usar cálculo local
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

  const canGenerate =
    !!order.serviceType &&
    !!(order.description || (order.files && order.files.length > 0)) &&
    !!(order.address?.formattedAddress || order.city) &&
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
    <div className="min-h-screen bg-[#F7FBFF]">
      {/* Hero */}
      <div className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center shadow-sm flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4.026 19.222A10.787 10.787 0 0012 21c2.695 0 5.17-.986 7.02-2.606l.1-.087A2.987 2.987 0 0020 17v-.5a2.5 2.5 0 00-2.5-2.5h-15A2.5 2.5 0 000 17v.5c0 .414.168.79.44 1.064" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-[#102033]">Simulador de Preços</h1>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#EFF8FF] text-[#0487D9] border border-[#BAE6FD]">
                    Estimativa sem compromisso
                  </span>
                </div>
                <p className="text-sm text-[#64748B] mt-0.5 max-w-xl">
                  Descreva o serviço, envie fotos e indique a morada. A CLYON calcula uma estimativa com base no preçário e nas condições de acesso.
                </p>
              </div>
            </div>
            <div className="sm:flex-shrink-0">
              <ProgressSteps currentStep={progressStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Coluna principal: Chat */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
              {/* Cabeçalho do chat */}
              <div className="px-5 py-4 border-b border-[#F1F5F9] flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#102033]">Orçamentista CLYON</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span className="text-xs text-[#64748B]">Online</span>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                {messages.map((msg, idx) => (
                  <div key={msg.id}>
                    <ChatMessageComponent message={msg} />
                    {/* Quick replies na última mensagem do assistente */}
                    {msg.role === "assistant" &&
                      msg.quickReplies &&
                      idx === messages.length - 1 &&
                      !isTyping && (
                        <div className="ml-11 mt-2">
                          <QuickReplyChips
                            options={msg.quickReplies}
                            onSelect={(val) => handleUserReply(val)}
                          />
                        </div>
                      )}
                    {/* Upload na última mensagem do assistente */}
                    {msg.role === "assistant" &&
                      msg.showUpload &&
                      idx === messages.length - 1 &&
                      !isTyping && (
                        <div className="ml-11 mt-3">
                          <UploadDropzone
                            files={pendingFiles}
                            onAdd={(f) => setPendingFiles((prev) => [...prev, ...f])}
                            onRemove={(id) => setPendingFiles((prev) => prev.filter((f) => f.id !== id))}
                          />
                        </div>
                      )}
                    {/* Formulário de contacto na última mensagem */}
                    {msg.role === "assistant" &&
                      msg.showContactForm &&
                      idx === messages.length - 1 &&
                      !isTyping && (
                        <div className="ml-11 mt-3">
                          <ContactAccessForm onSubmit={handleContactSubmit} />
                        </div>
                      )}
                  </div>
                ))}

                {/* Indicador de digitação */}
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0487D9] to-[#19C2E6] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">S</span>
                    </div>
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1 items-center h-5">
                        <div className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:0ms]" />
                        <div className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:150ms]" />
                        <div className="w-2 h-2 rounded-full bg-[#94A3B8] animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input fixo */}
              <div className="px-4 py-3 border-t border-[#F1F5F9] flex-shrink-0 space-y-2">
                {/* Botão upload rápido */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUpload((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs text-[#64748B] hover:border-[#0487D9] hover:text-[#0487D9] transition-colors bg-white"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Adicionar fotos ou vídeos
                    <span className="text-[#94A3B8]">até 10MB cada</span>
                  </button>
                  {pendingFiles.length > 0 && (
                    <span className="text-xs text-[#0487D9] font-medium">
                      {pendingFiles.length} {pendingFiles.length === 1 ? "ficheiro" : "ficheiros"} prontos
                    </span>
                  )}
                </div>

                {showUpload && (
                  <UploadDropzone
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
                    className="flex-1 resize-none rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm text-[#102033] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]/30 focus:border-[#0487D9] transition-colors bg-white leading-relaxed"
                    style={{ maxHeight: "120px" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleUserReply(input, pendingFiles.length > 0 ? pendingFiles : undefined)}
                    disabled={!input.trim() && pendingFiles.length === 0}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#0487D9] hover:bg-[#036BB0] disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita: Resumo + Estimativa */}
          <div className="lg:w-[360px] flex-shrink-0 space-y-4">
            <OrderSummaryCard order={order} />
            <EstimateCard
              estimate={estimate}
              loading={estimateLoading}
              canGenerate={canGenerate}
              onGenerate={handleGenerateEstimate}
              order={order}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
