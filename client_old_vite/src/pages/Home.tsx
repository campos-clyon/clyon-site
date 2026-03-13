import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, MapPin, ArrowRight, CheckCircle2, Truck, Home as HomeIcon, Trash2, Zap, MessageCircle, HelpCircle, Facebook, Instagram, Heart, Square, Lock as LockIcon, Phone, ChevronRight } from "lucide-react";
import ImageCarousel from "@/components/ImageCarousel";

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = "CLYON - Limpeza e Recolha em Portugal";
  }, []);

  const services = [
    { name: "Recolha de Entulho", description: "Remoção rápida e organizada para obras, remodelações e limpezas pesadas.", icon: Trash2, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-entulho-jWkvfXvyi6r7bPjF7Eamwa.webp" },
    { name: "Recolha de Móveis", description: "Retiramos móveis antigos, eletrodomésticos e volumes grandes sem complicações.", icon: HomeIcon, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-moveis-eEYtbTXcJSEpkquPasVSGb.webp" },
    { name: "Limpeza Pós-Obra", description: "Acabamentos impecáveis para deixar o espaço pronto a usar no mesmo dia.", icon: Zap, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-limpeza-kTd973fyrhyRQ8Xk9Migbx.webp" },
    { name: "Mudanças e Apoio", description: "Equipa de apoio para transporte, desmontagem e organização da mudança.", icon: Truck, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-mudancas-6XGYLEbwqA8fCfUohemfVw.webp" },
    { name: "Recolha de Monos", description: "Limpeza de sótãos, caves e garagens com organização e eficiência.", icon: Trash2, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-monos-hFyCTxd6r3wWH2AbPVsbTj.webp" },
    { name: "Aluguer Caminhão + Motorista", description: "Solução flexível para transporte de qualquer volume ou carga.", icon: Truck, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-aluguer-e3cKjED9XFDA6erEN5Qx86.webp" },
    { name: "Desmantelamento", description: "Desmontagem profissional de estruturas, móveis e equipamentos complexos.", icon: Trash2, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-desmantelamento-HzfFwn5BWwncdUGZxX5pjP.webp" },
    { name: "Reparações Domésticas", description: "Pequenas reparações e manutenção geral da casa com profissionais qualificados.", icon: Truck, img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/service-reparacoes-corvitGZisrq46zuCfi9ks.webp" },
  ];

  const steps = [
    { title: "Descreva o serviço em menos de 1 minuto", desc: "Conte-nos o que precisa: móveis, entulho, mudança completa ou limpeza pós-obra." },
    { title: "Receba uma resposta rápida com orçamento claro", desc: "Em menos de 11 minutos recebe um orçamento transparente, sem surpresas nem custos ocultos." },
    { title: "Agende o melhor horário e deixe connosco", desc: "Escolha a data e hora. A nossa equipa vai até si e realiza o trabalho no mesmo dia." },
  ];

  const testimonials = [
    { name: "Carlos F.", text: "Equipa profissional, pontual e muito cuidadosa. Ficou tudo limpo e resolvido sem stress.", rating: 5 },
    { name: "Inês A.", text: "Serviço rápido, preço justo e comunicação excelente do início ao fim.", rating: 5 },
    { name: "Christian M.", text: "Responderam no mesmo dia e executaram com muita eficiência. Recomendo sem hesitar.", rating: 5 },
    { name: "Maria T.", text: "Muito eficientes, boa relação qualidade preço. Estou extremamente satisfeita com o serviço.", rating: 5 },
    { name: "Patricia S.", text: "Serviço rápido e eficiente. Equipa muito simpática e profissional. Recomendo a toda a gente!", rating: 5 },
    { name: "Ana F.", text: "Trabalho impecável. Chegaram na hora combinada, foram rápidos e deixaram tudo limpo.", rating: 5 },
  ];

  const stats = [
    { value: "5.0★", label: "avaliação média" },
    { value: "11 min", label: "tempo médio de resposta" },
    { value: "Mesmo dia", label: "disponibilidade em muitos pedidos" },
  ];

  const whyUs = [
    { title: "Profissionais Verificados", desc: "Identidade verificada e avaliações reais de clientes" },
    { title: "Preço Transparente", desc: "Sem custos ocultos. Orçamento claro antes do serviço" },
    { title: "Resposta em 11 min", desc: "Orçamento em minutos. Agendamento flexível" },
    { title: "Avaliação 5.0 ★", desc: "Nota máxima de 163 clientes satisfeitos" },
    { title: "Garantia de Satisfação", desc: "Não satisfeito? Resolvemos sem custo adicional" },
    { title: "Suporte Dedicado", desc: "Equipa disponível para qualquer dúvida ou emergência" },
  ];

  const workImages = [
    { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/dqCbsQzHnvaqyagS.jpeg", alt: "Recolha de Entulho", title: "Recolha de Entulho", subtitle: "Fotos reais dos nossos trabalhos" },
    { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/vhJtJOvSLMtalhnU.jpeg", alt: "Recolha de Moveis", title: "Recolha de Móveis", subtitle: "Remoção segura e profissional" },
    { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/FKTNuRqFLbPWJerM.jpeg", alt: "Mudancas Completas", title: "Mudanças Completas", subtitle: "Transporte profissional" },
    { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/hdfUMgNArMKsLzwf.jpeg", alt: "Limpeza de Quintais", title: "Limpeza de Quintais", subtitle: "Espaços limpos e organizados" },
    { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/QRBPwUyLyiTpDsXi.jpeg", alt: "Recolha de Monos", title: "Recolha de Monos", subtitle: "Sótãos, caves e garagens" },
    { url: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/xVyYzBjdoinaOLEs.jpeg", alt: "Demolição Controlada", title: "Demolição Controlada", subtitle: "Trabalho especializado" }
  ];

  return (
    <>
      <Helmet>
        <title>Recolha de Móveis e Entulho em Lisboa e Setúbal | CLYON</title>
        <meta name="description" content="Serviço profissional de recolha de móveis, entulho e resíduos em Lisboa e Setúbal. Orçamentos grátis. Atendimento rápido e sustentável. Ligue já!" />
        <meta name="keywords" content="recolha de móveis lisboa, recolha de entulho lisboa, recolha de monos lisboa, limpeza de terrenos, demolições, clyon, lisboa, setúbal, amora, mudanças, limpeza pós-obra" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="CLYON" />
        <meta property="og:title" content="Recolha de Móveis e Entulho em Lisboa e Setúbal | CLYON" />
        <meta property="og:description" content="Serviço profissional de recolha de móveis, entulho e resíduos em Lisboa e Setúbal. Orçamentos grátis. Atendimento rápido e sustentável." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://clyon.pt" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://clyon.pt" />
      </Helmet>
      <div className="min-h-screen bg-white text-slate-900">

      {/* ═══════════════════════════════════════════════
          HERO — Layout 2 colunas: texto + card de passos
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Gradiente radial de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.16),_transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          {/* Coluna esquerda */}
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Líderes em satisfação no Fixando — 163 avaliações 5★
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Recolha e limpeza
              <span className="block text-cyan-500">rápida, moderna e sem stress.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Entulho, móveis velhos, limpeza pós-obra e apoio em mudanças com atendimento rápido,
              orçamento claro e execução profissional em Lisboa, Margem Sul e Setúbal.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/simulador">
                <button className="rounded-2xl bg-cyan-500 px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-600">
                  Simular Orçamento
                </button>
              </Link>
              <Link href="/trabalhos">
                <button className="rounded-2xl border border-cyan-200 bg-white px-6 py-3.5 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50">
                  Ver Trabalhos Reais
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-cyan-100 bg-white/90 p-5 shadow-sm">
                  <div className="text-2xl font-bold text-slate-950">{stat.value}</div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna direita — Carrossel de imagens reais */}
          <div className="relative">
            <div className="rounded-[32px] border border-cyan-100 bg-white p-4 shadow-2xl shadow-cyan-100">
              {/* Carrossel de imagens reais — altura fixa para caber no viewport */}
              <div className="rounded-[24px] overflow-hidden" style={{height: '374px'}}>
                <ImageCarousel
                  images={workImages}
                  autoPlay={true}
                  autoPlayInterval={5000}
                  showIndicators={true}
                  showArrows={true}
                />
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SERVIÇOS — Cards com hover lift, rounded-[28px]
      ═══════════════════════════════════════════════ */}
      <section id="servicos" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Serviços principais</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Menos ruído, mais clareza sobre o que a CLYON resolve.
            </h2>
          </div>
          <p className="max-w-xl text-slate-600">
            Serviços organizados em blocos fortes, fáceis de ler e comparar — com orçamento imediato.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Link key={service.name} href="/simulador">
              <div className="group rounded-[28px] border border-cyan-100 bg-white overflow-hidden shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-100 cursor-pointer">
                {/* Ícone do serviço */}
                <div className="relative h-44 bg-gradient-to-br from-cyan-50 to-cyan-100 flex items-center justify-center overflow-hidden">
                  <div className="text-cyan-500 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-20 h-20" strokeWidth={1.5} />
                  </div>
                </div>
                {/* Conteúdo do card */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950">{service.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{service.description}</p>
                  <button className="mt-6 text-sm font-semibold text-cyan-600 transition group-hover:translate-x-1 flex items-center gap-1">
                    Simular orçamento <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

        {/* ═════════════════════════════════════════════
          COMO FUNCIONA — Layout moderno com linha de progresso
      ═════════════════════════════════════════════ */}
      <section id="como-funciona" className="relative overflow-hidden bg-slate-950 py-24">
        {/* Padrão de pontos de fundo */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #22d3ee 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Brilho ciano superior */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-cyan-500/20 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Cabeçalho da secção */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Como funciona
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Simples. Rápido. <span className="text-cyan-400">Sem stress.</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base">
              Do primeiro contacto à recolha final — tudo resolvido em 3 passos.
            </p>
          </div>

          {/* Steps com linha conectora */}
          <div className="relative">
            {/* Linha conectora horizontal (desktop) */}
            <div className="hidden lg:block absolute top-[52px] left-[calc(16.66%-20px)] right-[calc(16.66%-20px)] h-px">
              <div className="h-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/60 to-cyan-500/0" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {steps.map((step, index) => {
                const icons = [
                  /* Passo 1: mensagem/descrição */
                  <svg key="1" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                  </svg>,
                  /* Passo 2: orçamento/documento */
                  <svg key="2" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>,
                  /* Passo 3: camião/execução */
                  <svg key="3" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>,
                ];
                const durations = ["< 1 minuto", "< 11 minutos", "Mesmo dia"];
                const durationColors = ["text-cyan-400", "text-purple-400", "text-emerald-400"];
                const ringColors = ["ring-cyan-500/40", "ring-purple-500/40", "ring-emerald-500/40"];
                const bgColors = ["bg-cyan-500", "bg-purple-500", "bg-emerald-500"];
                const glowColors = ["shadow-cyan-500/40", "shadow-purple-500/40", "shadow-emerald-500/40"];

                return (
                  <div key={step.title} className="group relative">
                    {/* Card */}
                    <div className={`relative rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm p-8 transition-all duration-300 hover:bg-white/10 hover:border-white/10 ring-1 ${ringColors[index]}`}>
                      {/* Número do passo (fundo) */}
                      <div className="absolute top-6 right-6 text-7xl font-black text-white/[0.04] select-none leading-none">
                        {String(index + 1).padStart(2, '0')}
                      </div>

                      {/* Ícone */}
                      <div className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${bgColors[index]} text-white shadow-lg ${glowColors[index]} shadow-md mb-6`}>
                        {icons[index]}
                        {/* Anel de pulso */}
                        <div className={`absolute inset-0 rounded-2xl ${bgColors[index]} opacity-30 scale-110 group-hover:scale-125 transition-transform duration-500`} />
                      </div>

                      {/* Duração */}
                      <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${durationColors[index]}`}>
                        {durations[index]}
                      </div>

                      {/* Título */}
                      <h3 className="text-xl font-bold text-white leading-snug mb-3">{step.title}</h3>

                      {/* Descrição */}
                      <p className="text-sm leading-7 text-slate-400">{step.desc}</p>

                      {/* Seta de progressão (apenas nos 2 primeiros no desktop) */}
                      {index < 2 && (
                        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-white/10">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA inferior */}
          <div className="mt-14 text-center">
            <Link href="/simulador">
              <button className="inline-flex items-center gap-3 rounded-full bg-cyan-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 hover:shadow-cyan-400/40 hover:-translate-y-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Simular orçamento agora
              </button>
            </Link>
            <p className="mt-4 text-xs text-slate-500">Grátis e sem compromisso · Resposta em menos de 11 minutos</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          GALERIA DE TRABALHOS — Imagens reais em grid
      ═══════════════════════════════════════════════ */}
      <section id="trabalhos" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Trabalhos reais</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Veja o que fazemos no terreno.
          </h2>
          <p className="mt-4 max-w-xl text-slate-600 leading-8">
            Fotos reais dos nossos trabalhos — entulho, móveis, limpezas e mudanças em Lisboa, Margem Sul e Setúbal.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {workImages.map((img, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div>
                  <p className="text-white font-semibold text-sm">{img.title}</p>
                  <p className="text-white/70 text-xs">{img.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white px-5 py-3 shadow-sm">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Cobertura</p>
              <p className="text-sm text-slate-700 font-medium">Lisboa · Margem Sul · Setúbal</p>
            </div>
          </div>
          <Link href="/trabalhos">
            <button className="rounded-2xl border border-cyan-200 px-6 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 hover:-translate-y-0.5">
              Ver todos os trabalhos →
            </button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          COBERTURA — Chips de cidades + bloco escuro
      ═══════════════════════════════════════════════ */}
      <section id="cobertura" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Cobertura regional</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Presença local destacada como prova de confiança.
            </h2>
            <p className="mt-5 max-w-xl text-slate-600 leading-8">
              A nossa área de atuação cobre toda a Grande Lisboa, Margem Sul e Setúbal — com equipas prontas a intervir no mesmo dia.
            </p>
          </div>

          <div className="rounded-[32px] border border-cyan-100 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {['Lisboa', 'Benfica', 'Lumiar', 'Olivais', 'Alvalade', 'Almada', 'Seixal', 'Barreiro', 'Moita', 'Setúbal', 'Palmela', 'Sesimbra'].map((city) => (
                <span key={city} className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700">
                  {city}
                </span>
              ))}
            </div>
            <div className="mt-8 rounded-[28px] bg-slate-950 p-6 text-white">
              <p className="text-sm text-white/70">Não encontrou a sua zona?</p>
              <p className="mt-2 text-xl font-semibold">Confirme disponibilidade por WhatsApp.</p>
              <button
                className="mt-4 rounded-2xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600"
                onClick={() => window.open('https://wa.me/351931632622', '_blank')}
              >
                Falar no WhatsApp →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          DEPOIMENTOS — Fundo escuro, glassmorphism
      ═══════════════════════════════════════════════ */}
      <section id="avaliacoes" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Prova social</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              163 avaliações de clientes reais.
            </h2>
            <p className="mt-3 text-slate-500">Avaliação média 5.0 ★★★★★ no Fixando e Google</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[28px] border border-cyan-100 bg-cyan-50/50 p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-cyan-500">★★★★★</div>
                <p className="mt-4 leading-8 text-slate-700">"{item.text}"</p>
                <div className="mt-6 flex items-center gap-3 border-t border-cyan-100 pt-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-sm font-bold text-white">
                    {item.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/avaliacoes">
              <button className="rounded-2xl border border-cyan-200 px-6 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 hover:-translate-y-0.5">
                Ver todas as avaliações →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          POR QUE CLYON — Fundo cyan-50 clean
      ═══════════════════════════════════════════════ */}
      <section id="sobre" className="bg-cyan-50/60 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">Diferenciais</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Por que escolher a CLYON?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyUs.map((item, idx) => (
              <div key={idx} className="rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-cyan-100 flex gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-cyan-50">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

         {/* ═════════════════════════════════════════════
          CERTIFICAÇÃO APA — Fundo branco com logo APA
      ═════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="rounded-[28px] border border-cyan-100 bg-white px-8 py-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Texto */}
          <div className="max-w-lg text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600 mb-2">Responsabilidade Ambiental</p>
            <p className="text-slate-700 leading-8 text-base">
              Os nossos resíduos são sempre encaminhados para operadores acreditados, pois possuímos
              <span className="font-semibold text-slate-900"> certificação APA</span> — Agência Portuguesa do Ambiente.
            </p>
          </div>

          {/* Logo APA SVG inline */}
          <div className="flex-shrink-0 flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 90" className="h-16 w-auto" aria-label="APA - Agência Portuguesa do Ambiente">
              {/* Círculo de formas geométricas */}
              <g transform="translate(0,5)">
                {/* Linha superior */}
                <polygon points="38,2 44,2 44,10 38,10" fill="#5cb85c" />
                <circle cx="52" cy="6" r="5" fill="#2e8b57" />
                <polygon points="60,2 66,2 63,8" fill="#5cb85c" />
                {/* Linha 2 */}
                <polygon points="24,14 30,14 27,20" fill="#2e8b57" />
                <rect x="36" y="14" width="8" height="8" rx="1" fill="#00bcd4" />
                <circle cx="52" cy="18" r="5" fill="#5cb85c" />
                <rect x="58" y="14" width="8" height="8" rx="1" fill="#2e8b57" />
                <polygon points="70,14 76,14 73,20" fill="#00bcd4" />
                {/* Linha 3 */}
                <circle cx="14" cy="30" r="5" fill="#5cb85c" />
                <polygon points="22,26 28,26 25,32" fill="#00bcd4" />
                <rect x="34" y="26" width="8" height="8" rx="1" fill="#2e8b57" />
                <circle cx="52" cy="30" r="6" fill="#2e8b57" />
                <rect x="58" y="26" width="8" height="8" rx="1" fill="#5cb85c" />
                <polygon points="70,26 76,26 73,32" fill="#2e8b57" />
                <circle cx="84" cy="30" r="5" fill="#00bcd4" />
                {/* Linha 4 */}
                <polygon points="22,38 28,38 25,44" fill="#5cb85c" />
                <rect x="34" y="38" width="8" height="8" rx="1" fill="#00bcd4" />
                <circle cx="52" cy="42" r="5" fill="#5cb85c" />
                <rect x="58" y="38" width="8" height="8" rx="1" fill="#2e8b57" />
                <polygon points="70,38 76,38 73,44" fill="#5cb85c" />
                {/* Linha 5 */}
                <polygon points="36,50 42,50 39,56" fill="#2e8b57" />
                <circle cx="52" cy="54" r="5" fill="#00bcd4" />
                <polygon points="62,50 68,50 65,56" fill="#5cb85c" />
              </g>
              {/* Texto "apa" */}
              <text x="100" y="48" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#00bcd4" letterSpacing="-1">apa</text>
              {/* Subtexto */}
              <text x="100" y="62" fontFamily="Arial, sans-serif" fontSize="9" fill="#2e8b57">agência portuguesa</text>
              <text x="100" y="73" fontFamily="Arial, sans-serif" fontSize="9" fill="#2e8b57">do ambiente</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════
          CTA FINAL — Gradiente ciano, botões brancos
      ═════════════════════════════════════════════ */}
      <section id="contacto" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-cyan-500 to-cyan-400 px-8 py-10 text-white shadow-2xl shadow-cyan-100 md:px-12 md:py-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Pronto para resolver?</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Livre-se do entulho, dos móveis velhos e da bagunça — hoje mesmo.
              </h2>
              <p className="mt-4 text-white/90 leading-8">
                Orçamento gratuito em 11 minutos. Sem compromisso, sem custos ocultos. Recolha no mesmo dia em Lisboa, Margem Sul e Setúbal.
              </p>
              <div className="mt-5 inline-flex items-start gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm text-white/95 backdrop-blur-sm border border-white/20">
                <span className="text-base leading-none mt-0.5">&#9888;&#65039;</span>
                <span><span className="font-semibold">Não descarte monos na via pública.</span> É ilegal e prejudica o ambiente. Agende a recolha connosco — fazemos o transporte de forma legal e certificada.</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/simulador">
                <button className="rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-cyan-700 transition hover:-translate-y-0.5 hover:shadow-lg">
                  Pedir Orçamento
                </button>
              </Link>
              <button
                className="rounded-2xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10 flex items-center gap-2 justify-center"
                onClick={() => window.open("https://wa.me/351931632622", "_blank")}
              >
                <MessageCircle className="w-5 h-5" />
                Falar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER — Limpo, com logo e links
      ═══════════════════════════════════════════════ */}
      <footer className="border-t border-cyan-100 bg-white py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            {/* Logo + descrição */}
            <div>
              <picture>
                <source srcSet="/logo-clyon-icon.webp" type="image/webp" />
                <img src="/logo-clyon-icon.webp" alt="CLYON" className="h-10 w-auto mb-3" width="205" height="84" />
              </picture>
              <p className="text-sm text-slate-500 mb-5">Recolha e limpeza profissional em Lisboa e Setúbal.</p>
              <div className="flex gap-3 mb-5">
                <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center border border-cyan-200 text-cyan-600 hover:bg-cyan-50 transition">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl flex items-center justify-center border border-cyan-200 text-cyan-600 hover:bg-cyan-50 transition">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
              <Link href="/colaboradores">
                <button className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-600">
                  Colaboradores
                </button>
              </Link>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-950">Serviços</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/simulador" className="hover:text-cyan-600 transition-colors">Solicitar serviço</Link></li>
                <li><Link href="/servicos" className="hover:text-cyan-600 transition-colors">Nossos Serviços</Link></li>
                <li><Link href="/blog" className="hover:text-cyan-600 transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-950">Empresa</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link href="/sobre-nos" className="hover:text-cyan-600 transition-colors">Sobre Nós</Link></li>
                <li><Link href="/central-ajuda" className="hover:text-cyan-600 transition-colors">Central de Ajuda</Link></li>
                <li><Link href="/contactos" className="hover:text-cyan-600 transition-colors">Contactos</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-950">Pagamentos</h3>
              <ul className="space-y-2 text-sm text-slate-500">
                <li className="flex items-center gap-2"><Heart className="w-4 h-4 text-cyan-500" /> Revolut</li>
                <li className="flex items-center gap-2"><Square className="w-4 h-4 text-cyan-500" /> MBWAY</li>
                <li className="flex items-center gap-2"><LockIcon className="w-4 h-4 text-cyan-500" /> NOVO BANCO</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">© CLYON 2025 — Todos os direitos reservados</p>
            <Link href="/privacidade" className="text-sm text-slate-400 hover:text-cyan-600 transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>

      {/* Botão flutuante WhatsApp */}
      <a
        href="https://wa.me/351931632622"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-green-300/50 transition-transform hover:scale-110 active:scale-95"
        aria-label="Falar no WhatsApp"
      >
        {/* Anel pulsante */}
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-60 animate-ping" />
        {/* Ícone WhatsApp SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8 relative z-10"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.8 1.832 6.8L2 30l7.4-1.8A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 0 1-5.88-1.6l-.42-.252-4.392 1.068 1.1-4.272-.276-.44A11.56 11.56 0 0 1 4.4 16C4.4 9.592 9.592 4.4 16 4.4S27.6 9.592 27.6 16 22.408 27.6 16 27.6zm6.34-8.68c-.348-.176-2.06-1.016-2.38-1.132-.32-.116-.552-.176-.784.176-.232.348-.9 1.132-1.104 1.364-.204.232-.408.26-.756.088-.348-.176-1.468-.54-2.796-1.724-1.032-.92-1.728-2.056-1.932-2.404-.204-.348-.02-.536.152-.708.156-.156.348-.408.524-.612.176-.204.232-.348.348-.58.116-.232.06-.436-.028-.612-.088-.176-.784-1.892-1.076-2.592-.284-.68-.572-.588-.784-.6l-.668-.012c-.232 0-.608.088-.928.436-.32.348-1.22 1.192-1.22 2.908s1.248 3.372 1.424 3.604c.176.232 2.456 3.748 5.952 5.256.832.36 1.48.576 1.988.736.836.264 1.596.228 2.196.14.672-.1 2.06-.84 2.352-1.652.292-.812.292-1.508.204-1.652-.088-.144-.32-.232-.668-.408z" />
        </svg>
      </a>
    </div>
    </>
  );
}
