import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function PerguntasFrequentes() {
  const [, setLocation] = useLocation();
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  const faqs = [
    {
      categoria: "Serviços",
      perguntas: [
        {
          pergunta: "Quais serviços vocês oferecem?",
          resposta: "Oferecemos recolha de entulho, móveis, mudanças residenciais, limpeza profissional, demolição controlada e transporte."
        },
        {
          pergunta: "Vocês trabalham aos fins de semana?",
          resposta: "Sim, oferecemos serviços de segunda a domingo. Pode agendar o horário que preferir."
        },
        {
          pergunta: "Qual é o horário de funcionamento?",
          resposta: "Operamos de segunda a domingo, das 08:00 às 19:00. Para emergências, entre em contacto connosco."
        }
      ]
    },
    {
      categoria: "Preços e Pagamento",
      perguntas: [
        {
          pergunta: "Como funciona o cálculo de preço?",
          resposta: "O preço é baseado no tipo de serviço, quantidade de material, localização e complexidade do trabalho."
        },
        {
          pergunta: "Quais são os métodos de pagamento?",
          resposta: "Aceitamos Revolut, MBWAY e NOVO BANCO. O pagamento é realizado após a conclusão do serviço."
        },
        {
          pergunta: "Há custos adicionais?",
          resposta: "Não. O preço que vê no orçamento é o preço final, sem custos ocultos."
        }
      ]
    },
    {
      categoria: "Agendamento",
      perguntas: [
        {
          pergunta: "Quanto tempo leva para agendar um serviço?",
          resposta: "Recebe uma resposta em até 11 minutos. Pode agendar para o dia que preferir."
        },
        {
          pergunta: "Posso cancelar um serviço?",
          resposta: "Sim, pode cancelar com até 24 horas de antecedência sem custos adicionais."
        },
        {
          pergunta: "E se eu precisar remarcar?",
          resposta: "Sem problema! Pode remarcar para outra data sem custos, desde que comunique com antecedência."
        }
      ]
    },
    {
      categoria: "Profissionais",
      perguntas: [
        {
          pergunta: "Os profissionais são verificados?",
          resposta: "Sim, todos passam por verificação de identidade, antecedentes e avaliações de clientes."
        },
        {
          pergunta: "Qual é a experiência dos profissionais?",
          resposta: "Os nossos profissionais têm experiência comprovada e avaliações de 5 estrelas."
        },
        {
          pergunta: "Posso escolher o profissional?",
          resposta: "Sim, pode ver o perfil e avaliações de cada profissional antes de confirmar."
        }
      ]
    }
  ];

  const toggleAberto = (categoria: number, index: number) => {
    const key = `${categoria}-${index}`;
    setAbertos(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-xl text-white/90">
            Respostas para as dúvidas mais comuns sobre os nossos serviços
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="space-y-10">
          {faqs.map((categoria, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-cyan-400">
                {categoria.categoria}
              </h2>
              <div className="space-y-3">
                {categoria.perguntas.map((faq, faqIndex) => {
                  const key = `${catIndex}-${faqIndex}`;
                  const isOpen = abertos[key] || false;
                  return (
                    <div
                      key={faqIndex}
                      className="border border-cyan-100 rounded-lg overflow-hidden hover:border-cyan-300 transition-colors"
                    >
                      <button
                        onClick={() => toggleAberto(catIndex, faqIndex)}
                        className="w-full p-5 text-left hover:bg-cyan-50 transition flex justify-between items-center gap-4"
                      >
                        <h3 className="text-base font-semibold text-slate-900">{faq.pergunta}</h3>
                        {isOpen
                          ? <ChevronUp className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                          : <ChevronDown className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                        }
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-cyan-100 text-slate-600 pt-4">
                          {faq.resposta}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-cyan-500 p-8 rounded-2xl text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ainda tem dúvidas?</h2>
          <p className="text-white/90 mb-6">Entre em contacto connosco através do WhatsApp ou email</p>
          <a
            href="https://wa.me/351931632622"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-cyan-600 hover:bg-cyan-50 font-bold px-8 py-3 rounded-lg transition shadow-lg"
          >
            Contactar via WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
