"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  Clock3,
  DollarSign,
  Loader2,
  Pencil,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SectionId = "overview" | "team" | "hours" | "site";

type PeriodStats = {
  horas: string;
  valor: string;
  trabalhos: number;
};

type Registro = {
  id: number;
  colaboradorId: number;
  data: string;
  horaEntrada: string | null;
  horaPausa: string | null;
  horaSaida: string | null;
  numeroTrabalhos: number;
  horasTrabalhadas: string;
  valorTotal: string;
};

type Colaborador = {
  id: number;
  nome: string;
  funcao: string;
  valorHora: string;
  isAdmin: number;
  registros: Registro[];
  estatisticas: {
    semana: PeriodStats;
    ultimos15Dias: PeriodStats;
    mes: PeriodStats;
  };
};

type TeamResponse = {
  colaboradores: Colaborador[];
};

type SimulatorSetting = {
  key: string;
  label: string;
  category: string;
  unit: string;
  value: string;
  description: string;
};

type SettingsResponse = {
  settings: SimulatorSetting[];
};

type ColaboradorForm = {
  nome: string;
  funcao: string;
  valorHora: string;
  senha: string;
  isAdmin: boolean;
};

type RegistroEdit = {
  id: number;
  data: string;
  horaEntrada: string;
  horaPausa: string;
  horaSaida: string;
  numeroTrabalhos: string;
  valorTotal: string;
};

const sectionItems: Array<{ id: SectionId; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Inicio", icon: Activity },
  { id: "team", label: "Equipa", icon: Users },
  { id: "hours", label: "Relatorios", icon: Clock3 },
  { id: "site", label: "Site", icon: Settings2 },
];

const sectionLabelMap: Record<SectionId, string> = {
  overview: "Resumo",
  team: "Equipa",
  hours: "Horarios",
  site: "Simulador",
};

const emptyForm: ColaboradorForm = {
  nome: "",
  funcao: "motorista",
  valorHora: "9",
  senha: "",
  isAdmin: false,
};

function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("colaborador_token") || "";
}

function euro(value: number | string) {
  const parsed = Number(value || 0);
  return `${parsed.toFixed(2)} €`;
}

function compactHours(value: number | string) {
  return `${Number(value || 0).toFixed(1)}h`;
}

function toInputDate(value: string) {
  if (!value) return "";
  return value.split("T")[0] || value;
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function MetricCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone: "cyan" | "blue" | "teal" | "indigo" | "violet" | "emerald";
}) {
  const toneMap: Record<string, string> = {
    cyan: "from-cyan-500/18 to-cyan-500/6 border-cyan-400/30",
    blue: "from-sky-500/18 to-sky-500/6 border-sky-400/30",
    teal: "from-teal-500/18 to-teal-500/6 border-teal-400/30",
    indigo: "from-indigo-500/18 to-indigo-500/6 border-indigo-400/30",
    violet: "from-violet-500/18 to-violet-500/6 border-violet-400/30",
    emerald: "from-emerald-500/18 to-emerald-500/6 border-emerald-400/30",
  };

  return (
    <Card
      className={`rounded-[26px] border bg-gradient-to-br p-5 shadow-none ${toneMap[tone] ?? toneMap.cyan}`}
    >
      <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">{title}</p>
      <p className="mt-4 truncate text-[3rem] font-bold leading-none text-white">{value}</p>
      <p className="mt-3 truncate text-sm text-slate-200">{subtitle}</p>
    </Card>
  );
}

function MiniInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#081221] px-4 py-3">
      <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 truncate text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function AdminField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</Label>
      {children}
    </div>
  );
}

export default function ColaboradorAdminClient() {
  const [section, setSection] = useState<SectionId>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [settings, setSettings] = useState<SimulatorSetting[]>([]);
  const [siteValues, setSiteValues] = useState<Record<string, string>>({});
  const [savingSettingKey, setSavingSettingKey] = useState<string | null>(null);
  const [form, setForm] = useState<ColaboradorForm>(emptyForm);
  const [editingColabId, setEditingColabId] = useState<number | null>(null);
  const [savingColab, setSavingColab] = useState(false);
  const [selectedRegistroId, setSelectedRegistroId] = useState<number | null>(null);
  const [registroEdit, setRegistroEdit] = useState<RegistroEdit | null>(null);
  const [savingRegistro, setSavingRegistro] = useState(false);

  const currentUser =
    typeof window !== "undefined" ? window.localStorage.getItem("colaborador_nome") || "" : "";

  const loadAll = async (silent = false) => {
    const token = getToken();
    if (!token) {
      setError("Sessao invalida.");
      setLoading(false);
      return;
    }

    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [teamRes, settingsRes] = await Promise.all([
        fetch("/api/colaboradores/admin/todos", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/colaboradores/admin/settings/simulador", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!teamRes.ok || !settingsRes.ok) {
        throw new Error("Falha ao carregar dados do painel.");
      }

      const teamData = (await teamRes.json()) as TeamResponse;
      const settingsData = (await settingsRes.json()) as SettingsResponse;

      setColaboradores(teamData.colaboradores || []);
      setSettings(settingsData.settings || []);
      setSiteValues(
        Object.fromEntries((settingsData.settings || []).map((item) => [item.key, String(item.value)])),
      );
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o painel.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const allRegistros = useMemo(
    () =>
      colaboradores
        .flatMap((colab) =>
          colab.registros.map((registro) => ({
            ...registro,
            colaboradorNome: colab.nome,
            valorHora: colab.valorHora,
          })),
        )
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [colaboradores],
  );

  const totals = useMemo(() => {
    const admins = colaboradores.filter((item) => item.isAdmin === 1).length;
    const averageRate =
      colaboradores.reduce((sum, item) => sum + Number(item.valorHora || 0), 0) /
      Math.max(colaboradores.length, 1);
    const todayHours = allRegistros
      .filter((item) => toInputDate(item.data) === toInputDate(new Date().toISOString()))
      .reduce((sum, item) => sum + Number(item.horasTrabalhadas || 0), 0);
    const weekHours = colaboradores.reduce((sum, item) => sum + Number(item.estatisticas.semana.horas || 0), 0);
    const last15Hours = colaboradores.reduce(
      (sum, item) => sum + Number(item.estatisticas.ultimos15Dias.horas || 0),
      0,
    );
    const monthHours = colaboradores.reduce((sum, item) => sum + Number(item.estatisticas.mes.horas || 0), 0);

    return {
      teamCount: colaboradores.length,
      adminCount: admins,
      averageRate,
      todayHours,
      weekHours,
      last15Hours,
      monthHours,
    };
  }, [allRegistros, colaboradores]);

  const areaData = useMemo(
    () =>
      colaboradores.slice(0, 8).map((item) => ({
        nome: item.nome.split(" ")[0],
        horas: Number(item.estatisticas.mes.horas || 0),
        valor: Number(item.estatisticas.mes.valor || 0),
      })),
    [colaboradores],
  );

  const roleData = useMemo(() => {
    const counts = colaboradores.reduce<Record<string, number>>((acc, item) => {
      acc[item.funcao] = (acc[item.funcao] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [colaboradores]);

  const startEditColaborador = (colab: Colaborador) => {
    setEditingColabId(colab.id);
    setForm({
      nome: colab.nome,
      funcao: colab.funcao,
      valorHora: String(colab.valorHora),
      senha: "",
      isAdmin: colab.isAdmin === 1,
    });
    setSection("team");
  };

  const resetColaboradorForm = () => {
    setEditingColabId(null);
    setForm(emptyForm);
  };

  const saveColaborador = async () => {
    const token = getToken();
    if (!token) return;
    setSavingColab(true);
    try {
      const payload = {
        nome: form.nome.trim().toUpperCase(),
        funcao: form.funcao.trim() || "motorista",
        valorHora: form.valorHora,
        senha: form.senha,
        isAdmin: form.isAdmin,
      };

      const endpoint =
        editingColabId === null
          ? "/api/colaboradores/criar"
          : `/api/colaboradores/${editingColabId}/editar`;
      const method = editingColabId === null ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel guardar o colaborador.");
      }

      resetColaboradorForm();
      await loadAll(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao guardar colaborador.");
    } finally {
      setSavingColab(false);
    }
  };

  const removeColaborador = async (id: number) => {
    const token = getToken();
    if (!token) return;
    if (!window.confirm("Apagar colaborador?")) return;

    try {
      const response = await fetch(`/api/colaboradores/${id}/deletar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Nao foi possivel apagar o colaborador.");
      }
      await loadAll(true);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Falha ao apagar colaborador.");
    }
  };

  const selectRegistro = (registroId: number) => {
    const registro = allRegistros.find((item) => item.id === registroId);
    if (!registro) return;
    setSelectedRegistroId(registroId);
    setRegistroEdit({
      id: registro.id,
      data: toInputDate(registro.data),
      horaEntrada: registro.horaEntrada || "",
      horaPausa: registro.horaPausa || "",
      horaSaida: registro.horaSaida || "",
      numeroTrabalhos: String(registro.numeroTrabalhos || 0),
      valorTotal: String(registro.valorTotal || "0"),
    });
    setSection("hours");
  };

  const saveRegistro = async () => {
    const token = getToken();
    if (!token || !registroEdit) return;
    setSavingRegistro(true);
    try {
      const response = await fetch(`/api/colaboradores/registros/${registroEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registroEdit),
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel guardar o registo.");
      }

      await loadAll(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao guardar registo.");
    } finally {
      setSavingRegistro(false);
    }
  };

  const deleteRegistro = async (registroId: number) => {
    const token = getToken();
    if (!token) return;
    if (!window.confirm("Apagar este registo?")) return;

    try {
      const response = await fetch(`/api/colaboradores/registros/${registroId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel apagar o registo.");
      }

      if (selectedRegistroId === registroId) {
        setSelectedRegistroId(null);
        setRegistroEdit(null);
      }

      await loadAll(true);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Falha ao apagar registo.");
    }
  };

  const saveSetting = async (setting: SimulatorSetting) => {
    const token = getToken();
    if (!token) return;
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
          value: siteValues[setting.key],
        }),
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel guardar a configuracao.");
      }

      await loadAll(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Falha ao guardar configuracao.");
    } finally {
      setSavingSettingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081221] text-white">
        <div className="mx-auto flex min-h-screen max-w-[1800px] items-center justify-center px-6">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081221] text-white">
      <div className="mx-auto w-full max-w-[1800px] px-5 py-5 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-[#0a1628] p-4 shadow-[0_24px_70px_-44px_rgba(6,182,212,0.35)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3 rounded-[22px] border border-cyan-500/20 bg-[#0b2134] px-4 py-3">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Backoffice CLYON
                </p>
                <p className="truncate text-[1.9rem] font-bold leading-none text-white">Gestao</p>
              </div>
            </div>

            <div className="grid flex-1 gap-3 md:grid-cols-4 xl:max-w-[760px]">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`flex min-w-0 items-center justify-center gap-2 rounded-[18px] border px-3 py-3 text-sm font-semibold transition ${
                      active
                        ? "border-cyan-400 bg-cyan-500 text-slate-950"
                        : "border-white/10 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => void loadAll(true)}
                className="rounded-[18px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/colaboradores";
                }}
                className="rounded-[18px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-[1.55fr_1fr_1fr_1fr_1fr_1fr]">
          <MetricCard title="Colaboradores" value={String(totals.teamCount)} subtitle="ativos" tone="cyan" />
          <MetricCard title="Admins" value={String(totals.adminCount)} subtitle="acesso total" tone="blue" />
          <MetricCard title="Hoje" value={compactHours(totals.todayHours)} subtitle={euro(totals.todayHours * totals.averageRate)} tone="teal" />
          <MetricCard title="Semana" value={compactHours(totals.weekHours)} subtitle={`${allRegistros.length} registos`} tone="indigo" />
          <MetricCard title="15 dias" value={compactHours(totals.last15Hours)} subtitle={euro(totals.last15Hours * totals.averageRate)} tone="violet" />
          <MetricCard title="Mes" value={compactHours(totals.monthHours)} subtitle={euro(totals.monthHours * totals.averageRate)} tone="emerald" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-5">
            {section === "overview" ? (
              <>
                <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Producao</p>
                        <h2 className="text-[1.7rem] font-bold text-white">Resumo operacional</h2>
                      </div>
                    </div>
                    <MiniInfo title="Ticket medio" value={euro(totals.averageRate)} />
                  </div>

                  <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
                    <div className="rounded-[22px] border border-white/10 bg-[#081221] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Horas e valor por colaborador</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Mes</p>
                      </div>
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={areaData}>
                            <defs>
                              <linearGradient id="hoursFill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.55} />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                            <XAxis dataKey="nome" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip
                              contentStyle={{
                                background: "#0f172a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 16,
                                color: "#fff",
                              }}
                            />
                            <Area type="monotone" dataKey="horas" stroke="#22d3ee" strokeWidth={3} fill="url(#hoursFill)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <Card className="rounded-[22px] border border-white/10 bg-[#081221] p-4 shadow-none">
                        <p className="text-sm font-semibold text-white">Distribuicao da equipa</p>
                        <div className="mt-3 h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={roleData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={48}
                                outerRadius={74}
                                paddingAngle={4}
                                stroke="transparent"
                                fill="#22d3ee"
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "#0f172a",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  borderRadius: 16,
                                  color: "#fff",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="grid gap-2">
                          {roleData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-sm">
                              <span className="truncate text-slate-200">{item.name}</span>
                              <span className="font-semibold text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <Card className="rounded-[22px] border border-white/10 bg-[#081221] p-4 shadow-none">
                        <p className="text-sm font-semibold text-white">Alertas</p>
                        <div className="mt-3 space-y-2 text-sm text-slate-300">
                          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                            {allRegistros.filter((item) => !item.horaSaida).length} registos em aberto
                          </div>
                          <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
                            {settings.length} parametros do simulador configurados
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Equipa</p>
                      <h3 className="text-[1.5rem] font-bold text-white">Estado atual</h3>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setSection("team")}
                      className="rounded-[16px] bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                      Gerir equipa
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {colaboradores.map((colab) => (
                      <div key={colab.id} className="rounded-[20px] border border-white/10 bg-[#081221] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">{colab.nome}</p>
                            <p className="truncate text-xs uppercase tracking-[0.14em] text-slate-400">{colab.funcao}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${colab.isAdmin === 1 ? "bg-cyan-500/20 text-cyan-200" : "bg-white/10 text-slate-300"}`}>
                            {colab.isAdmin === 1 ? "admin" : "user"}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MiniInfo title="Valor/h" value={euro(colab.valorHora)} />
                          <MiniInfo title="Mes" value={compactHours(colab.estatisticas.mes.horas)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : null}

            {section === "team" ? (
              <div className="grid gap-5 xl:grid-cols-[0.92fr_1.35fr]">
                <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Colaborador</p>
                      <h2 className="text-[1.55rem] font-bold text-white">{editingColabId ? "Editar perfil" : "Novo colaborador"}</h2>
                    </div>
                    {editingColabId ? (
                      <Button
                        type="button"
                        onClick={resetColaboradorForm}
                        className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        Limpar
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4">
                    <AdminField label="Nome">
                      <Input value={form.nome} onChange={(event) => setForm((current) => ({ ...current, nome: event.target.value }))} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                    </AdminField>
                    <AdminField label="Funcao">
                      <Input value={form.funcao} onChange={(event) => setForm((current) => ({ ...current, funcao: event.target.value }))} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                    </AdminField>
                    <AdminField label="Valor por hora">
                      <Input value={form.valorHora} onChange={(event) => setForm((current) => ({ ...current, valorHora: event.target.value }))} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                    </AdminField>
                    <AdminField label={editingColabId ? "Nova palavra-passe (opcional)" : "Palavra-passe"}>
                      <Input value={form.senha} onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                    </AdminField>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#081221] px-4 py-3">
                      <Checkbox checked={form.isAdmin} onCheckedChange={(value) => setForm((current) => ({ ...current, isAdmin: value === true }))} />
                      <span className="text-sm text-slate-200">Acesso de administrador</span>
                    </div>
                    <Button
                      type="button"
                      disabled={savingColab}
                      onClick={() => void saveColaborador()}
                      className="h-11 rounded-[18px] bg-cyan-500 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                    >
                      {savingColab ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Guardar colaborador
                    </Button>
                  </div>
                </Card>

                <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Equipa</p>
                      <h2 className="text-[1.55rem] font-bold text-white">Gestao de acessos</h2>
                    </div>
                    <MiniInfo title="Total" value={String(colaboradores.length)} />
                  </div>

                  <div className="mt-5 grid gap-3">
                    {colaboradores.map((colab) => (
                      <div key={colab.id} className="grid gap-3 rounded-[22px] border border-white/10 bg-[#081221] p-4 lg:grid-cols-[1.1fr_0.8fr_0.8fr_auto] lg:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-white">{colab.nome}</p>
                          <p className="truncate text-sm text-slate-400">{colab.funcao}</p>
                        </div>
                        <div className="text-sm text-slate-300">{euro(colab.valorHora)}/h</div>
                        <div className="text-sm text-slate-300">{colab.isAdmin === 1 ? "Admin" : "Operacional"}</div>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" onClick={() => startEditColaborador(colab)} className="h-10 rounded-[14px] border border-white/10 bg-white/5 px-3 text-sm text-white hover:bg-white/10">
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button type="button" onClick={() => void removeColaborador(colab.id)} className="h-10 rounded-[14px] border border-rose-400/30 bg-rose-500/10 px-3 text-sm text-rose-100 hover:bg-rose-500/20">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Apagar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}

            {section === "hours" ? (
              <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
                <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Horarios</p>
                      <h2 className="text-[1.55rem] font-bold text-white">Registos e pausas</h2>
                    </div>
                    <MiniInfo title="Registos" value={String(allRegistros.length)} />
                  </div>

                  <div className="mt-5 grid gap-3">
                    {allRegistros.slice(0, 18).map((registro) => (
                      <button
                        key={registro.id}
                        type="button"
                        onClick={() => selectRegistro(registro.id)}
                        className={`grid gap-3 rounded-[22px] border p-4 text-left transition lg:grid-cols-[1fr_auto_auto_auto] lg:items-center ${
                          selectedRegistroId === registro.id
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-white/10 bg-[#081221] hover:border-cyan-400/40"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{registro.colaboradorNome}</p>
                          <p className="truncate text-xs uppercase tracking-[0.14em] text-slate-400">{formatDate(registro.data)}</p>
                        </div>
                        <div className="text-sm text-slate-300">{registro.horaEntrada || "--:--"} - {registro.horaSaida || "--:--"}</div>
                        <div className="text-sm text-slate-300">{registro.horaPausa || "00:00"} pausa</div>
                        <div className="text-sm font-semibold text-cyan-200">{euro(registro.valorTotal)}</div>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Edicao</p>
                      <h2 className="text-[1.55rem] font-bold text-white">Ajustar registo</h2>
                    </div>
                    {registroEdit ? <MiniInfo title="ID" value={`#${registroEdit.id}`} /> : null}
                  </div>

                  {registroEdit ? (
                    <div className="mt-5 grid gap-4">
                      <AdminField label="Data">
                        <Input value={registroEdit.data} onChange={(event) => setRegistroEdit((current) => current ? { ...current, data: event.target.value } : current)} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                      </AdminField>
                      <div className="grid gap-4 md:grid-cols-3">
                        <AdminField label="Entrada">
                          <Input value={registroEdit.horaEntrada} onChange={(event) => setRegistroEdit((current) => current ? { ...current, horaEntrada: event.target.value } : current)} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                        </AdminField>
                        <AdminField label="Pausa">
                          <Input value={registroEdit.horaPausa} onChange={(event) => setRegistroEdit((current) => current ? { ...current, horaPausa: event.target.value } : current)} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                        </AdminField>
                        <AdminField label="Saida">
                          <Input value={registroEdit.horaSaida} onChange={(event) => setRegistroEdit((current) => current ? { ...current, horaSaida: event.target.value } : current)} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                        </AdminField>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <AdminField label="Trabalhos">
                          <Input value={registroEdit.numeroTrabalhos} onChange={(event) => setRegistroEdit((current) => current ? { ...current, numeroTrabalhos: event.target.value } : current)} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                        </AdminField>
                        <AdminField label="Valor total">
                          <Input value={registroEdit.valorTotal} onChange={(event) => setRegistroEdit((current) => current ? { ...current, valorTotal: event.target.value } : current)} className="h-11 rounded-2xl border-white/10 bg-[#081221] text-white" />
                        </AdminField>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <Button type="button" disabled={savingRegistro} onClick={() => void saveRegistro()} className="h-11 rounded-[18px] bg-cyan-500 text-sm font-semibold text-slate-950 hover:bg-cyan-400">
                          {savingRegistro ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Guardar
                        </Button>
                        <Button type="button" onClick={() => void deleteRegistro(registroEdit.id)} className="h-11 rounded-[18px] border border-rose-400/30 bg-rose-500/10 text-sm font-semibold text-rose-100 hover:bg-rose-500/20">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Apagar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[22px] border border-dashed border-white/10 bg-[#081221] px-4 py-8 text-center text-sm text-slate-400">
                      Escolha um registo para editar horas, pausa, valor e trabalhos.
                    </div>
                  )}
                </Card>
              </div>
            ) : null}

            {section === "site" ? (
              <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Simulador</p>
                    <h2 className="text-[1.55rem] font-bold text-white">Parametros editaveis</h2>
                  </div>
                  <MiniInfo title="Campos" value={String(settings.length)} />
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-2">
                  {["moveis", "entulho", "mudancas", "acessos", "geral"].map((category) => (
                    <div key={category} className="rounded-[22px] border border-white/10 bg-[#081221] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">{category}</p>
                      <div className="mt-3 grid gap-3">
                        {settings
                          .filter((setting) => setting.category === category)
                          .map((setting) => (
                            <div key={setting.key} className="rounded-[18px] border border-white/8 bg-white/5 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">{setting.label}</p>
                                  <p className="mt-1 text-xs text-slate-400">{setting.description}</p>
                                </div>
                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.12em] text-slate-300">
                                  {setting.unit === "eur" ? "eur" : "mult"}
                                </span>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Input
                                  value={siteValues[setting.key] ?? ""}
                                  onChange={(event) =>
                                    setSiteValues((current) => ({
                                      ...current,
                                      [setting.key]: event.target.value,
                                    }))
                                  }
                                  className="h-10 rounded-2xl border-white/10 bg-[#0a1628] text-white"
                                />
                                <Button
                                  type="button"
                                  disabled={savingSettingKey === setting.key}
                                  onClick={() => void saveSetting(setting)}
                                  className="h-10 rounded-[14px] bg-cyan-500 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                                >
                                  {savingSettingKey === setting.key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-5">
            <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950">
                  <UserCog className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Sessao</p>
                  <h3 className="text-[1.45rem] font-bold text-white">{currentUser || "ADMIN"}</h3>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <MiniInfo title="Vista" value={sectionLabelMap[section]} />
                <MiniInfo title="Valor medio" value={euro(totals.averageRate)} />
                <MiniInfo title="Em aberto" value={String(allRegistros.filter((item) => !item.horaSaida).length)} />
              </div>
            </Card>

            <Card className="rounded-[26px] border border-white/10 bg-[#0a1628] p-5 shadow-none">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-cyan-300" />
                <h3 className="text-lg font-semibold text-white">Financeiro rapido</h3>
              </div>
              <div className="mt-4 grid gap-3">
                <MiniInfo title="Hoje" value={euro(totals.todayHours * totals.averageRate)} />
                <MiniInfo title="15 dias" value={euro(totals.last15Hours * totals.averageRate)} />
                <MiniInfo title="Mes" value={euro(totals.monthHours * totals.averageRate)} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
