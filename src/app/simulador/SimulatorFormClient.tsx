"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Upload, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import SimulatorReviewCard from "./components/SimulatorReviewCard";
import SimulatorSuccessCard from "./components/SimulatorSuccessCard";

interface FormData {
  serviceType: string;
  description: string;
  volume: string;
  heavyItems: string[];
  needsDismantling: string;
  files: File[];
  address: {
    formattedAddress: string;
    city: string;
    postalCode: string;
    lat?: number;
    lng?: number;
    placeId?: string;
  };
  distanceFromBase?: {
    distanceKm?: number;
    durationText?: string;
    distanceMeters?: number;
    durationSeconds?: number;
  };
  floor: string;
  hasElevator: string;
  parkingDistance: string;
  difficultAccess: string;
  accessNotes: string;
  urgency: string;
  preferredDate: string;
  preferredTime: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    contactPreference: string;
  };
}

interface AnalysisResult {
  ok: boolean;
  status: "estimated" | "needs_more_info" | "onsite_required";
  estimatedPriceWithoutVat: number | null;
  vatAmount: number | null;
  estimatedPriceWithVat: number | null;
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  summary: string;
  assumptions: string[];
  missingFields: string[];
  customerMessage: string;
  internalNotes: string[];
}

const SERVICES = [
  "Recolha de móveis",
  "Recolha de monos/volumosos",
  "Recolha de entulho",
  "Esvaziamento de casa",
  "Esvaziamento de apartamento",
  "Mudança",
  "Limpeza de arrecadação/garagem/cave",
  "Outro serviço",
];

const VOLUMES = [
  "Poucos objetos",
  "1/4 de carrinha",
  "1/2 carrinha",
  "3/4 de carrinha",
  "Carrinha cheia",
  "Mais de uma carrinha",
  "Não sei",
];

const HEAVY_ITEMS_OPTIONS = [
  "Sofá grande",
  "Roupeiro",
  "Frigorífico",
  "Máquina de lavar",
  "Entulho pesado",
  "Vasos/terra/pedra",
  "Outros",
];

const FLOORS = [
  "Rés-do-chão",
  "1.º andar",
  "2.º andar",
  "3.º andar",
  "4.º andar ou superior",
  "Cave",
  "Garagem",
  "Arrecadação",
  "Outro",
];

const ELEVATOR_OPTIONS = [
  "Sim, funciona",
  "Sim, mas é pequeno",
  "Não tem elevador",
  "Não sei",
];

const PARKING_OPTIONS = [
  "Sim, mesmo à porta",
  "Sim, até 20 metros",
  "Mais de 30 metros",
  "Estacionamento difícil",
  "Não sei",
];

const DISMANTLING_OPTIONS = [
  "Não",
  "Sim, simples",
  "Sim, média",
  "Sim, demorada",
  "Não sei",
];

const URGENCY_OPTIONS = [
  "Hoje",
  "Amanhã",
  "Esta semana",
  "Tenho flexibilidade",
];

const TIME_OPTIONS = [
  "Manhã",
  "Tarde",
  "Qualquer horário",
];

const CONTACT_PREFERENCE = [
  "Telefone",
  "WhatsApp",
  "E-mail",
  "Indiferente",
];

export default function SimulatorFormClient() {
  const [step, setStep] = useState<"form" | "review" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [form, setForm] = useState<FormData>({
    serviceType: "",
    description: "",
    volume: "",
    heavyItems: [],
    needsDismantling: "",
    files: [],
    address: {
      formattedAddress: "",
      city: "",
      postalCode: "",
    },
    floor: "",
    hasElevator: "",
    parkingDistance: "",
    difficultAccess: "",
    accessNotes: "",
    urgency: "",
    preferredDate: "",
    preferredTime: "",
    customer: {
      name: "",
      phone: "",
      email: "",
      contactPreference: "",
    },
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("clyon_simulator_form_draft");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        console.error("[v0] Failed to load form draft:", e);
      }
    }
  }, []);

  // Save draft to localStorage
  useEffect(() => {
    const toSave = { ...form };
    // Don't save files to localStorage (too large)
    (toSave as Partial<typeof form>).files = [];
    localStorage.setItem("clyon_simulator_form_draft", JSON.stringify(toSave));
  }, [form]);

  // Validation
  const missingFields = (): string[] => {
    const missing: string[] = [];
    if (!form.customer.name) missing.push("Nome");
    if (!form.customer.phone) missing.push("Telefone");
    if (!form.serviceType) missing.push("Tipo de serviço");
    if (!form.description && form.files.length === 0) missing.push("Descrição ou fotos");
    if (!form.address.formattedAddress) missing.push("Morada");
    if (!form.floor) missing.push("Andar");
    if (!form.hasElevator) missing.push("Elevador");
    if (!form.parkingDistance) missing.push("Distância de estacionamento");
    return missing;
  };

  const canSubmit = missingFields().length === 0;

  // Handle form submission for analysis
  const handleAnalyze = async () => {
    const missing = missingFields();
    if (missing.length > 0) {
      setError(`Faltam campos obrigatórios: ${missing.join(", ")}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("[v0] SimulatorFormClient: Submitting form for analysis");

      const res = await fetch("/api/simulator/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Análise falhou");
      }

      const result = (await res.json()) as AnalysisResult;
      console.log("[v0] SimulatorFormClient: ✓ Analysis result:", result.status);

      setAnalysisResult(result);
      localStorage.setItem("clyon_simulator_analysis_result", JSON.stringify(result));
      setStep("review");
    } catch (err: any) {
      console.error("[v0] SimulatorFormClient: ❌ Analysis error:", err);
      setError(err.message || "Erro ao analisar pedido");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      serviceType: "",
      description: "",
      volume: "",
      heavyItems: [],
      needsDismantling: "",
      files: [],
      address: {
        formattedAddress: "",
        city: "",
        postalCode: "",
      },
      floor: "",
      hasElevator: "",
      parkingDistance: "",
      difficultAccess: "",
      accessNotes: "",
      urgency: "",
      preferredDate: "",
      preferredTime: "",
      customer: {
        name: "",
        phone: "",
        email: "",
        contactPreference: "",
      },
    });
    setStep("form");
    setAnalysisResult(null);
    setOrderId(null);
    setError(null);
    localStorage.removeItem("clyon_simulator_form_draft");
    localStorage.removeItem("clyon_simulator_analysis_result");
  };

  // Form render
  if (step === "form") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#EFF8FF] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#102033] text-balance">
              Solicitar Recolha CLYON
            </h1>
            <p className="text-[#64748B] mt-3 leading-relaxed">
              Preencha os detalhes do seu pedido e a nossa equipa irá analisar o volume, acesso e complexidade para fornecer um orçamento preciso.
            </p>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Section 1: Service Type */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#102033] mb-4">Tipo de Serviço</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Que serviço precisa? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.serviceType}
                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione um serviço...</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Descrição do que precisa recolher <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Ex: sofá grande, cama com colchão, roupeiro pequeno, 20 sacos de entulho..."
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Volume aproximado
                  </label>
                  <select
                    value={form.volume}
                    onChange={(e) => setForm({ ...form, volume: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {VOLUMES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Existem objetos pesados?
                  </label>
                  <div className="space-y-2">
                    {HEAVY_ITEMS_OPTIONS.map((item) => (
                      <label key={item} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.heavyItems.includes(item)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                heavyItems: [...form.heavyItems, item],
                              });
                            } else {
                              setForm({
                                ...form,
                                heavyItems: form.heavyItems.filter((i) => i !== item),
                              });
                            }
                          }}
                          className="w-4 h-4 rounded border-[#CBD5E1]"
                        />
                        <span className="text-sm text-[#475569]">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Precisa de desmontagem?
                  </label>
                  <select
                    value={form.needsDismantling}
                    onChange={(e) => setForm({ ...form, needsDismantling: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {DISMANTLING_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Photos */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#102033] mb-4">Fotos e Vídeos</h2>
              <p className="text-sm text-[#64748B] mb-4">
                As fotos ajudam a calcular melhor o volume e evitar alterações no valor.
              </p>

              {form.files.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {form.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative bg-[#F1F5F9] rounded-lg p-2 flex items-center justify-between"
                    >
                      <span className="text-xs text-[#475569] truncate">{file.name}</span>
                      <button
                        onClick={() => {
                          setForm({
                            ...form,
                            files: form.files.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-[#94A3B8] hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-[#CBD5E1] rounded-lg cursor-pointer hover:border-[#0487D9] transition-colors">
                <Upload className="w-5 h-5 text-[#64748B]" />
                <span className="text-sm font-medium text-[#475569]">
                  Clique ou arraste arquivos ({form.files.length} ficheiros)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setForm({ ...form, files: [...form.files, ...files] });
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Section 3: Address */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#102033] mb-4">Localização</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Morada completa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.address.formattedAddress}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, formattedAddress: e.target.value },
                      })
                    }
                    placeholder="Rua, número, código postal, localidade"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  />
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Nota: integração com Google Places em desenvolvimento
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Localidade
                  </label>
                  <input
                    type="text"
                    value={form.address.city}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        address: { ...form.address, city: e.target.value },
                      })
                    }
                    placeholder="Ex: Lisboa, Almada, etc."
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Access */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#102033] mb-4">Acesso</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Em que andar está o material? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {FLOORS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Tem elevador? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.hasElevator}
                    onChange={(e) => setForm({ ...form, hasElevator: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {ELEVATOR_OPTIONS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Estacionamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.parkingDistance}
                    onChange={(e) => setForm({ ...form, parkingDistance: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {PARKING_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Acesso complicado?
                  </label>
                  <select
                    value={form.difficultAccess}
                    onChange={(e) => setForm({ ...form, difficultAccess: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Não</option>
                    <option value="Sim">Sim</option>
                    <option value="Não sei">Não sei</option>
                  </select>
                </div>

                {form.difficultAccess === "Sim" && (
                  <div>
                    <label className="block text-sm font-medium text-[#475569] mb-2">
                      Descreva as dificuldades
                    </label>
                    <textarea
                      value={form.accessNotes}
                      onChange={(e) => setForm({ ...form, accessNotes: e.target.value })}
                      placeholder="Ex: escadas estreitas, corredores difíceis, portas pequenas..."
                      className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Urgency */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#102033] mb-4">Urgência</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Quando precisa do serviço?
                  </label>
                  <select
                    value={form.urgency}
                    onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {URGENCY_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Horário preferido
                  </label>
                  <select
                    value={form.preferredTime}
                    onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 6: Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#102033] mb-4">Contacto</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.customer.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer: { ...form.customer, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={form.customer.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer: { ...form.customer, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={form.customer.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer: { ...form.customer, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#475569] mb-2">
                    Preferência de contacto
                  </label>
                  <select
                    value={form.customer.contactPreference}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customer: { ...form.customer, contactPreference: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#102033] focus:outline-none focus:ring-2 focus:ring-[#0487D9]"
                  >
                    <option value="">Seleccione...</option>
                    {CONTACT_PREFERENCE.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Missing fields warning */}
            {!canSubmit && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Campos obrigatórios em falta: {missingFields().join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleAnalyze}
              disabled={!canSubmit || loading}
              className="w-full py-3 px-4 rounded-lg bg-[#0487D9] hover:bg-[#036BB0] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A analisar pedido...
                </>
              ) : (
                "Analisar pedido"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review step
  if (step === "review" && analysisResult) {
    return (
      <SimulatorReviewCard
        form={form}
        analysis={analysisResult}
        onConfirm={async (savedOrderId) => {
          setOrderId(savedOrderId);
          setStep("success");
        }}
        onEdit={() => setStep("form")}
      />
    );
  }

  // Success step
  if (step === "success") {
    return (
      <SimulatorSuccessCard orderId={orderId} onNewOrder={handleReset} />
    );
  }

  return null;
}
