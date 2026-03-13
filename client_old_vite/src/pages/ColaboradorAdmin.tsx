import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Edit, Trash2, LogOut, Plus, ChevronDown, ChevronUp, X } from 'lucide-react';
import Header from '@/components/Header';

export default function ColaboradorAdmin() {
  const [location, setLocation] = useLocation();
  const navigate = setLocation;
  const [token, setToken] = useState<string>('');
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNome, setAdminNome] = useState<string>('');
  const [error, setError] = useState('');
  const [expandedColaborador, setExpandedColaborador] = useState<number | null>(null);
  const [expandedRegistros, setExpandedRegistros] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editValorHora, setEditValorHora] = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [editandoRegistroId, setEditandoRegistroId] = useState<number | null>(null);
  const [editRegistroData, setEditRegistroData] = useState('');
  const [editRegistroHoraEntrada, setEditRegistroHoraEntrada] = useState('');
  const [editRegistroHoraPausa, setEditRegistroHoraPausa] = useState('');
  const [editRegistroHoraSaida, setEditRegistroHoraSaida] = useState('');
  const [editRegistroNumeroTrabalhos, setEditRegistroNumeroTrabalhos] = useState('0');
  const [loadingEdicao, setLoadingEdicao] = useState(false);

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
  const [loadingEdicaoRegistro, setLoadingEdicaoRegistro] = useState(false);
  const [filtroColaborador, setFiltroColaborador] = useState('todos');
  const [historicoVisivel, setHistoricoVisivel] = useState(false);
  const [criarNovoVisivel, setCriarNovoVisivel] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValorHora, setNovoValorHora] = useState('');
  const [novoFuncao, setNovoFuncao] = useState('');
  const [novoSenha, setNovoSenha] = useState('');
  const [novoIsAdmin, setNovoIsAdmin] = useState(false);
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [mostrarSenhaNovoUsuario, setMostrarSenhaNovoUsuario] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('colaborador_token');
    const storedNome = localStorage.getItem('colaborador_nome');
    if (!storedToken) {
      navigate('/colaboradores');
      return;
    }
    setToken(storedToken);
    setAdminNome(storedNome || 'Admin');
    carregarDados(storedToken);
  }, []);

  const carregarDados = async (authToken: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/colaboradores/admin/todos', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados');
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      setColaboradores(Array.isArray(data) ? data : data.colaboradores || []);
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const criarNovoColaborador = async () => {
    if (!novoNome || !novoValorHora || !novoFuncao || !novoSenha) {
      setError('Preencha todos os campos');
      return;
    }

    const valorHora = parseFloat(novoValorHora);
    if (isNaN(valorHora)) {
      setError('Valor/hora invalido');
      return;
    }

    setLoadingCriar(true);
    try {
      const response = await fetch('/api/colaboradores/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: novoNome.toUpperCase(),
          senha: novoSenha,
          funcao: novoFuncao,
          valorHora: valorHora,
          isAdmin: novoIsAdmin ? 1 : 0
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar usuario');
      }

      setError('');
      setCriarNovoVisivel(false);
      setNovoNome('');
      setNovoValorHora('');
      setNovoFuncao('');
      setNovoSenha('');
      setNovoIsAdmin(false);
      carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCriar(false);
    }
  };

  const abrirFormularioCriar = () => {
    setCriarNovoVisivel(true);
  };

  const criarUsuarioAntigo = async () => {
    const nome = prompt('Nome do novo colaborador:');
    if (!nome) return;

    const valorHoraStr = prompt('Valor/hora (ex: 7):');
    if (!valorHoraStr) return;

    const valorHora = parseFloat(valorHoraStr);
    if (isNaN(valorHora)) {
      setError('Valor/hora inválido');
      return;
    }

    const funcao = prompt('Função (ex: Ajudante):');
    if (!funcao) return;

    try {
      const response = await fetch('/api/colaboradores/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: nome.toUpperCase(),
          senha: nome.toUpperCase() + '26',
          funcao: funcao,
          valorHora: valorHora,
          isAdmin: 0
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar usuário');
      }

      setError('');
      carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const editarUsuario = async (id: number) => {
    if (!editNome || !editValorHora) {
      setError('Preencha todos os campos');
      return;
    }

    setLoadingEdicao(true);
    try {
      const body: any = {
        nome: editNome,
        valorHora: parseFloat(editValorHora)
      };
      
      if (editSenha) {
        body.senha = editSenha;
      }
      
      const response = await fetch(`/api/colaboradores/${id}/editar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao editar usuário');
      }

      setEditandoId(null);
      setEditSenha('');
      setMostrarSenha(false);
      setError('');
      carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingEdicao(false);
    }
  };

  const deletarUsuario = async (id: number, nome: string) => {
    if (!confirm(`Tem certeza que deseja deletar ${nome}?`)) return;

    try {
      const response = await fetch(`/api/colaboradores/${id}/deletar`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar usuário');
      }

      setError('');
      carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const iniciarEdicaoRegistro = (registro: any) => {
    setEditandoRegistroId(registro.id);
    let dataFormatada = registro.data;
    if (registro.data && typeof registro.data === 'string') {
      if (registro.data.includes('T')) {
        dataFormatada = registro.data.split('T')[0];
      }
    }
    setEditRegistroData(dataFormatada);
    setEditRegistroHoraEntrada(registro.horaEntrada);
    setEditRegistroHoraPausa(registro.horaPausa || '');
    setEditRegistroHoraSaida(registro.horaSaida);
    setEditRegistroNumeroTrabalhos(registro.numeroTrabalhos.toString());
  };

  const salvarEdicaoRegistro = async (colaboradorId: number) => {
    if (!editRegistroData || !editRegistroHoraEntrada || !editRegistroHoraSaida) {
      setError('Preencha os campos obrigatórios');
      return;
    }

    setLoadingEdicaoRegistro(true);
    try {
      const response = await fetch(`/api/colaboradores/${colaboradorId}/registros/${editandoRegistroId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: editRegistroData,
          horaEntrada: editRegistroHoraEntrada,
          horaPausa: editRegistroHoraPausa,
          horaSaida: editRegistroHoraSaida,
          numeroTrabalhos: parseInt(editRegistroNumeroTrabalhos)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao editar registro');
      }

      setEditandoRegistroId(null);
      setError('');
      carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingEdicaoRegistro(false);
    }
  };

  const deletarRegistro = async (colaboradorId: number, registroId: number) => {
    if (!confirm('Tem certeza que deseja deletar este registro?')) return;

    try {
      const response = await fetch(`/api/colaboradores/${colaboradorId}/registros/${registroId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao deletar registro');
      }

      setError('');
      carregarDados(token);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('colaborador_token');
    localStorage.removeItem('colaborador_nome');
    localStorage.removeItem('colaborador_isAdmin');
    navigate('/colaboradores');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Calcular horas e valores de hoje (por colaborador)
  const hoje = new Date().toISOString().split('T')[0];
  const totaisHoje = colaboradores.reduce((acc, col) => {
    const registrosHoje = (col.registros || []).filter((r: any) => r.data.startsWith(hoje));
    const horas = registrosHoje.reduce((h: number, r: any) => {
      if (r.horaEntrada && r.horaSaida) {
        const [hE, mE] = r.horaEntrada.split(':').map(Number);
        const [hS, mS] = r.horaSaida.split(':').map(Number);
        let minutos = (hS * 60 + mS) - (hE * 60 + mE);
        if (r.horaPausa) {
          const [hP, mP] = r.horaPausa.split(':').map(Number);
          minutos -= (hP * 60 + mP);
        }
        return h + (minutos / 60);
      }
      return h;
    }, 0);
    const valorHora = parseFloat(col.valorHora) || 0;
    return {
      horas: acc.horas + horas,
      valor: acc.valor + (horas * valorHora)
    };
  }, { horas: 0, valor: 0 });
  const totalHorasHoje = totaisHoje.horas;
  const totalValorHoje = totaisHoje.valor;
  
  const totalHorasSemana = colaboradores.reduce((acc, col) => acc + (parseFloat(col.estatisticas?.semana?.horas) || 0), 0);
  const totalValorSemana = colaboradores.reduce((acc, col) => acc + (parseFloat(col.estatisticas?.semana?.valor) || 0), 0);
  const totalHoras15Dias = colaboradores.reduce((acc, col) => acc + (parseFloat(col.estatisticas?.ultimos15Dias?.horas) || 0), 0);
  const totalValor15Dias = colaboradores.reduce((acc, col) => acc + (parseFloat(col.estatisticas?.ultimos15Dias?.valor) || 0), 0);
  const totalHorasMes = colaboradores.reduce((acc, col) => acc + (parseFloat(col.estatisticas?.mes?.horas) || 0), 0);
  const totalValorMes = colaboradores.reduce((acc, col) => acc + (parseFloat(col.estatisticas?.mes?.valor) || 0), 0);
  const totalTrabalhos = colaboradores.reduce((acc, col) => acc + (col.registros?.length || 0), 0);

  const colaboradoresFiltrados = filtroColaborador === 'todos' 
    ? colaboradores 
    : colaboradores.filter(c => c.id === parseInt(filtroColaborador));

  // Buscar todos os registros para o histórico
  const todosRegistros = colaboradores.flatMap(col => 
    (col.registros || []).map((reg: any) => ({ ...reg, colaboradorNome: col.nome, colaboradorId: col.id }))
  ).sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 pt-24">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Painel de Gestão</h1>
            <p className="text-slate-400">Bem-vindo, {adminNome}</p>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="gap-2">
            <LogOut size={18} />
            Sair
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-0">
            <CardContent className="pt-6">
              <p className="text-orange-100 text-sm mb-2">Hoje</p>
              <p className="text-white text-3xl font-bold">{totalHorasHoje.toFixed(2)}h</p>
              <p className="text-orange-100 text-sm mt-2">€{totalValorHoje.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0">
            <CardContent className="pt-6">
              <p className="text-blue-100 text-sm mb-2">Esta Semana</p>
              <p className="text-white text-3xl font-bold">{totalHorasSemana.toFixed(2)}h</p>
              <p className="text-blue-100 text-sm mt-2">€{totalValorSemana.toFixed(2)}</p>
              <p className="text-blue-200 text-xs mt-2">{totalTrabalhos} trabalhos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-0">
            <CardContent className="pt-6">
              <p className="text-purple-100 text-sm mb-2">Últimos 15 Dias</p>
              <p className="text-white text-3xl font-bold">{totalHoras15Dias.toFixed(2)}h</p>
              <p className="text-purple-100 text-sm mt-2">€{totalValor15Dias.toFixed(2)}</p>
              <p className="text-purple-200 text-xs mt-2">{totalTrabalhos} trabalhos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-600 to-green-800 border-0">
            <CardContent className="pt-6">
              <p className="text-green-100 text-sm mb-2">Este Mês</p>
              <p className="text-white text-3xl font-bold">{totalHorasMes.toFixed(2)}h</p>
              <p className="text-green-100 text-sm mt-2">€{totalValorMes.toFixed(2)}</p>
              <p className="text-green-200 text-xs mt-2">{totalTrabalhos} trabalhos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-600 to-slate-800 border-0">
            <CardContent className="pt-6">
              <p className="text-slate-100 text-sm mb-2">Colaboradores</p>
              <p className="text-white text-3xl font-bold">{colaboradores.length}</p>
              <p className="text-slate-200 text-xs mt-2">Ativos no sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Botão Histórico Completo */}
        <div className="mb-6">
          <Button 
            onClick={() => setHistoricoVisivel(!historicoVisivel)}
            variant="outline"
            className="gap-2"
          >
            {historicoVisivel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            Histórico Completo de Registros
          </Button>
        </div>

        {/* Histórico Completo */}
        {historicoVisivel && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader className="bg-cyan-500/10 border-b border-slate-700">
              <CardTitle className="text-cyan-400">Histórico Completo de Registros</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {todosRegistros.length > 0 ? (
                  todosRegistros.map((reg) => (
                    <div key={`${reg.colaboradorId}-${reg.id}`} className="bg-slate-600 rounded p-3 flex justify-between items-center">
                      <div className="text-slate-200 text-sm flex-1">
                        <p><strong>{reg.colaboradorNome}</strong> - {reg.data.split('T')[0]} • {reg.horaEntrada} - {reg.horaSaida}</p>
                        <p className="text-slate-400">{reg.numeroTrabalhos} trabalhos</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => iniciarEdicaoRegistro(reg)}
                          className="gap-1"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletarRegistro(reg.colaboradorId, reg.id)}
                          className="gap-1"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">Nenhum registro encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtro de Colaborador */}
        <div className="mb-6">
          <Select value={filtroColaborador} onValueChange={setFiltroColaborador}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filtrar por Colaborador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os colaboradores</SelectItem>
              {colaboradores.map(col => (
                <SelectItem key={col.id} value={col.id.toString()}>
                  {col.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão Novo Colaborador */}
        <div className="mb-6">
          <Button onClick={abrirFormularioCriar} className="gap-2 bg-cyan-600 hover:bg-cyan-700">
            <Plus size={18} />
            Novo Colaborador
          </Button>
        </div>

        {/* Colaboradores */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="bg-cyan-500/10 border-b border-slate-700">
            <CardTitle className="text-cyan-400">Colaboradores ({colaboradores.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {colaboradores.map((col) => (
                <div key={col.id} className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{col.nome}</h3>
                      <p className="text-slate-400 text-sm">{col.tipo} • €{(parseFloat(col.valorHora) || 0).toFixed(2)}/h</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-semibold text-lg">€{(parseFloat(col.estatisticas?.mes?.valor) || 0).toFixed(2)}</p>
                      <p className="text-slate-400 text-xs">este mês</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="bg-slate-600 rounded p-2">
                      <p className="text-slate-400">Esta Semana</p>
                      <p className="text-white font-semibold">{(parseFloat(col.estatisticas?.semana?.horas) || 0).toFixed(2)}h</p>
                      <p className="text-slate-300">€{(parseFloat(col.estatisticas?.semana?.valor) || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-600 rounded p-2">
                      <p className="text-slate-400">15 Dias</p>
                      <p className="text-white font-semibold">{(parseFloat(col.estatisticas?.ultimos15Dias?.horas) || 0).toFixed(2)}h</p>
                      <p className="text-slate-300">€{(parseFloat(col.estatisticas?.ultimos15Dias?.valor) || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-600 rounded p-2">
                      <p className="text-slate-400">Registros</p>
                      <p className="text-white font-semibold">{col.registros?.length || 0}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditandoId(col.id);
                        setEditNome(col.nome);
                        setEditValorHora(col.valorHora.toString());
                        setEditSenha('');
                        setMostrarSenha(false);
                      }}
                      className="gap-1"
                    >
                      <Edit size={16} />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletarUsuario(col.id, col.nome)}
                      className="gap-1"
                    >
                      <Trash2 size={16} />
                      Deletar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExpandedRegistros(expandedRegistros === col.id ? null : col.id)}
                      className="gap-1 ml-auto"
                    >
                      {expandedRegistros === col.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      Ver Registros
                    </Button>
                  </div>

                  {/* Formulário de Edição Inline */}
                  {editandoId === col.id && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded mt-4 p-4">
                      <h4 className="text-yellow-400 font-semibold mb-3 text-sm">Editar Colaborador</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="text-slate-300 text-xs mb-1 block">Nome</label>
                          <input
                            type="text"
                            value={editNome}
                            onChange={(e) => setEditNome(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-xs mb-1 block">Valor/Hora</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editValorHora}
                            onChange={(e) => setEditValorHora(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-slate-300 text-xs mb-1 block">Nova Senha (opcional)</label>
                          <div className="relative">
                            <input
                              type={mostrarSenha ? "text" : "password"}
                              value={editSenha}
                              onChange={(e) => setEditSenha(e.target.value)}
                              placeholder="Deixe em branco para não alterar"
                              className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm pr-8"
                            />
                            <button
                              onClick={() => setMostrarSenha(!mostrarSenha)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            >
                              {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => editarUsuario(col.id)}
                          disabled={loadingEdicao}
                          className="bg-green-600 hover:bg-green-700 text-sm"
                        >
                          {loadingEdicao ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditandoId(null);
                            setEditSenha('');
                            setMostrarSenha(false);
                          }}
                          variant="outline"
                          className="text-sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  {expandedRegistros === col.id && col.registros && col.registros.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
                      {col.registros.map((reg: any) => (
                        <div key={reg.id}>
                          <div className="bg-slate-600 rounded p-3 flex justify-between items-center">
                            <div className="text-slate-200 text-sm">
                              <p>{reg.data} • {reg.horaEntrada} - {reg.horaSaida}</p>
                              <p className="text-slate-400">{reg.numeroTrabalhos} trabalhos</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => iniciarEdicaoRegistro(reg)}
                                className="gap-1"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletarRegistro(col.id, reg.id)}
                                className="gap-1"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Formulário de Edição Inline */}
                          {editandoRegistroId === reg.id && (
                            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded mt-2 p-4">
                              <h4 className="text-yellow-400 font-semibold mb-3 text-sm">Editar Registro</h4>
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                                <div>
                                  <label className="text-slate-300 text-xs mb-1 block">Data</label>
                                  <input
                                    type="date"
                                    value={editRegistroData}
                                    onChange={(e) => setEditRegistroData(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-300 text-xs mb-1 block">Nº Trabalhos</label>
                                  <input
                                    type="number"
                                    value={editRegistroNumeroTrabalhos}
                                    onChange={(e) => setEditRegistroNumeroTrabalhos(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-300 text-xs mb-1 block">Entrada</label>
                                  <input
                                    type="time"
                                    value={editRegistroHoraEntrada}
                                    onChange={(e) => setEditRegistroHoraEntrada(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-300 text-xs mb-1 block">Pausa</label>
                                  <input
                                    type="time"
                                    value={editRegistroHoraPausa}
                                    onChange={(e) => setEditRegistroHoraPausa(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-slate-300 text-xs mb-1 block">Saída</label>
                                  <input
                                    type="time"
                                    value={editRegistroHoraSaida}
                                    onChange={(e) => setEditRegistroHoraSaida(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 text-white rounded px-2 py-1 text-sm"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => salvarEdicaoRegistro(col.id)}
                                  disabled={loadingEdicaoRegistro}
                                  className="bg-green-600 hover:bg-green-700 text-sm"
                                >
                                  {loadingEdicaoRegistro ? 'Salvando...' : 'Salvar'}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => setEditandoRegistroId(null)}
                                  variant="outline"
                                  className="text-sm"
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal Criar Novo Colaborador */}
        {criarNovoVisivel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md">
              <CardHeader className="bg-cyan-500/10 border-b border-slate-700 flex flex-row items-center justify-between">
                <CardTitle className="text-cyan-400">Criar Novo Colaborador</CardTitle>
                <button onClick={() => setCriarNovoVisivel(false)} className="text-slate-400 hover:text-slate-200">
                  <X size={20} />
                </button>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-300 text-sm mb-1 block">Nome</label>
                    <input
                      type="text"
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: Rodrigo"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1 block">Valor/Hora</label>
                    <input
                      type="number"
                      step="0.01"
                      value={novoValorHora}
                      onChange={(e) => setNovoValorHora(e.target.value)}
                      placeholder="Ex: 8"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1 block">Funcao</label>
                    <input
                      type="text"
                      value={novoFuncao}
                      onChange={(e) => setNovoFuncao(e.target.value)}
                      placeholder="Ex: Ajudante"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm mb-1 block">Senha</label>
                    <div className="relative">
                      <input
                        type={mostrarSenhaNovoUsuario ? "text" : "password"}
                        value={novoSenha}
                        onChange={(e) => setNovoSenha(e.target.value)}
                        placeholder="Ex: MILITA26"
                        className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2 pr-8"
                      />
                      <button
                        onClick={() => setMostrarSenhaNovoUsuario(!mostrarSenhaNovoUsuario)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {mostrarSenhaNovoUsuario ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="novoIsAdmin"
                      checked={novoIsAdmin}
                      onChange={(e) => setNovoIsAdmin(e.target.checked)}
                      className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"
                    />
                    <label htmlFor="novoIsAdmin" className="text-slate-300 text-sm">Administrador</label>
                  </div>
                  {error && (
                    <div className="p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
                      {error}
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => setCriarNovoVisivel(false)}
                      variant="outline"
                      className="bg-slate-700 hover:bg-slate-600"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={criarNovoColaborador}
                      disabled={loadingCriar}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      {loadingCriar ? 'Criando...' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded text-red-200">
            {error}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
