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

type AdminSection = "overview" | "team" | "hours" | "site";

const sectionLabels: Record<AdminSection, string> = {
  overview: "Visão geral",
  team: "Equipa",
  hours: "Horários e registos",
  site: "Gestão do site",
};

const siteModules = [
  {
    title: "Galeria de trabalhos",
    description:
      "Área preparada para gerir fotografias, capas, destaques e ordem visual dos trabalhos reais.",
    status: "Planeado",
    icon: ImagePlus,
  },
  {
    title: "Valores do simulador",
    description:
      "Estrutura pensada para ajustar preços, margens, regras de cálculo e cenários de orçamento.",
    status: "Próxima fase",
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

const money = (value: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);

const decimal = (value: number) =>
  new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatDateTime = (value?: string) => {
  if (!value) return "Sem data";
  const date = new Date(value);
  return `${new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)} · ${date.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
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

    return {
      hoje: totalHoje,
      semana,
      ultimos15,
      mes,
      ativos: colaboradores.length,
      mediaHora,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081423] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
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
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="w-full rounded-[34px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-80">
          <div className="flex items-center gap-3 rounded-[28px] border border-cyan-400/20 bg-cyan-400/[0.08] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Backoffice CLYON
              </p>
              <h2 className="text-lg font-semibold text-white">Gestão operacional</h2>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {[
              { id: "overview" as const, icon: LayoutDashboard },
              { id: "team" as const, icon: Users },
              { id: "hours" as const, icon: CalendarClock },
              { id: "site" as const, icon: Settings2 },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-cyan-400 text-slate-950 shadow-[0_18px_45px_rgba(34,211,238,0.25)]"
                      : "bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{sectionLabels[item.id]}</span>
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Sessão ativa
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{adminNome}</h3>
            <p className="mt-1 text-sm text-slate-400">
              Painel pensado para gerir horários, equipa e futuras atualizações do site.
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="mt-4 h-11 w-full rounded-2xl border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair do painel
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Central de gestão
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Um painel mais profissional para gerir equipa, horários e a próxima fase do site.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  A nova dashboard foi desenhada para controlar a operação diária agora e servir mais tarde
                  como base para atualizar fotos, textos e valores do simulador sem depender de código.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MiniStat
                  label="Colaboradores ativos"
                  value={String(dashboardStats.ativos)}
                  helper="Equipa com acesso ao sistema"
                  accent="cyan"
                />
                <MiniStat
                  label="Valor/hora médio"
                  value={money(dashboardStats.mediaHora)}
                  helper="Referência geral da equipa"
                  accent="emerald"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </section>

          {activeSection === "overview" && (
            <>
              <section className="grid gap-4 xl:grid-cols-4">
                <QuickStat
                  title="Hoje"
                  hours={`${decimal(dashboardStats.hoje.horas)}h`}
                  value={money(dashboardStats.hoje.valor)}
                  helper={`${dashboardStats.hoje.trabalhos} trabalhos registados`}
                  tone="cyan"
                />
                <QuickStat
                  title="Esta semana"
                  hours={`${decimal(dashboardStats.semana.horas)}h`}
                  value={money(dashboardStats.semana.valor)}
                  helper={`${dashboardStats.semana.trabalhos} trabalhos concluídos`}
                  tone="blue"
                />
                <QuickStat
                  title="Últimos 15 dias"
                  hours={`${decimal(dashboardStats.ultimos15.horas)}h`}
                  value={money(dashboardStats.ultimos15.valor)}
                  helper={`${dashboardStats.ultimos15.trabalhos} trabalhos registados`}
                  tone="violet"
                />
                <QuickStat
                  title="Este mês"
                  hours={`${decimal(dashboardStats.mes.horas)}h`}
                  value={money(dashboardStats.mes.valor)}
                  helper={`${dashboardStats.mes.trabalhos} trabalhos registados`}
                  tone="emerald"
                />
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.5fr,1fr]">
                <ActionCard
                  title="Centro de operação"
                  description="Atalhos rápidos para a rotina da gestão e para o que vem a seguir no backoffice."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <StatSurface
                      icon={Users}
                      title="Gestão de equipa"
                      body="Crie colaboradores, atualize valores/hora, altere acessos e mantenha a operação organizada."
                    />
                    <StatSurface
                      icon={CalendarClock}
                      title="Controlo de horários"
                      body="Acompanhe registos, volume de trabalhos e produtividade por colaborador e por período."
                    />
                    <StatSurface
                      icon={Wrench}
                      title="Pronto para crescer"
                      body="A estrutura já está pensada para suportar gestão de conteúdo do site no próximo passo."
                    />
                    <StatSurface
                      icon={CheckCircle2}
                      title="Visão executiva"
                      body="As métricas principais estão concentradas num único painel para decisões mais rápidas."
                    />
                  </div>
                </ActionCard>

                <ActionCard
                  title="Melhor desempenho do mês"
                  description="Resumo rápido da equipa com melhor faturação no período atual."
                >
                  <div className="space-y-3">
                    {topColaboradores.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
                        Ainda não existem registos suficientes para ordenar o ranking.
                      </div>
                    )}
                    {topColaboradores.map((colaborador, index) => (
                      <div
                        key={colaborador.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                              Top {index + 1}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-white">{colaborador.nome}</h3>
                            <p className="text-sm text-slate-400 capitalize">{colaborador.funcao}</p>
                          </div>
                          <div className="rounded-2xl bg-cyan-400/[0.12] px-3 py-2 text-right">
                            <p className="text-sm text-cyan-100">
                              {decimal(parseFloat(colaborador.estatisticas.mes.horas || "0"))}h
                            </p>
                            <p className="text-base font-semibold text-white">
                              {money(parseFloat(colaborador.estatisticas.mes.valor || "0"))}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ActionCard>
              </section>
            </>
          )}

          {activeSection === "hours" && (
            <section className="space-y-5 rounded-[34px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Gestão operacional
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">Horários e registos da equipa</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Filtra por colaborador, acompanha a cronologia de entradas e saídas e percebe quem está a
                    gerar mais trabalho no terreno.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  Último registo:{" "}
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
                  <div className="rounded-[28px] border border-dashed border-white/10 px-5 py-10 text-sm text-slate-400 xl:col-span-2">
                    Ainda não existem registos para o filtro escolhido.
                  </div>
                )}
                {todosRegistros.map((registro) => (
                  <Card
                    key={registro.id}
                    className="rounded-[30px] border-white/10 bg-slate-950/35 text-white shadow-[0_18px_60px_rgba(15,23,42,0.25)]"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-xl text-white">{registro.colaboradorNome}</CardTitle>
                          <CardDescription className="mt-1 text-slate-400">
                            {formatDateTime(registro.data)}
                          </CardDescription>
                        </div>
                        <div className="rounded-2xl bg-cyan-400/[0.12] px-3 py-2 text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Valor</p>
                          <p className="text-lg font-semibold text-white">
                            {money(parseFloat(registro.valorTotal || "0"))}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <RecordMeta label="Entrada" value={registro.horaEntrada || "—"} icon={Clock3} />
                        <RecordMeta label="Pausa" value={registro.horaPausa || "—"} icon={CalendarClock} />
                        <RecordMeta label="Saída" value={registro.horaSaida || "—"} icon={CheckCircle2} />
                        <RecordMeta
                          label="Horas"
                          value={`${decimal(parseFloat(registro.horasTrabalhadas || "0"))}h`}
                          icon={Briefcase}
                        />
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                        <span className="font-medium text-white">{registro.numeroTrabalhos}</span> trabalho(s)
                        registado(s) neste turno.
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {activeSection === "team" && (
            <section className="space-y-5 rounded-[34px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Estrutura da equipa
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">Gestão completa de colaboradores</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Centraliza acessos, funções, valores/hora e futuras permissões de gestão para cada membro.
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
                <Card className="rounded-[30px] border-white/10 bg-slate-950/35 text-white">
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
                            label="Últimos 15 dias"
                            value={`${decimal(parseFloat(colaborador.estatisticas.ultimos15Dias.horas || "0"))}h`}
                            helper={`${colaborador.estatisticas.ultimos15Dias.trabalhos} trabalhos`}
                            accent="violet"
                          />
                          <MiniStat
                            label="Este mês"
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
                                {loadingEdicao ? "A guardar..." : "Guardar alterações"}
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
            <section className="space-y-5 rounded-[34px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                    Próxima fase
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">Gestão do site e do simulador</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                    Esta área já está preparada como mapa funcional do próximo passo: mexer em fotos, textos e
                    valores do simulador a partir do backoffice.
                  </p>
                </div>
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.08] px-4 py-3 text-sm text-cyan-100">
                  Módulos em preparação para a futura gestão de conteúdo.
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {siteModules.map((module) => (
                  <ActionCard
                    key={module.title}
                    title={module.title}
                    description={module.description}
                    compact
                  >
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                          <module.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{module.status}</p>
                          <p className="text-xs text-slate-400">Módulo reservado na arquitetura</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-cyan-200" />
                    </div>
                  </ActionCard>
                ))}
              </div>

              <ActionCard
                title="Como esta área vai evoluir"
                description="Plano pensado para transformar o painel num verdadeiro centro de edição do negócio."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <StatSurface
                    icon={ImagePlus}
                    title="Troca de fotografias"
                    body="Substituição de imagens da home, trabalhos reais, capas de serviço e galerias locais."
                  />
                  <StatSurface
                    icon={Euro}
                    title="Preços do simulador"
                    body="Definição de margens, multiplicadores, extras e regras por serviço sem mexer no código."
                  />
                  <StatSurface
                    icon={Sparkles}
                    title="Textos de campanha"
                    body="Atualização de títulos, CTAs, destaques sazonais e mensagens promocionais em minutos."
                  />
                </div>
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
      className={`rounded-[30px] border bg-[linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(255,255,255,0.02))] p-1 text-white shadow-[0_18px_60px_rgba(15,23,42,0.25)] ${toneClass}`}
    >
      <CardContent className="rounded-[26px] bg-slate-950/45 p-5">
        <p className="text-sm uppercase tracking-[0.22em] text-slate-300">{title}</p>
        <p className="mt-4 text-4xl font-semibold text-white">{hours}</p>
        <p className="mt-2 text-sm text-slate-400">{value}</p>
        <p className="mt-5 text-sm text-slate-300">{helper}</p>
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
    <Card className="rounded-[32px] border-white/10 bg-slate-950/35 text-white shadow-[0_18px_60px_rgba(15,23,42,0.2)]">
      <CardHeader className={compact ? "pb-4" : "pb-5"}>
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
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
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-300">{body}</p>
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
    <div className={`rounded-[26px] border px-4 py-4 ${accentClass}`}>
      <p className="text-xs uppercase tracking-[0.22em]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
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
      <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}
