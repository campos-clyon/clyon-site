"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

type AdminSection = "overview" | "team" | "hours" | "site";

const sectionItems: Array<{ id: AdminSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Resumo", icon: LayoutDashboard },
  { id: "team", label: "Equipa", icon: Users },
  { id: "hours", label: "Registos", icon: CalendarClock },
  { id: "site", label: "Site", icon: Settings2 },
];

const siteModules = [
  { title: "Fotos", status: "Em preparacao", icon: ImagePlus },
  { title: "Precos", status: "Proxima fase", icon: Euro },
  { title: "Textos", status: "Em preparacao", icon: Sparkles },
  { title: "Regras", status: "Planeado", icon: Wrench },
];

const money = (value: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value || 0);

const decimal = (value: number) =>
  new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);

const emptyPeriodo = (): PeriodoStats => ({ horas: "0.00", valor: "0.00", trabalhos: 0 });

const normalizeRegistro = (registro: Partial<Registro>): Registro => ({
  id: Number(registro.id || 0),
  data: registro.data || "",
  horaEntrada: registro.horaEntrada || "",
  horaPausa: registro.horaPausa ?? null,
  horaSaida: registro.horaSaida ?? null,
  numeroTrabalhos: Number(registro.numeroTrabalhos || 0),
  horasTrabalhadas: String(registro.horasTrabalhadas || "0"),
  valorTotal: String(registro.valorTotal || "0"),
});

const normalizeColaborador = (item: Partial<Colaborador>): Colaborador => ({
  id: Number(item.id || 0),
  nome: item.nome || "Sem nome",
  funcao:
    item.funcao === "motorista" || item.funcao === "ajudante" || item.funcao === "admin"
      ? item.funcao
      : "ajudante",
  valorHora: String(item.valorHora || "0"),
  isAdmin: Number(item.isAdmin || 0),
  createdAt: item.createdAt,
  registros: Array.isArray(item.registros) ? item.registros.map(normalizeRegistro) : [],
  estatisticas: {
    semana: item.estatisticas?.semana
      ? {
          horas: String(item.estatisticas.semana.horas || "0"),
          valor: String(item.estatisticas.semana.valor || "0"),
          trabalhos: Number(item.estatisticas.semana.trabalhos || 0),
        }
      : emptyPeriodo(),
    ultimos15Dias: item.estatisticas?.ultimos15Dias
      ? {
          horas: String(item.estatisticas.ultimos15Dias.horas || "0"),
          valor: String(item.estatisticas.ultimos15Dias.valor || "0"),
          trabalhos: Number(item.estatisticas.ultimos15Dias.trabalhos || 0),
        }
      : emptyPeriodo(),
    mes: item.estatisticas?.mes
      ? {
          horas: String(item.estatisticas.mes.horas || "0"),
          valor: String(item.estatisticas.mes.valor || "0"),
          trabalhos: Number(item.estatisticas.mes.trabalhos || 0),
        }
      : emptyPeriodo(),
  },
});

const formatDateTime = (value?: string) => {
  if (!value) return "Sem data";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return `${new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)} ${date.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`;
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

  useEffect(() => {
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
    setAdminNome(storedNome || "Admin");
    void carregarDados(storedToken);
  }, [router]);

  const carregarDados = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/colaboradores/admin/todos", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) throw new Error("Nao foi possivel carregar o painel.");

      const data = await response.json();
      const base = Array.isArray(data) ? data : data.colaboradores || [];
      setColaboradores(base.map(normalizeColaborador));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar o painel.");
    } finally {
      setLoading(false);
    }
  };

  const colaboradoresFiltrados = useMemo(() => {
    if (filtroColaborador === "todos") return colaboradores;
    return colaboradores.filter((colaborador) => colaborador.id === Number(filtroColaborador));
  }, [colaboradores, filtroColaborador]);

  const todosRegistros = useMemo<RegistroComColaborador[]>(() => {
    return colaboradoresFiltrados
      .flatMap((colaborador) =>
        colaborador.registros.map((registro) => ({
          ...registro,
          colaboradorId: colaborador.id,
          colaboradorNome: colaborador.nome,
        })),
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [colaboradoresFiltrados]);

  const stats = useMemo(() => {
    const sumPeriodo = (key: "semana" | "ultimos15Dias" | "mes") =>
      colaboradoresFiltrados.reduce(
        (acc, item) => {
          acc.horas += parseFloat(item.estatisticas[key].horas || "0");
          acc.valor += parseFloat(item.estatisticas[key].valor || "0");
          acc.trabalhos += item.estatisticas[key].trabalhos || 0;
          return acc;
        },
        { horas: 0, valor: 0, trabalhos: 0 },
      );

    const hojeStr = new Date().toISOString().split("T")[0];
    const hoje = todosRegistros.reduce(
      (acc, item) => {
        if (!item.data.startsWith(hojeStr)) return acc;
        acc.horas += parseFloat(item.horasTrabalhadas || "0");
        acc.valor += parseFloat(item.valorTotal || "0");
        acc.trabalhos += item.numeroTrabalhos || 0;
        return acc;
      },
      { horas: 0, valor: 0, trabalhos: 0 },
    );

    const mediaHora = colaboradores.length
      ? colaboradores.reduce((acc, item) => acc + parseFloat(item.valorHora || "0"), 0) / colaboradores.length
      : 0;

    return {
      hoje,
      semana: sumPeriodo("semana"),
      ultimos15: sumPeriodo("ultimos15Dias"),
      mes: sumPeriodo("mes"),
      ativos: colaboradores.length,
      admins: colaboradores.filter((item) => item.isAdmin === 1).length,
      mediaHora,
    };
  }, [colaboradores, colaboradoresFiltrados, todosRegistros]);

  const chartResumo = useMemo(() => [
    { periodo: "Hoje", horas: Number(stats.hoje.horas.toFixed(2)), valor: Number(stats.hoje.valor.toFixed(2)) },
    { periodo: "Semana", horas: Number(stats.semana.horas.toFixed(2)), valor: Number(stats.semana.valor.toFixed(2)) },
    { periodo: "15 dias", horas: Number(stats.ultimos15.horas.toFixed(2)), valor: Number(stats.ultimos15.valor.toFixed(2)) },
    { periodo: "Mes", horas: Number(stats.mes.horas.toFixed(2)), valor: Number(stats.mes.valor.toFixed(2)) },
  ], [stats]);

  const chartEquipa = useMemo(() => {
    return [...colaboradores]
      .sort((a, b) => parseFloat(b.estatisticas.mes.valor || "0") - parseFloat(a.estatisticas.mes.valor || "0"))
      .slice(0, 5)
      .map((item) => ({
        nome: item.nome,
        valor: Number(parseFloat(item.estatisticas.mes.valor || "0").toFixed(2)),
      }));
  }, [colaboradores]);
  const abrirEdicao = (colaborador: Colaborador) => {
    setEditandoId(colaborador.id);
    setEditNome(colaborador.nome);
    setEditValorHora(String(colaborador.valorHora));
    setEditSenha("");
    setMostrarSenha(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("colaborador_token");
    localStorage.removeItem("colaborador_nome");
    localStorage.removeItem("colaborador_id");
    localStorage.removeItem("colaborador_isAdmin");
    router.push("/colaboradores");
  };

  const editarUsuario = async (id: number) => {
    if (!editNome || !editValorHora) {
      setError("Preencha nome e valor/hora.");
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
        throw new Error(data.error || "Nao foi possivel atualizar.");
      }

      setEditandoId(null);
      setEditSenha("");
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel atualizar.");
    } finally {
      setLoadingEdicao(false);
    }
  };

  const deletarUsuario = async (id: number, nome: string) => {
    if (!confirm(`Remover ${nome}?`)) return;

    try {
      const response = await fetch(`/api/colaboradores/${id}/deletar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Nao foi possivel remover.");
      }

      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel remover.");
    }
  };

  const criarNovoColaborador = async () => {
    if (!novoNome || !novoValorHora || !novoSenha) {
      setError("Preencha os campos do novo colaborador.");
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
        throw new Error(data.error || "Nao foi possivel criar.");
      }

      setCriarNovoVisivel(false);
      setNovoNome("");
      setNovoValorHora("");
      setNovoFuncao("ajudante");
      setNovoSenha("");
      setNovoIsAdmin(false);
      await carregarDados(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar.");
    } finally {
      setLoadingCriar(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#081423]" />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_24%),linear-gradient(180deg,#07111d_0%,#0b1727_55%,#101d31_100%)] text-white">
      <div className="mx-auto w-full max-w-[1800px] px-3 py-3 xl:px-5 xl:py-5">
        <div className="grid gap-4 xl:grid-cols-[260px,minmax(0,1fr)]">
          <aside className="rounded-[28px] border border-white/10 bg-slate-950/55 p-4 backdrop-blur xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)]">
            <div className="flex items-center gap-3 rounded-[22px] border border-cyan-400/20 bg-cyan-400/[0.08] p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Backoffice</p>
                <h2 className="truncate text-xl font-semibold text-white">CLYON Admin</h2>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                      active ? "bg-cyan-400 text-slate-950" : "bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="truncate font-medium">{item.label}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Sessao</p>
              <p className="mt-2 truncate text-2xl font-semibold text-white">{adminNome}</p>
              <div className="mt-4 grid gap-2">
                <CompactStat label="Admins" value={String(stats.admins)} />
                <CompactStat label="Equipa" value={String(stats.ativos)} />
              </div>
              <Button onClick={handleLogout} variant="outline" className="mt-4 h-11 w-full rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
                <LogOut className="mr-2 h-4 w-4" />Sair
              </Button>
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Painel</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Resumo e gestao da equipa</h1>
                </div>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:min-w-[720px]">
                  <KpiCard label="Hoje" value={`${decimal(stats.hoje.horas)}h`} helper={money(stats.hoje.valor)} tone="cyan" />
                  <KpiCard label="Semana" value={`${decimal(stats.semana.horas)}h`} helper={`${stats.semana.trabalhos} trabalhos`} tone="blue" />
                  <KpiCard label="15 dias" value={`${decimal(stats.ultimos15.horas)}h`} helper={money(stats.ultimos15.valor)} tone="violet" />
                  <KpiCard label="Mes" value={`${decimal(stats.mes.horas)}h`} helper={money(stats.mes.valor)} tone="emerald" />
                </div>
              </div>
              {error && <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
            </section>
            {activeSection === "overview" && (
              <>
                <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
                  <PanelCard title="Producao por periodo" icon={BarChart3}>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartResumo}>
                          <defs>
                            <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5} />
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                          <XAxis dataKey="periodo" stroke="#94a3b8" tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: "#081423", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }} />
                          <Area type="monotone" dataKey="horas" stroke="#22d3ee" strokeWidth={3} fill="url(#hoursFill)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </PanelCard>

                  <PanelCard title="Top da equipa" icon={Users}>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartEquipa} layout="vertical" margin={{ left: 10, right: 10 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
                          <XAxis type="number" stroke="#94a3b8" tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="nome" width={90} stroke="#cbd5e1" tickLine={false} axisLine={false} />
                          <Tooltip formatter={(value: number) => money(value)} contentStyle={{ background: "#081423", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }} />
                          <Bar dataKey="valor" radius={[8, 8, 8, 8]}>
                            {chartEquipa.map((_, index) => (
                              <Cell key={index} fill={["#22d3ee", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"][index % 5]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </PanelCard>
                </section>

                <section className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
                  <PanelCard title="Indicadores" icon={Clock3}>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <MetricTile label="Colaboradores" value={String(stats.ativos)} helper="Ativos" />
                      <MetricTile label="Admins" value={String(stats.admins)} helper="Acesso total" />
                      <MetricTile label="Valor/hora" value={money(stats.mediaHora)} helper="Media" />
                      <MetricTile label="Registos" value={String(todosRegistros.length)} helper="Total" />
                    </div>
                  </PanelCard>

                  <PanelCard title="Modulos" icon={Settings2}>
                    <div className="grid gap-3">
                      {siteModules.map((module) => (
                        <div key={module.title} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                              <module.icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-white">{module.title}</p>
                              <p className="truncate text-sm text-slate-400">{module.status}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 shrink-0 text-cyan-200" />
                        </div>
                      ))}
                    </div>
                  </PanelCard>
                </section>
              </>
            )}

            {activeSection === "hours" && (
              <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={filtroColaborador === "todos"} onClick={() => setFiltroColaborador("todos")} label="Toda a equipa" />
                  {colaboradores.map((colaborador) => (
                    <FilterPill key={colaborador.id} active={filtroColaborador === String(colaborador.id)} onClick={() => setFiltroColaborador(String(colaborador.id))} label={colaborador.nome} />
                  ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {todosRegistros.length === 0 && <div className="rounded-[24px] border border-dashed border-white/10 px-5 py-10 text-sm text-slate-400 xl:col-span-2">Sem registos para o filtro atual.</div>}
                  {todosRegistros.map((registro) => (
                    <Card key={registro.id} className="rounded-[24px] border-white/10 bg-slate-950/35 text-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <CardTitle className="truncate text-xl text-white">{registro.colaboradorNome}</CardTitle>
                            <p className="mt-1 text-sm text-slate-400">{formatDateTime(registro.data)}</p>
                          </div>
                          <div className="rounded-2xl bg-cyan-400/[0.12] px-3 py-2 text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Valor</p>
                            <p className="text-lg font-semibold text-white">{money(parseFloat(registro.valorTotal || "0"))}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <RecordMeta label="Entrada" value={registro.horaEntrada || "-"} icon={Clock3} />
                          <RecordMeta label="Pausa" value={registro.horaPausa || "-"} icon={CalendarClock} />
                          <RecordMeta label="Saida" value={registro.horaSaida || "-"} icon={ArrowRight} />
                          <RecordMeta label="Horas" value={`${decimal(parseFloat(registro.horasTrabalhadas || "0"))}h`} icon={BarChart3} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
            {activeSection === "team" && (
              <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <h2 className="text-2xl font-semibold text-white">Gestao da equipa</h2>
                  <Button type="button" onClick={() => setCriarNovoVisivel((state) => !state)} className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300">
                    {criarNovoVisivel ? <X className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    {criarNovoVisivel ? "Fechar" : "Novo colaborador"}
                  </Button>
                </div>

                {criarNovoVisivel && (
                  <Card className="rounded-[24px] border-white/10 bg-slate-950/35 text-white">
                    <CardContent className="grid gap-4 p-5 md:grid-cols-2">
                      <Field label="Nome"><input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan-300" placeholder="Ex.: WANDERSON" /></Field>
                      <Field label="Valor/hora"><input type="number" step="0.01" value={novoValorHora} onChange={(e) => setNovoValorHora(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan-300" placeholder="Ex.: 8.50" /></Field>
                      <Field label="Funcao">
                        <div className="grid gap-2 sm:grid-cols-3">
                          {(["ajudante", "motorista", "admin"] as const).map((funcao) => (
                            <button key={funcao} type="button" onClick={() => setNovoFuncao(funcao)} className={`rounded-2xl border px-4 py-3 text-sm font-medium capitalize transition ${novoFuncao === funcao ? "border-cyan-300 bg-cyan-400 text-slate-950" : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"}`}>{funcao}</button>
                          ))}
                        </div>
                      </Field>
                      <Field label="Palavra-passe">
                        <div className="relative">
                          <input type={mostrarSenhaNovoUsuario ? "text" : "password"} value={novoSenha} onChange={(e) => setNovoSenha(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-12 text-white outline-none focus:border-cyan-300" placeholder="Defina a senha" />
                          <button type="button" onClick={() => setMostrarSenhaNovoUsuario((state) => !state)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{mostrarSenhaNovoUsuario ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                        </div>
                      </Field>
                      <div className="md:col-span-2">
                        <button type="button" onClick={() => setNovoIsAdmin((state) => !state)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${novoIsAdmin ? "border-cyan-300 bg-cyan-400/[0.14] text-white" : "border-white/10 bg-white/[0.03] text-slate-300"}`}>
                          <div className={`h-5 w-5 rounded-full border ${novoIsAdmin ? "border-cyan-300 bg-cyan-300" : "border-white/30"}`} />Dar acesso de administrador
                        </button>
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button type="button" disabled={loadingCriar} onClick={criarNovoColaborador} className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300">{loadingCriar ? "A criar..." : "Criar colaborador"}</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 xl:grid-cols-2">
                  {colaboradores.map((colaborador) => {
                    const emEdicao = editandoId === colaborador.id;
                    return (
                      <Card key={colaborador.id} className="rounded-[24px] border-white/10 bg-slate-950/35 text-white">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <CardTitle className="truncate text-2xl text-white">{colaborador.nome}</CardTitle>
                              <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-300">
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 capitalize">{colaborador.funcao}</span>
                                {colaborador.isAdmin === 1 && <span className="rounded-full border border-cyan-300/30 bg-cyan-400/[0.14] px-3 py-1 text-cyan-100">Administrador</span>}
                              </div>
                            </div>
                            <div className="rounded-2xl bg-cyan-400/[0.12] px-3 py-2 text-right">
                              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Valor/hora</p>
                              <p className="text-lg font-semibold text-white">{money(parseFloat(colaborador.valorHora || "0"))}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <MiniStat label="Semana" value={`${decimal(parseFloat(colaborador.estatisticas.semana.horas || "0"))}h`} helper={`${colaborador.estatisticas.semana.trabalhos} trabalhos`} accent="cyan" />
                            <MiniStat label="15 dias" value={`${decimal(parseFloat(colaborador.estatisticas.ultimos15Dias.horas || "0"))}h`} helper={`${colaborador.estatisticas.ultimos15Dias.trabalhos} trabalhos`} accent="violet" />
                            <MiniStat label="Mes" value={`${decimal(parseFloat(colaborador.estatisticas.mes.horas || "0"))}h`} helper={money(parseFloat(colaborador.estatisticas.mes.valor || "0"))} accent="emerald" />
                          </div>

                          {emEdicao ? (
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field label="Nome"><input value={editNome} onChange={(e) => setEditNome(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan-300" /></Field>
                              <Field label="Valor/hora"><input type="number" step="0.01" value={editValorHora} onChange={(e) => setEditValorHora(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-cyan-300" /></Field>
                              <Field label="Nova palavra-passe">
                                <div className="relative">
                                  <input type={mostrarSenha ? "text" : "password"} value={editSenha} onChange={(e) => setEditSenha(e.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-12 text-white outline-none focus:border-cyan-300" placeholder="Opcional" />
                                  <button type="button" onClick={() => setMostrarSenha((state) => !state)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">{mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                </div>
                              </Field>
                              <div className="flex items-end justify-end gap-3 md:col-span-2">
                                <Button type="button" variant="outline" onClick={() => setEditandoId(null)} className="h-12 rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">Cancelar</Button>
                                <Button type="button" disabled={loadingEdicao} onClick={() => editarUsuario(colaborador.id)} className="h-12 rounded-2xl bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300">{loadingEdicao ? "A guardar..." : "Guardar"}</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-3">
                              <Button type="button" onClick={() => abrirEdicao(colaborador)} className="h-11 rounded-2xl bg-cyan-400 px-5 text-slate-950 hover:bg-cyan-300"><Pencil className="mr-2 h-4 w-4" />Editar</Button>
                              <Button type="button" variant="outline" onClick={() => deletarUsuario(colaborador.id, colaborador.nome)} className="h-11 rounded-2xl border-rose-300/20 bg-rose-400/[0.08] px-5 text-rose-100 hover:bg-rose-400/[0.14]"><Trash2 className="mr-2 h-4 w-4" />Remover</Button>
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
                <h2 className="text-2xl font-semibold text-white">Gestao do site</h2>
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                  {siteModules.map((module) => (
                    <Card key={module.title} className="rounded-[24px] border-white/10 bg-slate-950/35 text-white">
                      <CardContent className="flex h-full flex-col gap-4 p-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"><module.icon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-lg font-semibold text-white">{module.title}</p>
                          <p className="mt-1 text-sm text-slate-400">{module.status}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: "cyan" | "blue" | "violet" | "emerald" }) {
  const toneClass = { cyan: "border-cyan-300/20 bg-cyan-400/[0.08]", blue: "border-blue-300/20 bg-blue-500/[0.08]", violet: "border-violet-300/20 bg-violet-500/[0.08]", emerald: "border-emerald-300/20 bg-emerald-500/[0.08]" }[tone];
  return <div className={`rounded-[24px] border p-4 ${toneClass}`}><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{label}</p><p className="mt-3 truncate text-4xl font-semibold text-white">{value}</p><p className="mt-2 text-sm text-slate-300">{helper}</p></div>;
}

function PanelCard({ title, icon: Icon, children }: { title: string; icon: typeof LayoutDashboard; children: React.ReactNode }) {
  return <Card className="rounded-[28px] border-white/10 bg-slate-950/35 text-white"><CardHeader className="pb-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"><Icon className="h-5 w-5" /></div><CardTitle className="text-xl text-white">{title}</CardTitle></div></CardHeader><CardContent>{children}</CardContent></Card>;
}

function MetricTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p><p className="mt-2 text-sm text-slate-400">{helper}</p></div>;
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2"><span className="text-sm text-slate-300">{label}</span><span className="font-semibold text-white">{value}</span></div>;
}

function MiniStat({ label, value, helper, accent }: { label: string; value: string; helper: string; accent: "cyan" | "emerald" | "violet" }) {
  const accentClass = { cyan: "border-cyan-300/20 bg-cyan-400/[0.08] text-cyan-100", emerald: "border-emerald-300/20 bg-emerald-400/[0.08] text-emerald-100", violet: "border-violet-300/20 bg-violet-400/[0.08] text-violet-100" }[accent];
  return <div className={`rounded-[22px] border px-4 py-4 ${accentClass}`}><p className="text-xs uppercase tracking-[0.22em]">{label}</p><p className="mt-3 truncate text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-sm text-slate-300">{helper}</p></div>;
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-cyan-300 bg-cyan-400 text-slate-950" : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"}`}>{label}</button>;
}

function RecordMeta({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock3 }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"><div className="flex items-center gap-2 text-slate-400"><Icon className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.2em]">{label}</span></div><p className="mt-3 truncate text-lg font-semibold text-white">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-slate-200">{label}</span>{children}</label>;
}
