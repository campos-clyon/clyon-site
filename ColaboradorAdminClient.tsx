"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Euro,
  Eye,
  EyeOff,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Pencil,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
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
  overview: "Inicio",
  team: "Equipe",
  hours: "Horarios",
  site: "Configuracoes",
};

const siteModules = [
  {
    title: "Galeria de trabalhos",
    description:
      "Ãrea preparada para gerir fotografias, capas, destaques e ordem visual dos trabalhos reais.",
    status: "Ativo",
    icon: ImagePlus,
  },
  {
    title: "Valores do simulador",
    description:
      "Estrutura pensada para ajustar preÃ§os, margens, regras de cÃ¡lculo e cenÃ¡rios de orÃ§amento.",
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

const simulatorCategoryLabels: Record<SimulatorSetting["category"], string> = {
  moveis: "RemoÃ§Ã£o de mÃ³veis",
  entulho: "Entulho e limpeza",
  mudancas: "MudanÃ§as",
  acessos: "Acessos e pisos",
  geral: "Base geral",
};

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

const formatSimulatorUnit = (unit: SimulatorSetting["unit"]) =>
  unit === "eur" ? "EUR" : "Multiplicador";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

export default function ColaboradorAdminClient() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [adminNome, setAdminNome] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [filtroColaborador, setFiltroColaborador] = useState("todos");

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
    setAdminNome(storedNome || "AdministraÃ§Ã£o");
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
        throw new Error("NÃ£o foi possÃ­vel carregar os dados do painel.");
      }

      const data = await response.json();
      setColaboradores(Array.isArray(data) ? data : data.colaboradores || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel carregar os dados do painel.");
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
        throw new Error("NÃ£o foi possÃ­vel carregar os valores do simulador.");
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
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel carregar os valores do simulador.");
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
          })),
        )
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [colaboradoresFiltrados],
  );

  const dashboardStats = useMemo(() => {
    const hoje = new Date().toISOString().split("T")[0];

    const totalHoje = todosRegistros.reduce(
      (acc, registro) => {
        if (!registro.data.startsWith(hoje)) return acc;
        acc.horas += parseFloat(registro.horasTrabalhadas || "0");
        acc.valor += parseFloat(registro.valorTotal || "0");
        acc.trabalhos += registro.numeroTrabalhos || 0;
        return acc;
      },
      { horas: 0, valor: 0, trabalhos: 0 },
    );

    const semana = colaboradoresFiltrados.reduce(
      (acc, colaborador) => {
        acc.horas += parseFloat(colaborador.estatisticas?.semana?.horas || "0");
        acc.valor += parseFloat(colaborador.estatisticas?.semana?.valor || "0");
        acc.trabalhos += colaborador.estatisticas?.semana?.trabalhos || 0;
        return acc;
      },
      { horas: 0, valor: 0, trabalhos: 0 },
    );

    const ultimos15 = colaboradoresFiltrados.reduce(
      (acc, colaborador) => {
        acc.horas += parseFloat(colaborador.estatisticas?.ultimos15Dias?.horas || "0");
        acc.valor += parseFloat(colaborador.estatisticas?.ultimos15Dias?.valor || "0");
        acc.trabalhos += colaborador.estatisticas?.ultimos15Dias?.trabalhos || 0;
        return acc;
      },
      { horas: 0, valor: 0, trabalhos: 0 },
    );

    const mes = colaboradoresFiltrados.reduce(
      (acc, colaborador) => {
        acc.horas += parseFloat(colaborador.estatisticas?.mes?.horas || "0");
        acc.valor += parseFloat(colaborador.estatisticas?.mes?.valor || "0");
        acc.trabalhos += colaborador.estatisticas?.mes?.trabalhos || 0;
        return acc;
      },
      { horas: 0, valor: 0, trabalhos: 0 },
    );

    const mediaHora =
      colaboradores.length > 0
        ? colaboradores.reduce((acc, item) => acc + parseFloat(item.valorHora || "0"), 0) /
          colaboradores.length
        : 0;

    const admins = colaboradores.filter((item) => item.isAdmin === 1).length;

    return {
      hoje: totalHoje,
      semana,
      ultimos15,
      mes,
      ativos: colaboradores.length,
      mediaHora,
      admins,
      ultimoRegisto: todosRegistros[0]?.data || "",
    };
  }, [colaboradores, colaboradoresFiltrados, todosRegistros]);

  const topColaboradores = useMemo(
    () =>
      [...colaboradores]
        .sort(
          (a, b) =>
            parseFloat(b.estatisticas?.mes?.valor || "0") -
            parseFloat(a.estatisticas?.mes?.valor || "0"),
        )
        .slice(0, 3),
    [colaboradores],
  );

  const simulatorGroups = useMemo(() => {
    return simulatorSettings.reduce<Record<string, SimulatorSetting[]>>((acc, setting) => {
      const category = setting.category || "geral";
      if (!acc[category]) acc[category] = [];
      acc[category].push(setting);
      return acc;
    }, {});
  }, [simulatorSettings]);

  const latestRecords = useMemo(() => todosRegistros.slice(0, 5), [todosRegistros]);

  const overviewBars = useMemo(
    () => [
      {
        label: "Hoje",
        hours: dashboardStats.hoje.horas,
        jobs: dashboardStats.hoje.trabalhos,
      },
      {
        label: "Semana",
        hours: dashboardStats.semana.horas,
        jobs: dashboardStats.semana.trabalhos,
      },
      {
        label: "15 dias",
        hours: dashboardStats.ultimos15.horas,
        jobs: dashboardStats.ultimos15.trabalhos,
      },
      {
        label: "Mes",
        hours: dashboardStats.mes.horas,
        jobs: dashboardStats.mes.trabalhos,
      },
    ],
    [dashboardStats],
  );

  const chartMax = useMemo(() => {
    const maxHours = Math.max(...overviewBars.map((item) => item.hours), 1);
    const maxJobs = Math.max(...overviewBars.map((item) => item.jobs), 1);
    return { maxHours, maxJobs };
  }, [overviewBars]);

  const teamComposition = useMemo(() => {
    const counts = [
      {
        label: "Ajudantes",
        value: colaboradores.filter((item) => item.funcao === "ajudante").length,
        color: "#22d3ee",
      },
      {
        label: "Motoristas",
        value: colaboradores.filter((item) => item.funcao === "motorista").length,
        color: "#0ea5e9",
      },
      {
        label: "Admins",
        value: colaboradores.filter((item) => item.isAdmin === 1).length,
        color: "#34d399",
      },
    ];

    const total = counts.reduce((acc, item) => acc + item.value, 0);

    return counts.map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [colaboradores]);

  const donutStyle = useMemo(() => {
    const activeSegments = teamComposition.filter((item) => item.percent > 0);
    if (activeSegments.length === 0) {
      return "conic-gradient(#17324a 0deg 360deg)";
    }

    let current = 0;
    return `conic-gradient(${activeSegments
      .map((item) => {
        const start = current;
        current += item.percent * 3.6;
        return `${item.color} ${start}deg ${current}deg`;
      })
      .join(", ")})`;
  }, [teamComposition]);

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
        throw new Error(data.error || "NÃ£o foi possÃ­vel atualizar o colaborador.");
      }

      setEditandoId(null);
      setEditSenha("");
      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel atualizar o colaborador.");
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
        throw new Error(data.error || "NÃ£o foi possÃ­vel remover o colaborador.");
      }

      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel remover o colaborador.");
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
        throw new Error(data.error || "NÃ£o foi possÃ­vel criar o colaborador.");
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
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel criar o colaborador.");
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
          horaPausa: registroForm.horaPausa || null,
          horaSaida: registroForm.horaSaida || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "NÃ£o foi possÃ­vel atualizar o registo.");
      }

      setEditandoRegistroId(null);
      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel atualizar o registo.");
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
        throw new Error(data.error || "NÃ£o foi possÃ­vel apagar o registo.");
      }

      setError("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel apagar o registo.");
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
        throw new Error(data.error || "NÃ£o foi possÃ­vel guardar este valor.");
      }

      setError("");
      await carregarSimulatorSettings(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "NÃ£o foi possÃ­vel guardar este valor.");
    } finally {
      setSavingSettingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081423] px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_22%),linear-gradient(180deg,#07111d_0%,#0b1727_52%,#101d31_100%)] text-white">
      <div className="mx-auto max-w-[1500px] px-3 py-5 lg:px-6">
        <header className="rounded-[28px] border border-cyan-400/15 bg-slate-950/65 px-5 py-4 shadow-[0_24px_80px_rgba(4,11,20,0.34)] backdrop-blur">
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
                        : "bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]"
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

          <section className="grid gap-4 xl:grid-cols-[1.45fr_repeat(4,minmax(0,0.82fr))]">
            <Card className="rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(17,39,54,0.95))] text-white shadow-[0_24px_80px_rgba(4,11,20,0.3)]">
              <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100">
                    Central de gestao
                  </p>
                  <h1 className="mt-3 max-w-3xl text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.06] text-white">
                    Bem-vindo, {adminNome.split(" ")[0] || adminNome}.
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                    Um dashboard com a estrutura mais proxima da referencia visual, mas usando as cores da
                    CLYON e mantendo as funcoes operacionais do painel.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => setActiveSection("team")}
                    className="h-11 rounded-[16px] bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Abrir equipe
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveSection("hours")}
                    className="h-11 rounded-[16px] border-white/10 bg-white/[0.03] px-5 text-white hover:bg-white/[0.08]"
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Abrir horarios
                  </Button>
                </div>
              </CardContent>
            </Card>

            <QuickStat
              title="Colaboradores"
              hours={String(dashboardStats.ativos)}
              value="Equipe ativa"
              helper={`${dashboardStats.admins} admin(s) no painel`}
              tone="cyan"
            />
            <QuickStat
              title="Registos hoje"
              hours={String(dashboardStats.hoje.trabalhos)}
              value={`${decimal(dashboardStats.hoje.horas)}h`}
              helper="Turnos do dia"
              tone="blue"
            />
            <QuickStat
              title="Semana"
              hours={`${decimal(dashboardStats.semana.horas)}h`}
              value={money(dashboardStats.semana.valor)}
              helper={`${dashboardStats.semana.trabalhos} trabalhos`}
              tone="violet"
            />
            <QuickStat
              title="Valor/hora"
              hours={money(dashboardStats.mediaHora)}
              value="Media geral"
              helper="Referencia da equipa"
              tone="emerald"
            />
          </section>

          {activeSection === "overview" && (
            <>
              <section className="grid gap-4 xl:grid-cols-[0.82fr_1.45fr_1fr]">
                <ActionCard
                  title="Sessao ativa"
                  description="Resumo do utilizador e do estado atual do painel."
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-cyan-400 text-3xl font-semibold text-slate-950">
                      {getInitials(adminNome)}
                    </div>
                    <h3 className="mt-4 text-[1.55rem] font-semibold text-white">{adminNome}</h3>
                    <p className="mt-1 text-sm text-slate-400">Administrador principal</p>
                  </div>

                  <div className="grid gap-3">
                    <RecordMeta label="Ultimo registo" value={formatDateTime(dashboardStats.ultimoRegisto)} icon={CalendarClock} />
                    <RecordMeta label="Media hora" value={money(dashboardStats.mediaHora)} icon={Euro} />
                    <RecordMeta label="Ativos" value={`${dashboardStats.ativos} colaboradores`} icon={Users} />
                  </div>

                  <Button
                    type="button"
                    onClick={() => setActiveSection("team")}
                    className="h-11 rounded-[16px] bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  >
                    Editar equipa
                  </Button>
                </ActionCard>

                <ActionCard
                  title="Grafico de atividade"
                  description="Comparacao rapida entre horas e trabalhos por periodo."
                >
                  <div className="flex gap-2">
                    {["Semana", "Mes", "Ano"].map((item) => (
                      <div
                        key={item}
                        className={`rounded-[14px] px-3 py-2 text-xs font-semibold ${
                          item === "Semana"
                            ? "bg-cyan-400 text-slate-950"
                            : "bg-white/[0.03] text-slate-300"
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="grid h-[240px] grid-cols-4 items-end gap-5">
                    {overviewBars.map((item) => {
                      const hourHeight = `${Math.max((item.hours / chartMax.maxHours) * 100, item.hours > 0 ? 12 : 4)}%`;
                      const jobHeight = `${Math.max((item.jobs / chartMax.maxJobs) * 100, item.jobs > 0 ? 10 : 4)}%`;

                      return (
                        <div key={item.label} className="flex h-full flex-col justify-end gap-3">
                          <div className="flex h-full items-end justify-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex h-full flex-col justify-end">
                              <div className="w-7 rounded-full bg-cyan-400" style={{ height: hourHeight }} />
                            </div>
                            <div className="flex h-full flex-col justify-end">
                              <div className="w-7 rounded-full bg-emerald-400" style={{ height: jobHeight }} />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="text-xs text-slate-400">
                              {decimal(item.hours)}h | {item.jobs} trabalhos
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-5 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-cyan-400" />
                      Horas
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-400" />
                      Trabalhos
                    </div>
                  </div>
                </ActionCard>

                <ActionCard
                  title="Desempenho da equipa"
                  description="Distribuicao atual da estrutura operacional."
                >
                  <div className="flex flex-col items-center gap-5">
                    <div
                      className="relative h-52 w-52 rounded-full border border-white/10"
                      style={{ background: donutStyle }}
                    >
                      <div className="absolute inset-[27%] rounded-full bg-slate-950/95" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">Equipa</p>
                          <p className="mt-2 text-3xl font-semibold text-white">{dashboardStats.ativos}</p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full space-y-3">
                      {teamComposition.map((item) => (
                        <div key={item.label} className="rounded-[18px] border border-white/10 bg-white/[0.03] p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-sm font-semibold text-white">{item.label}</span>
                            </div>
                            <span className="text-sm text-slate-300">
                              {item.value} | {decimal(item.percent)}%
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-950/70">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.max(item.percent, item.value > 0 ? 8 : 0)}%`,
                                backgroundColor: item.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ActionCard>
              </section>

              <section className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
                <ActionCard
                  title="Ultimos registos"
                  description="Turnos recentes da equipa para consulta rapida."
                >
                  <div className="space-y-3">
                    {latestRecords.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                        Ainda nao existem registos suficientes para mostrar atividade recente.
                      </div>
                    )}

                    {latestRecords.map((registro) => (
                      <div
                        key={registro.id}
                        className="grid gap-4 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_auto]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-sm font-semibold text-slate-950">
                            {getInitials(registro.colaboradorNome)}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{registro.colaboradorNome}</p>
                            <p className="text-sm text-slate-400">{formatDate(registro.data)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Turno</p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {registro.horaEntrada || "--"} - {registro.horaSaida || "--"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Horas</p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {decimal(parseFloat(registro.horasTrabalhadas || "0"))}h
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trabalhos</p>
                          <p className="mt-1 text-sm font-semibold text-white">{registro.numeroTrabalhos}</p>
                        </div>
                        <div className="text-left lg:text-right">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Valor</p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {money(parseFloat(registro.valorTotal || "0"))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ActionCard>

                <div className="space-y-4">
                  <ActionCard
                    title="Atalhos do painel"
                    description="Acoes mais usadas no dia a dia."
                    compact
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSection("team")}
                      className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Gerir equipa</p>
                        <p className="text-xs text-slate-400">Atualizar acessos e valores por hora.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-100" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection("hours")}
                      className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Corrigir horarios</p>
                        <p className="text-xs text-slate-400">Editar pausas, turnos e valores finais.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-100" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSection("site")}
                      className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">Gestao do site</p>
                        <p className="text-xs text-slate-400">Media e simulador num unico fluxo.</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-100" />
                    </button>
                  </ActionCard>

                  <ActionCard
                    title="Melhor desempenho do mes"
                    description="Ranking atual por faturacao."
                    compact
                  >
                    <div className="space-y-3">
                      {topColaboradores.map((colaborador, index) => (
                        <div
                          key={colaborador.id}
                          className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">
                                Top {index + 1}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-white">{colaborador.nome}</p>
                              <p className="text-xs text-slate-400 capitalize">{colaborador.funcao}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-white">
                                {money(parseFloat(colaborador.estatisticas.mes.valor || "0"))}
                              </p>
                              <p className="text-xs text-slate-400">
                                {decimal(parseFloat(colaborador.estatisticas.mes.horas || "0"))}h
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ActionCard>
                </div>
              </section>
            </>
          )}

          {activeSection === "hours" && (
            <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    GestÃ£o operacional
                  </p>
                  <h2 className="mt-2 text-[1.85rem] font-semibold text-white">
                    HorÃ¡rios, pausas e valores por registo
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Pode editar horas, pausa, quantidade de trabalhos, valor final e apagar qualquer registo
                    individual sem sair do painel.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  Ãšltimo registo:{" "}
                  <span className="font-medium text-white">{formatDateTime(dashboardStats.ultimoRegisto)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={filtroColaborador === "todos"}
                  onClick={() => setFiltroColaborador("todos")}
                  label="Toda a equipa"
                />
                {colaboradores.map((colaborador) => (
                  <FilterPill
                    key={colaborador.id}
                    active={filtroColaborador === String(colaborador.id)}
                    onClick={() => setFiltroColaborador(String(colaborador.id))}
                    label={colaborador.nome}
                  />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {todosRegistros.length === 0 && (
                  <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-slate-400 xl:col-span-2">
                    Ainda nÃ£o existem registos para o filtro escolhido.
                  </div>
                )}
                {todosRegistros.map((registro) => {
                  const emEdicao = editandoRegistroId === registro.id;

                  return (
                    <Card
                      key={registro.id}
                      className="rounded-[24px] border-white/10 bg-slate-950/35 text-white shadow-[0_18px_60px_rgba(15,23,42,0.25)]"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg text-white">{registro.colaboradorNome}</CardTitle>
                            <CardDescription className="mt-1 text-slate-400">
                              {formatDateTime(registro.data)}
                            </CardDescription>
                          </div>
                          <div className="rounded-2xl bg-cyan-400/[0.12] px-3 py-2 text-right">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200">Valor</p>
                            <p className="text-base font-semibold text-white">
                              {money(parseFloat(registro.valorTotal || "0"))}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {emEdicao ? (
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <Field label="Data">
                              <input
                                type="date"
                                value={registroForm.data}
                                onChange={(event) =>
                                  setRegistroForm((state) => ({ ...state, data: event.target.value }))
                                }
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                              />
                            </Field>
                            <Field label="Hora entrada">
                              <input
                                type="time"
                                value={registroForm.horaEntrada}
                                onChange={(event) =>
                                  setRegistroForm((state) => ({ ...state, horaEntrada: event.target.value }))
                                }
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                              />
                            </Field>
                            <Field label="Pausa">
                              <input
                                type="time"
                                value={registroForm.horaPausa}
                                onChange={(event) =>
                                  setRegistroForm((state) => ({ ...state, horaPausa: event.target.value }))
                                }
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                              />
                            </Field>
                            <Field label="Hora saÃ­da">
                              <input
                                type="time"
                                value={registroForm.horaSaida}
                                onChange={(event) =>
                                  setRegistroForm((state) => ({ ...state, horaSaida: event.target.value }))
                                }
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                              />
                            </Field>
                            <Field label="NÃºmero de trabalhos">
                              <input
                                type="number"
                                min="0"
                                value={registroForm.numeroTrabalhos}
                                onChange={(event) =>
                                  setRegistroForm((state) => ({
                                    ...state,
                                    numeroTrabalhos: event.target.value,
                                  }))
                                }
                                className="h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition focus:border-cyan-300"
                              />
                            </Field>
                            <Field label="Valor final">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={registroForm.valorTotal}
                                onChange={(event) =>
                                  setRegistroForm((state) => ({ ...state, valorTotal: event.target.value }))
                                }
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
                                variant="outline"
                                onClick={() => apagarRegistro(registro.id)}
                                className="h-11 rounded-2xl border-rose-300/20 bg-rose-400/[0.08] text-rose-100 hover:bg-rose-400/[0.14]"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Apagar
                              </Button>
                              <Button
                                type="button"
                                disabled={savingRegistro}
                                onClick={() => guardarRegistro(registro.id)}
                                className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                              >
                                {savingRegistro ? "A guardar..." : "Guardar registo"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <RecordMeta label="Entrada" value={registro.horaEntrada || "â€”"} icon={Clock3} />
                              <RecordMeta label="Pausa" value={registro.horaPausa || "â€”"} icon={CalendarClock} />
                              <RecordMeta label="SaÃ­da" value={registro.horaSaida || "â€”"} icon={CheckCircle2} />
                              <RecordMeta
                                label="Horas"
                                value={`${decimal(parseFloat(registro.horasTrabalhadas || "0"))}h`}
                                icon={Briefcase}
                              />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                <span className="font-medium text-white">{registro.numeroTrabalhos}</span> trabalho(s)
                                registado(s) neste turno.
                              </div>
                              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                                O total das horas continua a ser recalculado pelo sistema com base nos horÃ¡rios
                                editados e no valor/hora do colaborador.
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <Button
                                type="button"
                                onClick={() => abrirEdicaoRegistro(registro)}
                                className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar horas
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => apagarRegistro(registro.id)}
                                className="h-11 rounded-2xl border-rose-300/20 bg-rose-400/[0.08] px-5 text-rose-100 hover:bg-rose-400/[0.14]"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Apagar registo
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {activeSection === "team" && (
            <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Estrutura da equipa
                  </p>
                  <h2 className="mt-2 text-[1.85rem] font-semibold text-white">GestÃ£o completa de colaboradores</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Centraliza acessos, funÃ§Ãµes, valores/hora e futuras permissÃµes de gestÃ£o para cada membro.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setCriarNovoVisivel((state) => !state)}
                  className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                >
                  {criarNovoVisivel ? <X className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {criarNovoVisivel ? "Fechar criaÃ§Ã£o" : "Novo colaborador"}
                </Button>
              </div>

              {criarNovoVisivel && (
                <Card className="rounded-[30px] border-white/10 bg-slate-950/35 text-white">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Criar colaborador</CardTitle>
                    <CardDescription className="text-slate-400">
                      Adiciona um novo elemento Ã  operaÃ§Ã£o com acesso ao sistema e estrutura salarial definida.
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
                    <Field label="FunÃ§Ã£o">
                      <div className="grid gap-2 sm:grid-cols-3">
                        {(["ajudante", "motorista", "admin"] as const).map((funcao) => (
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
                            {funcao}
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

              <div className="grid gap-4 xl:grid-cols-2">
                {colaboradores.map((colaborador) => {
                  const emEdicao = editandoId === colaborador.id;
                  return (
                    <Card
                      key={colaborador.id}
                      className="rounded-[30px] border-white/10 bg-slate-950/35 text-white shadow-[0_18px_60px_rgba(15,23,42,0.25)]"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-2xl text-white">{colaborador.nome}</CardTitle>
                            <CardDescription className="mt-2 flex flex-wrap gap-2 text-slate-300">
                              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 capitalize">
                                {colaborador.funcao}
                              </span>
                              {colaborador.isAdmin === 1 && (
                                <span className="rounded-full border border-cyan-300/30 bg-cyan-400/[0.14] px-3 py-1 text-cyan-100">
                                  Administrador
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="rounded-2xl bg-cyan-400/[0.12] px-3 py-2 text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Valor/hora</p>
                            <p className="text-lg font-semibold text-white">
                              {money(parseFloat(colaborador.valorHora || "0"))}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <MiniStat
                            label="Semana"
                            value={`${decimal(parseFloat(colaborador.estatisticas.semana.horas || "0"))}h`}
                            helper={`${colaborador.estatisticas.semana.trabalhos} trabalhos`}
                            accent="cyan"
                          />
                          <MiniStat
                            label="Ãšltimos 15 dias"
                            value={`${decimal(parseFloat(colaborador.estatisticas.ultimos15Dias.horas || "0"))}h`}
                            helper={`${colaborador.estatisticas.ultimos15Dias.trabalhos} trabalhos`}
                            accent="violet"
                          />
                          <MiniStat
                            label="Este mÃªs"
                            value={`${decimal(parseFloat(colaborador.estatisticas.mes.horas || "0"))}h`}
                            helper={money(parseFloat(colaborador.estatisticas.mes.valor || "0"))}
                            accent="emerald"
                          />
                        </div>

                        {emEdicao ? (
                          <div className="grid gap-4 md:grid-cols-2">
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
                                onClick={() => editarUsuario(colaborador.id)}
                                className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                              >
                                {loadingEdicao ? "A guardar..." : "Guardar alteraÃ§Ãµes"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            <Button
                              type="button"
                              onClick={() => abrirEdicao(colaborador)}
                              className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar colaborador
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => deletarUsuario(colaborador.id, colaborador.nome)}
                              className="h-11 rounded-2xl border-rose-300/20 bg-rose-400/[0.08] px-5 text-rose-100 hover:bg-rose-400/[0.14]"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {activeSection === "site" && (
            <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    GestÃ£o do site
                  </p>
                  <h2 className="mt-2 text-[1.85rem] font-semibold text-white">
                    Imagens do site e valores do simulador
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    O gestor de imagens continua separado. Aqui passa a controlar os parÃ¢metros do simulador um a
                    um, com gravaÃ§Ã£o individual por campo.
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
                          <p className="text-xs text-slate-400">MÃ³dulo pronto para evoluir no painel</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-200" />
                    </div>
                  </ActionCard>
                ))}
              </div>

              <ActionCard
                title="Valores do simulador"
                description="Edite preÃ§os, extras e multiplicadores um a um. Cada bloco guarda sÃ³ o valor alterado."
              >
                {loadingSimulatorSettings ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-sm text-slate-400">
                    A carregar configuraÃ§Ãµes do simulador...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(simulatorGroups).map(([category, settings]) => (
                      <div
                        key={category}
                        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {simulatorCategoryLabels[category as keyof typeof simulatorCategoryLabels] || category}
                            </h3>
                            <p className="text-sm text-slate-400">
                              Ajustes separados por Ã¡rea operacional.
                            </p>
                          </div>
                          <div className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200">
                            {settings.length} valor(es)
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          {settings.map((setting) => (
                            <div
                              key={setting.key}
                              className="rounded-[20px] border border-white/10 bg-slate-950/40 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-white">{setting.label}</p>
                                  <p className="mt-1 text-xs leading-6 text-slate-400">
                                    {setting.description || "Sem descriÃ§Ã£o adicional."}
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
                      </div>
                    ))}
                  </div>
                )}
              </ActionCard>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function QuickStat({
  title,
  hours,
  value,
  helper,
  tone,
}: {
  title: string;
  hours: string;
  value: string;
  helper: string;
  tone: "cyan" | "blue" | "violet" | "emerald";
}) {
  const toneClass =
    {
      cyan: "from-cyan-400/25 via-cyan-400/10 to-white/[0.03] border-cyan-300/20",
      blue: "from-blue-500/25 via-blue-500/10 to-white/[0.03] border-blue-300/20",
      violet: "from-violet-500/25 via-violet-500/10 to-white/[0.03] border-violet-300/20",
      emerald: "from-emerald-500/25 via-emerald-500/10 to-white/[0.03] border-emerald-300/20",
    }[tone];

  return (
    <Card
      className={`rounded-[24px] border bg-[linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-1 text-white shadow-[0_18px_60px_rgba(15,23,42,0.25)] ${toneClass}`}
    >
      <CardContent className="rounded-[20px] bg-slate-950/45 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-300">{title}</p>
        <p className="mt-3 text-[2rem] font-semibold text-white">{hours}</p>
        <p className="mt-1 text-sm text-slate-400">{value}</p>
        <p className="mt-4 text-sm text-slate-300">{helper}</p>
      </CardContent>
    </Card>
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
    <Card className="rounded-[26px] border-white/10 bg-slate-950/35 text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
      <CardHeader className={compact ? "pb-3" : "pb-4"}>
        <CardTitle className="text-[1.35rem] text-white">{title}</CardTitle>
        <CardDescription className="text-slate-400">{description}</CardDescription>
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
    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: "cyan" | "emerald" | "violet";
}) {
  const accentClass =
    {
      cyan: "border-cyan-300/20 bg-cyan-400/[0.08] text-cyan-100",
      emerald: "border-emerald-300/20 bg-emerald-400/[0.08] text-emerald-100",
      violet: "border-violet-300/20 bg-violet-400/[0.08] text-violet-100",
    }[accent];

  return (
    <div className={`rounded-[22px] border px-4 py-3.5 ${accentClass}`}>
      <p className="text-xs uppercase tracking-[0.22em]">{label}</p>
      <p className="mt-2 text-[1.55rem] font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-300">{helper}</p>
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
          : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
      }`}
    >
      {label}
    </button>
  );
}

function RecordMeta({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
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


