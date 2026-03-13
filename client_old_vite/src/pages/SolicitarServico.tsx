import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";


export default function SolicitarServico() {
  const [, setLocation] = useLocation();

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Solicitar um Serviço</h1>
          <p className="text-xl text-white/90">
            Encontre profissionais qualificados para resolver os seus problemas de recolha, limpeza e mudanças.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Como Funciona</h2>
            <ol className="space-y-4">
              {[
                "Descreva o seu serviço e necessidades",
                "Receba orçamentos de profissionais verificados",
                "Escolha o melhor profissional para si",
                "Agende e receba o serviço com qualidade garantida"
              ].map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="bg-white border-cyan-100 p-8 hover:shadow-lg transition-all">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Serviços Disponíveis</h2>
            <ul className="space-y-3">
              {["Recolha de Entulho", "Recolha de Móveis", "Mudanças Residenciais", "Limpeza Profissional", "Demolição Controlada"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* CTA Simulador */}
        <div className="bg-cyan-500 p-8 rounded-2xl text-center text-white mb-8">
          <h2 className="text-2xl font-bold mb-3">Pronto para começar?</h2>
          <p className="text-white/90 mb-6">Simule o seu orçamento agora mesmo e receba uma proposta em minutos!</p>
          <Button
            onClick={() => setLocation("/simulador")}
            className="bg-white text-cyan-600 hover:bg-cyan-50 font-bold px-8 py-3 text-lg shadow-lg"
          >
            Simular Orçamento <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-slate-500 mb-4">Dúvidas? Consulte a nossa Central de Ajuda</p>
          <Button
            variant="outline"
            onClick={() => setLocation("/central-ajuda")}
            className="border-cyan-400 text-cyan-600 hover:bg-cyan-50"
          >
            Central de Ajuda
          </Button>
        </div>
      </section>
    </div>
  );
}
