"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  LogOut, Clock, Calendar, Briefcase, DollarSign, 
  Loader2, Save, AlertCircle, CheckCircle, Lock, PlayCircle, PauseCircle, StopCircle, History
} from "lucide-react";
import { HistoricoHorasModal } from "@/components/HistoricoHorasModal";

interface Estatisticas {
  horas: string;
  valor: string;
  trabalhos: number;
  dias: number;
}

interface DadosEstatisticas {
  semana: Estatisticas & { periodo?: string };
  ultimos15Dias: Estatisticas;
  mes: Estatisticas;
  registros: any[];
}

interface RegistroEmAberto {
  id: number;
  data: string;
  horaEntrada: string;
  horaPausa: string | null;
  horaSaida: string | null;
  numeroTrabalhos: number;
}

export default function ColaboradorDashboard() {
  const router = useRouter();
  
  const [nomeColaborador, setNomeColaborador] = useState("");
  const [loading, setLoading] = useState(true);

  // Add noindex meta tag for SEO
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [estatisticas, setEstatisticas] = useState<DadosEstatisticas | null>(null);
  const [registroEmAberto, setRegistroEmAberto] = useState<RegistroEmAberto | null>(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);

  // Campos do formulário para NOVA entrada
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horaEntrada, setHoraEntrada] = useState("");
  const [numeroTrabalhos, setNumeroTrabalhos] = useState("0");

  // Campos para ATUALIZAR registro em aberto
  const [horaPausaUpdate, setHoraPausaUpdate] = useState("");
  const [horaSaidaUpdate, setHoraSaidaUpdate] = useState("");
  const [numeroTrabalhosUpdate, setNumeroTrabalhosUpdate] = useState("0");

  useEffect(() => {
    const token = localStorage.getItem("colaborador_token");
    const nome = localStorage.getItem("colaborador_nome");
    const id = localStorage.getItem("colaborador_id");
    
    if (!token) {
      router.push("/colaboradores");
      return;
    }
    
    setNomeColaborador(nome || "");
    if (id) setColaboradorId(parseInt(id));
    carregarDados(token);
  }, []);

  const carregarDados = async (token: string) => {
    try {
      // Carregar estatísticas
      const responseEstatisticas = await fetch("/api/colaboradores/estatisticas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!responseEstatisticas.ok) {
        if (responseEstatisticas.status === 401) {
          localStorage.removeItem("colaborador_token");
          router.push("/colaboradores");
          return;
        }
        throw new Error("Erro ao carregar estatísticas");
      }
      
      const dataEstatisticas = await responseEstatisticas.json();
      setEstatisticas(dataEstatisticas);

      // Carregar registro em aberto
      const responseRegistro = await fetch("/api/colaboradores/registro-em-aberto", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (responseRegistro.ok) {
        const dataRegistro = await responseRegistro.json();
        if (dataRegistro.registroAberto) {
          setRegistroEmAberto(dataRegistro.registroAberto);
          setHoraPausaUpdate(dataRegistro.registroAberto.horaPausa || "");
          setHoraSaidaUpdate(dataRegistro.registroAberto.horaSaida || "");
          setNumeroTrabalhosUpdate(dataRegistro.registroAberto.numeroTrabalhos.toString());
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("colaborador_token");
    localStorage.removeItem("colaborador_nome");
    localStorage.removeItem("colaborador_id");
    localStorage.removeItem("colaborador_isAdmin");
    router.push("/colaboradores");
  };

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const token = localStorage.getItem("colaborador_token");
    if (!token) {
      router.push("/colaboradores");
      return;
    }

    try {
      const response = await fetch("/api/colaboradores/registrar-horas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data,
          horaEntrada,
          horaPausa: null,
          horaSaida: null,
          numeroTrabalhos: parseInt(numeroTrabalhos)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao registrar entrada");
      }

      setSuccess("Entrada registrada com sucesso!");
      setHoraEntrada("");
      setNumeroTrabalhos("0");
      
      // Recarregar dados
      await carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAtualizarRegistro = async (tipo: 'pausa' | 'saida') => {
    setError("");
    setSuccess("");
    setSaving(true);

    const token = localStorage.getItem("colaborador_token");
    if (!token || !registroEmAberto) {
      router.push("/colaboradores");
      return;
    }

    try {
      const body: any = {
        numeroTrabalhos: parseInt(numeroTrabalhosUpdate)
      };

      if (tipo === 'pausa') {
        body.horaPausa = horaPausaUpdate;
      } else if (tipo === 'saida') {
        body.horaSaida = horaSaidaUpdate;
        if (horaPausaUpdate) {
          body.horaPausa = horaPausaUpdate;
        }
      }

      const response = await fetch(`/api/colaboradores/atualizar-registro/${registroEmAberto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar registro");
      }

      setSuccess(tipo === 'pausa' ? "Pausa registrada com sucesso!" : "Saída registrada com sucesso!");
      
      // Recarregar dados
      await carregarDados(token);
      
      // Se registrou saída, limpar o registro em aberto
      if (tipo === 'saida') {
        setRegistroEmAberto(null);
        setHoraPausaUpdate("");
        setHoraSaidaUpdate("");
        setNumeroTrabalhosUpdate("0");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-[#0a1f3d] via-[#0d2847] to-[#0a1f3d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0097b2] animate-spin" />
      </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f3d] via-[#0d2847] to-[#0a1f3d] p-4 pt-24">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Olá, {nomeColaborador}!</h1>
            <p className="text-gray-400">Registe as suas horas de trabalho</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowHistorico(true)}
              className="text-white border-white/30 hover:bg-white/10"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/colaboradores/alterar-senha")}
              className="text-white border-white/30 hover:bg-white/10"
            >
              <Lock className="w-4 h-4 mr-2" />
              Alterar Senha
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-white border-white/30 hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">{estatisticas?.semana.periodo || "Semana 6"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{estatisticas?.semana.horas || "0"}h</div>
              <div className="text-[#0097b2] font-semibold">€{estatisticas?.semana.valor || "0.00"}</div>
              <div className="text-xs text-gray-400">{estatisticas?.semana.trabalhos || 0} trabalhos</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Últimos 15 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{estatisticas?.ultimos15Dias.horas || "0"}h</div>
              <div className="text-[#0097b2] font-semibold">€{estatisticas?.ultimos15Dias.valor || "0.00"}</div>
              <div className="text-xs text-gray-400">{estatisticas?.ultimos15Dias.trabalhos || 0} trabalhos</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Este Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{estatisticas?.mes.horas || "0"}h</div>
              <div className="text-[#0097b2] font-semibold">€{estatisticas?.mes.valor || "0.00"}</div>
              <div className="text-xs text-gray-400">{estatisticas?.mes.trabalhos || 0} trabalhos</div>
            </CardContent>
          </Card>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-2 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center gap-2 text-green-200">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* REGISTRO EM ABERTO */}
        {registroEmAberto && (
          <Card className="shadow-2xl mb-6 border-[#0097b2] border-2">
            <CardHeader className="bg-[#0097b2]/10">
              <CardTitle className="text-[#0097b2] flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Registro em Aberto
              </CardTitle>
              <CardDescription>
                Entrada registrada em {new Date(registroEmAberto.data).toLocaleDateString('pt-PT')} às {registroEmAberto.horaEntrada}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-900 font-semibold">
                    <PauseCircle className="w-4 h-4" />
                    Hora Pausa (opcional)
                  </Label>
                  <Input
                    type="time"
                    value={horaPausaUpdate}
                    onChange={(e) => setHoraPausaUpdate(e.target.value)}
                    disabled={saving || !!registroEmAberto.horaSaida}
                    className="bg-white border-2 border-[#0097b2] text-gray-900 font-semibold placeholder-gray-500 focus:ring-2 focus:ring-[#0097b2] focus:border-[#0097b2]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-900 font-semibold">
                    <StopCircle className="w-4 h-4" />
                    Hora Saída
                  </Label>
                  <Input
                    type="time"
                    value={horaSaidaUpdate}
                    onChange={(e) => setHoraSaidaUpdate(e.target.value)}
                    disabled={saving || !!registroEmAberto.horaSaida}
                    className="bg-white border-2 border-red-500 text-gray-900 font-semibold placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-900 font-semibold">
                    <Briefcase className="w-4 h-4" />
                    Nº de Trabalhos
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={numeroTrabalhosUpdate}
                    onChange={(e) => setNumeroTrabalhosUpdate(e.target.value)}
                    disabled={saving || !!registroEmAberto.horaSaida}
                    className="bg-white border-2 border-orange-500 text-gray-900 font-semibold placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {!registroEmAberto.horaSaida && (
                <div className="flex gap-3">
                  {!registroEmAberto.horaPausa && horaPausaUpdate && (
                    <Button
                      onClick={() => handleAtualizarRegistro('pausa')}
                      disabled={saving || !horaPausaUpdate}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <PauseCircle className="w-4 h-4 mr-2" />
                          Registrar Pausa
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    onClick={() => handleAtualizarRegistro('saida')}
                    disabled={saving || !horaSaidaUpdate}
                    className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <StopCircle className="w-4 h-4 mr-2" />
                        Registrar Saída
                      </>
                    )}
                  </Button>
                </div>
              )}

              {registroEmAberto.horaSaida && (
                <div className="p-3 bg-green-900/30 border border-green-700 rounded text-green-200 text-sm">
                  ✓ Registro completo! Saída registrada às {registroEmAberto.horaSaida}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* FORMULÁRIO DE NOVA ENTRADA */}
        {!registroEmAberto && (
          <Card className="shadow-2xl">
            <CardHeader>
              <CardTitle className="text-[#0097b2] flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Registrar Entrada
              </CardTitle>
              <CardDescription>
                Registre sua entrada para começar o dia de trabalho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegistrarEntrada} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Data
                    </Label>
                    <Input
                      id="data"
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="horaEntrada" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Hora Entrada
                    </Label>
                    <Input
                      id="horaEntrada"
                      type="time"
                      value={horaEntrada}
                      onChange={(e) => setHoraEntrada(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numeroTrabalhos" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Nº de Trabalhos
                    </Label>
                    <Input
                      id="numeroTrabalhos"
                      type="number"
                      min="0"
                      value={numeroTrabalhos}
                      onChange={(e) => setNumeroTrabalhos(e.target.value)}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0097b2] hover:bg-[#007a8f] text-white font-semibold h-12"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Registrar Entrada
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Histórico de Registros */}
        {estatisticas && estatisticas.registros.length > 0 && (
          <Card className="mt-6 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-[#0097b2]">Histórico Recente</CardTitle>
              <CardDescription>Seus últimos registros de horas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estatisticas.registros.slice(0, 5).map((registro: any) => (
                  <div
                    key={registro.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-200">
                      <div className="text-slate-800 font-bold text-base">
                        {registro.dataFormatada || (typeof registro.data === 'string' ? new Date(registro.data).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Data indisponível')}
                      </div>
                      <div className="text-[#0097b2] font-bold text-lg">{registro.horasTrabalhadas}h</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-slate-700 mt-2">
                      <div>Entrada: {registro.horaEntrada}</div>
                      <div>Pausa: {registro.horaPausa || '--:--'}</div>
                      <div>Saída: {registro.horaSaida || '--:--'}</div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      {registro.numeroTrabalhos} trabalho(s)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
      
      {/* Modal de Histórico */}
      {colaboradorId && (
        <HistoricoHorasModal
          isOpen={showHistorico}
          onClose={() => setShowHistorico(false)}
          colaboradorId={colaboradorId}
          colaboradorNome={nomeColaborador}
        />
      )}
    </>
  );
}
