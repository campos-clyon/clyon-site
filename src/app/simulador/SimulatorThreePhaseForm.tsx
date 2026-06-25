"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  OrderData,
  UploadedFile,
  AddressData,
  DistanceFromBase,
  DistanceStatus,
  EstimateResult,
  AddressStatus,
} from "./types";
import AddressAutocomplete from "./components/AddressAutocomplete";
import OrderSummaryCard from "./components/OrderSummaryCard";
import ContactAccessForm from "./components/ContactAccessForm";
import AnalysisResultCard from "./components/AnalysisResultCard";
import ServiceTypeCards from "./components/ServiceTypeCards";
import EntulhoDetails from "./components/EntulhoDetails";
import CompactOrderDetails from "./components/CompactOrderDetails";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

const DRAFT_KEY = "clyon_simulator_draft";
const PHASES = ["Serviço", "Local e acesso", "Contacto e envio"] as const;

interface FormState extends OrderData {
  distanceFromBase?: DistanceFromBase;
  distanceStatus?: DistanceStatus;
  addressStatus?: AddressStatus;
}

export default function SimulatorThreePhaseForm() {
  const [phase, setPhase] = useState(1);
  const [formData, setFormData] = useState<FormState>({});
  const [analysis, setAnalysis] = useState<EstimateResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<number | null>(null);
  const [successAssignedTo, setSuccessAssignedTo] = useState<{ id: number; name: string } | null>(null);
  const [addressValue, setAddressValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Limpar localStorage ao inicializar (F5 sempre reseta)
  useEffect(() => {
    try {
      // Sempre limpar localStorage ao montar (F5 reseta o formulário)
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem("clyon_simulator_form_draft");
      console.log("[v0] SimulatorThreePhaseForm: ✓ Formulário zerado (F5 = reset)");
    } catch (e) {
      console.error("[v0] SimulatorThreePhaseForm: ❌ Erro ao limpar localStorage", e);
    }
  }, []);

  // Salvar draft no localStorage
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressSelect = (data: AddressData) => {
    updateField("address", data);
    updateField("addressStatus", "selected");
    setAddressValue(data.formattedAddress || "");
  };

  const handleDistanceCalculated = (distance: DistanceFromBase, status: DistanceStatus) => {
    updateField("distanceFromBase", distance);
    updateField("distanceStatus", status);
  };

  const isPhase1Valid = () => {
    // Deve ter serviço selecionado
    if (!formData.serviceType) return false;

    // Para entulho: precisa de estado + quantidade
    if (formData.serviceType === "recolha_entulho") {
      const hasEntulhoData = formData.entulhoState && formData.entulhoQuantidade;
      if (!hasEntulhoData) return false;
      // Para entulho: tem dados suficientes (campo de descrição agora é opcional)
      return true;
    }

    // Para outros serviços: precisa de PELO MENOS UMA DAS:
    // 1. Descrição preenchida
    // 2. Fotos/vídeos adicionados
    const hasDescription = !!formData.description?.trim();
    const hasFiles = (formData.files || []).length > 0;

    return hasDescription || hasFiles;
  };

  const isPhase2Valid = () => {
    // Se rés-do-chão, não precisa de elevador; caso contrário, é obrigatório
    const elevatorValid = formData.floor === "rés-do-chão" ? true : !!formData.hasElevator;
    return formData.address?.formattedAddress && formData.floor && elevatorValid && formData.parkingDistance;
  };

  const isPhase3Valid = () => {
    return formData.receiver?.name && formData.receiver?.phone && formData.urgency;
  };

  const canProceedToPhase2 = isPhase1Valid();
  const canProceedToPhase3 = isPhase2Valid();
  const canAnalyze = isPhase3Valid();

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log("[v0] SimulatorThreePhaseForm: Enviando para análise Gemini...", {
        serviceType: formData.serviceType,
        contactName: formData.receiver?.name,
        contactPhone: formData.receiver?.phone,
        description: formData.description?.substring(0, 50),
      });

      const res = await fetch("/api/simulator/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: formData }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao analisar pedido");
      }

      const result: EstimateResult = await res.json();
      console.log("[v0] SimulatorThreePhaseForm: ✓ Análise recebida -", {
        status: result.status,
        price: result.estimatedPriceWithVat,
      });

      setAnalysis(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao analisar pedido";
      console.error("[v0] SimulatorThreePhaseForm: ❌", message);
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!analysis || !isPhase3Valid()) {
      setError("Dados incompletos para enviar pedido");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("[v0] SimulatorThreePhaseForm: Enviando pedido para criação...", {
        contactName: formData.receiver?.name,
        contactPhone: formData.receiver?.phone,
        serviceType: formData.serviceType,
        analysisStatus: analysis?.status,
      });

      const payload = {
        order: formData,
        estimate: analysis,
        chatHistory: [],
      };
      console.log("[v0] SimulatorThreePhaseForm: Payload -", JSON.stringify(payload, null, 2).substring(0, 200));

      const res = await fetch("/api/simulador/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("[v0] SimulatorThreePhaseForm: API Error -", err);
        throw new Error(err.error || "Erro ao enviar pedido");
      }

      const result = await res.json();
      console.log("[v0] SimulatorThreePhaseForm: ✓ Pedido criado -", {
        id: result.id,
        status: result.status,
        assignedTo: result.assignedTo,
        assignedToId: result.assignedToId,
      });

      setSuccessOrderId(result.id);
      if (result.assignedToId && result.assignedTo) {
        setSuccessAssignedTo({ id: result.assignedToId, name: result.assignedTo });
      }
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao enviar pedido";
      console.error("[v0] SimulatorThreePhaseForm: ❌", message);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    console.log("[v0] SimulatorThreePhaseForm: Reset - limpando tudo");
    setFormData({});
    setAnalysis(null);
    setSuccessOrderId(null);
    setSuccessAssignedTo(null);
    setPhase(1);
    setAddressValue("");
    setError(null);
    
    // Limpar TODOS os localStorage keys (novos e antigos)
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem("clyon_simulator_form_draft");
    localStorage.removeItem("clyon_simulator_draft");
    
    // Limpar também qualquer outra chave do simulador antigo
    Object.keys(localStorage).forEach(key => {
      if (key.includes("simulador") || key.includes("simulator")) {
        localStorage.removeItem(key);
        console.log("[v0] SimulatorThreePhaseForm: Limpado localStorage key -", key);
      }
    });
  };

  // Success Screen
  if (successOrderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7FBFF] to-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Enviado com Sucesso!</h1>
            <p className="text-xl text-gray-600 mb-8">Pedido #{successOrderId}</p>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6 mb-8">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Próximos Passos</h2>
                <p className="text-gray-600">
                  A equipa CLYON irá analisar o pedido e entrar em contacto em breve para confirmar os detalhes e disponibilidade.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Número de pedido:</strong> #{successOrderId}
                </p>
                {successAssignedTo && (
                  <p className="text-sm text-blue-800 mt-2">
                    <strong>Assistente responsável:</strong> {successAssignedTo.name}
                  </p>
                )}
                <p className="text-sm text-blue-800 mt-2">
                  Guarde este número para referência futura. Será contactado pelo telefone ou email fornecido.
                </p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2.7 px-7.2 rounded-xl transition-colors inline-block text-sm"
            >
              Novo Pedido
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FBFF] to-white py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {PHASES.map((phaseName, idx) => {
            const phaseNum = idx + 1;
            const isActive = phaseNum === phase;
            const isCompleted = phaseNum < phase || (phaseNum === 1 && isPhase1Valid()) || (phaseNum === 2 && isPhase2Valid()) || (phaseNum === 3 && isPhase3Valid());

            return (
              <div key={phaseNum} className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    isActive
                      ? "bg-cyan-600 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted && phaseNum < phase ? "✓" : phaseNum}
                </div>
                <div className="mx-2 text-center">
                  <p className="text-sm text-gray-600">{phaseName}</p>
                </div>
                {idx < PHASES.length - 1 && (
                  <div className={`w-12 h-1 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Content - 2 Columns on Desktop, 1 on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section - 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              {/* Phase 1: Service */}
              {phase === 1 && (
                <Phase1Service
                  formData={formData}
                  updateField={updateField}
                />
              )}

              {/* Phase 2: Location & Access */}
              {phase === 2 && (
                <Phase2Location
                  formData={formData}
                  addressValue={addressValue}
                  setAddressValue={setAddressValue}
                  onAddressSelect={handleAddressSelect}
                  onDistanceCalculated={handleDistanceCalculated}
                  updateField={updateField}
                />
              )}

              {/* Phase 3: Contact & Review */}
              {phase === 3 && !analysis && (
                <Phase3Contact
                  formData={formData}
                  updateField={updateField}
                />
              )}

              {/* Analysis Result */}
              {phase === 3 && analysis && (
                <AnalysisResultCard
                  analysis={analysis}
                  isLoading={isAnalyzing}
                  onConfirm={handleSubmitOrder}
                  isSubmitting={isSubmitting}
                />
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              {phase < 3 || !analysis ? (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  {phase > 1 && (
                    <button
                      onClick={() => setPhase(phase - 1)}
                      className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                  )}

                  {phase < 3 && (
                    <button
                      onClick={() => setPhase(phase + 1)}
                      disabled={!canProceedToPhase2 || (phase === 2 && !canProceedToPhase3)}
                      className="ml-auto flex items-center gap-2 px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-gray-300 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95"
                    >
                      Seguinte
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  {phase === 3 && !analysis && (
                    <button
                      onClick={handleAnalyze}
                      disabled={!canAnalyze || isAnalyzing}
                      className="ml-auto flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
                    >
                      {isAnalyzing ? "A analisar..." : "Analisar pedido"}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Summary Sidebar - 1 column on desktop */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummaryCard
                order={formData}
                onEdit={() => setPhase(1)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Phase 1 Component
function Phase1Service({
  formData,
  updateField,
}: {
  formData: FormState;
  updateField: (field: string, value: unknown) => void;
}) {
  const services = [
    { id: "recolha_moveis" as const, label: "Recolha de móveis", icon: "🛋️" },
    { id: "recolha_monos" as const, label: "Recolha de monos", icon: "📦" },
    { id: "recolha_entulho" as const, label: "Recolha de entulho", icon: "🏗️" },
    { id: "esvaziamento_casa" as const, label: "Esvaziamento de casa", icon: "🏠" },
    { id: "esvaziamento_apartamento" as const, label: "Esvaziamento de apartamento", icon: "🏢" },
    { id: "mudanca" as const, label: "Mudança", icon: "🚚" },
    { id: "outro" as const, label: "Outro serviço", icon: "⭐" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Que serviço precisa?
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Escolha o tipo de serviço e adicione detalhes para análise.
        </p>
      </div>

      {/* Service Cards */}
      <ServiceTypeCards
        services={services}
        selected={formData.serviceType}
        onSelect={(serviceType) => updateField("serviceType", serviceType)}
      />

      {/* Entulho Details (conditional) */}
      {formData.serviceType === "recolha_entulho" && (
        <EntulhoDetails
          state={formData.entulhoState}
          quantity={formData.entulhoQuantidade}
          onStateChange={(state) => updateField("entulhoState", state)}
          onQuantityChange={(quantity) => updateField("entulhoQuantidade", quantity)}
        />
      )}

      {/* Order Details with integrated upload */}
      <CompactOrderDetails
        description={formData.description}
        files={formData.files || []}
        onDescriptionChange={(description) => updateField("description", description)}
        onFilesAdd={(files) => updateField("files", [...(formData.files || []), ...files])}
        onFileRemove={(id) => updateField("files", (formData.files || []).filter(f => f.id !== id))}
        maxFiles={10}
        maxSizeMB={50}
      />
    </div>
  );
}

// Phase 2 Component
function Phase2Location({
  formData,
  addressValue,
  setAddressValue,
  onAddressSelect,
  onDistanceCalculated,
  updateField,
}: {
  formData: FormState;
  addressValue: string;
  setAddressValue: (value: string) => void;
  onAddressSelect: (data: AddressData) => void;
  onDistanceCalculated: (distance: DistanceFromBase, status: DistanceStatus) => void;
  updateField: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Morada e condições de acesso</h2>

      <AddressAutocomplete
        value={addressValue}
        onChange={setAddressValue}
        onSelect={onAddressSelect}
        onDistanceCalculated={onDistanceCalculated}
        placeholder="Escreva a rua, número e localidade..."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Andar *</label>
          <select
            value={formData.floor || ""}
            onChange={(e) => {
              const newFloor = e.target.value;
              updateField("floor", newFloor);
              // Se rés-do-chão, resetar elevador (não é relevante)
              if (newFloor === "rés-do-chão") {
                updateField("hasElevator", "");
              }
            }}
            className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 shadow-sm"
          >
            <option value="">Seleccione...</option>
            <option value="rés-do-chão">Rés-do-chão</option>
            <option value="1º">1º Andar</option>
            <option value="2º">2º Andar</option>
            <option value="3º">3º Andar</option>
            <option value="4º+">4º Andar ou superior</option>
          </select>
        </div>

        {formData.floor !== "rés-do-chão" && formData.floor && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-900">Elevador *</label>
            <select
              value={formData.hasElevator || ""}
              onChange={(e) => updateField("hasElevator", e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 shadow-sm"
            >
              <option value="">Seleccione...</option>
              <option value="yes">Sim, funciona</option>
              <option value="small">Sim, mas é pequeno</option>
              <option value="no">Não tem</option>
              <option value="unknown">Não sei</option>
            </select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">Estacionamento *</label>
        <select
          value={formData.parkingDistance || ""}
          onChange={(e) => updateField("parkingDistance", e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 shadow-sm"
        >
          <option value="">Seleccione...</option>
          <option value="door">Sim, mesmo à porta</option>
          <option value="under_20m">Sim, até 20 metros</option>
          <option value="over_30m">Mais de 30 metros</option>
          <option value="difficult">Estacionamento difícil</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!formData.needsDismantling && formData.needsDismantling !== "no"}
            onChange={(e) => updateField("needsDismantling", e.target.checked ? "simple" : "no")}
            className="rounded border-gray-400"
          />
          <span className="text-sm text-gray-700">Acesso difícil ou desmontagem necessária</span>
        </label>
      </div>
    </div>
  );
}

// Phase 3 Component
function Phase3Contact({
  formData,
  updateField,
}: {
  formData: FormState;
  updateField: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Contacto e revisão</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Nome completo *</label>
          <input
            type="text"
            value={formData.receiver?.name || ""}
            onChange={(e) => updateField("receiver", { ...formData.receiver, name: e.target.value })}
            placeholder="Ex: Eugênia Almeida"
            className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">Telefone *</label>
          <input
            type="tel"
            value={formData.receiver?.phone || ""}
            onChange={(e) => updateField("receiver", { ...formData.receiver, phone: e.target.value })}
            placeholder="Ex: 911 128 863"
            className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">Email (opcional)</label>
        <input
          type="email"
          value={formData.receiver?.email || ""}
          onChange={(e) => updateField("receiver", { ...formData.receiver, email: e.target.value })}
          placeholder="Ex: exemplo@email.com"
          className="w-full px-4 py-2 border-2 border-gray-400 bg-white rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600 shadow-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">Quando precisa do serviço? *</label>
        <select
          value={formData.urgency || ""}
          onChange={(e) => updateField("urgency", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-transparent"
        >
          <option value="">Seleccione...</option>
          <option value="today">Hoje</option>
          <option value="tomorrow">Amanhã</option>
          <option value="this_week">Esta semana</option>
          <option value="flexible">Flexível</option>
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Nota:</strong> Após enviar o pedido, a equipa CLYON irá analisar os dados e entrar em contacto através do telefone ou email fornecido.
        </p>
      </div>
    </div>
  );
}
