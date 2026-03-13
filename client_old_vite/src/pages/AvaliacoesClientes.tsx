import { useLocation } from "wouter";
import { ArrowLeft, Star } from "lucide-react";

export default function AvaliacoesClientes() {
  const [, setLocation] = useLocation();

  const avaliacoes = [
    { nome: "Carlos F.", data: "22 de Nov 2025", rating: 5, texto: "Excelente trabalho de toda a equipa muito profissionais e extrema simpatia, fizeram o excelente trabalho e deixaram tudo limpo, recomendo vivamente" },
    { nome: "Ines A.", data: "20 de Nov 2025", rating: 5, texto: "Excelente serviço, rápido e com uma ótima relação qualidade-preço. Trabalho impecável, tudo removido em duas horas." },
    { nome: "Ana F.", data: "8 de Nov 2025", rating: 5, texto: "Avaliação automática: 5 estrelas pela conclusão do serviço com sucesso." },
    { nome: "Maria T.", data: "27 de Nov 2025", rating: 5, texto: "Muito eficientes, boa relação qualidade preço. Estou extremamente satisfeita com o serviço." },
    { nome: "Christian M.", data: "10 de Nov 2025", rating: 5, texto: "Excelente - fizeram proposta em menos de meia hora e vieram passado 2h no mesmo dia - fizeram o trabalho de forma super profissional e célere. 5 estrelas." },
    { nome: "Patricia S.", data: "8 de Nov 2025", rating: 5, texto: "Serviço rápido e eficiente. Equipa muito simpática e profissional. Recomendo a toda a gente!" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header ciano */}
      <div className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 60%, #22d3ee 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20" style={{ background: 'white' }}></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-15" style={{ background: 'white' }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white transition mb-8 font-semibold"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Avaliações de Clientes</h1>
          <p className="text-lg text-white/80">Veja o que os nossos clientes dizem sobre os nossos serviços</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Resumo */}
        <div className="rounded-3xl p-8 mb-10 text-center border-2" style={{ background: 'linear-gradient(135deg, #f0fdff, #e0f9ff)', borderColor: '#a5f3fc' }}>
          <div className="text-7xl font-black mb-2" style={{ color: '#06b6d4' }}>5.0</div>
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-7 h-7 fill-current" style={{ color: '#06b6d4' }} />
            ))}
          </div>
          <p className="font-semibold text-lg" style={{ color: '#0f172a' }}>163 avaliações verificadas</p>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>118 no Fixando · 45 no Google</p>
        </div>

        {/* Cards de avaliações */}
        <div className="grid gap-5">
          {avaliacoes.map((avaliacao, index) => (
            <div key={index} className="p-6 rounded-2xl border-2 transition-all hover:shadow-md duration-300" style={{ borderColor: '#f1f5f9', background: 'white' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: '#06b6d4' }}>
                    {avaliacao.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: '#0f172a' }}>{avaliacao.nome}</h3>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{avaliacao.data}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(avaliacao.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#06b6d4' }} />
                  ))}
                </div>
              </div>
              <p className="leading-relaxed" style={{ color: '#475569' }}>"{avaliacao.texto}"</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center py-10 rounded-3xl" style={{ background: 'linear-gradient(135deg, #f0fdff, #e0f9ff)' }}>
          <p className="font-semibold mb-4 text-lg" style={{ color: '#0f172a' }}>Quer deixar a sua avaliação?</p>
          <button
            className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: '#06b6d4', boxShadow: '0 4px 16px rgba(6,182,212,0.3)' }}
            onClick={() => window.open('https://www.fixando.pt', '_blank')}
          >
            Avaliar no Fixando →
          </button>
        </div>
      </div>
    </div>
  );
}
