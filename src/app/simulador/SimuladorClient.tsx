"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  type LucideIcon,
  Loader2,
  MapPin,
  Package,
  Phone,
  Route,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_ADDRESS } from "@/lib/maps-config";
import { BUSINESS_PHONE } from "@/lib/seo-data";
import { createSimulatorSettingsMap } from "@/lib/simulator-settings";
import { cn } from "@/lib/utils";

type CategoriaId =
  | "entulho"
  | "moveis"
  | "monos"
  | "limpeza"
  | "mudancas"
  | "camiao";
type ModoCalculo = "entulho" | "moveis" | "mudancas";
type ModoTrajeto = "base" | "custom";

type Categoria = {
  id: CategoriaId;
  nome: string;
  descricao: string;
  icon: LucideIcon;
  calculo: ModoCalculo;
  trajeto: ModoTrajeto;
};

type ChoiceOption = { value: string; label: string };
type MapsPrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type SettingsResponse = {
  settings?: Array<{ key: string; value: string | number }>;
};

const categorias: Categoria[] = [
  { id: "entulho", nome: "Recolha de entulho", descricao: "Obras, resíduos e limpezas pesadas.", icon: Wrench, calculo: "entulho", trajeto: "base" },
  { id: "moveis", nome: "Recolha de móveis", descricao: "Móveis antigos e recheios.", icon: Package, calculo: "moveis", trajeto: "base" },
  { id: "monos", nome: "Recolha de monos", descricao: "Volumes grandes, sucata e despejos.", icon: Package, calculo: "moveis", trajeto: "base" },
  { id: "limpeza", nome: "Limpeza pós-obra", descricao: "Acabamento final e recolha associada.", icon: Sparkles, calculo: "entulho", trajeto: "base" },
  { id: "mudancas", nome: "Mudanças", descricao: "Origem e destino reais com cálculo automático.", icon: Truck, calculo: "mudancas", trajeto: "custom" },
  { id: "camiao", nome: "Camião com motorista", descricao: "Apoio logístico com base CLYON.", icon: Truck, calculo: "mudancas", trajeto: "base" },
];

const categoriaIds = new Set<CategoriaId>(["entulho", "moveis", "monos", "limpeza", "mudancas", "camiao"]);

type SimuladorClientProps = {
  initialCategoriaId?: CategoriaId | null;
};

export default function SimuladorClient({ initialCategoriaId = null }: SimuladorClientProps) {
  const summaryValueRef = useRef<HTMLDivElement | null>(null);
  const [pricingMap, setPricingMap] = useState(() => createSimulatorSettingsMap());
  const [categoriaId, setCategoriaId] = useState<CategoriaId | null>(initialCategoriaId);
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [km, setKm] = useState<number | null>(null);
  const [kmLoading, setKmLoading] = useState(false);
  const [kmErro, setKmErro] = useState("");

  const [tipoAcesso, setTipoAcesso] = useState("");
  const [quantidadePessoas, setQuantidadePessoas] = useState("");
  const [tempoEstimado, setTempoEstimado] = useState("");
  const [numeroAndares, setNumeroAndares] = useState("");
  const [temElevador, setTemElevador] = useState("");
  const [acessoDificil, setAcessoDificil] = useState(false);
  const [entulhoModo, setEntulhoModo] = useState("");
  const [quantidadeSacos, setQuantidadeSacos] = useState("");
  const [moveisModo, setMoveisModo] = useState("");
  const [cargas, setCargas] = useState("1");
  const [peq, setPeq] = useState("");
  const [med, setMed] = useState("");
  const [gra, setGra] = useState("");
  const [orcamento, setOrcamento] = useState<number | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [pessoasManual, setPessoasManual] = useState(false);
  const [highlightBudget, setHighlightBudget] = useState(false);

  const categoria = categorias.find((item) => item.id === categoriaId) ?? null;
  const origemValida = categoria?.trajeto === "base" || origem.trim().length >= 3;
  const destinoValido = destino.trim().length >= 3;
  const entulhoModoValido = categoria?.calculo !== "entulho" || Boolean(entulhoModo);
  const quantidadeSacosValida = categoria?.calculo !== "entulho" || Boolean(quantidadeSacos);
  const moveisModoValido = categoria?.calculo !== "moveis" || Boolean(moveisModo);
  const cargasValida = categoria?.calculo !== "moveis" || moveisModo !== "carga" || Boolean(cargas);
  const itensMoveisValidos =
    categoria?.calculo !== "moveis" ||
    moveisModo !== "item" ||
    Boolean(peq || med || gra);
  const acessoValido = Boolean(tipoAcesso);
  const pessoasValida = Boolean(quantidadePessoas);
  const tempoValido = Boolean(tempoEstimado);

  const step1Sequence = [
    ...(categoria?.trajeto === "custom" ? [{ id: "origem", done: origemValida }] : []),
    { id: "destino", done: destinoValido },
    ...(categoria?.calculo === "entulho"
      ? [
          { id: "entulhoModo", done: entulhoModoValido },
          { id: "quantidadeSacos", done: quantidadeSacosValida },
        ]
      : []),
  ];

  const step2Sequence = [
    ...(categoria?.calculo === "moveis" ? [{ id: "moveisModo", done: moveisModoValido }] : []),
    ...(categoria?.calculo === "moveis" && moveisModo === "carga"
      ? [{ id: "cargas", done: cargasValida }]
      : []),
    ...(categoria?.calculo === "moveis" && moveisModo === "item"
      ? [{ id: "itensMoveis", done: itensMoveisValidos }]
      : []),
    { id: "tipoAcesso", done: acessoValido },
    ...(tipoAcesso === "apartamento"
      ? [
          { id: "numeroAndares", done: Boolean(numeroAndares) },
          { id: "temElevador", done: Boolean(temElevador) },
        ]
      : []),
    { id: "quantidadePessoas", done: pessoasValida },
    { id: "tempoEstimado", done: tempoValido },
  ];

  const nextStep1Field = step1Sequence.find((item) => !item.done)?.id ?? null;
  const nextStep2Field = step2Sequence.find((item) => !item.done)?.id ?? null;

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const response = await fetch("/api/simulador/settings");
        if (!response.ok) return;
        const data = (await response.json()) as SettingsResponse;
        if (active) {
          setPricingMap(createSimulatorSettingsMap(data.settings));
        }
      } catch {
        // Mantem os valores locais se a API falhar.
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialCategoriaId || !categoriaIds.has(initialCategoriaId)) return;
    setCategoriaId((current) => (current === initialCategoriaId ? current : initialCategoriaId));
  }, [initialCategoriaId]);

  const resetFlow = () => {
    setOrigem("");
    setDestino("");
    setKm(null);
    setKmLoading(false);
    setKmErro("");
    setTipoAcesso("");
    setQuantidadePessoas("");
    setTempoEstimado("");
    setNumeroAndares("");
    setTemElevador("");
    setAcessoDificil(false);
    setEntulhoModo("");
    setQuantidadeSacos("");
    setMoveisModo("");
    setCargas("1");
    setPeq("");
    setMed("");
    setGra("");
    setOrcamento(null);
    setShowValidation(false);
    setPessoasManual(false);
  };

  useEffect(() => {
    setOrcamento(null);
  }, [
    tipoAcesso,
    quantidadePessoas,
    tempoEstimado,
    numeroAndares,
    temElevador,
    acessoDificil,
    entulhoModo,
    quantidadeSacos,
    moveisModo,
    cargas,
    peq,
    med,
    gra,
  ]);

  const escolherCategoria = (id: CategoriaId) => {
    resetFlow();
    setCategoriaId(id);
  };

  const atualizarOrigem = (value: string) => {
    setOrigem(value);
    setKm(null);
    setOrcamento(null);
    setKmErro("");
  };

  const atualizarDestino = (value: string) => {
    setDestino(value);
    setKm(null);
    setOrcamento(null);
    setKmErro("");
  };

  const calcularDistancia = async () => {
    const origin = categoria?.trajeto === "custom" ? origem.trim() : BASE_ADDRESS;
    const destination = destino.trim();
    if (!origin || !destination) {
      setShowValidation(true);
      setKmErro("Preencha a morada antes de calcular a distância.");
      return;
    }

    setKmLoading(true);
    setKmErro("");
    setOrcamento(null);

    try {
      const response = await fetch("/api/maps/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });
      const data = await response.json();

      if (!response.ok) {
        setKmErro(
          data?.error === "maps_unconfigured"
            ? "A chave Google Maps ainda não está configurada no servidor."
            : "Não foi possível calcular a distância agora.",
        );
        return;
      }

      setKm(Number(data.distanceKm ?? 0));
      if (categoria?.trajeto === "custom") {
        setOrigem(String(data.originAddress ?? origin));
      }
      setDestino(String(data.destinationAddress ?? destination));
    } catch {
      setKmErro("A distância não pôde ser calculada. Tente novamente.");
    } finally {
      setKmLoading(false);
    }
  };

  const calcularOrcamento = () => {
    if (!categoria || km === null) return;
    setShowValidation(true);

    const pessoas = Number(quantidadePessoas || 0);
    const horas = Number(tempoEstimado || 0);
    const andares = Number(numeroAndares || 0);
    const sacos = Number(quantidadeSacos || 0);
    const cargasNum = Number(cargas || 1);
    const pequeno = Number(peq || 0);
    const medio = Number(med || 0);
    const grande = Number(gra || 0);

    let adicionalAcesso = 0;
    if (tipoAcesso === "apartamento") {
      adicionalAcesso =
        temElevador === "sim"
          ? andares * pricingMap.apartamento_com_elevador_por_andar
          : andares * pricingMap.apartamento_sem_elevador_por_andar;
    }
    const adicionalDificil = acessoDificil ? pricingMap.acesso_dificil_extra : 0;
    let total = 0;

    if (categoria.calculo === "moveis") {
      if (moveisModo === "item") {
        total =
          pequeno * pricingMap.moveis_item_pequeno +
          medio * pricingMap.moveis_item_medio +
          grande * pricingMap.moveis_item_grande +
          km * pricingMap.moveis_distancia_km +
          adicionalAcesso +
          adicionalDificil;
        total *= pricingMap.entulho_multiplicador;
      } else {
        const base = (horas + pricingMap.moveis_carga_base) * (pessoas + 1) * pricingMap.hora_base;
        total =
          (base +
            km * pricingMap.moveis_distancia_km +
            adicionalAcesso +
            adicionalDificil +
            base * pricingMap.moveis_carga_multiplicador) *
          cargasNum;
      }
    }

    if (categoria.calculo === "entulho") {
      const material = entulhoModo === "chao" ? sacos * pricingMap.entulho_saco_chao_extra : sacos;
      total =
        (horas * pessoas * pricingMap.hora_base +
          material +
          km * pricingMap.entulho_distancia_km +
          adicionalAcesso +
          adicionalDificil) *
        pricingMap.entulho_multiplicador;
    }

    if (categoria.calculo === "mudancas") {
      total =
        (horas * pessoas * pricingMap.hora_base +
          km * pricingMap.mudancas_distancia_km +
          adicionalAcesso +
          adicionalDificil) *
        pricingMap.mudancas_multiplicador;
    }

    setOrcamento(Math.round(total * 100) / 100);
    setHighlightBudget(true);
  };

  useEffect(() => {
    if (!highlightBudget || orcamento === null) return;

    summaryValueRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightBudget, orcamento]);

  const podeCalcularDistancia =
    destino.trim().length > 0 && (categoria?.trajeto === "base" || origem.trim().length > 0);

  const podeCalcularOrcamento = (() => {
    if (!categoria || km === null || !tipoAcesso || !quantidadePessoas || !tempoEstimado) {
      return false;
    }
    if (tipoAcesso === "apartamento" && (!numeroAndares || !temElevador)) return false;
    if (categoria.calculo === "entulho") return Boolean(entulhoModo && quantidadeSacos);
    if (categoria.calculo === "moveis") {
      if (!moveisModo) return false;
      if (moveisModo === "carga") return Boolean(cargas);
      return Boolean(peq || med || gra);
    }
    return true;
  })();

  const confirmarPedido = () => {
    if (!categoria || km === null) return;
    setHighlightBudget(false);
    const linhas = [
      "Olá, quero solicitar este serviço com base no simulador.",
      "",
      `Serviço: ${categoria.nome}`,
      categoria.trajeto === "custom" ? `Origem: ${origem}` : "Origem: Base CLYON",
      `Destino: ${destino}`,
      `Distância: ${km.toFixed(1)} km`,
      `Tipo de acesso: ${tipoAcesso || "-"}`,
      tipoAcesso === "apartamento" ? `Andares: ${numeroAndares || "0"}` : null,
      tipoAcesso === "apartamento" ? `Elevador: ${temElevador || "-"}` : null,
      `Pessoas: ${quantidadePessoas || "-"}`,
      `Tempo estimado: ${tempoEstimado || "-"} h`,
      `Acesso difícil: ${acessoDificil ? "Sim" : "Não"}`,
      categoria.calculo === "entulho"
        ? `Condição: ${entulhoModo || "-"} | Sacos: ${quantidadeSacos || "0"}`
        : null,
      categoria.calculo === "moveis" && moveisModo === "carga"
        ? `Condição: por carga | Cargas: ${cargas || "1"}`
        : null,
      categoria.calculo === "moveis" && moveisModo === "item"
        ? `Condição: por item | Pequeno: ${peq || "0"} | Médio: ${med || "0"} | Grande: ${gra || "0"}`
        : null,
      `Valor simulado: EUR ${orcamento?.toFixed(2) ?? "-"}`,
      "",
      "Peço confirmação deste valor aproximado com um assistente.",
    ].filter(Boolean);

    const mensagem = encodeURIComponent(linhas.join("\n"));
    window.location.href = `https://wa.me/${BUSINESS_PHONE.replace(/\D/g, "")}?text=${mensagem}`;
  };

  if (!categoria) {
    return (
      <div className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_24%),linear-gradient(90deg,rgba(236,254,255,0.96)_0%,rgba(255,255,255,1)_55%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                  Simulador
                </div>
                <h1 className="mt-4 max-w-[18ch] text-[2.25rem] font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-[3.35rem]">
                  Calcule a distância antes do preço final.
                </h1>
                <p className="mt-4 max-w-2xl text-[0.98rem] leading-7 text-slate-600">
                  O cliente escreve a morada, recebe sugestões automáticas do Google
                  e só depois avança para o cálculo do valor final.
                </p>
              </div>
              <Card className="rounded-[30px] border border-cyan-100 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.2)]">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Fluxo novo
                </p>
                <ol className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                  <li>1. Escolher o serviço</li>
                  <li>2. Introduzir a morada com sugestões</li>
                  <li>3. Calcular distância</li>
                  <li>4. Gerar o valor final</li>
                </ol>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            {categorias.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => escolherCategoria(item.id)}
                className="group rounded-[28px] border border-cyan-100 bg-white p-5 text-left shadow-[0_20px_44px_-34px_rgba(14,116,144,0.22)] transition hover:-translate-y-0.5 hover:border-cyan-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.nome}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.descricao}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-cyan-50 text-cyan-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center rounded-full bg-cyan-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                  Simular agora
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_24%),linear-gradient(90deg,rgba(236,254,255,0.96)_0%,rgba(255,255,255,1)_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          <button
            onClick={() => {
              resetFlow();
              setCategoriaId(null);
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 transition hover:text-cyan-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos serviços
          </button>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                {categoria.nome}
              </div>
              <h1 className="mt-4 max-w-[16ch] text-[2.2rem] font-bold leading-[1.04] tracking-tight text-slate-950 sm:text-[3.15rem]">
                Introduza a morada e calcule a distância.
              </h1>
            </div>
            <Card className="rounded-[30px] border border-cyan-100 bg-white p-6 shadow-[0_24px_60px_-34px_rgba(14,116,144,0.2)]">
              <p className="text-sm leading-7 text-slate-600">
                {categoria.trajeto === "custom"
                  ? "Este serviço usa origem e destino reais."
                  : "Este serviço usa a base CLYON como origem e calcula a distância até à morada do cliente."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <Card className="rounded-[28px] border border-cyan-100 bg-white p-5 shadow-[0_20px_52px_-34px_rgba(14,116,144,0.18)]">
              <StepTitle number="1" title="Morada e distância" />
              <div className="mt-4 space-y-4">
                {categoria.trajeto === "custom" ? (
                  <AddressField
                    id="origem"
                    label="Morada de origem *"
                    value={origem}
                    onChange={atualizarOrigem}
                    placeholder="Ex: Rua da Paz, 123, Lisboa"
                    tone={getFieldTone({
                      isNext: nextStep1Field === "origem",
                      isMissing: showValidation && !origemValida,
                      hasError: Boolean(kmErro) && !origemValida,
                    })}
                  />
                ) : (
                  <div className="rounded-[20px] border border-cyan-100 bg-cyan-50/80 p-3.5 text-sm leading-7 text-slate-700">
                    A origem operacional é a base CLYON e é aplicada automaticamente.
                  </div>
                )}

                <AddressField
                  id="destino"
                  label={categoria.trajeto === "custom" ? "Morada de destino *" : "Morada do serviço *"}
                  value={destino}
                  onChange={atualizarDestino}
                  placeholder="Ex: Rua da Paz, 123, Lisboa"
                  tone={getFieldTone({
                    isNext: nextStep1Field === "destino",
                    isMissing: showValidation && !destinoValido,
                    hasError: Boolean(kmErro) && !destinoValido,
                  })}
                />

                {categoria.calculo === "entulho" ? (
                  <>
                    <Field>
                      <Label>O entulho está em sacos ou no chão? *</Label>
                      <ChoiceGrid
                        value={entulhoModo}
                        onChange={setEntulhoModo}
                        options={[
                          { value: "sacos", label: "Em sacos" },
                          { value: "chao", label: "No chão" },
                        ]}
                        tone={getFieldTone({
                          isNext: nextStep1Field === "entulhoModo",
                          isMissing: showValidation && !entulhoModoValido,
                        })}
                      />
                    </Field>
                    <CompactNumberInput
                      id="sacos"
                      label="Quantidade de sacos *"
                      value={quantidadeSacos}
                      onChange={setQuantidadeSacos}
                      placeholder="0"
                      maxWidthClass="w-24"
                      tone={getFieldTone({
                        isNext: nextStep1Field === "quantidadeSacos",
                        isMissing: showValidation && !quantidadeSacosValida,
                      })}
                    />
                  </>
                ) : null}

                <Button
                  type="button"
                  onClick={calcularDistancia}
                  disabled={!podeCalcularDistancia || kmLoading}
                  className="site-btn-primary w-full py-5 text-base"
                >
                  {kmLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Route className="mr-2 h-5 w-5" />}
                  Calcular distância
                </Button>

                {kmErro ? (
                  <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-900">
                    {kmErro}
                  </div>
                ) : null}

                {km !== null ? (
                  <div className="rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Distância calculada</p>
                    <p className="mt-2 text-[2.5rem] font-bold leading-none text-slate-950">{km.toFixed(1)} km</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Estes quilómetros serão usados no cálculo final.
                    </p>
                  </div>
                ) : null}
              </div>
            </Card>

            {km !== null ? (
              <Card className="rounded-[28px] border border-cyan-100 bg-white p-5 shadow-[0_20px_52px_-34px_rgba(14,116,144,0.18)]">
                <StepTitle number="2" title="Detalhes do serviço" />
                <div className="mt-4 space-y-4">
                  {categoria.calculo === "moveis" ? (
                    <>
                      <Field>
                      <Label>Como deseja calcular? *</Label>
                        <ChoiceGrid
                          value={moveisModo}
                          onChange={setMoveisModo}
                          options={[
                            { value: "carga", label: "Por carga" },
                            { value: "item", label: "Por item" },
                          ]}
                          tone={getFieldTone({
                            isNext: nextStep2Field === "moveisModo",
                            isMissing: showValidation && !moveisModoValido,
                          })}
                        />
                      </Field>
                      {moveisModo === "carga" ? (
                        <CompactNumberInput
                          id="cargas"
                          label="Quantas cargas? *"
                          value={cargas}
                          onChange={setCargas}
                          placeholder="1"
                          maxWidthClass="w-24"
                          tone={getFieldTone({
                            isNext: nextStep2Field === "cargas",
                            isMissing: showValidation && !cargasValida,
                          })}
                        />
                      ) : null}
                      {moveisModo === "item" ? (
                        <div className={cn(
                          "grid gap-4 rounded-[20px] border p-3 md:grid-cols-3",
                          fieldToneClass(
                            getFieldTone({
                              isNext: nextStep2Field === "itensMoveis",
                              isMissing: showValidation && !itensMoveisValidos,
                            }),
                          ),
                        )}>
                          <Field>
                          <Label htmlFor="peq">Móvel pequeno</Label>
                            <Input id="peq" type="number" min="0" value={peq} onChange={(event) => setPeq(event.target.value)} className="h-10 rounded-[14px] text-center" />
                          </Field>
                          <Field>
                          <Label htmlFor="med">Móvel médio</Label>
                            <Input id="med" type="number" min="0" value={med} onChange={(event) => setMed(event.target.value)} className="h-10 rounded-[14px] text-center" />
                          </Field>
                          <Field>
                          <Label htmlFor="gra">Móvel grande</Label>
                            <Input id="gra" type="number" min="0" value={gra} onChange={(event) => setGra(event.target.value)} className="h-10 rounded-[14px] text-center" />
                          </Field>
                        </div>
                      ) : null}
                    </>
                  ) : null}

                  <Field>
                    <Label>Tipo de acesso *</Label>
                    <ChoiceGrid
                      value={tipoAcesso}
                      onChange={setTipoAcesso}
                      options={[
                        { value: "apartamento", label: "Apartamento" },
                        { value: "casa", label: "Casa" },
                      ]}
                      tone={getFieldTone({
                        isNext: nextStep2Field === "tipoAcesso",
                        isMissing: showValidation && !acessoValido,
                      })}
                    />
                  </Field>

                  {tipoAcesso === "apartamento" ? (
                    <div className="grid gap-4 rounded-[22px] border border-cyan-100 bg-cyan-50/70 p-4 md:grid-cols-2">
                      <Field>
                        <Label htmlFor="andares">Número de andares *</Label>
                        <Input id="andares" type="number" min="0" value={numeroAndares} onChange={(event) => setNumeroAndares(event.target.value)} className={cn("h-10 w-24 rounded-[14px] text-center", fieldToneClass(getFieldTone({
                          isNext: nextStep2Field === "numeroAndares",
                          isMissing: showValidation && tipoAcesso === "apartamento" && !numeroAndares,
                        })))} />
                      </Field>
                      <Field>
                        <Label>Tem elevador? *</Label>
                        <ChoiceGrid value={temElevador} onChange={setTemElevador} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} tone={getFieldTone({
                          isNext: nextStep2Field === "temElevador",
                          isMissing: showValidation && tipoAcesso === "apartamento" && !temElevador,
                        })} compact />
                      </Field>
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <Field>
                      <PeopleSelector
                        value={quantidadePessoas}
                        onChange={setQuantidadePessoas}
                        manualMode={pessoasManual}
                        onManualModeChange={setPessoasManual}
                        tone={getFieldTone({
                          isNext: nextStep2Field === "quantidadePessoas",
                          isMissing: showValidation && !pessoasValida,
                        })}
                      />
                    </Field>
                    <CompactNumberInput
                      id="tempo"
                      label="Tempo estimado (horas) *"
                      value={tempoEstimado}
                      onChange={setTempoEstimado}
                      placeholder="2.5"
                      maxWidthClass="w-28"
                      tone={getFieldTone({
                        isNext: nextStep2Field === "tempoEstimado",
                        isMissing: showValidation && !tempoValido,
                      })}
                    />
                  </div>

                  <div className="flex items-center gap-3 rounded-[20px] border border-cyan-100 bg-cyan-50/70 p-4">
                    <Checkbox id="dificil" checked={acessoDificil} onCheckedChange={(checked) => setAcessoDificil(Boolean(checked))} />
                    <Label htmlFor="dificil" className="cursor-pointer font-medium leading-6">
                      O acesso é considerado difícil
                    </Label>
                  </div>

                  <Button
                    type="button"
                    onClick={calcularOrcamento}
                    disabled={!podeCalcularOrcamento}
                    className={cn(
                      "site-btn-primary w-full py-5 text-base",
                      podeCalcularOrcamento &&
                        "border border-cyan-300 shadow-[0_0_0_0_rgba(34,211,238,0.55)] animate-[budget-button-pulse_1.8s_ease-in-out_infinite]",
                    )}
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Calcular orçamento
                  </Button>
                </div>
              </Card>
            ) : <div className="hidden lg:block" />}
          </div>

          <Card className="mt-6 rounded-[28px] border border-slate-900 bg-[linear-gradient(160deg,#082f49_0%,#041c2d_100%)] p-5 text-white shadow-[0_28px_70px_-34px_rgba(2,132,199,0.4)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Resumo</p>
            <div className="mt-3 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <h2 className="text-[1.65rem] font-bold leading-tight">{categoria.nome}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{categoria.descricao}</p>
              </div>
              <div className="space-y-4">
                <style>{`
                  @keyframes budget-button-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34,211,238,0.18); }
                    50% { box-shadow: 0 0 0 8px rgba(34,211,238,0.06); }
                  }
                  @keyframes budget-card-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34,211,238,0.18); }
                    50% { box-shadow: 0 0 0 12px rgba(34,211,238,0.08); }
                  }
                  @keyframes whatsapp-cta-pulse {
                    0%, 100% {
                      box-shadow: 0 0 0 0 rgba(34,211,238,0.24), 0 16px 38px -24px rgba(34,211,238,0.72);
                      transform: translateY(0);
                    }
                    50% {
                      box-shadow: 0 0 0 10px rgba(34,211,238,0.08), 0 22px 44px -22px rgba(34,211,238,0.8);
                      transform: translateY(-1px);
                    }
                  }
                `}</style>
                <div
                  ref={summaryValueRef}
                  className={cn(
                    "rounded-[24px] border border-cyan-300/20 bg-cyan-400/10 p-5 transition duration-300",
                    highlightBudget &&
                      "border-cyan-300 shadow-[0_0_0_0_rgba(34,211,238,0.55)] animate-[budget-card-pulse_1.2s_ease-in-out_infinite]",
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    Valor simulado
                  </p>
                  <p className="mt-2 text-[2.2rem] font-bold leading-none text-white">
                    {orcamento !== null ? `EUR ${orcamento.toFixed(2)}` : "--"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cyan-50/85">
                    {orcamento !== null
                      ? "Estimativa pronta para envio."
                      : "Preencha os dados para ver o valor estimado."}
                  </p>
                </div>
                {orcamento !== null ? (
                  <>
                    <div className="rounded-[22px] border border-amber-200/35 bg-amber-50/10 px-4 py-3 text-sm leading-7 text-cyan-50">
                      Estes valores são aproximados e devem ser confirmados por um assistente.
                    </div>
                    <Button
                      type="button"
                      onClick={confirmarPedido}
                      className={cn(
                        "site-btn-primary w-full py-6 text-base",
                        highlightBudget &&
                          "border border-cyan-200/70 animate-[whatsapp-cta-pulse_1.2s_ease-in-out_infinite]",
                      )}
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Solicitar este serviço no WhatsApp
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
            <div className="mt-5 space-y-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
              {categoria.trajeto === "custom" ? (
                <SummaryRow icon={<MapPin className="h-4.5 w-4.5" />} label="Origem" value={origem || "Ainda não definida"} />
              ) : (
                <SummaryRow icon={<MapPin className="h-4.5 w-4.5" />} label="Origem" value="Base CLYON" />
              )}
              <SummaryRow icon={<MapPin className="h-4.5 w-4.5" />} label="Destino" value={destino || "Ainda não definido"} />
              <SummaryRow icon={<Route className="h-4.5 w-4.5" />} label="Distância" value={km !== null ? `${km.toFixed(1)} km` : "Calcule a distância"} />
              <SummaryRow
                icon={<Calculator className="h-4.5 w-4.5" />}
                label="Condições"
                value={[
                  tipoAcesso ? `Acesso: ${tipoAcesso}` : null,
                  quantidadePessoas ? `Pessoas: ${quantidadePessoas}` : null,
                  tempoEstimado ? `Tempo: ${tempoEstimado} h` : null,
                  acessoDificil ? "Acesso difícil" : null,
                ].filter(Boolean).join(" | ") || "Preencha os detalhes do serviço"}
              />
            </div>

            {orcamento !== null ? (
              <>
                <div className="hidden mt-5 rounded-[22px] border border-amber-200/35 bg-amber-50/10 px-4 py-3 text-sm leading-7 text-cyan-50">
                  Estes valores são aproximados e devem ser confirmados por um assistente.
                </div>
                <Button
                  type="button"
                  onClick={confirmarPedido}
                  className="site-btn-primary hidden mt-4 w-full py-6 text-base"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Solicitar este serviço no WhatsApp
                </Button>
              </>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-white/15 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                Calcule a distância e complete os detalhes para ver o valor final.
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2.5">{children}</div>;
}

type FieldTone = "default" | "next" | "warning" | "error";

function getFieldTone({
  isNext,
  isMissing,
  hasError,
}: {
  isNext?: boolean;
  isMissing?: boolean;
  hasError?: boolean;
}): FieldTone {
  if (hasError) return "error";
  if (isNext) return "next";
  if (isMissing) return "warning";
  return "default";
}

function fieldToneClass(tone: FieldTone) {
  if (tone === "error") {
    return "border-red-300 ring-4 ring-red-100";
  }
  if (tone === "warning") {
    return "border-amber-300 ring-4 ring-amber-100";
  }
  if (tone === "next") {
    return "border-cyan-300 ring-4 ring-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]";
  }
  return "border-cyan-100";
}

function StepTitle({ number, title }: { number: string; title: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-cyan-700">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white">
          {number}
        </span>
        Etapa {number}
      </div>
      <h2 className="mt-4 text-[1.55rem] font-bold leading-tight text-slate-950">{title}</h2>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="mt-0.5 text-cyan-200">{icon}</div>
      <div className="min-w-0">
        <p className="font-semibold text-cyan-100">{label}</p>
        <p className="mt-1 break-words leading-6 text-slate-300">{value}</p>
      </div>
    </div>
  );
}

function AddressField({
  id,
  label,
  value,
  onChange,
  placeholder,
  tone = "default",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  tone?: FieldTone;
}) {
  const [focused, setFocused] = useState(false);
  const [predictions, setPredictions] = useState<MapsPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = value.trim();
    if (!focused || query.length < 3) {
      setPredictions([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/maps/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: query }),
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          setError(
            data?.error === "maps_unconfigured"
            ? "A chave Google Maps ainda não está configurada."
            : "Não foi possível carregar sugestões.",
          );
          setPredictions([]);
          return;
        }
        setPredictions(Array.isArray(data.predictions) ? data.predictions : []);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return;
      setError("Não foi possível carregar sugestões.");
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    }, 260);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [focused, value]);

  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder={placeholder}
          autoComplete="street-address"
          className={cn("h-10 rounded-[14px] bg-white", fieldToneClass(tone))}
        />
        {loading ? (
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : null}
        {focused && predictions.length > 0 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[22px] border border-cyan-100 bg-white shadow-[0_24px_60px_-34px_rgba(14,116,144,0.3)]">
            {predictions.map((prediction) => (
              <button
                key={prediction.placeId}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(prediction.description);
                  setPredictions([]);
                  setFocused(false);
                }}
                className="flex w-full items-start gap-3 border-b border-cyan-50 px-4 py-3 text-left transition last:border-b-0 hover:bg-cyan-50"
              >
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">{prediction.mainText}</p>
                  <p className="text-sm leading-6 text-slate-500">
                    {prediction.secondaryText || prediction.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {value.trim().length > 0 && value.trim().length < 3 ? (
        <p className="text-xs leading-6 text-slate-500">
                    Escreva pelo menos 3 caracteres para ver sugestões do Google.
        </p>
      ) : null}
      {error ? <p className="text-xs leading-6 text-amber-700">{error}</p> : null}
    </Field>
  );
}

function ChoiceGrid({
  value,
  onChange,
  options,
  columns = 2,
  tone = "default",
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ChoiceOption[];
  columns?: 2 | 3;
  tone?: FieldTone;
  compact?: boolean;
}) {
  const gridClass =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2";

  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              compact
                ? "min-h-11 rounded-[16px] px-3 py-2 text-center text-sm"
                : "min-h-14 rounded-[22px] px-4 py-3 text-left text-sm",
              "border font-semibold transition",
              active
                ? "border-cyan-400 bg-cyan-500 text-white shadow-[0_16px_30px_-18px_rgba(6,182,212,0.7)]"
                : `${fieldToneClass(tone)} bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50`,
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CompactNumberInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxWidthClass = "w-28",
  tone = "default",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWidthClass?: string;
  tone?: FieldTone;
}) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn("h-10 rounded-[14px] text-center", maxWidthClass, fieldToneClass(tone))}
      />
    </Field>
  );
}

function PeopleSelector({
  value,
  onChange,
  manualMode,
  onManualModeChange,
  tone = "default",
}: {
  value: string;
  onChange: (value: string) => void;
  manualMode: boolean;
  onManualModeChange: (manual: boolean) => void;
  tone?: FieldTone;
}) {
  return (
    <div className="space-y-3">
      {manualMode ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="8"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="8"
            className={cn("h-10 w-24 rounded-[14px] text-center", fieldToneClass(tone))}
          />
          <button
            type="button"
            onClick={() => {
              onManualModeChange(false);
              onChange("");
            }}
            className="h-10 rounded-[14px] border border-cyan-100 px-3 text-sm font-semibold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            Voltar
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const active = value === String(num) && !manualMode;
            return (
              <button
                key={num}
                type="button"
                onClick={() => {
                  onManualModeChange(false);
                  onChange(String(num));
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[14px] border text-sm font-bold transition",
                  active
                    ? "border-cyan-400 bg-cyan-500 text-white shadow-[0_16px_30px_-18px_rgba(6,182,212,0.7)]"
                    : `${fieldToneClass(tone)} bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50`,
                )}
              >
                {num}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              onManualModeChange(true);
              onChange("");
            }}
            className={cn(
              "flex h-10 w-12 items-center justify-center rounded-[14px] border text-sm font-bold transition",
              `${fieldToneClass(tone)} bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50`,
            )}
          >
            8+
          </button>
        </div>
      )}
    </div>
  );
}
