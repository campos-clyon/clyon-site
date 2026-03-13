import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

export default function CentralAjuda() {
  const [, setLocation] = useLocation();
  const [abertos, setAbertos] = useState<Record<number, boolean>>(
    Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, true]))
  );

  const faqs: Array<{ pergunta: string; resposta: string | React.ReactNode }> = [
    {
      pergunta: "Como solicitar um serviço?",
      resposta: (
        <>
          Acesse a página{" "}
          <Link href="/simulador" className="font-semibold underline" style={{ color: '#06b6d4' }}>
            Simular Orçamento
          </Link>
          , descreva o que precisa, e receberá orçamentos de profissionais verificados em minutos.
        </>
      )
    },
    { pergunta: "Qual é o tempo de resposta?", resposta: "Os nossos profissionais respondem em até 11 minutos. Pode agendar o serviço para o dia que preferir." },
    { pergunta: "Como funciona o pagamento?", resposta: "Aceitamos Revolut, MBWAY e NOVO BANCO. O pagamento é seguro e processado após a conclusão do serviço." },
    { pergunta: "Posso cancelar um serviço agendado?", resposta: "Sim, pode cancelar com até 24 horas de antecedência sem custos adicionais." },
    { pergunta: "Os profissionais são verificados?", resposta: "Sim, todos os nossos profissionais passam por verificação de identidade e avaliações de clientes anteriores." },
    { pergunta: "Há garantia de satisfação?", resposta: "Sim! Se não estiver satisfeito com o serviço, resolvemos o problema sem custos adicionais." },
    { pergunta: "Como funciona o programa de referência?", resposta: "Partilhe o seu código de referência com amigos. Ambos ganham €15 em créditos quando o seu amigo faz o primeiro serviço." },
    {
      pergunta: "Posso trabalhar como prestador?",
      resposta: (
        <>
          Sim! Acesse{" "}
          <a href="https://clyon.pt/colaboradores" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: '#06b6d4' }}>
            Colaboradores
          </a>
          {" "}para se registar como prestador profissional.
        </>
      )
    }
  ];

  const toggleAberto = (index: number) => {
    setAbertos(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.pergunta,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": typeof faq.resposta === 'string' ? faq.resposta : String(faq.pergunta)
        }
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero ciano */}
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Central de Ajuda</h1>
          <p className="text-lg text-white/80">Encontre respostas para as perguntas mais frequentes sobre os nossos serviços</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* FAQ Accordion */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border-2 overflow-hidden transition-all duration-200"
              style={{ borderColor: abertos[index] ? '#06b6d4' : '#e2e8f0', background: 'white' }}
            >
              <button
                onClick={() => toggleAberto(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-base" style={{ color: '#0f172a' }}>{faq.pergunta}</h3>
                {abertos[index]
                  ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: '#06b6d4' }} />
                  : <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: '#94a3b8' }} />
                }
              </button>
              {abertos[index] && (
                <div className="px-6 pb-5 border-t" style={{ borderColor: '#f1f5f9', color: '#475569' }}>
                  <div className="pt-4 leading-relaxed">{faq.resposta}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="relative rounded-3xl p-10 text-center overflow-hidden" style={{ background: '#06b6d4' }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20" style={{ background: 'white' }}></div>
          <div className="relative">
            <h2 className="text-2xl font-black text-white mb-3">Não encontrou o que procurava?</h2>
            <p className="text-white/80 mb-6">Entre em contacto connosco através do WhatsApp</p>
            <a
              href="https://wa.me/351931632622"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-white transition-all hover:scale-105"
              style={{ color: '#06b6d4' }}
            >
              Falar no WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
