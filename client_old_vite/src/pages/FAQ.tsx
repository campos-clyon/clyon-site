import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Helmet } from "react-helmet";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Serviços Gerais",
      questions: [
        {
          q: "Qual é o tempo de resposta da CLYON?",
          a: "Respondemos em até 11 minutos para solicitar um orçamento. Nosso objetivo é fornecer respostas rápidas e eficientes para todos os clientes."
        },
        {
          q: "Quais regiões a CLYON atende?",
          a: "Atendemos Lisboa, Setúbal e Margem Sul com serviços profissionais de limpeza, recolha de entulho e mudanças. Podemos expandir para outras regiões mediante consulta."
        },
        {
          q: "Como posso contratar um serviço?",
          a: "Você pode contratar através do nosso site usando o Simulador de Orçamento, entrando em contato via WhatsApp (+351 931 632 622) ou preenchendo o formulário de solicitação de serviço."
        },
        {
          q: "Qual é a taxa de satisfação da CLYON?",
          a: "100% dos nossos clientes estão satisfeitos com nossos serviços. Somos Top Pro no Fixando com avaliações 5 estrelas."
        }
      ]
    },
    {
      category: "Simulador de Orçamento",
      questions: [
        {
          q: "Como funciona o simulador de orçamento?",
          a: "Acesse o simulador, selecione o tipo de serviço (Móveis, Entulho, Mudanças, etc.), preencha os dados solicitados e receba um orçamento instantâneo com o preço final."
        },
        {
          q: "O orçamento é vinculativo?",
          a: "O orçamento fornecido pelo simulador é uma estimativa. O preço final pode variar dependendo de fatores como acessibilidade, complexidade do trabalho e condições no local."
        },
        {
          q: "Posso modificar o orçamento após receber?",
          a: "Sim, você pode entrar em contato conosco via WhatsApp ou telefone para discutir modificações no orçamento antes de confirmar o serviço."
        }
      ]
    },
    {
      category: "Recolha de Entulho",
      questions: [
        {
          q: "Quanto custa a recolha de entulho?",
          a: "O preço depende da quantidade de entulho, localização e acessibilidade. Use nosso simulador para obter um orçamento instantâneo."
        },
        {
          q: "Vocês recolhem entulho de qualquer tipo?",
          a: "Recolhemos a maioria dos tipos de entulho de obras, reformas e demolições. Para materiais especiais (amianto, resíduos perigosos), entre em contato conosco."
        },
        {
          q: "Qual é o tempo de recolha?",
          a: "O tempo depende da quantidade e localização. Geralmente, conseguimos agendar a recolha em 24-48 horas após confirmação."
        }
      ]
    },
    {
      category: "Mudanças",
      questions: [
        {
          q: "Vocês oferecem serviço completo de mudança?",
          a: "Sim, oferecemos serviço completo incluindo embalagem, transporte, desembalagem e montagem de móveis no novo local."
        },
        {
          q: "Como é calculado o preço de uma mudança?",
          a: "O preço é baseado no tempo estimado, número de pessoas, distância entre endereços, e acessibilidade. Use o simulador para calcular."
        },
        {
          q: "Vocês oferecem seguro para os móveis?",
          a: "Todos os móveis são tratados com máximo cuidado. Entre em contato para discutir opções de cobertura de seguro para mudanças de alto valor."
        }
      ]
    },
    {
      category: "Recolha de Móveis",
      questions: [
        {
          q: "Vocês recolhem móveis velhos ou danificados?",
          a: "Sim, recolhemos móveis velhos, danificados ou indesejados. Transportamos para reciclagem ou doação conforme apropriado."
        },
        {
          q: "Qual é o custo de recolha de móveis?",
          a: "O custo depende da quantidade e tipo de móveis. Use nosso simulador para obter um orçamento rápido e preciso."
        }
      ]
    },
    {
      category: "Recolha de Monos",
      questions: [
        {
          q: "O que são monos?",
          a: "Monos são objetos volumosos e inúteis como sofás velhos, camas, armários, bicicletas e outros itens que ocupam espaço."
        },
        {
          q: "Como funciona a recolha de monos?",
          a: "Você nos contacta com a descrição dos itens, fornecemos um orçamento, agendamos a recolha e transportamos para reciclagem ou descarte apropriado."
        }
      ]
    },
    {
      category: "Pagamento e Políticas",
      questions: [
        {
          q: "Quais são as formas de pagamento?",
          a: "Aceitamos transferência bancária, multibanco, e pagamento via WhatsApp. Discuta a forma de pagamento ao agendar o serviço."
        },
        {
          q: "Vocês oferecem desconto para múltiplos serviços?",
          a: "Sim, oferecemos descontos para clientes que contratam múltiplos serviços. Entre em contato para discutir."
        },
        {
          q: "Qual é a política de cancelamento?",
          a: "Cancelamentos com 24 horas de antecedência não têm custo. Cancelamentos com menos de 24 horas podem estar sujeitos a taxa."
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Perguntas Frequentes | CLYON</title>
        <meta name="description" content="Encontre respostas para as perguntas mais frequentes sobre serviços de recolha, limpeza, mudanças e muito mais. Saiba como a CLYON pode ajudar." />
        <meta name="keywords" content="perguntas frequentes, FAQ, recolha móveis, entulho, limpeza, mudanças, orçamentos" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://clyon.pt/faq" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-white">
      
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-cyan-500 text-white">
          <div className="flex justify-center px-4">
            <div className="w-full max-w-4xl text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Perguntas Frequentes
              </h1>
              <p className="text-white/90 text-lg">
                Encontre respostas para as perguntas mais comuns sobre os nossos serviços
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20 bg-white">
          <div className="flex justify-center px-4">
            <div className="w-full max-w-4xl">
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-cyan-500">
                    {category.category}
                  </h2>
                  
                  <div className="space-y-4">
                    {category.questions.map((item, index) => {
                      const globalIndex = categoryIndex * 100 + index;
                      const isOpen = openIndex === globalIndex;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          <button
                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                            className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 text-left">
                              {item.q}
                            </h3>
                            <ChevronDown
                              className={`w-5 h-5 text-cyan-600 flex-shrink-0 ml-4 transition-transform ${
                                isOpen ? "transform rotate-180" : ""
                              }`}
                            />
                          </button>
                          
                          {isOpen && (
                            <div className="p-6 bg-white border-t border-gray-200">
                              <p className="text-gray-700 leading-relaxed">
                                {item.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
          <div className="flex justify-center px-4">
            <div className="w-full max-w-4xl text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ainda tem dúvidas?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Entre em contato conosco via WhatsApp e responderemos em até 11 minutos!
              </p>
              <a
                href="https://wa.me/351931632622"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-cyan-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contactar via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>


    </div>
    </>
  );
}
