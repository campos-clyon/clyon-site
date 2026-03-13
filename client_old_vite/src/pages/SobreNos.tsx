import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, Users, Award, Zap, Heart, Shield, ArrowRight, MapPin, Phone, Mail, Star } from "lucide-react";

export default function SobreNos() {
  const values = [
    {
      icon: CheckCircle2,
      title: "Qualidade",
      description: "Executamos cada trabalho com excelência e atenção aos detalhes"
    },
    {
      icon: Users,
      title: "Profissionalismo",
      description: "Equipa treinada e certificada para garantir o melhor serviço"
    },
    {
      icon: Zap,
      title: "Rapidez",
      description: "Serviços rápidos e eficientes, respeitando os prazos acordados"
    },
    {
      icon: Heart,
      title: "Confiança",
      description: "Transparência total e honestidade em todas as nossas operações"
    },
    {
      icon: Shield,
      title: "Segurança",
      description: "Protegemos seus bens e seguimos todas as normas de segurança"
    },
    {
      icon: Award,
      title: "Experiência",
      description: "Mais de uma década de experiência em serviços de recolha e limpeza"
    }
  ];

  const stats = [
    { number: "10+", label: "Anos de Experiência" },
    { number: "5000+", label: "Clientes Satisfeitos" },
    { number: "4.96", label: "Avaliação Média" },
    { number: "34", label: "Regiões Cobertas" }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section — fundo ciano consistente com o resto do site */}
      <section className="px-4 pt-32 pb-20 text-center bg-cyan-500">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="w-4 h-4 fill-white" />
            163+ Avaliações — 4.96 Estrelas
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sobre a CLYON
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Somos líderes em serviços de recolha, limpeza e mudanças em Portugal, comprometidos com excelência e sustentabilidade ambiental.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bg-white border-cyan-100 p-8 text-center hover:shadow-lg hover:border-cyan-300 transition-all duration-300"
            >
              <div className="text-4xl font-bold text-cyan-500 mb-2">{stat.number}</div>
              <p className="text-slate-600">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="px-4 py-16 bg-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">A Nossa Essência</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-cyan-500 mb-4">Missão</h3>
              <p className="text-slate-700">
                Fornecer serviços de recolha, limpeza e mudanças de excelência, com profissionalismo e responsabilidade ambiental, melhorando a qualidade de vida dos nossos clientes.
              </p>
            </Card>
            <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-cyan-500 mb-4">Visão</h3>
              <p className="text-slate-700">
                Ser a empresa de referência em Portugal para serviços de recolha e limpeza, reconhecida pela qualidade, inovação e compromisso com a sustentabilidade.
              </p>
            </Card>
            <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all duration-300">
              <h3 className="text-2xl font-bold text-cyan-500 mb-4">Valores</h3>
              <p className="text-slate-700">
                Qualidade, profissionalismo, integridade, responsabilidade ambiental e satisfação do cliente são os pilares que guiam todas as nossas ações.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores Principais */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Os Nossos Valores</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card
                key={index}
                className="bg-white border-cyan-100 p-6 hover:border-cyan-400 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600 text-sm">{value.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Por Que Escolher CLYON */}
      <section className="px-4 py-16 bg-cyan-500">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Por Que Escolher CLYON?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Equipa Profissional",
                desc: "A nossa equipa é composta por profissionais treinados, certificados e com vasta experiência em serviços de recolha, limpeza e mudanças."
              },
              {
                title: "Cobertura Regional Ampla",
                desc: "Operamos em 34 regiões diferentes, cobrindo Lisboa, Margem Sul, Setúbal e arredores com serviços rápidos e eficientes."
              },
              {
                title: "Preços Competitivos",
                desc: "Oferecemos orçamentos gratuitos e transparentes, sem custos ocultos. Qualidade premium com preços justos."
              },
              {
                title: "Responsabilidade Ambiental",
                desc: "Comprometidos com a sustentabilidade, realizamos reciclagem e disposição responsável de materiais, em conformidade com a APA."
              },
              {
                title: "Atendimento 24/7",
                desc: "Disponíveis para atender as suas dúvidas e solicitações a qualquer hora do dia, via WhatsApp ou telefone."
              },
              {
                title: "Avaliações 5 Estrelas",
                desc: "Mais de 5000 clientes satisfeitos com uma avaliação média de 4.96 estrelas em todas as plataformas."
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-white/85 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Informações Legais e Morada */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Informações da Empresa</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold text-cyan-500 mb-4">Detalhes da Empresa</h3>
            <div className="space-y-3 text-slate-700">
              <p><strong>Nome:</strong> CLYON - Recolha, Limpeza e Mudanças</p>
              <p><strong>Morada:</strong> Rua dos Jasmins, 3, Amora, 2720-000 Portugal</p>
              <p><strong>Telefone:</strong> +351 931 632 622</p>
              <p><strong>Email:</strong> info@clyon.pt</p>
              <p><strong>Horário:</strong> 24/7 — Atendimento disponível a qualquer hora</p>
            </div>
          </Card>
          <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-bold text-cyan-500 mb-4">Certificações e Conformidade</h3>
            <div className="space-y-3 text-slate-700">
              <p><strong>Descarte Legal:</strong> Certificado e conforme com legislação portuguesa</p>
              <p><strong>Responsabilidade Ambiental:</strong> Reciclagem e disposição responsável de materiais</p>
              <p><strong>Seguro:</strong> Cobertura completa para todos os serviços</p>
              <p><strong>Profissionalismo:</strong> Equipa treinada e certificada</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Contacto Section */}
      <section className="px-4 py-16 bg-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Entre em Contacto</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white border-cyan-100 p-8 text-center hover:shadow-lg hover:border-cyan-300 transition-all duration-300">
              <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Telefone</h3>
              <p className="text-slate-600">+351 931 632 622</p>
            </Card>
            <Card className="bg-white border-cyan-100 p-8 text-center hover:shadow-lg hover:border-cyan-300 transition-all duration-300">
              <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Email</h3>
              <p className="text-slate-600">info@clyon.pt</p>
            </Card>
            <Card className="bg-white border-cyan-100 p-8 text-center hover:shadow-lg hover:border-cyan-300 transition-all duration-300">
              <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Localização</h3>
              <p className="text-slate-600">Grande Lisboa e Margem Sul</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Políticas e Privacidade */}
      <section className="px-4 py-12 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Políticas e Privacidade</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
          <Link href="/privacidade">
            <Button variant="outline" className="w-full border-cyan-400 text-cyan-600 hover:bg-cyan-50">
              Política de Privacidade
            </Button>
          </Link>
          <Link href="/termos">
            <Button variant="outline" className="w-full border-cyan-400 text-cyan-600 hover:bg-cyan-50">
              Termos e Condições
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 text-center bg-cyan-500 mx-4 md:mx-8 rounded-2xl mb-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para trabalhar connosco?</h2>
          <p className="text-white/90 mb-8">
            Contacte-nos hoje para um orçamento gratuito e descubra por que somos a escolha número um em Portugal.
          </p>
          <Link href="/contactos">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold shadow-lg">
              Contacte-nos <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
