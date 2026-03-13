import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CookieConsent from "./components/CookieConsent";
import Home from "./pages/Home";
import { SchemaMarkup } from "./components/SchemaMarkup";
import { CanonicalTag } from "./components/CanonicalTag";
import Header from "./components/Header";

// Lazy-load páginas não-críticas para melhorar performance
const Services = lazy(() => import("./pages/Services"));
const SimuladorOrcamento = lazy(() => import("./pages/SimuladorOrcamento"));
const ColaboradorLogin = lazy(() => import("./pages/ColaboradorLogin"));
const ColaboradorDashboard = lazy(() => import("./pages/ColaboradorDashboard"));
const ColaboradorAdmin = lazy(() => import("./pages/ColaboradorAdmin"));
const AlterarSenha = lazy(() => import("./pages/AlterarSenha"));

const SolicitarServico = lazy(() => import("./pages/SolicitarServico"));
const CentralAjuda = lazy(() => import("./pages/CentralAjuda"));
// const CreditoFiscal = lazy(() => import("./pages/CreditoFiscal")); // Removido
const ServicosEmpresariais = lazy(() => import("./pages/ServicosEmpresariais"));
const Blog = lazy(() => import("./pages/Blog"));
const Contactos = lazy(() => import("./pages/Contactos"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Trabalhos = lazy(() => import("./pages/Trabalhos"));
const SobreNos = lazy(() => import("./pages/SobreNos"));
const AvaliacoesClientes = lazy(() => import("./pages/AvaliacoesClientes"));
const RecolhaEntulhoLisboa = lazy(() => import("./pages/RecolhaEntulhoLisboa"));
const RecolhaMoveisLisboa = lazy(() => import("./pages/RecolhaMoveisLisboa"));
const RecolhaEntulhoSetubal = lazy(() => import("./pages/RecolhaEntulhoSetubal"));
const RecolhaMoveisSetubal = lazy(() => import("./pages/RecolhaMoveisSetubal"));
const RecolhaMonosLisboa = lazy(() => import("./pages/RecolhaMonosLisboa"));
const RecolhaMonosSetubal = lazy(() => import("./pages/RecolhaMonosSetubal"));
const RecolhaMoveisRegional = lazy(() => import("./pages/RecolhaMoveisRegional"));
// Páginas regionais - Recolha de Móveis (34 regiões)
const RecolhaCascaisMoveis = lazy(() => import("./pages/RecolhaCascaisMoveis"));
const RecolhaLisboaMoveis = lazy(() => import("./pages/RecolhaLisboaMoveis"));
const RecolhaSetubalMoveis = lazy(() => import("./pages/RecolhaSetubalMoveis"));
const RecolhaAlmadaMoveis = lazy(() => import("./pages/RecolhaAlmadaMoveis"));
const RecolhaSintraMoveis = lazy(() => import("./pages/RecolhaSintraMoveis"));
const RecolhaMontijoMoveis = lazy(() => import("./pages/RecolhaMontijoMoveis"));
const RecolhaSeixalMoveis = lazy(() => import("./pages/RecolhaSeixalMoveis"));
const RecolhaBarreiroMoveis = lazy(() => import("./pages/RecolhaBarreiroMoveis"));
const RecolhaSesimbraMoveis = lazy(() => import("./pages/RecolhaSesimbraMoveis"));
const RecolhaLouresMoveis = lazy(() => import("./pages/RecolhaLouresMoveis"));
const RecolhaOeirasMoveis = lazy(() => import("./pages/RecolhaOeirasMoveis"));
const RecolhaOlivaisMoveis = lazy(() => import("./pages/RecolhaOlivaisMoveis"));
const RecolhaAlcocheteMoveis = lazy(() => import("./pages/RecolhaAlcocheteMoveis"));
const RecolhaOdivelasMoveis = lazy(() => import("./pages/RecolhaOdivelasMoveis"));
const RecolhaMoitaMoveis = lazy(() => import("./pages/RecolhaMoitaMoveis"));
const RecolhaAmoraMoveis = lazy(() => import("./pages/RecolhaAmoraMoveis"));
const RecolhaPalmelaMoveis = lazy(() => import("./pages/RecolhaPalmelaMoveis"));
const RecolhaEstorilMoveis = lazy(() => import("./pages/RecolhaEstorilMoveis"));
const RecolhaAmadoraMoveis = lazy(() => import("./pages/RecolhaAmadoraMoveis"));
const RecolhaSacavemMoveis = lazy(() => import("./pages/RecolhaSacavemMoveis"));
const RecolhaParquedasNaçoesMoveis = lazy(() => import("./pages/RecolhaParquedasNaçoesMoveis"));
const RecolhaCampoGrandeMoveis = lazy(() => import("./pages/RecolhaCampoGrandeMoveis"));
const RecolhaTelheirasMoveis = lazy(() => import("./pages/RecolhaTelheirasMoveis"));
const RecolhaRiodeMouroMoveis = lazy(() => import("./pages/RecolhaRiodeMouroMoveis"));
const RecolhaCampoPequenoMoveis = lazy(() => import("./pages/RecolhaCampoPequenoMoveis"));
const RecolhaChiadoMoveis = lazy(() => import("./pages/RecolhaChiadoMoveis"));
const RecolhaAgualvaCacemMoveis = lazy(() => import("./pages/RecolhaAgualvaCacemMoveis"));
const RecolhaCarnaxideMoveis = lazy(() => import("./pages/RecolhaCarnaxideMoveis"));
const RecolhaQuintadoCondeMoveis = lazy(() => import("./pages/RecolhaQuintadoCondeMoveis"));
const RecolhaCostadaCaparicaMoveis = lazy(() => import("./pages/RecolhaCostadaCaparicaMoveis"));
const RecolhaMontedaCaparicaMoveis = lazy(() => import("./pages/RecolhaMontedaCaparicaMoveis"));
const RecolhaTrafariaMoveis = lazy(() => import("./pages/RecolhaTrafariaMoveis"));
const RecolhaLaranjeiroMoveis = lazy(() => import("./pages/RecolhaLaranjeiroMoveis"));
const RecolhaCorroiosMoveis = lazy(() => import("./pages/RecolhaCorroiosMoveis"));

// Páginas SEO - Esvaziamento de Casas (20 cidades)
const EsvaziamentoCasasLisboa = lazy(() => import("./pages/EsvaziamentoCasasLisboa"));
const EsvaziamentoCasasSetubal = lazy(() => import("./pages/EsvaziamentoCasasSetubal"));
const EsvaziamentoCasasAlmada = lazy(() => import("./pages/EsvaziamentoCasasAlmada"));
const EsvaziamentoCasasSeixal = lazy(() => import("./pages/EsvaziamentoCasasSeixal"));
const EsvaziamentoCasasBarreiro = lazy(() => import("./pages/EsvaziamentoCasasBarreiro"));
const EsvaziamentoCasasCascais = lazy(() => import("./pages/EsvaziamentoCasasCascais"));
const EsvaziamentoCasasSintra = lazy(() => import("./pages/EsvaziamentoCasasSintra"));
const EsvaziamentoCasasOeiras = lazy(() => import("./pages/EsvaziamentoCasasOeiras"));
const EsvaziamentoCasasLoures = lazy(() => import("./pages/EsvaziamentoCasasLoures"));
const EsvaziamentoCasasOdivelas = lazy(() => import("./pages/EsvaziamentoCasasOdivelas"));
const EsvaziamentoCasasAmadora = lazy(() => import("./pages/EsvaziamentoCasasAmadora"));
const EsvaziamentoCasasMontijo = lazy(() => import("./pages/EsvaziamentoCasasMontijo"));
const EsvaziamentoCasasMoita = lazy(() => import("./pages/EsvaziamentoCasasMoita"));
const EsvaziamentoCasasPalmela = lazy(() => import("./pages/EsvaziamentoCasasPalmela"));
const EsvaziamentoCasasSesimbra = lazy(() => import("./pages/EsvaziamentoCasasSesimbra"));
const EsvaziamentoCasasAlcochete = lazy(() => import("./pages/EsvaziamentoCasasAlcochete"));
const EsvaziamentoCasasCorroios = lazy(() => import("./pages/EsvaziamentoCasasCorroios"));
const EsvaziamentoCasasAmora = lazy(() => import("./pages/EsvaziamentoCasasAmora"));
const EsvaziamentoCasasCostaDaCaparica = lazy(() => import("./pages/EsvaziamentoCasasCostaDaCaparica"));
const EsvaziamentoCasasCarnaxide = lazy(() => import("./pages/EsvaziamentoCasasCarnaxide"));
// Páginas SEO - Limpeza Pós-Obra (20 cidades)
const LimpezaPosObraLisboa = lazy(() => import("./pages/LimpezaPosObraLisboa"));
const LimpezaPosObraSetubal = lazy(() => import("./pages/LimpezaPosObraSetubal"));
const LimpezaPosObraAlmada = lazy(() => import("./pages/LimpezaPosObraAlmada"));
const LimpezaPosObraSeixal = lazy(() => import("./pages/LimpezaPosObraSeixal"));
const LimpezaPosObraBarreiro = lazy(() => import("./pages/LimpezaPosObraBarreiro"));
const LimpezaPosObraCascais = lazy(() => import("./pages/LimpezaPosObraCascais"));
const LimpezaPosObraSintra = lazy(() => import("./pages/LimpezaPosObraSintra"));
const LimpezaPosObraOeiras = lazy(() => import("./pages/LimpezaPosObraOeiras"));
const LimpezaPosObraLoures = lazy(() => import("./pages/LimpezaPosObraLoures"));
const LimpezaPosObraOdivelas = lazy(() => import("./pages/LimpezaPosObraOdivelas"));
const LimpezaPosObraAmadora = lazy(() => import("./pages/LimpezaPosObraAmadora"));
const LimpezaPosObraMontijo = lazy(() => import("./pages/LimpezaPosObraMontijo"));
const LimpezaPosObraMoita = lazy(() => import("./pages/LimpezaPosObraMoita"));
const LimpezaPosObraPalmela = lazy(() => import("./pages/LimpezaPosObraPalmela"));
const LimpezaPosObraSesimbra = lazy(() => import("./pages/LimpezaPosObraSesimbra"));
const LimpezaPosObraAlcochete = lazy(() => import("./pages/LimpezaPosObraAlcochete"));
const LimpezaPosObraCorroios = lazy(() => import("./pages/LimpezaPosObraCorroios"));
const LimpezaPosObraAmora = lazy(() => import("./pages/LimpezaPosObraAmora"));
const LimpezaPosObraCostaDaCaparica = lazy(() => import("./pages/LimpezaPosObraCostaDaCaparica"));
const LimpezaPosObraCarnaxide = lazy(() => import("./pages/LimpezaPosObraCarnaxide"));
// Páginas SEO - Mudanças (20 cidades)
const MudancasLisboa = lazy(() => import("./pages/MudancasLisboa"));
const MudancasSetubal = lazy(() => import("./pages/MudancasSetubal"));
const MudancasAlmada = lazy(() => import("./pages/MudancasAlmada"));
const MudancasSeixal = lazy(() => import("./pages/MudancasSeixal"));
const MudancasBarreiro = lazy(() => import("./pages/MudancasBarreiro"));
const MudancasCascais = lazy(() => import("./pages/MudancasCascais"));
const MudancasSintra = lazy(() => import("./pages/MudancasSintra"));
const MudancasOeiras = lazy(() => import("./pages/MudancasOeiras"));
const MudancasLoures = lazy(() => import("./pages/MudancasLoures"));
const MudancasOdivelas = lazy(() => import("./pages/MudancasOdivelas"));
const MudancasAmadora = lazy(() => import("./pages/MudancasAmadora"));
const MudancasMontijo = lazy(() => import("./pages/MudancasMontijo"));
const MudancasMoita = lazy(() => import("./pages/MudancasMoita"));
const MudancasPalmela = lazy(() => import("./pages/MudancasPalmela"));
const MudancasSesimbra = lazy(() => import("./pages/MudancasSesimbra"));
const MudancasAlcochete = lazy(() => import("./pages/MudancasAlcochete"));
const MudancasCorroios = lazy(() => import("./pages/MudancasCorroios"));
const MudancasAmora = lazy(() => import("./pages/MudancasAmora"));
const MudancasCostaDaCaparica = lazy(() => import("./pages/MudancasCostaDaCaparica"));
const MudancasCarnaxide = lazy(() => import("./pages/MudancasCarnaxide"));
// Páginas SEO - Recolha de Entulho (novas cidades)
const RecolhaEntulhoAlmada = lazy(() => import("./pages/RecolhaEntulhoAlmada"));
const RecolhaEntulhoSeixal = lazy(() => import("./pages/RecolhaEntulhoSeixal"));
const RecolhaEntulhoBarreiro = lazy(() => import("./pages/RecolhaEntulhoBarreiro"));
const RecolhaEntulhoCascais = lazy(() => import("./pages/RecolhaEntulhoCascais"));
const RecolhaEntulhoSintra = lazy(() => import("./pages/RecolhaEntulhoSintra"));
const RecolhaEntulhoOeiras = lazy(() => import("./pages/RecolhaEntulhoOeiras"));
const RecolhaEntulhoLoures = lazy(() => import("./pages/RecolhaEntulhoLoures"));
const RecolhaEntulhoOdivelas = lazy(() => import("./pages/RecolhaEntulhoOdivelas"));
const RecolhaEntulhoAmadora = lazy(() => import("./pages/RecolhaEntulhoAmadora"));
const RecolhaEntulhoMontijo = lazy(() => import("./pages/RecolhaEntulhoMontijo"));
const RecolhaEntulhoMoita = lazy(() => import("./pages/RecolhaEntulhoMoita"));
const RecolhaEntulhoPalmela = lazy(() => import("./pages/RecolhaEntulhoPalmela"));
const RecolhaEntulhoSesimbra = lazy(() => import("./pages/RecolhaEntulhoSesimbra"));
const RecolhaEntulhoAlcochete = lazy(() => import("./pages/RecolhaEntulhoAlcochete"));
const RecolhaEntulhoCorroios = lazy(() => import("./pages/RecolhaEntulhoCorroios"));
const RecolhaEntulhoAmora = lazy(() => import("./pages/RecolhaEntulhoAmora"));
const RecolhaEntulhoCostaDaCaparica = lazy(() => import("./pages/RecolhaEntulhoCostaDaCaparica"));
const RecolhaEntulhoCarnaxide = lazy(() => import("./pages/RecolhaEntulhoCarnaxide"));
// Páginas SEO - Recolha de Monos (novas cidades)
const RecolhaMonosAlmada = lazy(() => import("./pages/RecolhaMonosAlmada"));
const RecolhaMonosSeixal = lazy(() => import("./pages/RecolhaMonosSeixal"));
const RecolhaMonosBarreiro = lazy(() => import("./pages/RecolhaMonosBarreiro"));
const RecolhaMonosCascais = lazy(() => import("./pages/RecolhaMonosCascais"));
const RecolhaMonosSintra = lazy(() => import("./pages/RecolhaMonosSintra"));
const RecolhaMonosOeiras = lazy(() => import("./pages/RecolhaMonosOeiras"));
const RecolhaMonosLoures = lazy(() => import("./pages/RecolhaMonosLoures"));
const RecolhaMonosOdivelas = lazy(() => import("./pages/RecolhaMonosOdivelas"));
const RecolhaMonosAmadora = lazy(() => import("./pages/RecolhaMonosAmadora"));
const RecolhaMonosMontijo = lazy(() => import("./pages/RecolhaMonosMontijo"));
const RecolhaMonosMoita = lazy(() => import("./pages/RecolhaMonosMoita"));
const RecolhaMonosPalmela = lazy(() => import("./pages/RecolhaMonosPalmela"));
const RecolhaMonosSesimbra = lazy(() => import("./pages/RecolhaMonosSesimbra"));
const RecolhaMonosAlcochete = lazy(() => import("./pages/RecolhaMonosAlcochete"));
const RecolhaMonosCorroios = lazy(() => import("./pages/RecolhaMonosCorroios"));
const RecolhaMonosAmora = lazy(() => import("./pages/RecolhaMonosAmora"));
const RecolhaMonosCostaDaCaparica = lazy(() => import("./pages/RecolhaMonosCostaDaCaparica"));
const RecolhaMonosCarnaxide = lazy(() => import("./pages/RecolhaMonosCarnaxide"));

// Loading fallback
const LoadingFallback = () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="pt-[68px]">
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/servicos"} component={Services} />
        <Route path={"/trabalhos"} component={Trabalhos} />
        <Route path={"/sobre-nos"} component={SobreNos} />
        <Route path={"/avaliacoes"} component={AvaliacoesClientes} />
        <Route path={"/blog"} component={Blog} />
        <Route path={"/contactos"} component={Contactos} />
        {/* Rota /contato removida - usar /contactos */}
        <Route path={"/simulador"} component={SimuladorOrcamento} />
        <Route path={"/colaboradores"} component={ColaboradorLogin} />
        <Route path={"/colaboradores/dashboard"} component={ColaboradorDashboard} />
        <Route path={"/colaboradores/admin"} component={ColaboradorAdmin} />
        <Route path={"/colaboradores/alterar-senha"} component={AlterarSenha} />

        <Route path={"/solicitar-servico"} component={SolicitarServico} />
        <Route path={"/central-ajuda"} component={CentralAjuda} />
        {/* <Route path={"/credito-fiscal"} component={CreditoFiscal} /> */} {/* Removido */}
        <Route path={"/servicos-empresariais"} component={ServicosEmpresariais} />
        <Route path={"/privacidade"} component={PrivacyPolicy} />
        {/* Money Pages - SEO Local */}
        {/* Rotas regionais - Recolha de Móveis (34 regiões) */}
        <Route path={"/recolha-moveis-cascais"} component={RecolhaCascaisMoveis} />
        <Route path={"/recolha-moveis-lisboa"} component={RecolhaLisboaMoveis} />
        <Route path={"/recolha-moveis-setubal"} component={RecolhaSetubalMoveis} />
        <Route path={"/recolha-moveis-almada"} component={RecolhaAlmadaMoveis} />
        <Route path={"/recolha-moveis-sintra"} component={RecolhaSintraMoveis} />
        <Route path={"/recolha-moveis-montijo"} component={RecolhaMontijoMoveis} />
        <Route path={"/recolha-moveis-seixal"} component={RecolhaSeixalMoveis} />
        <Route path={"/recolha-moveis-barreiro"} component={RecolhaBarreiroMoveis} />
        <Route path={"/recolha-moveis-sesimbra"} component={RecolhaSesimbraMoveis} />
        <Route path={"/recolha-moveis-loures"} component={RecolhaLouresMoveis} />
        <Route path={"/recolha-moveis-oeiras"} component={RecolhaOeirasMoveis} />
        <Route path={"/recolha-moveis-olivais"} component={RecolhaOlivaisMoveis} />
        <Route path={"/recolha-moveis-alcochete"} component={RecolhaAlcocheteMoveis} />
        <Route path={"/recolha-moveis-odivelas"} component={RecolhaOdivelasMoveis} />
        <Route path={"/recolha-moveis-moita"} component={RecolhaMoitaMoveis} />
        <Route path={"/recolha-moveis-amora"} component={RecolhaAmoraMoveis} />
        <Route path={"/recolha-moveis-palmela"} component={RecolhaPalmelaMoveis} />
        <Route path={"/recolha-moveis-estoril"} component={RecolhaEstorilMoveis} />
        <Route path={"/recolha-moveis-amadora"} component={RecolhaAmadoraMoveis} />
        <Route path={"/recolha-moveis-sacavem"} component={RecolhaSacavemMoveis} />
        <Route path={"/recolha-moveis-parque-das-nacoes"} component={RecolhaParquedasNaçoesMoveis} />
        <Route path={"/recolha-moveis-campo-grande"} component={RecolhaCampoGrandeMoveis} />
        <Route path={"/recolha-moveis-telheiras"} component={RecolhaTelheirasMoveis} />
        <Route path={"/recolha-moveis-rio-de-mouro"} component={RecolhaRiodeMouroMoveis} />
        <Route path={"/recolha-moveis-campo-pequeno"} component={RecolhaCampoPequenoMoveis} />
        <Route path={"/recolha-moveis-chiado"} component={RecolhaChiadoMoveis} />
        <Route path={"/recolha-moveis-agualva-cacem"} component={RecolhaAgualvaCacemMoveis} />
        <Route path={"/recolha-moveis-carnaxide"} component={RecolhaCarnaxideMoveis} />
        <Route path={"/recolha-moveis-quinta-do-conde"} component={RecolhaQuintadoCondeMoveis} />
        <Route path={"/recolha-moveis-costa-da-caparica"} component={RecolhaCostadaCaparicaMoveis} />
        <Route path={"/recolha-moveis-monte-da-caparica"} component={RecolhaMontedaCaparicaMoveis} />
        <Route path={"/recolha-moveis-trafaria"} component={RecolhaTrafariaMoveis} />
        <Route path={"/recolha-moveis-laranjeiro"} component={RecolhaLaranjeiroMoveis} />
        <Route path={"/recolha-moveis-corroios"} component={RecolhaCorroiosMoveis} />
        {/* Rotas antigas (manter compatibilidade) */}
        <Route path={"/recolha-entulho-lisboa"} component={RecolhaEntulhoLisboa} />
        <Route path={"/recolha-entulho-setubal"} component={RecolhaEntulhoSetubal} />
        <Route path={"/recolha-monos-lisboa"} component={RecolhaMonosLisboa} />
        <Route path={"/recolha-monos-setubal"} component={RecolhaMonosSetubal} />
        {/* Novas páginas SEO - Esvaziamento de Casas */}
        <Route path={"/esvaziamento-casas-lisboa"} component={EsvaziamentoCasasLisboa} />
        <Route path={"/esvaziamento-casas-setubal"} component={EsvaziamentoCasasSetubal} />
        <Route path={"/esvaziamento-casas-almada"} component={EsvaziamentoCasasAlmada} />
        <Route path={"/esvaziamento-casas-seixal"} component={EsvaziamentoCasasSeixal} />
        <Route path={"/esvaziamento-casas-barreiro"} component={EsvaziamentoCasasBarreiro} />
        <Route path={"/esvaziamento-casas-cascais"} component={EsvaziamentoCasasCascais} />
        <Route path={"/esvaziamento-casas-sintra"} component={EsvaziamentoCasasSintra} />
        <Route path={"/esvaziamento-casas-oeiras"} component={EsvaziamentoCasasOeiras} />
        <Route path={"/esvaziamento-casas-loures"} component={EsvaziamentoCasasLoures} />
        <Route path={"/esvaziamento-casas-odivelas"} component={EsvaziamentoCasasOdivelas} />
        <Route path={"/esvaziamento-casas-amadora"} component={EsvaziamentoCasasAmadora} />
        <Route path={"/esvaziamento-casas-montijo"} component={EsvaziamentoCasasMontijo} />
        <Route path={"/esvaziamento-casas-moita"} component={EsvaziamentoCasasMoita} />
        <Route path={"/esvaziamento-casas-palmela"} component={EsvaziamentoCasasPalmela} />
        <Route path={"/esvaziamento-casas-sesimbra"} component={EsvaziamentoCasasSesimbra} />
        <Route path={"/esvaziamento-casas-alcochete"} component={EsvaziamentoCasasAlcochete} />
        <Route path={"/esvaziamento-casas-corroios"} component={EsvaziamentoCasasCorroios} />
        <Route path={"/esvaziamento-casas-amora"} component={EsvaziamentoCasasAmora} />
        <Route path={"/esvaziamento-casas-costa-da-caparica"} component={EsvaziamentoCasasCostaDaCaparica} />
        <Route path={"/esvaziamento-casas-carnaxide"} component={EsvaziamentoCasasCarnaxide} />
        {/* Novas páginas SEO - Limpeza Pós-Obra */}
        <Route path={"/limpeza-pos-obra-lisboa"} component={LimpezaPosObraLisboa} />
        <Route path={"/limpeza-pos-obra-setubal"} component={LimpezaPosObraSetubal} />
        <Route path={"/limpeza-pos-obra-almada"} component={LimpezaPosObraAlmada} />
        <Route path={"/limpeza-pos-obra-seixal"} component={LimpezaPosObraSeixal} />
        <Route path={"/limpeza-pos-obra-barreiro"} component={LimpezaPosObraBarreiro} />
        <Route path={"/limpeza-pos-obra-cascais"} component={LimpezaPosObraCascais} />
        <Route path={"/limpeza-pos-obra-sintra"} component={LimpezaPosObraSintra} />
        <Route path={"/limpeza-pos-obra-oeiras"} component={LimpezaPosObraOeiras} />
        <Route path={"/limpeza-pos-obra-loures"} component={LimpezaPosObraLoures} />
        <Route path={"/limpeza-pos-obra-odivelas"} component={LimpezaPosObraOdivelas} />
        <Route path={"/limpeza-pos-obra-amadora"} component={LimpezaPosObraAmadora} />
        <Route path={"/limpeza-pos-obra-montijo"} component={LimpezaPosObraMontijo} />
        <Route path={"/limpeza-pos-obra-moita"} component={LimpezaPosObraMoita} />
        <Route path={"/limpeza-pos-obra-palmela"} component={LimpezaPosObraPalmela} />
        <Route path={"/limpeza-pos-obra-sesimbra"} component={LimpezaPosObraSesimbra} />
        <Route path={"/limpeza-pos-obra-alcochete"} component={LimpezaPosObraAlcochete} />
        <Route path={"/limpeza-pos-obra-corroios"} component={LimpezaPosObraCorroios} />
        <Route path={"/limpeza-pos-obra-amora"} component={LimpezaPosObraAmora} />
        <Route path={"/limpeza-pos-obra-costa-da-caparica"} component={LimpezaPosObraCostaDaCaparica} />
        <Route path={"/limpeza-pos-obra-carnaxide"} component={LimpezaPosObraCarnaxide} />
        {/* Novas páginas SEO - Mudanças */}
        <Route path={"/mudancas-lisboa"} component={MudancasLisboa} />
        <Route path={"/mudancas-setubal"} component={MudancasSetubal} />
        <Route path={"/mudancas-almada"} component={MudancasAlmada} />
        <Route path={"/mudancas-seixal"} component={MudancasSeixal} />
        <Route path={"/mudancas-barreiro"} component={MudancasBarreiro} />
        <Route path={"/mudancas-cascais"} component={MudancasCascais} />
        <Route path={"/mudancas-sintra"} component={MudancasSintra} />
        <Route path={"/mudancas-oeiras"} component={MudancasOeiras} />
        <Route path={"/mudancas-loures"} component={MudancasLoures} />
        <Route path={"/mudancas-odivelas"} component={MudancasOdivelas} />
        <Route path={"/mudancas-amadora"} component={MudancasAmadora} />
        <Route path={"/mudancas-montijo"} component={MudancasMontijo} />
        <Route path={"/mudancas-moita"} component={MudancasMoita} />
        <Route path={"/mudancas-palmela"} component={MudancasPalmela} />
        <Route path={"/mudancas-sesimbra"} component={MudancasSesimbra} />
        <Route path={"/mudancas-alcochete"} component={MudancasAlcochete} />
        <Route path={"/mudancas-corroios"} component={MudancasCorroios} />
        <Route path={"/mudancas-amora"} component={MudancasAmora} />
        <Route path={"/mudancas-costa-da-caparica"} component={MudancasCostaDaCaparica} />
        <Route path={"/mudancas-carnaxide"} component={MudancasCarnaxide} />
        {/* Novas páginas SEO - Recolha de Entulho (mais cidades) */}
        <Route path={"/recolha-entulho-almada"} component={RecolhaEntulhoAlmada} />
        <Route path={"/recolha-entulho-seixal"} component={RecolhaEntulhoSeixal} />
        <Route path={"/recolha-entulho-barreiro"} component={RecolhaEntulhoBarreiro} />
        <Route path={"/recolha-entulho-cascais"} component={RecolhaEntulhoCascais} />
        <Route path={"/recolha-entulho-sintra"} component={RecolhaEntulhoSintra} />
        <Route path={"/recolha-entulho-oeiras"} component={RecolhaEntulhoOeiras} />
        <Route path={"/recolha-entulho-loures"} component={RecolhaEntulhoLoures} />
        <Route path={"/recolha-entulho-odivelas"} component={RecolhaEntulhoOdivelas} />
        <Route path={"/recolha-entulho-amadora"} component={RecolhaEntulhoAmadora} />
        <Route path={"/recolha-entulho-montijo"} component={RecolhaEntulhoMontijo} />
        <Route path={"/recolha-entulho-moita"} component={RecolhaEntulhoMoita} />
        <Route path={"/recolha-entulho-palmela"} component={RecolhaEntulhoPalmela} />
        <Route path={"/recolha-entulho-sesimbra"} component={RecolhaEntulhoSesimbra} />
        <Route path={"/recolha-entulho-alcochete"} component={RecolhaEntulhoAlcochete} />
        <Route path={"/recolha-entulho-corroios"} component={RecolhaEntulhoCorroios} />
        <Route path={"/recolha-entulho-amora"} component={RecolhaEntulhoAmora} />
        <Route path={"/recolha-entulho-costa-da-caparica"} component={RecolhaEntulhoCostaDaCaparica} />
        <Route path={"/recolha-entulho-carnaxide"} component={RecolhaEntulhoCarnaxide} />
        {/* Novas páginas SEO - Recolha de Monos (mais cidades) */}
        <Route path={"/recolha-monos-almada"} component={RecolhaMonosAlmada} />
        <Route path={"/recolha-monos-seixal"} component={RecolhaMonosSeixal} />
        <Route path={"/recolha-monos-barreiro"} component={RecolhaMonosBarreiro} />
        <Route path={"/recolha-monos-cascais"} component={RecolhaMonosCascais} />
        <Route path={"/recolha-monos-sintra"} component={RecolhaMonosSintra} />
        <Route path={"/recolha-monos-oeiras"} component={RecolhaMonosOeiras} />
        <Route path={"/recolha-monos-loures"} component={RecolhaMonosLoures} />
        <Route path={"/recolha-monos-odivelas"} component={RecolhaMonosOdivelas} />
        <Route path={"/recolha-monos-amadora"} component={RecolhaMonosAmadora} />
        <Route path={"/recolha-monos-montijo"} component={RecolhaMonosMontijo} />
        <Route path={"/recolha-monos-moita"} component={RecolhaMonosMoita} />
        <Route path={"/recolha-monos-palmela"} component={RecolhaMonosPalmela} />
        <Route path={"/recolha-monos-sesimbra"} component={RecolhaMonosSesimbra} />
        <Route path={"/recolha-monos-alcochete"} component={RecolhaMonosAlcochete} />
        <Route path={"/recolha-monos-corroios"} component={RecolhaMonosCorroios} />
        <Route path={"/recolha-monos-amora"} component={RecolhaMonosAmora} />
        <Route path={"/recolha-monos-costa-da-caparica"} component={RecolhaMonosCostaDaCaparica} />
        <Route path={"/recolha-monos-carnaxide"} component={RecolhaMonosCarnaxide} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <SchemaMarkup />
          <CanonicalTag />
          <Header />
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
