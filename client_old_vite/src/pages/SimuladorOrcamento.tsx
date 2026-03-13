import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, Phone, ArrowLeft, Loader } from "lucide-react";


type Categoria = "moveis" | "entulho" | "mudancas" | null;

const ENDERECO_PADRAO = "Av. Q.ta das Laranjeiras, 2865-688 Fernão Ferro, Portugal";

const categorias = [
  {
    id: "moveis" as const,
    nome: "Móveis",
    descricao: "Recolha e remoção de móveis antigos ou danificados",
    icone: "🛋️"
  },
  {
    id: "entulho" as const,
    nome: "Entulho",
    descricao: "Remoção de entulho de obras e construção",
    icone: "🏗️"
  },

  {
    id: "mudancas" as const,
    nome: "Mudanças",
    descricao: "Serviço completo de mudança de residências ou comércios",
    icone: "📦"
  }
];

export default function SimuladorOrcamento() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria>(null);
  const [tipoTrabalho, setTipoTrabalho] = useState("");

  const [enderecoPartida, setEnderecoPartida] = useState("");
  const [enderecoCheagada, setEnderecoCheagada] = useState("");
  const [tipoAcesso, setTipoAcesso] = useState("");
  const [quantidadePessoas, setQuantidadePessoas] = useState("");
  const [tempoEstimado, setTempoEstimado] = useState("");
  
  const [numeroAndares, setNumeroAndares] = useState("");
  const [temElevador, setTemElevador] = useState("");
  const [acessoDificil, setAcessoDificil] = useState(false);
  const [orcamentoCalculado, setOrcamentoCalculado] = useState<number | null>(null);
  
  // Estados para lógica de entulho
  const [entulhoEmSacos, setEntulhoEmSacos] = useState("");
  const [quantidadeSacosEntulho, setQuantidadeSacosEntulho] = useState("");
  
  // Estados para lógica de móveis
  const [moveisTipo, setMoveisTipo] = useState("");
  const [moveisCargas, setMoveisCargas] = useState("1");
  const [moveisPequeno, setMoveisPequeno] = useState("");
  const [moveisMedio, setMoveisMedio] = useState("");
  const [moveisGrande, setMoveisGrande] = useState("");
  
  // Estados para localização de endereços
  const [sugestoesPartida, setSugestoesPartida] = useState<any[]>([]);
  const [sugestoesCheagada, setSugestoesCheagada] = useState<any[]>([]);
  const [carregandoPartida, setCarregandoPartida] = useState(false);
  const [carregandoCheagada, setCarregandoCheagada] = useState(false);
  const [distancia, setDistancia] = useState<number | null>(null);
  const [carregandoDistancia, setCarregandoDistancia] = useState(false);
  const [erroDistancia, setErroDistancia] = useState<string | null>(null);
  const [aguardandoCalculo, setAguardandoCalculo] = useState(false);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCategoriaSelecionada = (categoria: Categoria) => {
    setCategoriaSelecionada(categoria);
    setTipoTrabalho(categoria || "");
    // Resetar campos quando mudar de categoria
    setOrcamentoCalculado(null);
    setEntulhoEmSacos("");
    setQuantidadeSacosEntulho("");
    setMoveisTipo("");
    setMoveisCargas("");
    setMoveisPequeno("");
    setMoveisMedio("");
    setMoveisGrande("");
  };

  // Inicializar Google Maps Services
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
      const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
      const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;
      
      const script = document.createElement("script");
      script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places,geocoding,routes`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.google) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          directionsServiceRef.current = new window.google.maps.DirectionsService();
        }
      };
      document.head.appendChild(script);
    };
    
    // Inicializar Google Maps para todas as categorias (não apenas mudanças)
    if (!autocompleteServiceRef.current) {
      initializeGoogleMaps();
    }
  }, []);

  // Buscar sugestões de endereço de partida
  const buscarSugestoesPartida = async (input: string) => {
    if (!input || input.length < 3 || !autocompleteServiceRef.current) {
      setSugestoesPartida([]);
      return;
    }
    
    setCarregandoPartida(true);
    try {
      const predictions = await autocompleteServiceRef.current.getPlacePredictions({
        input,
        componentRestrictions: { country: "pt" },
        types: ["address"]
      });
      setSugestoesPartida(predictions.predictions || []);
    } catch (error) {
      console.error("Erro ao buscar sugestões de partida:", error);
      setSugestoesPartida([]);
    } finally {
      setCarregandoPartida(false);
    }
  };

  // Buscar sugestões de endereço de chegada
  const buscarSugestoesCheagada = async (input: string) => {
    if (!input || input.length < 3 || !autocompleteServiceRef.current) {
      setSugestoesCheagada([]);
      return;
    }
    
    setCarregandoCheagada(true);
    try {
      const predictions = await autocompleteServiceRef.current.getPlacePredictions({
        input,
        componentRestrictions: { country: "pt" },
        types: ["address"]
      });
      setSugestoesCheagada(predictions.predictions || []);
    } catch (error) {
      console.error("Erro ao buscar sugestões de chegada:", error);
      setSugestoesCheagada([]);
    } finally {
      setCarregandoCheagada(false);
    }
  };

  // Calcular distância entre dois endereços
  const calcularDistancia = async () => {
    const partida = tipoTrabalho === "mudancas" ? enderecoPartida : ENDERECO_PADRAO;
    
    if (!partida || !enderecoCheagada || !directionsServiceRef.current) {
      return;
    }
    
    setCarregandoDistancia(true);
    setErroDistancia(null);
    try {
      // Geocodificar ambos os endereços para obter coordenadas
      const coordPartida = await geocodificarEndereco(partida);
      const coordDestino = await geocodificarEndereco(enderecoCheagada);
      
      if (!coordPartida || !coordDestino) {
        setDistancia(null);
        setErroDistancia("Não foi possível validar os endereços. Verifique e tente novamente.");
        setCarregandoDistancia(false);
        return;
      }
      
      const result = await directionsServiceRef.current.route({
        origin: coordPartida,
        destination: coordDestino,
        travelMode: window.google.maps.TravelMode.DRIVING
      });
      
      if (result.status === "OK" && result.routes && result.routes[0] && result.routes[0].legs && result.routes[0].legs[0]) {
        const distanciaMetros = result.routes[0].legs[0].distance.value;
        const distanciaKm = distanciaMetros / 1000;
        setDistancia(Math.round(distanciaKm * 10) / 10);
        setErroDistancia(null);
      } else if (result.status === "ZERO_RESULTS") {
        setDistancia(null);
        setErroDistancia("Não foi possível encontrar uma rota. Verifique os endereços.");
      } else {
        setDistancia(null);
        setErroDistancia(`Erro: ${result.status}`);
      }
    } catch (error) {
      console.error("Erro ao calcular distância:", error);
      setDistancia(null);
      setErroDistancia("Erro ao calcular a distância.");
    } finally {
      setCarregandoDistancia(false);
    }
  };


  // Geocodificar endereço para obter coordenadas
  const geocodificarEndereco = async (endereco: string) => {
    if (!endereco || !window.google) {
      return null;
    }
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({ address: endereco });
      
      if (result.results && result.results.length > 0) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
    } catch (error) {
      console.error("Erro ao geocodificar endereço:", error);
    }
    
    return null;
  };

  // Calcular distância quando ambos os endereços forem preenchidos
  // Cálculo manual de distância - sem debounce automático

  // Limpar orçamento calculado quando distância muda
  // Isso força o usuário a recalcular após alterar a distância
  useEffect(() => {
    if (tipoTrabalho === "mudancas" && distancia !== null) {
      setOrcamentoCalculado(null);
    }
  }, [distancia, tipoTrabalho]);

  const handleVoltar = () => {
    setCategoriaSelecionada(null);
    setTipoTrabalho("");
    setEnderecoPartida("");
    setEnderecoCheagada("");
    setTipoAcesso("");
    setQuantidadePessoas("");
    setTempoEstimado("");
    setNumeroAndares("");
    setTemElevador("");
    setAcessoDificil(false);
    setOrcamentoCalculado(null);
    setEntulhoEmSacos("");
    setQuantidadeSacosEntulho("");
    setMoveisTipo("");
    setMoveisCargas("");
    setMoveisPequeno("");
    setMoveisMedio("");
    setMoveisGrande("");
  };

  const calcularOrcamento = () => {
    let subtotal = 0;
    
    // Lógica especial para Móveis Por Item
    if ((tipoTrabalho === "moveis" || tipoTrabalho === "moveis-monos") && moveisTipo === "item") {
      const qtdPequeno = parseInt(moveisPequeno) || 0;
      const qtdMedio = parseInt(moveisMedio) || 0;
      const qtdGrande = parseInt(moveisGrande) || 0;
      
      const custoItens = (qtdPequeno * 5) + (qtdMedio * 7) + (qtdGrande * 13);
      
      // Custo de distancia (km x €2,50/km)
      const custoDistancia = (distancia || 0) * 2.5;
      
      let adicionalAcesso = 0;
      if (tipoAcesso === "apartamento") {
        const andares = parseInt(numeroAndares) || 0;
        if (temElevador === "sim") {
          adicionalAcesso = andares * 3;
        } else if (temElevador === "nao") {
          adicionalAcesso = andares * 6;
        }
      }
      
      const adicionalDificuldade = acessoDificil ? 30 : 0;
      const subtotalItens = custoItens + custoDistancia + adicionalAcesso + adicionalDificuldade;
      // Margem de 30%
      subtotal = subtotalItens * 1.30;
    } else if ((tipoTrabalho === "moveis" || tipoTrabalho === "moveis-monos") && moveisTipo === "carga") {
      // Móveis Por Carga: Nova fórmula
      const horasUsuario = parseFloat(tempoEstimado) || 0;
      const pessoasUsuario = parseInt(quantidadePessoas) || 1;
      
      // Tempo real = tempo + 2 horas fixas (descarregar a carrinha)
      const horasReais = horasUsuario + 2;
      
      // Pessoas reais = pessoas + 1 (carrinha)
      const pessoasReais = pessoasUsuario + 1;
      
      // Mão de obra
      const custoMaoDeObra = horasReais * pessoasReais * 9;
      
      // Subtotal (antes de acesso e margem)
      const subtotalBase = custoMaoDeObra;
      
      // Acesso
      let adicionalAcesso = 0;
      if (tipoAcesso === "apartamento") {
        const andares = parseInt(numeroAndares) || 0;
        if (temElevador === "sim") {
          adicionalAcesso = andares * 3;
        } else if (temElevador === "nao") {
          adicionalAcesso = andares * 6;
        }
      }
      
      const adicionalDificuldade = acessoDificil ? 30 : 0;
      
      // Margem de 35% sobre subtotal base
      const margem = subtotalBase * 0.35;
      
      // Subtotal com acesso e margem (antes de multiplicar por cargas)
      const subtotalComMargem = subtotalBase + adicionalAcesso + adicionalDificuldade + margem;
      
      // Multiplicar por número de cargas
      const numeroCargas = parseInt(moveisCargas) || 1;
      subtotal = subtotalComMargem * numeroCargas;
    } else {
      // Lógica padrão para Entulho, Móveis e Monos, Mudanças
      const horasTrabalho = parseFloat(tempoEstimado) || 0;
      const pessoas = parseInt(quantidadePessoas) || 1;
      
      let custoMaoDeObra = horasTrabalho * pessoas * 9;
      
      // Adicional por tipo de material
      let adicionalMaterial = 0;
      if (tipoTrabalho === "entulho" || tipoTrabalho === "moveis-monos") {
        const sacos = parseInt(quantidadeSacosEntulho) || 0;
        if (entulhoEmSacos === "sacos") {
          adicionalMaterial = sacos * 1; // €1.00 por saco
        } else if (entulhoEmSacos === "chao") {
          adicionalMaterial = sacos * 1.5; // €1.50 por saco no chão
        }
      } else if (tipoTrabalho === "monos") {
        adicionalMaterial = 30;
      } else if (tipoTrabalho === "misto") {
        adicionalMaterial = 40;
      }
      

      // Adicional por tipo de acesso
      let adicionalAcesso = 0;
      if (tipoAcesso === "apartamento") {
        const andares = parseInt(numeroAndares) || 0;
        if (temElevador === "sim") {
          adicionalAcesso = andares * 3;
        } else if (temElevador === "nao") {
          adicionalAcesso = andares * 6;
        }
      }
      
      const adicionalDificuldade = acessoDificil ? 30 : 0;
      const subtotalBase = custoMaoDeObra + adicionalMaterial + adicionalAcesso + adicionalDificuldade;
      
      if (tipoTrabalho === "entulho") {
        // Margem de 30% para Entulho
        subtotal = subtotalBase * 1.30;
      } else if (tipoTrabalho === "mudancas" && distancia !== null) {
        // Adicionar custo de distância
        const custoDistancia = distancia * 2.5; // €2.50 por km
        // Somar km ao subtotal ANTES de aplicar margem de 40%
        const subtotalComDistancia = subtotalBase + custoDistancia;
        // Aplicar margem de 40% sobre subtotal + km
        subtotal = subtotalComDistancia * 1.40;
      } else {
        subtotal = subtotalBase;
      }
    }
    
    setOrcamentoCalculado(Math.round(subtotal * 100) / 100);
  };

  const podeCalcular = (() => {
    if (!tipoTrabalho) return false;
    
    if ((tipoTrabalho === "moveis" || tipoTrabalho === "moveis-monos") && !moveisTipo) return false;
    
    if (tipoTrabalho === "entulho" || tipoTrabalho === "moveis-monos") {
      if (!entulhoEmSacos) return false;
      if (!quantidadeSacosEntulho) return false; // Obrigatório para ambas opções
    }
    
    if (tipoTrabalho === "mudancas") {
      return enderecoPartida && enderecoCheagada && tipoAcesso && quantidadePessoas && tempoEstimado && distancia !== null;
    }
    
    return enderecoCheagada && tipoAcesso && quantidadePessoas && tempoEstimado;
  })();

  const handleWhatsApp = () => {
    let mensagem = `Olá! Fiz uma simulação de orçamento no site e gostaria de confirmar:\n\n📋 Detalhes:\n`;
    
    if (tipoTrabalho === "mudancas") {
      mensagem += `- Endereço de Partida: ${enderecoPartida}\n- Endereço de Chegada: ${enderecoCheagada}\n- Distância: ${distancia} km\n`;
    } else {
      mensagem += `- Tipo de material: ${tipoTrabalho}\n`;
    }
    
    mensagem += `- Tipo de acesso: ${tipoAcesso}${
      tipoAcesso === "apartamento"
        ? `\n- Andares: ${numeroAndares}\n- Elevador: ${temElevador}`
        : ""
    }\n- Pessoas necessárias: ${quantidadePessoas}\n- Tempo estimado: ${tempoEstimado}h\n- Acesso difícil: ${acessoDificil ? "Sim" : "Não"}\n\n💰 Valor estimado: €${orcamentoCalculado}\n\nPosso agendar?`;
    
    const numeroWhatsApp = tipoTrabalho === "mudancas" ? "351924370335" : "351931632622";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");
  };

  // Tela de seleção de categorias
  if (!categoriaSelecionada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
          
      <main className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0097b2] rounded-full mb-4">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                  Simulador de Orçamento
                </h2>
                <p className="text-lg text-slate-600">
                  Selecione a categoria de serviço para simular o orçamento
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categorias.map((categoria) => (
                  <Card
                    key={categoria.id}
                    className="p-4 cursor-pointer hover:shadow-lg hover:border-[#0097b2] transition-all hover:scale-105"
                    onClick={() => handleCategoriaSelecionada(categoria.id)}
                  >
                    <div className="text-3xl mb-3">{categoria.icone}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {categoria.nome}
                    </h3>
                    <p className="text-slate-600 text-xs mb-3">
                      {categoria.descricao}
                    </p>
                    <Button className="w-full bg-[#0097b2] hover:bg-[#007a99] text-white text-sm py-2">
                      Selecionar
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </main>
      </div>
    );
  }

  // Tela de simulação
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleVoltar}
              className="flex items-center gap-2 text-[#0097b2] hover:text-[#007a99] transition mb-8 font-semibold"
            >
              <ArrowLeft size={20} />
              Voltar para Categorias
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0097b2] rounded-full mb-4">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                {tipoTrabalho === "mudancas" ? "Simulador Mudanças" : "Simulador de Orçamento"}
              </h2>
              <p className="text-lg text-slate-600">
                Preencha os dados abaixo e descubra quanto custará o seu serviço
              </p>
            </div>

            <Card className="p-6 md:p-8 shadow-lg">
              <div className="space-y-6">
                {/* Campos condicionais para Móveis e Móveis e Monos */}
                {(tipoTrabalho === "moveis" || tipoTrabalho === "moveis-monos") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="moveis-tipo" className="text-base font-semibold">
                        Como deseja calcular? *
                      </Label>
                      <Select value={moveisTipo} onValueChange={setMoveisTipo}>
                        <SelectTrigger id="moveis-tipo" className="text-base">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="carga">
                            Por Carga - Carga completa cheia (muita quantidade)
                          </SelectItem>
                          <SelectItem value="item">
                            Por Item - Calculado por item (pouca quantidade)
                          </SelectItem>
                        </SelectContent>
                      </Select>

                    </div>

                    {moveisTipo === "carga" && (
                      <div className="space-y-2 pl-4 border-l-4 border-[#0097b2]">
                        <Label htmlFor="cargas" className="text-base font-semibold">
                          Quantas cargas? *
                        </Label>
                        <Input
                          id="cargas"
                          type="number"
                          min="1"
                          placeholder="Ex: 1"
                          value={moveisCargas}
                          onChange={(e) => setMoveisCargas(e.target.value)}
                          className="text-base"
                        />

                      </div>
                    )}

                    {moveisTipo === "item" && (
                      <div className="space-y-4 pl-4 border-l-4 border-[#0097b2]">
                        <div className="space-y-2">
                          <Label htmlFor="pequeno" className="text-base font-semibold">
                            Móvel Pequeno
                          </Label>
                          <p className="text-sm text-gray-600">micro-ondas, forno, máquina de café, mesinha de cabeceira...</p>
                          <Input
                            id="pequeno"
                            type="number"
                            min="0"
                            max="20"
                            placeholder="Quantidade (máx 20)"
                            value={moveisPequeno}
                            onChange={(e) => setMoveisPequeno(e.target.value)}
                            className="text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="medio" className="text-base font-semibold">
                            Móvel Médio
                          </Label>
                          <p className="text-sm text-gray-600">fogão, frigorífico bar...</p>
                          <Input
                            id="medio"
                            type="number"
                            min="0"
                            max="20"
                            placeholder="Quantidade (máx 20)"
                            value={moveisMedio}
                            onChange={(e) => setMoveisMedio(e.target.value)}
                            className="text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="grande" className="text-base font-semibold">
                            Móvel Grande
                          </Label>
                          <p className="text-sm text-gray-600">geladeira, máquina de lavar (pesada), sofá, armário...</p>
                          <Input
                            id="grande"
                            type="number"
                            min="0"
                            max="20"
                            placeholder="Quantidade (máx 20)"
                            value={moveisGrande}
                            onChange={(e) => setMoveisGrande(e.target.value)}
                            className="text-base"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Campos condicionais para Entulho e Móveis e Monos */}
                {(tipoTrabalho === "entulho" || tipoTrabalho === "moveis-monos") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="entulho-tipo" className="text-base font-semibold">
                        O entulho está em sacos ou no chão? *
                      </Label>
                      <Select value={entulhoEmSacos} onValueChange={setEntulhoEmSacos}>
                        <SelectTrigger id="entulho-tipo" className="text-base">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sacos">O entulho está em sacos</SelectItem>
                          <SelectItem value="chao">O entulho está no chão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {entulhoEmSacos && (
                      <div className="space-y-2">
                        <Label htmlFor="qtd-sacos" className="text-base font-semibold">
                          Quantidade de sacos *
                        </Label>
                        <Input
                          id="qtd-sacos"
                          type="number"
                          placeholder="Ex: 100"
                          value={quantidadeSacosEntulho}
                          onChange={(e) => setQuantidadeSacosEntulho(e.target.value)}
                          min="1"
                          className="text-base"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* REGIÃO ou ENDEREÇOS */}
                {tipoTrabalho === "mudancas" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="endereco-partida" className="text-base font-semibold flex items-center gap-2">
                        <span className="bg-[#0097b2] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                        Endereço de Partida *
                      </Label>
                      <div className="relative">
                        <Input
                          id="endereco-partida"
                          type="text"
                          placeholder="Ex: Rua da Paz, 123, Lisboa"
                          value={enderecoPartida}
                          onChange={(e) => {
                            setEnderecoPartida(e.target.value);
                            buscarSugestoesPartida(e.target.value);
                          }}
                          className="text-base"
                        />
                        {carregandoPartida && <Loader className="absolute right-3 top-3 h-5 w-5 animate-spin text-[#0097b2]" />}
                        {sugestoesPartida.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                            {sugestoesPartida.map((sugestao, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setEnderecoPartida(sugestao.description);
                                  setSugestoesPartida([]);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                              >
                                {sugestao.description}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco-chegada" className="text-base font-semibold flex items-center gap-2">
                        <span className="bg-[#0097b2] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                        Endereço de Chegada *
                      </Label>
                      <div className="relative">
                        <Input
                          id="endereco-chegada"
                          type="text"
                          placeholder="Ex: Avenida Paulista, 456, São Paulo"
                          value={enderecoCheagada}
                          onChange={(e) => {
                            setEnderecoCheagada(e.target.value);
                            buscarSugestoesCheagada(e.target.value);
                          }}
                          className="text-base"
                        />
                        {carregandoCheagada && <Loader className="absolute right-3 top-3 h-5 w-5 animate-spin text-[#0097b2]" />}
                        {sugestoesCheagada.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                            {sugestoesCheagada.map((sugestao, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setEnderecoCheagada(sugestao.description);
                                  setSugestoesCheagada([]);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                              >
                                {sugestao.description}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão para calcular distância manualmente */}
                    {/* Mostrar indicador de aguardando */}
                    <Button
                      onClick={calcularDistancia}
                      disabled={carregandoDistancia || !enderecoCheagada}
                      className="w-full bg-[#0097b2] hover:bg-[#007a99] text-white py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {carregandoDistancia ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Calculando Rota...
                        </>
                      ) : (
                        "Calcular Rota"
                      )}
                    </Button>
                    
                    {/* Mostrar distância calculada */}
                    {distancia !== null && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600">Distância calculada:</p>
                        <p className="text-2xl font-bold text-[#0097b2]">{distancia} km</p>
                      </div>
                    )}
                    {carregandoDistancia && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                        <Loader className="h-5 w-5 animate-spin text-[#0097b2]" />
                        <p className="text-sm text-gray-600">Calculando distância...</p>
                      </div>
                    )}
                    {erroDistancia && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">⚠️ {erroDistancia}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="endereco-destino" className="text-base font-semibold flex items-center gap-2">
                        <span className="bg-[#0097b2] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                        Endereço de Destino *
                      </Label>
                      <div className="relative">
                        <Input
                          id="endereco-destino"
                          type="text"
                          placeholder="Ex: Rua da Paz, 123, Lisboa"
                          value={enderecoCheagada}
                          onChange={(e) => {
                            setEnderecoCheagada(e.target.value);
                            buscarSugestoesCheagada(e.target.value);
                          }}
                          className="text-base"
                        />
                        {carregandoCheagada && <Loader className="absolute right-3 top-3 h-5 w-5 animate-spin text-[#0097b2]" />}
                        {sugestoesCheagada.length > 0 && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                            {sugestoesCheagada.map((sugestao, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setEnderecoCheagada(sugestao.description);
                                  setSugestoesCheagada([]);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                              >
                                {sugestao.description}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botão para calcular rota manualmente */}
                    <Button
                      onClick={calcularDistancia}
                      disabled={carregandoDistancia || !enderecoCheagada}
                      className="w-full bg-[#0097b2] hover:bg-[#007a99] text-white py-3 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                    >
                      {carregandoDistancia ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Calculando Rota...
                        </>
                      ) : (
                        "Calcular Rota"
                      )}
                    </Button>
                    {distancia !== null && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-gray-600">Distância calculada:</p>
                        <p className="text-2xl font-bold text-[#0097b2]">{distancia} km</p>
                      </div>
                    )}
                    {carregandoDistancia && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-2">
                        <Loader className="h-5 w-5 animate-spin text-[#0097b2]" />
                        <p className="text-sm text-gray-600">Calculando distância...</p>
                      </div>
                    )}
                    {erroDistancia && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">⚠️ {erroDistancia}</p>
                      </div>
                    )}
                  </>
                )}

                {/* TIPO DE ACESSO */}
                <div className="space-y-2">
                  <Label htmlFor="acesso" className="text-base font-semibold flex items-center gap-2">
                    <span className="bg-[#0097b2] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{tipoTrabalho === "mudancas" ? "3" : "2"}</span>
                    Tipo de Acesso *
                  </Label>
                  <Select value={tipoAcesso} onValueChange={setTipoAcesso}>
                    <SelectTrigger id="acesso" className="text-base">
                      <SelectValue placeholder="Selecione o tipo de acesso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campos condicionais para Apartamento */}
                {tipoAcesso === "apartamento" && (
                  <div className="space-y-4 pl-4 border-l-4 border-[#0097b2]">
                    <div className="space-y-2">
                      <Label htmlFor="andares" className="text-base font-semibold">
                        Número de Andares *
                      </Label>
                      <Input
                        id="andares"
                        type="number"
                        min="0"
                        max="30"
                        placeholder="Ex: 3"
                        value={numeroAndares}
                        onChange={(e) => setNumeroAndares(e.target.value)}
                        className="text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="elevador" className="text-base font-semibold">
                        Tem Elevador? *
                      </Label>
                      <Select value={temElevador} onValueChange={setTemElevador}>
                        <SelectTrigger id="elevador" className="text-base">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="nao">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* QUANTIDADE DE PESSOAS */}
                <div className="space-y-2">
                  <Label htmlFor="pessoas" className="text-base font-semibold flex items-center gap-2">
                    <span className="bg-[#0097b2] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{tipoTrabalho === "mudancas" ? "4" : "3"}</span>
                    Quantidade de Pessoas Necessárias *
                  </Label>
                  <Select value={quantidadePessoas} onValueChange={setQuantidadePessoas}>
                    <SelectTrigger id="pessoas" className="text-base">
                      <SelectValue placeholder="Selecione a quantidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "pessoa" : "pessoas"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* TEMPO ESTIMADO */}
                <div className="space-y-2">
                  <Label htmlFor="tempo" className="text-base font-semibold flex items-center gap-2">
                    <span className="bg-[#0097b2] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">{tipoTrabalho === "mudancas" ? "5" : "4"}</span>
                    Tempo Estimado (horas) *
                  </Label>
                  <Input
                    id="tempo"
                    type="number"
                    min="0.3"
                    step="0.3"
                    placeholder="Ex: 2.5"
                    value={tempoEstimado}
                    onChange={(e) => setTempoEstimado(e.target.value)}
                    className="text-base"
                  />
                </div>

                {/* Acesso Difícil */}
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                  <Checkbox
                    id="dificil"
                    checked={acessoDificil}
                    onCheckedChange={(checked) => setAcessoDificil(checked as boolean)}
                  />
                  <Label htmlFor="dificil" className="text-base font-medium cursor-pointer">
                    O acesso é considerado difícil (escadas estreitas, sem estacionamento próximo, etc.)
                  </Label>
                </div>

                {/* Botão Calcular */}
                <Button
                  onClick={calcularOrcamento}
                  disabled={!podeCalcular}
                  className="w-full bg-[#0097b2] hover:bg-[#007a99] text-white py-6 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Calcular Orçamento
                </Button>

                {/* Resultado */}
                {orcamentoCalculado !== null && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-[#0097b2] to-[#007a99] rounded-lg text-white text-center space-y-4">
                    <h3 className="text-xl font-semibold">Orçamento Estimado:</h3>
                    <p className="text-5xl font-bold">€{orcamentoCalculado}</p>
                    <p className="text-sm opacity-90">
                      *Valor aproximado. Orçamento final pode variar após avaliação presencial.
                    </p>
                    <Button
                      onClick={handleWhatsApp}
                      className="w-full bg-white text-[#0097b2] hover:bg-slate-100 py-6 text-lg font-bold rounded-lg shadow-lg mt-4"
                    >
                      <Phone className="mr-2 h-5 w-5" />
                      Confirmar no WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
  );
}
