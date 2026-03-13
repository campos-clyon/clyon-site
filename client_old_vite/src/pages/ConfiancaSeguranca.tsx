import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function ConfiancaSeguranca() {
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
        <h1 className="text-4xl font-bold mb-6">Confiança e Segurança</h1>
        <p className="text-lg text-gray-300 mb-8">
          Sua segurança e privacidade são nossas prioridades máximas
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Verificação de Profissionais</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Verificação de identidade
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Antecedentes criminais
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Referências verificadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Avaliações de clientes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span> Seguro profissional
              </li>
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20">
            <h2 className="text-2xl font-bold mb-4">Proteção de Dados</h2>
            <ul className="space-y-3 text-gray-200">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span> Encriptação SSL 256-bit
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span> GDPR Compliant
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span> Privacidade garantida
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span> Dados não compartilhados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">🔒</span> Conformidade PCI-DSS
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur p-8 rounded-lg border border-white/20 mb-8">
          <h2 className="text-2xl font-bold mb-4">Garantias de Serviço</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-bold text-cyan-400 mb-2">Garantia de Satisfação</h3>
              <p className="text-gray-300 text-sm">Se não estiver satisfeito, resolvemos sem custos adicionais</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-bold text-cyan-400 mb-2">Preço Transparente</h3>
              <p className="text-gray-300 text-sm">Sem custos ocultos. Orçamento claro antes do serviço</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="font-bold text-cyan-400 mb-2">Documentação Completa</h3>
              <p className="text-gray-300 text-sm">Recibos, faturas e certificados de serviço</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Certificações e Prêmios</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 p-4 rounded">
              <p className="text-sm">⭐ Avaliação 5.0</p>
              <p className="text-xs text-gray-300">95 clientes satisfeitos</p>
            </div>
            <div className="bg-white/20 p-4 rounded">
              <p className="text-sm">🏆 Top Pro Fixando</p>
              <p className="text-xs text-gray-300">Profissional verificado</p>
            </div>
            <div className="bg-white/20 p-4 rounded">
              <p className="text-sm">✅ GDPR Compliant</p>
              <p className="text-xs text-gray-300">Proteção de dados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
