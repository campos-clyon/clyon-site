import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function CreditoFiscal() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition mb-8 font-semibold"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1 className="text-4xl font-bold mb-6">Crédito Fiscal</h1>
        <p className="text-lg text-gray-300 mb-8">
          Informações sobre benefícios fiscais e deduções para serviços de recolha e limpeza
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Benefícios Fiscais</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Deduções em IRS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Crédito de IVA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Despesas dedutíveis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Recibos válidos
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Documentação</h2>
            <p className="text-gray-300 mb-4">
              Todos os nossos serviços incluem documentação fiscal completa:
            </p>
            <ul className="space-y-2 text-gray-200">
              <li>• Recibos detalhados</li>
              <li>• Faturas eletrônicas</li>
              <li>• Comprovantes de pagamento</li>
              <li>• Certificados de serviço</li>
            </ul>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-4">Serviços Elegíveis</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-cyan-400 mb-3">Totalmente Dedutíveis</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✓ Recolha de Entulho</li>
                <li>✓ Limpeza Profissional</li>
                <li>✓ Demolição Controlada</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-3">Parcialmente Dedutíveis</h3>
              <ul className="space-y-2 text-gray-300">
                <li>✓ Mudanças Residenciais</li>
                <li>✓ Recolha de Móveis</li>
                <li>✓ Transporte</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Precisa de Mais Informações?</h2>
          <p className="text-lg mb-6">Consulte um especialista fiscal ou entre em contato conosco</p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-lg transition">
            Contacte-nos
          </button>
        </div>
      </div>
    </div>
  );
}
