import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, Briefcase, ArrowRight } from "lucide-react";


export default function ServicosEmpresariais() {
  const [, setLocation] = useLocation();

  const sectors = [
    { name: "Construção", desc: "Limpeza de obras e recolha de entulho" },
    { name: "Imobiliário", desc: "Limpeza de imóveis e mudanças" },
    { name: "Retail", desc: "Limpeza de lojas e espaços comerciais" },
    { name: "Logística", desc: "Gestão de resíduos e organização" },
    { name: "Hotelaria", desc: "Limpeza profissional contínua" },
    { name: "Saúde", desc: "Limpeza especializada e segura" },
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-cyan-500 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-8 font-medium"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Serviços Empresariais</h1>
          <p className="text-xl text-white/90">
            Soluções profissionais de recolha, limpeza e mudanças para empresas e negócios
          </p>
        </div>
      </section>

      {/* Serviços e Benefícios */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Serviços Disponíveis</h2>
            <ul className="space-y-3">
              {["Limpeza de Escritórios", "Recolha de Entulho Industrial", "Mudanças Comerciais", "Limpeza Pós-Obra", "Gestão de Resíduos", "Serviços Customizados"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Benefícios Empresariais</h2>
            <ul className="space-y-3">
              {["Preços especiais", "Contratos flexíveis", "Suporte dedicado", "Agendamento prioritário", "Faturas customizadas", "Relatórios detalhados"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-3 h-3 text-cyan-600" />
                  </div>
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Setores */}
        <Card className="bg-white border-cyan-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Setores Atendidos</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {sectors.map((sector) => (
              <div key={sector.name} className="bg-cyan-50 p-4 rounded-lg border border-cyan-100">
                <p className="font-bold text-cyan-600">{sector.name}</p>
                <p className="text-sm text-slate-600 mt-1">{sector.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="bg-cyan-500 p-8 rounded-2xl text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Solicite um Orçamento Empresarial</h2>
          <p className="text-white/90 mb-6">Entre em contacto connosco para discutir as suas necessidades específicas</p>
          <Button
            className="bg-white text-cyan-600 hover:bg-cyan-50 font-bold px-8 py-3 text-lg shadow-lg"
            onClick={() => window.open("https://wa.me/351931632622", "_blank")}
          >
            Solicitar Orçamento <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
