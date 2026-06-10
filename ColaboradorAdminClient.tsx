"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Euro,
  Eye,
  EyeOff,
  History,
  ImagePlus,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Registro = {
  id: number;
  data: string;
  horaEntrada: string;
  horaPausa?: string | null;
  horaSaida?: string | null;
  numeroTrabalhos: number;
  horasTrabalhadas?: string;
  valorTotal?: string;
};

type PeriodoStats = {
  horas: string;
  valor: string;
  trabalhos: number;
  periodo?: string;
};

type Colaborador = {
  id: number;
  nome: string;
  funcao: "motorista" | "ajudante" | "admin";
  valorHora: string;
  isAdmin: number;
  createdAt?: string;
  registros: Registro[];
  estatisticas: {
    semana: PeriodoStats;
    ultimos15Dias: PeriodoStats;
    mes: PeriodoStats;
  };
};

type RegistroComColaborador = Registro & {
  colaboradorId: number;
  colaboradorNome: string;
  colaboradorValorHora: string;
};

type SimulatorSetting = {
  key: string;
  label: string;
  category: string;
  unit: string;
  value: string | number;
  description?: string | null;
};

type AdminSection = "overview" | "team" | "hours" | "site";

const functionOptions: Array<Colaborador["funcao"]> = ["admin", "motorista", "ajudante"];

const adminNavItems: Array<{
  id: AdminSection;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "overview", icon: LayoutDashboard },
  { id: "team", icon: Users },
  { id: "hours", icon: CalendarClock },
  { id: "site", icon: Settings2 },
];

const sectionLabels: Record<AdminSection, string> = {
  overview: "Início",
  team: "Equipa",
  hours: "Horários",
  site: "Configurações",
};

const siteModules = [
  {
    title: "Galeria de trabalhos",
    description:
      "Área preparada para gerir fotografias, capas, destaques e ordem visual dos trabalhos reais.",
    status: "Ativo",
    icon: ImagePlus,
  },
  {
    title: "Valores do simulador",
    description:
      "Estrutura pensada para ajustar preços, margens, regras de cálculo e cenários de orçamento.",
    status: "Ativo",
    icon: Euro,
  },
  {
    title: "Textos e campanhas",
    description:
      "Bloco futuro para atualizar mensagens da homepage, CTAs, prova social e campanhas sazonais.",
    status: "Planeado",
    icon: Sparkles,
  },
];

const simulatorDisplayGroups = [
  {
    id: "entulho",
    label: "Entulho",
    description: "Valores específicos para recolha de entulho.",
    keys: ["entulho_saco_chao_extra", "entulho_distancia_km", "entulho_multiplicador"],
  },
  {
    id: "monos",
    label: "Monos",
    description: "Valores partilhados para recolha de monos e volumes semelhantes.",
    keys: ["entulho_distancia_km", "entulho_multiplicador"],
  },
  {
    id: "pos_obra",
    label: "Pós-obra",
    description: "Valores partilhados para limpeza pós-obra e resíduos de obra.",
    keys: ["entulho_distancia_km", "entulho_multiplicador"],
  },
  {
    id: "moveis",
    label: "Móveis",
    description: "Valores ligados à recolha de móveis, volumes e cargas.",
    keys: [
      "moveis_item_pequeno",
      "moveis_item_medio",
      "moveis_item_grande",
      "moveis_distancia_km",
      "moveis_carga_base",
      "moveis_carga_multiplicador",
    ],
  },
  {
    id: "mudancas",
    label: "Mudanças",
    description: "Valores específicos para mudanças e transporte completo.",
    keys: ["mudancas_distancia_km", "mudancas_multiplicador"],
  },
  {
    id: "camiao",
    label: "Camião com motorista",
    description: "Valores partilhados com o serviço de mudanças e transporte simples.",
    keys: ["mudancas_distancia_km", "mudancas_multiplicador"],
  },
  {
    id: "acessos",
    label: "Acessos, andares e elevador",
    description: "Extras de acesso, andares, elevador e dificuldade operacional.",
    keys: [
      "apartamento_com_elevador_por_andar",
      "apartamento_sem_elevador_por_andar",
      "acesso_dificil_extra",
    ],
  },
  {
    id: "geral",
    label: "Base geral",
    description: "Base horária e referências comuns a todos os simuladores.",
    keys: ["hora_base"],
  },
] as const;

const money = (value: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

const decimal = (value: number) =>
  new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value?: string) => {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value?: string) => {
  if (!value) return "Sem data";
  const date = new Date(value);
  return `${formatDate(value)} | ${date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const formatDayName = (value?: string) => {
  if (!value) return "Sem dia";
  return new Intl.DateTimeFormat("pt-PT", { weekday: "long" }).format(new Date(value));
};

const getCurrentWeekRange = () => {
  const today = new Date();
  const start = new Date(today);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Semana operacional CLYON: começa sempre segunda 00:00 e termina domingo 23:59.
// O offset permite navegar entre semanas (0 = atual, -1 = anterior).
const getWeekRange = (offset = 0) => {
  const today = new Date();
  const start = new Date(today);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday + offset * 7);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const WEEK_DAY_LABELS = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

const getCurrentMonthRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const isBetweenDates = (value: string, start: Date, end: Date) => {
  const date = new Date(value);
  return date >= start && date <= end;
};

const isSameDay = (value: string, reference: Date) => {
  const date = new Date(value);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
};

// Estado derivado do registo (não há campo dedicado na BD, por isso é calculado).
// incompleto: falta hora de saída | alerta: horas anómalas | validado: registo fechado normal.
const HIGH_HOURS_THRESHOLD = 16;

type RecordStatus = "incompleto" | "alerta" | "validado";

const getRecordStatus = (registro: Registro): RecordStatus => {
  if (!registro.horaSaida) return "incompleto";
  if (parseFloat(registro.horasTrabalhadas || "0") > HIGH_HOURS_THRESHOLD) return "alerta";
  return "validado";
};

const formatShortDate = (value?: string) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit" }).format(new Date(value));
};

const formatSimulatorUnit = (unit: SimulatorSetting["unit"]) =>
  unit === "eur" ? "EUR" : "Multiplicador";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const formatRoleLabel = (role: Colaborador["funcao"]) => {
  if (role === "admin") return "Administrador";
  if (role === "motorista") return "Motorista";
  return "Ajudante";
};

export default function ColaboradorAdminClient() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [adminNome, setAdminNome] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [filtroColaborador, setFiltroColaborador] = useState("todos");
  const [weekOffset, setWeekOffset] = useState(0);
  const [funcaoFilter, setFuncaoFilter] = useState<"todas" | Colaborador["funcao"]>("todas");
  const [colaboradorDrawerId, setColaboradorDrawerId] = useState<number | null>(null);

  // Aba ativa da página Configurações
  const [settingsTab, setSettingsTab] = useState<
    "simulador" | "funcoes" | "imagens" | "seguranca" | "empresa"
  >("simulador");

  // Filtros da página Equipa
  const [teamSearch, setTeamSearch] = useState("");
  const [teamFuncao, setTeamFuncao] = useState<"todas" | Colaborador["funcao"]>("todas");
  const [teamStatus, setTeamStatus] = useState<"todos" | "ativo" | "inativo">("todos");

  // Filtros da página Horários
  const [hoursFuncao, setHoursFuncao] = useState<"todas" | Colaborador["funcao"]>("todas");
  const [hoursStatus, setHoursStatus] = useState<"todos" | "validado" | "pendente" | "incompleto">("todos");
  const [hoursPeriodo, setHoursPeriodo] = useState<"semana" | "anterior" | "personalizado">("semana");
  const [hoursDe, setHoursDe] = useState("");
  const [hoursAte, setHoursAte] = useState("");

  const [criarNovoVisivel, setCriarNovoVisivel] = useState(false);
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoValorHora, setNovoValorHora] = useState("");
  const [novoFuncao, setNovoFuncao] = useState<Colaborador["funcao"]>("ajudante");
  const [novoSenha, setNovoSenha] = useState("");
  const [novoIsAdmin, setNovoIsAdmin] = useState(false);
  const [mostrarSenhaNovoUsuario, setMostrarSenhaNovoUsuario] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editValorHora, setEditValorHora] = useState("");
  const [editFuncao, setEditFuncao] = useState<Colaborador["funcao"]>("ajudante");
  const [editSenha, setEditSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loadingEdicao, setLoadingEdicao] = useState(false);
  const [editandoRegistroId, setEditandoRegistroId] = useState<number | null>(null);
  const [registroForm, setRegistroForm] = useState({
    data: "",
    horaEntrada: "",
    horaPausa: "",
    horaSaida: "",
    numeroTrabalhos: "0",
    valorHora: "",
    valorTotal: "",
  });
  const [savingRegistro, setSavingRegistro] = useState(false);
  const [simulatorSettings, setSimulatorSettings] = useState<SimulatorSetting[]>([]);
  const [simulatorDrafts, setSimulatorDrafts] = useState<Record<string, string>>({});
  const [loadingSimulatorSettings, setLoadingSimulatorSettings] = useState(false);
  const [savingSettingKey, setSavingSettingKey] = useState<string | null>(null);

  useEffect(() => {
    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow";
    document.head.appendChild(metaRobots);

    const storedToken = localStorage.getItem("colaborador_token");
    const storedNome = localStorage.getItem("colaborador_nome");
    const storedIsAdmin = localStorage.getItem("colaborador_isAdmin");

    if (!storedToken) {
      router.push("/colaboradores");
      return;
    }

    if (storedIsAdmin !== "1") {
      router.push("/colaboradores/dashboard");
      return;
    }

    setToken(storedToken);
    setAdminNome(storedNome || "Administração");
    void carregarDados(storedToken);
    void carregarSimulatorSettings(storedToken);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, [router]);

  const carregarDados = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/colaboradores/admin/todos", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar os dados do painel.");
      }

      const data = await response.json();
      setColaboradores(Array.isArray(data) ? data : data.colaboradores || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados do painel.");
    } finally {
      setLoading(false);
    }
  };

  const carregarSimulatorSettings = async (authToken: string) => {
    try {
      setLoadingSimulatorSettings(true);
      const response = await fetch("/api/colaboradores/admin/settings/simulador", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error("Não foi possível carregar os valores do simulador.");
      }

      const data = await response.json();
      const settings = data.settings || [];
      setSimulatorSettings(settings);
      setSimulatorDrafts(
        Object.fromEntries(
          settings.map((item: SimulatorSetting) => [item.key, String(item.value ?? "")]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os valores do simulador.");
    } finally {
      setLoadingSimulatorSettings(false);
    }
  };

  const colaboradoresFiltrados = useMemo(() => {
    if (filtroColaborador === "todos") return colaboradores;
    return colaboradores.filter((colaborador) => colaborador.id === Number(filtroColaborador));
  }, [colaboradores, filtroColaborador]);

  const todosRegistros = useMemo<RegistroComColaborador[]>(
    () =>
      colaboradoresFiltrados
        .flatMap((colaborador) =>
          (colaborador.registros || []).map((registro) => ({
            ...registro,
            colaboradorId: colaborador.id,
            colaboradorNome: colaborador.nome,
            colaboradorValorHora: colaborador.valorHora,
          })),
        )
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [colaboradoresFiltrados],
  );

  const simulatorGroups = useMemo(() => {
    const settingsMap = new Map(simulatorSettings.map((setting) => [setting.key, setting]));

    return simulatorDisplayGroups.map((group) => ({
      id: group.id,
      label: group.label,
      description: group.description,
      settings: group.keys
        .map((key) => settingsMap.get(key))
        .filter((setting): setting is SimulatorSetting => Boolean(setting)),
    }));
  }, [simulatorSettings]);

  // ---- Núcleo operacional: semana selecionada (segunda -> domingo) ----
  const weekRange = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const weekLabel = useMemo(() => {
    const fmt = (date: Date) =>
      new Intl.DateTimeFormat("pt-PT", { weekday: "long", day: "2-digit", month: "2-digit" }).format(date);
    return `${fmt(weekRange.start)} até ${fmt(weekRange.end)}`;
  }, [weekRange]);

  const today = useMemo(() => new Date(), []);

  const hojeLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("pt-PT", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  // Colaboradores com registos na semana selecionada (respeitando filtro de função).
  const weekCollaborators = useMemo(() => {
    const base =
      funcaoFilter === "todas"
        ? colaboradores
        : colaboradores.filter((c) => c.funcao === funcaoFilter);

    return base
      .map((colaborador) => {
        const registrosSemana = (colaborador.registros || [])
          .filter((registro) => isBetweenDates(registro.data, weekRange.start, weekRange.end))
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

        const horas = registrosSemana.reduce((sum, r) => sum + parseFloat(r.horasTrabalhadas || "0"), 0);
        const valor = registrosSemana.reduce((sum, r) => sum + parseFloat(r.valorTotal || "0"), 0);
        const trabalhos = registrosSemana.reduce((sum, r) => sum + (r.numeroTrabalhos || 0), 0);
        const diasTrabalhados = new Set(
          registrosSemana.map((r) => new Date(r.data).toISOString().split("T")[0]),
        ).size;
        const ultimoDia = registrosSemana[0]?.data || "";
        const ativoHoje = registrosSemana.some((r) => isSameDay(r.data, today));
        const temPendencia = registrosSemana.some((r) => getRecordStatus(r) !== "validado");

        return {
          ...colaborador,
          registrosSemana,
          horas,
          valor,
          trabalhos,
          diasTrabalhados,
          ultimoDia,
          ativoHoje,
          temPendencia,
        };
      })
      .filter((c) => c.registrosSemana.length > 0)
      .sort((a, b) => b.horas - a.horas);
  }, [colaboradores, funcaoFilter, weekRange, today]);

  // Cards de topo da semana.
  const weekSummary = useMemo(() => {
    const totalHoras = weekCollaborators.reduce((sum, c) => sum + c.horas, 0);
    const totalValor = weekCollaborators.reduce((sum, c) => sum + c.valor, 0);
    const totalRegistos = weekCollaborators.reduce((sum, c) => sum + c.registrosSemana.length, 0);
    const pendentes = weekCollaborators.reduce(
      (sum, c) => sum + c.registrosSemana.filter((r) => getRecordStatus(r) !== "validado").length,
      0,
    );
    const ativosHoje = weekCollaborators.filter((c) => c.ativoHoje).length;

    return {
      colaboradores: weekCollaborators.length,
      totalHoras,
      totalValor,
      totalRegistos,
      pendentes,
      ativosHoje,
    };
  }, [weekCollaborators]);

  // Registos da semana com colaborador, ordenados (pendentes primeiro, depois recentes).
  const weekRecords = useMemo(() => {
    const rows = weekCollaborators.flatMap((colaborador) =>
      colaborador.registrosSemana.map((registro) => ({
        ...registro,
        colaboradorId: colaborador.id,
        colaboradorNome: colaborador.nome,
        colaboradorValorHora: colaborador.valorHora,
        status: getRecordStatus(registro),
      })),
    );

    return rows.sort((a, b) => {
      const aPend = a.status !== "validado" ? 0 : 1;
      const bPend = b.status !== "validado" ? 0 : 1;
      if (aPend !== bPend) return aPend - bPend;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
  }, [weekCollaborators]);

  // ---- Página Horários: registos filtrados por período/status/função ----
  const hoursRange = useMemo(() => {
    if (hoursPeriodo === "anterior") {
      const start = new Date(weekRange.start);
      start.setDate(start.getDate() - 7);
      const end = new Date(weekRange.end);
      end.setDate(end.getDate() - 7);
      return { start, end };
    }
    if (hoursPeriodo === "personalizado" && hoursDe && hoursAte) {
      const start = new Date(`${hoursDe}T00:00:00`);
      const end = new Date(`${hoursAte}T23:59:59`);
      return { start, end };
    }
    return weekRange;
  }, [hoursPeriodo, hoursDe, hoursAte, weekRange]);

  const hoursRecords = useMemo(() => {
    const funcaoById = new Map(colaboradores.map((c) => [c.id, c.funcao]));
    return colaboradores
      .flatMap((colaborador) =>
        (colaborador.registros || []).map((registro) => {
          const status = getRecordStatus(registro);
          return {
            ...registro,
            colaboradorId: colaborador.id,
            colaboradorNome: colaborador.nome,
            colaboradorValorHora: colaborador.valorHora,
            funcao: colaborador.funcao,
            status,
            statusLabel: (status === "incompleto"
              ? "incompleto"
              : status === "alerta"
                ? "pendente"
                : "validado") as "incompleto" | "pendente" | "validado",
          };
        }),
      )
      .filter((r) => isBetweenDates(r.data, hoursRange.start, hoursRange.end))
      .filter((r) => (filtroColaborador === "todos" ? true : r.colaboradorId === Number(filtroColaborador)))
      .filter((r) => (hoursFuncao === "todas" ? true : funcaoById.get(r.colaboradorId) === hoursFuncao))
      .filter((r) => {
        if (hoursStatus === "todos") return true;
        if (hoursStatus === "validado") return r.status === "validado";
        if (hoursStatus === "incompleto") return r.status === "incompleto";
        return r.status === "alerta"; // pendente
      })
      .sort((a, b) => {
        const aPend = a.status !== "validado" ? 0 : 1;
        const bPend = b.status !== "validado" ? 0 : 1;
        if (aPend !== bPend) return aPend - bPend;
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
  }, [colaboradores, hoursRange, filtroColaborador, hoursFuncao, hoursStatus]);

  const hoursSummary = useMemo(() => {
    const colaboradoresComRegisto = new Set(hoursRecords.map((r) => r.colaboradorId)).size;
    const totalHoras = hoursRecords.reduce((s, r) => s + parseFloat(r.horasTrabalhadas || "0"), 0);
    const totalValor = hoursRecords.reduce((s, r) => s + parseFloat(r.valorTotal || "0"), 0);
    const pendentes = hoursRecords.filter((r) => r.status === "alerta").length;
    const incompletos = hoursRecords.filter((r) => r.status === "incompleto").length;
    return {
      colaboradoresComRegisto,
      totalHoras,
      totalValor,
      pendentes,
      incompletos,
      mediaHoras: colaboradoresComRegisto > 0 ? totalHoras / colaboradoresComRegisto : 0,
    };
  }, [hoursRecords]);

  const hoursPeriodLabel = useMemo(() => {
    const fmt = (d: Date) =>
      d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
    return `${fmt(hoursRange.start)} a ${fmt(hoursRange.end)}`;
  }, [hoursRange]);

  // Pendências operacionais derivadas dos registos da semana.
  const pendencias = useMemo(() => {
    const semSaida: Array<{ id: number; nome: string; data: string }> = [];
    const horasAltas: Array<{ id: number; nome: string; data: string; horas: number }> = [];
    const naoValidados: number[] = [];

    weekCollaborators.forEach((colaborador) => {
      colaborador.registrosSemana.forEach((registro) => {
        if (!registro.horaSaida) {
          semSaida.push({ id: registro.id, nome: colaborador.nome, data: registro.data });
        } else if (parseFloat(registro.horasTrabalhadas || "0") > HIGH_HOURS_THRESHOLD) {
          horasAltas.push({
            id: registro.id,
            nome: colaborador.nome,
            data: registro.data,
            horas: parseFloat(registro.horasTrabalhadas || "0"),
          });
        }
        if (getRecordStatus(registro) !== "validado") naoValidados.push(registro.id);
      });
    });

    return { semSaida, horasAltas, totalNaoValidados: naoValidados.length };
  }, [weekCollaborators]);

  // Dados do colaborador aberto no drawer de histórico semanal.
  const drawerColaborador = useMemo(() => {
    if (colaboradorDrawerId === null) return null;
    return weekCollaborators.find((c) => c.id === colaboradorDrawerId) || null;
  }, [colaboradorDrawerId, weekCollaborators]);

  // Histórico dia-a-dia (segunda -> domingo) para o drawer.
  const drawerDias = useMemo(() => {
    if (!drawerColaborador) return [];
    return WEEK_DAY_LABELS.map((label, index) => {
      const dia = new Date(weekRange.start);
      dia.setDate(dia.getDate() + index);
      const registros = drawerColaborador.registrosSemana.filter((r) => isSameDay(r.data, dia));
      return { label, dia, registros };
    });
  }, [drawerColaborador, weekRange]);

  // ---- Página Equipa: dados derivados por colaborador (estado = atividade real) ----
  const teamRows = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return colaboradores.map((colaborador) => {
      const registros = colaborador.registros || [];
      const ultimoRegistro = [...registros].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
      )[0];

      const horasSemana = registros
        .filter((r) => isBetweenDates(r.data, weekRange.start, weekRange.end))
        .reduce((sum, r) => sum + parseFloat(r.horasTrabalhadas || "0"), 0);

      const horas30 = registros
        .filter((r) => new Date(r.data) >= thirtyDaysAgo)
        .reduce((sum, r) => sum + parseFloat(r.horasTrabalhadas || "0"), 0);

      const trabalhouSemana = horasSemana > 0;
      const ativoHoje = registros.some((r) => isSameDay(r.data, today));

      return {
        ...colaborador,
        ultimoRegistro,
        horasSemana,
        horas30,
        valorMes: parseFloat(colaborador.estatisticas?.mes?.valor || "0"),
        trabalhouSemana,
        ativoHoje,
        // "ativo" = trabalhou esta semana (estado derivado, sem campo na BD)
        estadoAtividade: (trabalhouSemana ? "ativo" : "inativo") as "ativo" | "inativo",
      };
    });
  }, [colaboradores, weekRange, today]);

  const teamRowsFiltered = useMemo(() => {
    const term = teamSearch.trim().toLowerCase();
    return teamRows
      .filter((row) => (term ? row.nome.toLowerCase().includes(term) : true))
      .filter((row) => (teamFuncao === "todas" ? true : row.funcao === teamFuncao))
      .filter((row) => (teamStatus === "todos" ? true : row.estadoAtividade === teamStatus))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [teamRows, teamSearch, teamFuncao, teamStatus]);

  const teamStats = useMemo(() => {
    return {
      total: colaboradores.length,
      ativos: teamRows.filter((r) => r.estadoAtividade === "ativo").length,
      inativos: teamRows.filter((r) => r.estadoAtividade === "inativo").length,
      motoristas: colaboradores.filter((c) => c.funcao === "motorista").length,
      ajudantes: colaboradores.filter((c) => c.funcao === "ajudante").length,
      admins: colaboradores.filter((c) => c.isAdmin === 1 || c.funcao === "admin").length,
    };
  }, [colaboradores, teamRows]);

  const sortCollaboratorsByHoursReport = <
    T extends {
      nome: string;
      relatorio: {
        semana: { horas: number; valor: number; trabalhos: number };
        mes: { horas: number; valor: number; trabalhos: number };
      };
    },
  >(
    reports: T[],
  ) =>
    [...reports].sort((a, b) => {
      const aWorked =
        a.relatorio.mes.trabalhos > 0 ||
        a.relatorio.mes.horas > 0 ||
        a.relatorio.semana.trabalhos > 0 ||
        a.relatorio.semana.horas > 0;
      const bWorked =
        b.relatorio.mes.trabalhos > 0 ||
        b.relatorio.mes.horas > 0 ||
        b.relatorio.semana.trabalhos > 0 ||
        b.relatorio.semana.horas > 0;

      if (aWorked !== bWorked) {
        return Number(bWorked) - Number(aWorked);
      }

      if (b.relatorio.mes.valor !== a.relatorio.mes.valor) {
        return b.relatorio.mes.valor - a.relatorio.mes.valor;
      }

      if (b.relatorio.semana.valor !== a.relatorio.semana.valor) {
        return b.relatorio.semana.valor - a.relatorio.semana.valor;
      }

      if (b.relatorio.mes.horas !== a.relatorio.mes.horas) {
        return b.relatorio.mes.horas - a.relatorio.mes.horas;
      }

      if (b.relatorio.semana.horas !== a.relatorio.semana.horas) {
        return b.relatorio.semana.horas - a.relatorio.semana.horas;
      }

      return a.nome.localeCompare(b.nome, "pt-PT");
    });

  const collaboratorHourReports = useMemo(() => {
    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();
    const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

    const buildPeriod = (records: Registro[]) => {
      const horas = records.reduce((sum, item) => sum + parseFloat(item.horasTrabalhadas || "0"), 0);
      const valor = records.reduce((sum, item) => sum + parseFloat(item.valorTotal || "0"), 0);
      const trabalhos = records.reduce((sum, item) => sum + (item.numeroTrabalhos || 0), 0);

      return {
        horas,
        valor,
        trabalhos,
      };
    };

    const reports = colaboradoresFiltrados.map((colaborador) => {
      const registros = [...(colaborador.registros || [])].sort(
        (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
      );
      const semanaRegistros = registros.filter((registro) => isBetweenDates(registro.data, weekStart, weekEnd));
      const mesRegistros = registros.filter((registro) => isBetweenDates(registro.data, monthStart, monthEnd));

      return {
        ...colaborador,
        relatorio: {
          semana: {
            ...buildPeriod(semanaRegistros),
            periodo: `${formatDate(weekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}`,
            historico: semanaRegistros,
          },
          mes: {
            ...buildPeriod(mesRegistros),
            periodo: new Intl.DateTimeFormat("pt-PT", {
              month: "long",
              year: "numeric",
            }).format(monthStart),
            historico: mesRegistros,
          },
        },
      };
    });

    return sortCollaboratorsByHoursReport(reports);
  }, [colaboradoresFiltrados]);

  const collaboratorHoursFilters = useMemo(() => {
    const { start: weekStart, end: weekEnd } = getCurrentWeekRange();
    const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

    const reports = colaboradores.map((colaborador) => {
      const registros = colaborador.registros || [];
      const semanaRegistros = registros.filter((registro) => isBetweenDates(registro.data, weekStart, weekEnd));
      const mesRegistros = registros.filter((registro) => isBetweenDates(registro.data, monthStart, monthEnd));

      const semanaHoras = semanaRegistros.reduce(
        (sum, item) => sum + parseFloat(item.horasTrabalhadas || "0"),
        0,
      );
      const semanaValor = semanaRegistros.reduce((sum, item) => sum + parseFloat(item.valorTotal || "0"), 0);
      const semanaTrabalhos = semanaRegistros.reduce((sum, item) => sum + (item.numeroTrabalhos || 0), 0);
      const mesHoras = mesRegistros.reduce((sum, item) => sum + parseFloat(item.horasTrabalhadas || "0"), 0);
      const mesValor = mesRegistros.reduce((sum, item) => sum + parseFloat(item.valorTotal || "0"), 0);
      const mesTrabalhos = mesRegistros.reduce((sum, item) => sum + (item.numeroTrabalhos || 0), 0);

      return {
        ...colaborador,
        relatorio: {
          semana: { horas: semanaHoras, valor: semanaValor, trabalhos: semanaTrabalhos },
          mes: { horas: mesHoras, valor: mesValor, trabalhos: mesTrabalhos },
        },
      };
    });

    return sortCollaboratorsByHoursReport(reports);
  }, [colaboradores]);

  const handleLogout = () => {
    localStorage.removeItem("colaborador_token");
    localStorage.removeItem("colaborador_nome");
    localStorage.removeItem("colaborador_id");
    localStorage.removeItem("colaborador_isAdmin");
    router.push("/colaboradores");
  };

  const abrirEdicao = (colaborador: Colaborador) => {
    setEditandoId(colaborador.id);
    setEditNome(colaborador.nome);
    setEditValorHora(String(colaborador.valorHora));
    setEditFuncao(colaborador.funcao);
    setEditSenha("");
    setMostrarSenha(false);
  };

  const editarUsuario = async (id: number) => {
    if (!editNome || !editValorHora) {
      setError("Preencha nome e valor/hora antes de guardar.");
      return;
    }

    setLoadingEdicao(true);
    try {
      const body: Record<string, unknown> = {
        nome: editNome.toUpperCase(),
        valorHora: parseFloat(editValorHora),
        funcao: editFuncao,
      };

      if (editSenha) body.senha = editSenha;

      const response = await fetch(`/api/colaboradores/${id}/editar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível atualizar o colaborador.");
      }

      setEditandoId(null);
      setEditSenha("");
      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o colaborador.");
    } finally {
      setLoadingEdicao(false);
    }
  };

  const deletarUsuario = async (id: number, nome: string) => {
    if (!confirm(`Tem a certeza de que deseja remover ${nome}?`)) return;

    try {
      const response = await fetch(`/api/colaboradores/${id}/deletar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível remover o colaborador.");
      }

      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover o colaborador.");
    }
  };

  const criarNovoColaborador = async () => {
    if (!novoNome || !novoValorHora || !novoSenha || !novoFuncao) {
      setError("Preencha todos os campos do novo colaborador.");
      return;
    }

    setLoadingCriar(true);
    try {
      const response = await fetch("/api/colaboradores/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: novoNome.toUpperCase(),
          senha: novoSenha,
          funcao: novoFuncao,
          valorHora: parseFloat(novoValorHora),
          isAdmin: novoIsAdmin ? 1 : 0,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível criar o colaborador.");
      }

      setCriarNovoVisivel(false);
      setNovoNome("");
      setNovoValorHora("");
      setNovoFuncao("ajudante");
      setNovoSenha("");
      setNovoIsAdmin(false);
      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o colaborador.");
    } finally {
      setLoadingCriar(false);
    }
  };

  const abrirEdicaoRegistro = (registro: RegistroComColaborador) => {
    setEditandoRegistroId(registro.id);
    setRegistroForm({
      data: registro.data ? new Date(registro.data).toISOString().split("T")[0] || "" : "",
      horaEntrada: registro.horaEntrada || "",
      horaPausa: registro.horaPausa || "",
      horaSaida: registro.horaSaida || "",
      numeroTrabalhos: String(registro.numeroTrabalhos || 0),
      valorHora: String(registro.colaboradorValorHora || ""),
      valorTotal: String(registro.valorTotal || ""),
    });
  };

  const guardarRegistro = async (id: number) => {
    setSavingRegistro(true);
    try {
      const response = await fetch(`/api/colaboradores/registros/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...registroForm,
          valorHora: registroForm.valorHora || null,
          horaPausa: registroForm.horaPausa || null,
          horaSaida: registroForm.horaSaida || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível atualizar o registo.");
      }

      setEditandoRegistroId(null);
      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o registo.");
    } finally {
      setSavingRegistro(false);
    }
  };

  const apagarRegistro = async (id: number) => {
    if (!confirm("Tem a certeza de que deseja apagar este registo?")) return;

    try {
      const response = await fetch(`/api/colaboradores/registros/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível apagar o registo.");
      }

      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível apagar o registo.");
    }
  };

  const guardarSimulatorSetting = async (setting: SimulatorSetting) => {
    setSavingSettingKey(setting.key);
    try {
      const response = await fetch("/api/colaboradores/admin/settings/simulador", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: setting.key,
          value: simulatorDrafts[setting.key],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível guardar este valor.");
      }

      setError("");
      await carregarSimulatorSettings(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível guardar este valor.");
    } finally {
      setSavingSettingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#07111d_0%,#0b1727_52%,#101d31_100%)] px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5 [zoom:0.8]">
          <div className="h-10 w-72 rounded-full bg-white/10" />
          <div className="grid gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 rounded-[28px] bg-white/8" />
            ))}
          </div>
          <div className="h-80 rounded-[32px] bg-white/8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(103,232,249,0.08),_transparent_20%),linear-gradient(180deg,#07111d_0%,#0b1727_52%,#101d31_100%)] text-white">
      <div className="mx-auto max-w-[1500px] px-3 py-5 [zoom:0.8] lg:px-6">
        <header className="rounded-[28px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(7,24,39,0.96)_0%,rgba(10,32,49,0.94)_100%)] px-5 py-4 shadow-[0_24px_80px_rgba(4,11,20,0.34)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-cyan-400 text-slate-950">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">
                  Backoffice CLYON
                </p>
                <h2 className="mt-1 text-[1.5rem] font-semibold text-white">Painel administrativo</h2>
                <p className="mt-1 text-xs capitalize text-slate-400">{hojeLabel}</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-cyan-400 text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.22)]"
                        : "border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {sectionLabels[item.id]}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 rounded-[22px] border border-cyan-400/15 bg-cyan-400/[0.08] px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-sm font-semibold text-slate-950">
                {getInitials(adminNome)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-white">{adminNome}</p>
                <p className="text-sm text-cyan-100/80">Administrador do sistema</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="h-10 rounded-[16px] border-white/10 bg-transparent px-4 text-white hover:bg-white/[0.08]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </header>

        <main className="mt-4 min-w-0 space-y-5">
          {error && (
            <div className="rounded-[22px] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {activeSection === "overview" && (
            <>
              {/* Barra de semana + filtros operacionais */}
              <section className="flex flex-col gap-4 rounded-[24px] border border-cyan-300/16 bg-[linear-gradient(135deg,rgba(9,27,43,0.96)_0%,rgba(12,34,52,0.94)_100%)] p-5 shadow-[0_20px_70px_rgba(3,10,18,0.24)] xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                      {weekOffset === 0 ? "Semana atual" : weekOffset === -1 ? "Semana anterior" : "Semana selecionada"}
                    </p>
                    <p className="mt-1 text-lg font-semibold capitalize text-white">{weekLabel}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-[16px] border border-white/10 bg-white/[0.03] p-1">
                    <button
                      type="button"
                      onClick={() => setWeekOffset(0)}
                      className={`rounded-[12px] px-3 py-2 text-sm font-semibold transition ${weekOffset === 0 ? "bg-cyan-400 text-slate-950" : "text-slate-200 hover:bg-white/[0.06]"}`}
                    >
                      Atual
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekOffset(-1)}
                      className={`rounded-[12px] px-3 py-2 text-sm font-semibold transition ${weekOffset === -1 ? "bg-cyan-400 text-slate-950" : "text-slate-200 hover:bg-white/[0.06]"}`}
                    >
                      Anterior
                    </button>
                  </div>

                  <select
                    value={funcaoFilter}
                    onChange={(e) => setFuncaoFilter(e.target.value as typeof funcaoFilter)}
                    className="h-11 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white outline-none focus:border-cyan-400"
                  >
                    <option value="todas">Todas as funções</option>
                    <option value="admin">Administradores</option>
                    <option value="motorista">Motoristas</option>
                    <option value="ajudante">Ajudantes</option>
                  </select>

                  <Button
                    type="button"
                    onClick={() => {
                      setCriarNovoVisivel(true);
                      setActiveSection("team");
                    }}
                    className="h-11 rounded-[14px] bg-cyan-400 px-4 text-slate-950 hover:bg-cyan-300"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Adicionar registo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection("hours")}
                    className="h-11 rounded-[14px] border-white/10 bg-white/[0.03] px-4 text-white hover:bg-white/[0.08]"
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Validar pendências
                  </Button>
                </div>
              </section>

              {/* Cards de resumo da semana */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <SummaryStat icon={Users} label="Colaboradores" value={String(weekSummary.colaboradores)} helper="ativos na semana" />
                <SummaryStat icon={Clock3} label="Horas da semana" value={`${decimal(weekSummary.totalHoras)}h`} helper="total da equipa" />
                <SummaryStat icon={Euro} label="A pagar (estimado)" value={money(weekSummary.totalValor)} helper="valor da semana" tone="emerald" />
                <SummaryStat icon={Briefcase} label="Registos" value={String(weekSummary.totalRegistos)} helper="turnos da semana" />
                <SummaryStat icon={AlertTriangle} label="Pendentes" value={String(weekSummary.pendentes)} helper="por validar" tone="amber" />
                <SummaryStat icon={CheckCircle2} label="Ativos hoje" value={String(weekSummary.ativosHoje)} helper="com registo hoje" tone="cyan" />
              </section>

              {/* Layout principal: colaboradores + lateral de pendências */}
              <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <ActionCard
                  title="Colaboradores que trabalharam esta semana"
                  description="Clique num colaborador para abrir o histórico semanal detalhado."
                >
                  {weekCollaborators.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-400">
                      Sem registos de colaboradores nesta semana.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {weekCollaborators.map((colaborador) => (
                        <button
                          key={colaborador.id}
                          type="button"
                          onClick={() => setColaboradorDrawerId(colaborador.id)}
                          className="grid w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.06] md:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))_auto]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-cyan-400 text-sm font-semibold text-slate-950">
                              {getInitials(colaborador.nome)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{colaborador.nome}</p>
                              <p className="text-xs capitalize text-slate-400">{formatRoleLabel(colaborador.funcao)}</p>
                            </div>
                          </div>
                          <CellStat label="Dias" value={String(colaborador.diasTrabalhados)} />
                          <CellStat label="Horas" value={`${decimal(colaborador.horas)}h`} />
                          <CellStat label="A receber" value={money(colaborador.valor)} accent />
                          <CellStat label="Último dia" value={formatShortDate(colaborador.ultimoDia)} />
                          <div className="flex items-center justify-between gap-2 md:justify-end">
                            <StatusBadge
                              status={
                                colaborador.temPendencia
                                  ? "pendente"
                                  : colaborador.ativoHoje
                                    ? "ativo"
                                    : "inativo"
                              }
                            />
                            <ChevronRight className="hidden h-4 w-4 text-slate-500 md:block" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ActionCard>

                <div className="space-y-4">
                  {/* Pendências */}
                  <ActionCard title="Pendências" description="Alertas operacionais desta semana." compact>
                    <div className="space-y-3">
                      <PendingRow
                        icon={TimerReset}
                        tone="rose"
                        label="Sem hora de saída"
                        count={pendencias.semSaida.length}
                        detail={pendencias.semSaida.slice(0, 3).map((p) => `${p.nome} · ${formatShortDate(p.data)}`)}
                      />
                      <PendingRow
                        icon={AlertTriangle}
                        tone="amber"
                        label="Horas muito altas"
                        count={pendencias.horasAltas.length}
                        detail={pendencias.horasAltas
                          .slice(0, 3)
                          .map((p) => `${p.nome} · ${decimal(p.horas)}h`)}
                      />
                      <PendingRow
                        icon={ListChecks}
                        tone="cyan"
                        label="Registos por validar"
                        count={pendencias.totalNaoValidados}
                        detail={[]}
                      />
                      {pendencias.semSaida.length === 0 &&
                        pendencias.horasAltas.length === 0 &&
                        pendencias.totalNaoValidados === 0 && (
                          <div className="flex items-center gap-2 rounded-[16px] border border-emerald-300/20 bg-emerald-400/[0.08] px-4 py-3 text-sm text-emerald-100">
                            <CheckCircle2 className="h-4 w-4" />
                            Tudo em dia esta semana.
                          </div>
                        )}
                    </div>
                  </ActionCard>

                  {/* Ações rápidas */}
                  <ActionCard title="Ações rápidas" description="Atalhos operacionais." compact>
                    <QuickAction icon={CalendarClock} label="Abrir histórico e horários" onClick={() => setActiveSection("hours")} />
                    <QuickAction icon={Users} label="Ver colaboradores" onClick={() => setActiveSection("team")} />
                    <QuickAction icon={Settings2} label="Gestão do site" onClick={() => setActiveSection("site")} />
                  </ActionCard>
                </div>
              </section>

              {/* Registos recentes da semana */}
              <ActionCard
                title="Registos recentes"
                description="Pendentes primeiro, depois os mais recentes da semana."
              >
                {weekRecords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                    Sem registos nesta semana.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400">
                          <th className="px-3 py-2 font-medium">Colaborador</th>
                          <th className="px-3 py-2 font-medium">Data</th>
                          <th className="px-3 py-2 font-medium">Entrada</th>
                          <th className="px-3 py-2 font-medium">Saída</th>
                          <th className="px-3 py-2 font-medium">Horas</th>
                          <th className="px-3 py-2 font-medium">Valor</th>
                          <th className="px-3 py-2 font-medium">Estado</th>
                          <th className="px-3 py-2 font-medium text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weekRecords.slice(0, 12).map((registro) => (
                          <tr key={registro.id} className="border-t border-white/10 text-slate-200">
                            <td className="px-3 py-3 font-medium text-white">{registro.colaboradorNome}</td>
                            <td className="px-3 py-3">{formatShortDate(registro.data)}</td>
                            <td className="px-3 py-3">{registro.horaEntrada || "—"}</td>
                            <td className="px-3 py-3">{registro.horaSaida || "—"}</td>
                            <td className="px-3 py-3 font-medium text-white">
                              {decimal(parseFloat(registro.horasTrabalhadas || "0"))}h
                            </td>
                            <td className="px-3 py-3 font-medium text-cyan-200">
                              {money(parseFloat(registro.valorTotal || "0"))}
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge
                                status={
                                  registro.status === "incompleto"
                                    ? "incompleto"
                                    : registro.status === "alerta"
                                      ? "pendente"
                                      : "validado"
                                }
                              />
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setColaboradorDrawerId(registro.colaboradorId)}
                                className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-white/[0.08]"
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </ActionCard>
            </>
          )}

          {activeSection === "hours" && (
            <section className="space-y-4 rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(9,25,40,0.94)_0%,rgba(11,30,47,0.92)_100%)] p-5 shadow-[0_20px_70px_rgba(3,10,18,0.22)]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Gestão operacional
                  </p>
                  <h2 className="mt-2 text-[1.85rem] font-semibold text-white">
                    Horários, pausas e valores por registo
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Valide entradas, saídas, horas trabalhadas e valores estimados da equipa.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWeekOffset((v) => v - 1)}
                    className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                  >
                    Semana anterior
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className={`h-11 rounded-2xl px-5 ${
                      weekOffset === 0
                        ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    Semana atual
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-white/[0.02] p-4 lg:flex-row lg:flex-wrap lg:items-center">
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    active={filtroColaborador === "todos"}
                    onClick={() => setFiltroColaborador("todos")}
                    label="Toda a equipa"
                  />
                  {collaboratorHoursFilters.map((colaborador) => (
                    <FilterPill
                      key={colaborador.id}
                      active={filtroColaborador === String(colaborador.id)}
                      onClick={() => setFiltroColaborador(String(colaborador.id))}
                      label={colaborador.nome}
                    />
                  ))}
                </div>
                <span className="hidden h-6 w-px bg-white/10 lg:block" />
                <div className="flex flex-wrap gap-2">
                  {(["todas", "motorista", "ajudante", "admin"] as const).map((funcao) => (
                    <button
                      key={funcao}
                      type="button"
                      onClick={() => setHoursFuncao(funcao)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                        hoursFuncao === funcao
                          ? "border-cyan-300 bg-cyan-400 text-slate-950"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      {funcao === "todas" ? "Todas" : formatRoleLabel(funcao)}
                    </button>
                  ))}
                </div>
                <span className="hidden h-6 w-px bg-white/10 lg:block" />
                <div className="flex flex-wrap gap-2">
                  {(["todos", "validado", "pendente", "incompleto"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setHoursStatus(status)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                        hoursStatus === status
                          ? "border-cyan-300 bg-cyan-400 text-slate-950"
                          : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]"
                      }`}
                    >
                      {status === "todos" ? "Todos" : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards de resumo */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                <SummaryStat icon={Users} label="Com registo" value={String(hoursSummary.colaboradoresComRegisto)} helper="Colaboradores" tone="cyan" />
                <SummaryStat icon={TimerReset} label="Horas" value={`${decimal(hoursSummary.totalHoras)}h`} helper="No filtro atual" tone="slate" />
                <SummaryStat icon={Wallet} label="A pagar" value={money(hoursSummary.totalValor)} helper="Estimado" tone="emerald" />
                <SummaryStat icon={AlertTriangle} label="Pendentes" value={String(hoursSummary.pendentes)} helper="Por validar" tone="amber" />
                <SummaryStat icon={Clock3} label="Incompletos" value={String(hoursSummary.incompletos)} helper="Sem saída" tone="amber" />
                <SummaryStat icon={CalendarDays} label="Média" value={`${decimal(hoursSummary.mediaHoras)}h`} helper="Por colaborador" tone="slate" />
              </div>

              {/* Painel de edição de registo */}
              {editandoRegistroId !== null && (
                <Card className="rounded-[24px] border-cyan-300/20 bg-[linear-gradient(180deg,rgba(12,34,52,0.96)_0%,rgba(9,27,43,0.94)_100%)] text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-white">Corrigir registo</CardTitle>
                    <CardDescription className="text-slate-400">
                      As horas e valores são recalculados pelo sistema com base nos horários introduzidos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Data">
                      <input
                        type="date"
                        value={registroForm.data}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, data: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Hora entrada">
                      <input
                        type="time"
                        value={registroForm.horaEntrada}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, horaEntrada: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Pausa">
                      <input
                        type="time"
                        value={registroForm.horaPausa}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, horaPausa: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Hora saída">
                      <input
                        type="time"
                        value={registroForm.horaSaida}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, horaSaida: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Número de trabalhos">
                      <input
                        type="number"
                        min="0"
                        value={registroForm.numeroTrabalhos}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, numeroTrabalhos: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Valor/hora">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={registroForm.valorHora}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, valorHora: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Valor final">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={registroForm.valorTotal}
                        onChange={(event) => setRegistroForm((state) => ({ ...state, valorTotal: event.target.value }))}
                        className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <div className="flex flex-wrap items-end justify-end gap-3 md:col-span-2 xl:col-span-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditandoRegistroId(null)}
                        className="h-11 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        disabled={savingRegistro}
                        onClick={() => editandoRegistroId !== null && guardarRegistro(editandoRegistroId)}
                        className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                      >
                        {savingRegistro ? "A guardar..." : "Guardar registo"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabela de registos */}
              <div className="overflow-x-auto rounded-[20px] border border-white/10">
                <table className="w-full min-w-[880px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-left text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="px-4 py-3 font-semibold">Data</th>
                      <th className="px-4 py-3 font-semibold">Colaborador</th>
                      <th className="px-4 py-3 font-semibold">Função</th>
                      <th className="px-4 py-3 font-semibold">Entrada</th>
                      <th className="px-4 py-3 font-semibold">Pausa</th>
                      <th className="px-4 py-3 font-semibold">Saída</th>
                      <th className="px-4 py-3 font-semibold">Horas</th>
                      <th className="px-4 py-3 font-semibold">Valor</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hoursRecords.length === 0 && (
                      <tr>
                        <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                          Ainda não existem registos para os filtros escolhidos.
                        </td>
                      </tr>
                    )}
                    {hoursRecords.map((registro) => (
                      <tr key={registro.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                        <td className="px-4 py-3 text-slate-300">{formatShortDate(registro.data)}</td>
                        <td className="px-4 py-3 font-semibold text-white">{registro.colaboradorNome}</td>
                        <td className="px-4 py-3 capitalize text-slate-400">{formatRoleLabel(registro.funcao)}</td>
                        <td className="px-4 py-3 text-slate-300">{registro.horaEntrada || "—"}</td>
                        <td className="px-4 py-3 text-slate-300">{registro.horaPausa || "—"}</td>
                        <td className="px-4 py-3 text-slate-300">{registro.horaSaida || "—"}</td>
                        <td className="px-4 py-3 font-semibold text-white">{decimal(parseFloat(registro.horasTrabalhadas || "0"))}h</td>
                        <td className="px-4 py-3 font-semibold text-cyan-200">{money(parseFloat(registro.valorTotal || "0"))}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={registro.statusLabel} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setColaboradorDrawerId(registro.colaboradorId)}
                              title="Ver histórico"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-200 transition hover:bg-white/[0.08]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => abrirEdicaoRegistro(registro)}
                              title="Corrigir"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.1] text-cyan-100 transition hover:bg-cyan-400/[0.2]"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => apagarRegistro(registro.id)}
                              title="Excluir"
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-400/[0.08] text-rose-100 transition hover:bg-rose-400/[0.16]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumo por colaborador */}
              <Card className="rounded-[24px] border-cyan-300/14 bg-[linear-gradient(180deg,rgba(12,34,52,0.96)_0%,rgba(9,27,43,0.94)_100%)] text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ReceiptText className="h-5 w-5 text-cyan-300" />
                    Resumo por colaborador
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Total semanal e mensal por colaborador. A semana fecha de segunda a domingo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-[16px] border border-white/10">
                    <table className="w-full min-w-[640px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03] text-left text-[11px] uppercase tracking-wide text-slate-400">
                          <th className="px-4 py-3 font-semibold">Colaborador</th>
                          <th className="px-4 py-3 font-semibold">Horas semana</th>
                          <th className="px-4 py-3 font-semibold">Valor semana</th>
                          <th className="px-4 py-3 font-semibold">Horas mês</th>
                          <th className="px-4 py-3 font-semibold">Valor mês</th>
                          <th className="px-4 py-3 text-right font-semibold">Histórico</th>
                        </tr>
                      </thead>
                      <tbody>
                        {collaboratorHourReports.map((colaborador) => (
                          <tr key={colaborador.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                            <td className="px-4 py-3 font-semibold text-white">{colaborador.nome}</td>
                            <td className="px-4 py-3 text-white">{decimal(colaborador.relatorio.semana.horas)}h</td>
                            <td className="px-4 py-3 text-cyan-200">{money(colaborador.relatorio.semana.valor)}</td>
                            <td className="px-4 py-3 text-white">{decimal(colaborador.relatorio.mes.horas)}h</td>
                            <td className="px-4 py-3 font-semibold text-emerald-200">{money(colaborador.relatorio.mes.valor)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => setColaboradorDrawerId(colaborador.id)}
                                className="rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-white/[0.08]"
                              >
                                Ver semana
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {activeSection === "team" && (
            <section className="space-y-4 rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(9,25,40,0.94)_0%,rgba(11,30,47,0.92)_100%)] p-5 shadow-[0_20px_70px_rgba(3,10,18,0.22)]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Gestão da equipa
                  </p>
                  <h2 className="mt-2 text-[1.6rem] font-semibold text-white">Gestão da equipa</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                    Consulte, edite e acompanhe os colaboradores da CLYON.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setCriarNovoVisivel((state) => !state)}
                  className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                >
                  {criarNovoVisivel ? <X className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {criarNovoVisivel ? "Fechar criação" : "Novo colaborador"}
                </Button>
              </div>

              {criarNovoVisivel && (
                <Card className="rounded-[30px] border-cyan-300/14 bg-[linear-gradient(180deg,rgba(12,34,52,0.96)_0%,rgba(9,27,43,0.94)_100%)] text-white">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Criar colaborador</CardTitle>
                    <CardDescription className="text-slate-400">
                      Adiciona um novo elemento à operação com acesso ao sistema e estrutura salarial definida.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome">
                      <input
                        value={novoNome}
                        onChange={(event) => setNovoNome(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                        placeholder="Ex.: WANDERSON"
                      />
                    </Field>
                    <Field label="Valor por hora">
                      <input
                        type="number"
                        step="0.01"
                        value={novoValorHora}
                        onChange={(event) => setNovoValorHora(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                        placeholder="Ex.: 8.50"
                      />
                    </Field>
                    <Field label="Função">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {functionOptions.map((funcao) => (
                          <button
                            key={funcao}
                            type="button"
                            onClick={() => setNovoFuncao(funcao)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition ${
                              novoFuncao === funcao
                                ? "border-cyan-300 bg-cyan-400 text-slate-950"
                                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            {formatRoleLabel(funcao)}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Palavra-passe inicial">
                      <div className="relative">
                        <input
                          type={mostrarSenhaNovoUsuario ? "text" : "password"}
                          value={novoSenha}
                          onChange={(event) => setNovoSenha(event.target.value)}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-12 text-white outline-none transition focus:border-cyan-300"
                          placeholder="Defina uma palavra-passe"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenhaNovoUsuario((state) => !state)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                        >
                          {mostrarSenhaNovoUsuario ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </Field>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={() => setNovoIsAdmin((state) => !state)}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                          novoIsAdmin
                            ? "border-cyan-300 bg-cyan-400/[0.14] text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full border ${
                            novoIsAdmin ? "border-cyan-300 bg-cyan-300" : "border-white/30"
                          }`}
                        />
                        Dar acesso de administrador a este utilizador
                      </button>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        disabled={loadingCriar}
                        onClick={criarNovoColaborador}
                        className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                      >
                        {loadingCriar ? "A criar..." : "Criar colaborador"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cards de resumo da equipa */}
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <SummaryStat icon={Users} label="Colaboradores" value={String(teamStats.total)} helper="no total" />
                <SummaryStat icon={CheckCircle2} label="Ativos" value={String(teamStats.ativos)} helper="trabalharam esta semana" tone="emerald" />
                <SummaryStat icon={TimerReset} label="Inativos" value={String(teamStats.inativos)} helper="sem registo esta semana" tone="amber" />
                <SummaryStat icon={Briefcase} label="Motoristas" value={String(teamStats.motoristas)} helper="na equipa" />
                <SummaryStat icon={Users} label="Ajudantes" value={String(teamStats.ajudantes)} helper="na equipa" />
                <SummaryStat icon={ShieldCheck} label="Administradores" value={String(teamStats.admins)} helper="com acesso total" tone="cyan" />
              </div>

              {/* Filtros */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={teamSearch}
                  onChange={(event) => setTeamSearch(event.target.value)}
                  placeholder="Pesquisar colaborador..."
                  className="h-11 min-w-[200px] flex-1 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-cyan-300"
                />
                <select
                  value={teamFuncao}
                  onChange={(event) => setTeamFuncao(event.target.value as typeof teamFuncao)}
                  className="h-11 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white outline-none focus:border-cyan-400"
                >
                  <option value="todas">Todas as funções</option>
                  <option value="admin">Administradores</option>
                  <option value="motorista">Motoristas</option>
                  <option value="ajudante">Ajudantes</option>
                </select>
                <select
                  value={teamStatus}
                  onChange={(event) => setTeamStatus(event.target.value as typeof teamStatus)}
                  className="h-11 rounded-[14px] border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-white outline-none focus:border-cyan-400"
                >
                  <option value="todos">Todos os estados</option>
                  <option value="ativo">Trabalhou esta semana</option>
                  <option value="inativo">Sem atividade esta semana</option>
                </select>
              </div>

              {/* Formulário de edição (aparece ao editar) */}
              {editandoId !== null && (
                <Card className="rounded-[24px] border-cyan-300/20 bg-[linear-gradient(180deg,rgba(12,34,52,0.96)_0%,rgba(9,27,43,0.94)_100%)] text-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-white">Editar colaborador</CardTitle>
                    <CardDescription className="text-slate-400">
                      A editar {colaboradores.find((c) => c.id === editandoId)?.nome}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome">
                      <input
                        value={editNome}
                        onChange={(event) => setEditNome(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Valor por hora">
                      <input
                        type="number"
                        step="0.01"
                        value={editValorHora}
                        onChange={(event) => setEditValorHora(event.target.value)}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                      />
                    </Field>
                    <Field label="Função">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {functionOptions.map((funcao) => (
                          <button
                            key={funcao}
                            type="button"
                            onClick={() => setEditFuncao(funcao)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                              editFuncao === funcao
                                ? "border-cyan-300 bg-cyan-400 text-slate-950"
                                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            {formatRoleLabel(funcao)}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Field label="Nova palavra-passe (opcional)">
                      <div className="relative">
                        <input
                          type={mostrarSenha ? "text" : "password"}
                          value={editSenha}
                          onChange={(event) => setEditSenha(event.target.value)}
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-12 text-white outline-none transition focus:border-cyan-300"
                          placeholder="Deixe vazio para manter"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha((state) => !state)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                        >
                          {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </Field>
                    <div className="flex items-end justify-end gap-3 md:col-span-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditandoId(null)}
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        disabled={loadingEdicao}
                        onClick={() => editarUsuario(editandoId)}
                        className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                      >
                        {loadingEdicao ? "A guardar..." : "Guardar alterações"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tabela compacta de colaboradores */}
              <div className="overflow-x-auto rounded-[20px] border border-white/10 bg-white/[0.02]">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="px-3 py-3 font-medium">Nome</th>
                      <th className="px-3 py-3 font-medium">Função</th>
                      <th className="px-3 py-3 font-medium">Estado</th>
                      <th className="px-3 py-3 font-medium">Valor/hora</th>
                      <th className="px-3 py-3 font-medium">Horas semana</th>
                      <th className="px-3 py-3 font-medium">Horas 30 dias</th>
                      <th className="px-3 py-3 font-medium">Valor mês</th>
                      <th className="px-3 py-3 font-medium">Último registo</th>
                      <th className="px-3 py-3 text-right font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamRowsFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                          Nenhum colaborador corresponde aos filtros.
                        </td>
                      </tr>
                    ) : (
                      teamRowsFiltered.map((row) => (
                        <tr key={row.id} className="border-t border-white/10 text-slate-200">
                          <td className="px-3 py-3">
                            <button
                              type="button"
                              onClick={() => setColaboradorDrawerId(row.id)}
                              className="flex items-center gap-2 text-left font-medium text-white transition hover:text-cyan-200"
                            >
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-xs font-semibold text-slate-950">
                                {getInitials(row.nome)}
                              </span>
                              {row.nome}
                            </button>
                          </td>
                          <td className="px-3 py-3 capitalize">
                            {formatRoleLabel(row.funcao)}
                            {row.isAdmin === 1 && (
                              <span className="ml-2 rounded-full border border-cyan-300/30 bg-cyan-400/[0.14] px-2 py-0.5 text-[10px] text-cyan-100">
                                Admin
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={row.ativoHoje ? "ativo" : row.estadoAtividade === "ativo" ? "validado" : "inativo"} />
                          </td>
                          <td className="px-3 py-3 font-medium text-white">{money(parseFloat(row.valorHora || "0"))}</td>
                          <td className="px-3 py-3">{decimal(row.horasSemana)}h</td>
                          <td className="px-3 py-3">{decimal(row.horas30)}h</td>
                          <td className="px-3 py-3 font-medium text-cyan-200">{money(row.valorMes)}</td>
                          <td className="px-3 py-3">{row.ultimoRegistro ? formatShortDate(row.ultimoRegistro.data) : "—"}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setColaboradorDrawerId(row.id)}
                                title="Ver histórico"
                                className="rounded-[10px] border border-white/10 bg-white/[0.04] p-2 text-cyan-100 transition hover:bg-white/[0.08]"
                              >
                                <History className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => abrirEdicao(row)}
                                title="Editar"
                                className="rounded-[10px] border border-white/10 bg-white/[0.04] p-2 text-white transition hover:bg-white/[0.08]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deletarUsuario(row.id, row.nome)}
                                title="Remover"
                                className="rounded-[10px] border border-rose-300/20 bg-rose-400/[0.08] p-2 text-rose-100 transition hover:bg-rose-400/[0.14]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeSection === "site" && (
            <section className="space-y-4 rounded-[28px] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(9,25,40,0.94)_0%,rgba(11,30,47,0.92)_100%)] p-5 shadow-[0_20px_70px_rgba(3,10,18,0.22)]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Gestão do site
                  </p>
                  <h2 className="mt-2 text-[1.85rem] font-semibold text-white">
                    Imagens do site e valores do simulador
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    O gestor de imagens continua separado. Aqui passa a controlar os parâmetros do simulador um a
                    um, com gravação individual por campo.
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 xl:items-end">
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.08] px-4 py-3 text-sm text-cyan-100">
                    Cada valor do simulador pode ser revisto e ajustado individualmente.
                  </div>
                  <Button
                    type="button"
                    onClick={() => router.push("/colaboradores/admin/imagens")}
                    className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                  >
                    Abrir gestor de imagens
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {siteModules.map((module) => (
                  <ActionCard key={module.title} title={module.title} description={module.description} compact>
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                          <module.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{module.status}</p>
                          <p className="text-xs text-slate-400">Módulo pronto para evoluir no painel</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-200" />
                    </div>
                  </ActionCard>
                ))}
              </div>

              <ActionCard
                title="Valores do simulador"
                description="Todos os valores do simulador estão visíveis abaixo, separados por categoria operacional para facilitar a gestão."
              >
                {loadingSimulatorSettings ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-sm text-slate-400">
                    A carregar configurações do simulador...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {simulatorGroups.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-[24px] border border-cyan-300/15 bg-white/[0.03] p-5"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{group.label}</h3>
                            <p className="text-sm text-slate-400">
                              {group.description}
                            </p>
                          </div>
                          <div className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                            {group.settings.length} valor(es)
                          </div>
                        </div>

                        {group.settings.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                            Sem valores configurados nesta categoria.
                          </div>
                        ) : (
                        <div className="grid gap-4 xl:grid-cols-2">
                          {group.settings.map((setting) => (
                            <div
                              key={setting.key}
                              className="rounded-[20px] border border-white/10 bg-slate-950/40 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">{setting.label}</p>
                                  <p className="mt-1 text-xs leading-6 text-slate-400">
                                    {setting.description || "Sem descrição adicional."}
                                  </p>
                                  <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                                    Chave: {setting.key}
                                  </p>
                                </div>
                                <span className="rounded-full border border-cyan-300/20 bg-cyan-400/[0.08] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                                  {formatSimulatorUnit(setting.unit)}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                                <Field label="Valor">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={simulatorDrafts[setting.key] ?? ""}
                                    onChange={(event) =>
                                      setSimulatorDrafts((state) => ({
                                        ...state,
                                        [setting.key]: event.target.value,
                                      }))
                                    }
                                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                                  />
                                </Field>
                                <Button
                                  type="button"
                                  disabled={savingSettingKey === setting.key}
                                  onClick={() => guardarSimulatorSetting(setting)}
                                  className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                                >
                                  {savingSettingKey === setting.key ? "A guardar..." : "Guardar"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ActionCard>
            </section>
          )}
        </main>
      </div>

      {/* Drawer lateral: histórico semanal do colaborador */}
      {drawerColaborador && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Fechar histórico"
            onClick={() => setColaboradorDrawerId(null)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-cyan-300/20 bg-[linear-gradient(180deg,rgba(9,27,43,0.99)_0%,rgba(7,20,33,0.99)_100%)] shadow-[-30px_0_80px_rgba(3,10,18,0.5)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[rgba(9,27,43,0.96)] px-6 py-5 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Histórico semanal
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">{drawerColaborador.nome}</h3>
                <p className="mt-1 text-sm capitalize text-slate-400">
                  {formatRoleLabel(drawerColaborador.funcao)} • <span className="capitalize">{weekLabel}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setColaboradorDrawerId(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.1]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 px-6 py-5">
              {drawerDias.map((dia) => {
                const trabalhou = dia.registros.length > 0;
                return (
                  <div
                    key={dia.label}
                    className={`rounded-[18px] border px-4 py-3 ${
                      trabalhou
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-white/5 bg-white/[0.015]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{dia.label}</span>
                        <span className="text-xs text-slate-500">{formatShortDate(dia.dia.toISOString())}</span>
                      </div>
                      {trabalhou ? (
                        <StatusBadge status={getRecordStatus(dia.registros[0]) === "validado" ? "validado" : getRecordStatus(dia.registros[0]) === "incompleto" ? "incompleto" : "pendente"} />
                      ) : (
                        <span className="text-xs font-medium text-slate-500">Sem registo</span>
                      )}
                    </div>

                    {trabalhou &&
                      dia.registros.map((r) => (
                        <div
                          key={r.id}
                          className="mt-3 grid grid-cols-2 gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-2 text-sm sm:grid-cols-4"
                        >
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Entrada</p>
                            <p className="font-medium text-white">{r.horaEntrada || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Saída</p>
                            <p className="font-medium text-white">{r.horaSaida || "—"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Horas</p>
                            <p className="font-medium text-white">{decimal(parseFloat(r.horasTrabalhadas || "0"))}h</p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-slate-500">Valor</p>
                            <p className="font-medium text-cyan-200">{money(parseFloat(r.valorTotal || "0"))}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 space-y-4 border-t border-white/10 bg-[rgba(9,27,43,0.96)] px-6 py-5 backdrop-blur">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Horas</p>
                  <p className="mt-1 text-lg font-semibold text-white">{decimal(drawerColaborador.horas)}h</p>
                </div>
                <div className="rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Dias</p>
                  <p className="mt-1 text-lg font-semibold text-white">{drawerColaborador.diasTrabalhados}</p>
                </div>
                <div className="rounded-[16px] border border-emerald-300/20 bg-emerald-400/[0.08] px-3 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-emerald-200/80">A pagar</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-100">{money(drawerColaborador.valor)}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setFiltroColaborador(String(drawerColaborador.id));
                    setColaboradorDrawerId(null);
                    setActiveSection("hours");
                  }}
                  className="h-11 flex-1 rounded-[14px] bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                >
                  <History className="mr-2 h-4 w-4" />
                  Ver histórico completo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFiltroColaborador(String(drawerColaborador.id));
                    setColaboradorDrawerId(null);
                    setActiveSection("hours");
                  }}
                  className="h-11 rounded-[14px] border-white/10 bg-white/[0.03] px-4 text-white hover:bg-white/[0.08]"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Corrigir registo
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  helper,
  tone = "slate",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
  tone?: "slate" | "cyan" | "emerald" | "amber";
}) {
  const toneClass = {
    slate: "border-white/10 text-cyan-100",
    cyan: "border-cyan-300/25 text-cyan-100",
    emerald: "border-emerald-300/25 text-emerald-100",
    amber: "border-amber-300/25 text-amber-100",
  }[tone];

  return (
    <Card className={`rounded-[20px] border bg-[linear-gradient(180deg,rgba(12,34,52,0.96)_0%,rgba(9,27,43,0.94)_100%)] text-white shadow-[0_16px_50px_rgba(15,23,42,0.22)] ${toneClass}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">{label}</p>
        </div>
        <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
        <p className="mt-1 text-xs text-slate-400">{helper}</p>
      </CardContent>
    </Card>
  );
}

function CellStat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-semibold ${accent ? "text-cyan-200" : "text-white"}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "ativo" | "inativo" | "pendente" | "validado" | "incompleto" }) {
  const config = {
    ativo: { label: "Ativo hoje", className: "border-emerald-300/30 bg-emerald-400/[0.12] text-emerald-100" },
    validado: { label: "Validado", className: "border-emerald-300/30 bg-emerald-400/[0.12] text-emerald-100" },
    pendente: { label: "Pendente", className: "border-amber-300/30 bg-amber-400/[0.12] text-amber-100" },
    incompleto: { label: "Incompleto", className: "border-rose-300/30 bg-rose-400/[0.12] text-rose-100" },
    inativo: { label: "Sem atividade hoje", className: "border-white/15 bg-white/[0.05] text-slate-300" },
  }[status];

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}

function PendingRow({
  icon: Icon,
  tone,
  label,
  count,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  tone: "rose" | "amber" | "cyan";
  label: string;
  count: number;
  detail: string[];
}) {
  const toneClass = {
    rose: "border-rose-300/25 bg-rose-400/[0.08] text-rose-100",
    amber: "border-amber-300/25 bg-amber-400/[0.08] text-amber-100",
    cyan: "border-cyan-300/25 bg-cyan-400/[0.08] text-cyan-100",
  }[tone];

  return (
    <div className={`rounded-[16px] border px-4 py-3 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-semibold text-white">{label}</span>
        </div>
        <span className="rounded-full bg-white/[0.08] px-2.5 py-0.5 text-xs font-semibold text-white">{count}</span>
      </div>
      {detail.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-slate-300">
          {detail.map((item, index) => (
            <li key={index} className="truncate">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition hover:border-cyan-400/40 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-200" />
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <ArrowRight className="h-4 w-4 text-cyan-100" />
    </button>
  );
}

function ActionCard({
  title,
  description,
  children,
  compact = false,
}: {
  title: string;
  description: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Card className="rounded-[26px] border-cyan-300/14 bg-[linear-gradient(180deg,rgba(12,34,52,0.96)_0%,rgba(9,27,43,0.94)_100%)] text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <CardTitle className="text-[1.35rem] text-white">{title}</CardTitle>
        <CardDescription className="text-slate-300">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function StatSurface({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[22px] border border-cyan-300/14 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-200">{body}</p>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-cyan-300 bg-cyan-400 text-slate-950"
          : "border-cyan-300/14 bg-white/[0.04] text-white hover:bg-white/[0.08]"
      }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}


