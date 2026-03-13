import { ArrowRight, Phone, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";


export default function Services() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const serviceCategories = [
    {
      id: 1,
      name: "Recolha de Monos",
      icon: "♻️",
      description: "Remoção segura e profissional de monos, sucata e materiais diversos. Limpeza completa do espaço após recolha.",
      fullDescription: "Serviço especializado em recolha de monos, sucata, ferro velho e materiais diversos. Nossa equipe remove tudo com segurança e deixa o espaço limpo e organizado. Garantimos disposição adequada e reciclagem responsável de todos os materiais.",
      image: "/service-monos.jpg",
      simulatorCategory: "monos"
    },
    {
      id: 2,
      name: "Recolha de Recheios",
      icon: "🛋️",
      description: "Esvaziamos e recolhemos recheios completos de casas, apartamentos e vivendas com total eficiência.",
      fullDescription: "Serviço completo de esvaziamento de recheios. Recolhemos móveis, eletrodomésticos e objetos de qualquer tamanho. Nossa equipe trabalha com rapidez e profissionalismo, deixando o espaço completamente vazio e pronto para uso.",
      image: "/service-recheios.jpg",
      simulatorCategory: "moveis"
    },
    {
      id: 3,
      name: "Esvaziamento de Casas",
      icon: "🏠",
      description: "Serviço completo de esvaziamento para venda, arrendamento ou renovação do seu imóvel.",
      fullDescription: "Esvaziamento profissional de casas, apartamentos e propriedades. Removemos todos os móveis, objetos e entulho, deixando o espaço completamente vazio e limpo. Ideal para vendas, arrendamentos ou renovações.",
      image: "/service-esvaziamento.jpg",
      simulatorCategory: "moveis"
    },
    {
      id: 4,
      name: "Serviço de Limpeza",
      icon: "🧹",
      description: "Limpezas profissionais de imóveis: pós-obra, pós-despejo, casas abandonadas e situações especiais.",
      fullDescription: "Serviço completo de limpeza profissional. Desde limpeza pós-obra até casas abandonadas, nossa equipe especializada deixa tudo impecável. Utilizamos produtos profissionais e técnicas avançadas para garantir máxima qualidade.",
      image: "/service-limpeza.jpg",
      simulatorCategory: "limpeza"
    },
    {
      id: 5,
      name: "Mudanças e Apoio",
      icon: "📦",
      description: "Serviço completo de mudança residencial ou comercial com profissionais qualificados.",
      fullDescription: "Mudanças profissionais de residências e empresas. Embalagem cuidadosa, transporte seguro e desembalagem no novo local. Nossa equipe garante que todos os seus bens chegam em perfeito estado. Oferecemos também montagem de móveis e organização.",
      image: "/service-mudancas.jpg",
      simulatorCategory: "mudancas"
    },
    {
      id: 6,
      name: "Aluguer Caminhão + Motorista",
      icon: "🚚",
      description: "Aluguel de caminhão com motorista profissional para transporte de carga e mudanças.",
      fullDescription: "Aluguel de caminhão com motorista experiente. Disponível para mudanças, entregas, recolhas e transporte de carga. Profissionais qualificados garantem segurança e eficiência em cada viagem.",
      image: "/service-caminhao.jpg",
      simulatorCategory: "mudancas"
    },
    {
      id: 7,
      name: "Desmantelamento",
      icon: "🔧",
      description: "Desmontagem de estruturas, móveis e instalações com profissionalismo e cuidado.",
      fullDescription: "Serviço especializado em desmantelamento de estruturas, móveis, instalações e equipamentos. Nossa equipe qualificada realiza o trabalho com precisão, garantindo a segurança e a preservação de peças que possam ser reutilizadas. Ideal para renovações, demolições e limpezas de espaços.",
      image: "/service-desmantelamento.jpg",
      simulatorCategory: "entulho"
    },
    {
      id: 8,
      name: "Reparações Domésticas",
      icon: "🔨",
      description: "Pequenos reparos e manutenção doméstica realizada por profissionais qualificados.",
      fullDescription: "Serviço de reparações domésticas para pequenos trabalhos de manutenção. Desde reparos de torneiras, pintura, instalação de prateleiras, reparos de móveis até pequenas reformas. Nossa equipe experiente resolve qualquer problema doméstico com rapidez e qualidade.",
      image: "/service-reparacoes.jpg",
      simulatorCategory: "moveis"
    }
  ];

  const services = [
    {
      id: 1,
      name: "Recolha de Móveis",
      description: "Recolha segura e rápida de móveis velhos, danificados ou indesejados. Transporte direto para reciclagem ou doação.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-moveis-oK535m27dvMeha7PEEJxBk.webp"
    },
    {
      id: 2,
      name: "Recolha de Monos",
      description: "Remoção profissional de monos, sucata e materiais diversos. Limpeza completa do espaço após recolha.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-monos-kgdaeFx2LEotpqEgWX735B.webp"
    },
    {
      id: 3,
      name: "Recolha de Entulho",
      description: "Limpeza profissional de entulho de obras, reformas e demolições. Transporte e disposição adequada.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-entulho-8mczhgdWKNXtn3yrBUZSr5.webp"
    },
    {
      id: 4,
      name: "Esvaziamento de Casas",
      description: "Esvaziamento completo de casas, apartamentos e vivendas. Ideal para venda, arrendamento ou renovação.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-esvaziamento-QPGkqk4kW9RzSxPGeFBRTG.webp"
    },
    {
      id: 5,
      name: "Limpeza Pós-Obra",
      description: "Limpeza profissional após obras e remodelações. Espaço pronto a usar no mesmo dia.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-limpeza-8MNUx8b7oxs5ymfpQrfExs.webp"
    },
    {
      id: 6,
      name: "Mudanças",
      description: "Serviço completo de mudança residencial ou comercial. Embalagem, transporte e desembalagem profissional.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-mudancas-auFHFFvpfWCayi4kQn4nBY.webp"
    },
    {
      id: 7,
      name: "Aluguer de Caminhão com Motorista",
      description: "Aluguer de caminhão com motorista profissional para transporte de carga. Disponível para mudanças, entregas e recolhas.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-caminhao-aVJXAJ7pk6UBHTUm6HX6Ze.webp"
    },
    {
      id: 8,
      name: "Desmantelamento",
      description: "Desmontagem de estruturas, móveis e instalações com profissionalismo e cuidado.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-desmantelamento-K6q3RShYnsihWtqcV3Ubmy.webp"
    },
    {
      id: 9,
      name: "Reparações Domésticas",
      description: "Pequenos reparos e manutenção doméstica realizados por profissionais qualificados.",
      image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663108032375/9kEaxw5PeTniExyaRSHpgx/srv-reparacoes-jpK8aF26TwwoocyRMXbgBj.webp"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Serviços de Recolha e Limpeza | CLYON</title>
        <meta name="description" content="Conheça todos os serviços CLYON: recolha de móveis, entulho, monos, limpeza pós-obra, mudanças e muito mais. Orçamentos gratis." />
        <meta name="keywords" content="serviços de recolha, recolha de móveis, recolha de entulho, limpeza pós-obra, mudanças, recolha de monos, desmantelamento, reparações" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://clyon.pt/servicos" />
      </Helmet>
      <div className="min-h-screen bg-white flex flex-col">

      {/* Hero Section — fundo ciano consistente */}
      <section className="pt-32 pb-20 bg-cyan-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Melhore a sua qualidade de vida com serviços domiciliares.
          </h1>
          <p className="text-white/90 text-lg">
            Encontre profissionais qualificados para todos os seus serviços
          </p>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="py-20 bg-white">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Categorias de Serviços</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {serviceCategories.map((category) => (
                <div 
                  key={category.id} 
                  onClick={() => setSelectedCategory(category)}
                  className="bg-white rounded-2xl border border-cyan-100 shadow-sm hover:shadow-lg hover:border-cyan-300 transition-all hover:scale-105 p-6 cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="text-5xl mb-3">{category.icon}</div>
                    <h3 className="text-lg font-bold text-slate-900 text-center">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm text-center">
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-20 bg-cyan-50">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                Serviços CLYON
              </h2>
              <p className="text-lg text-slate-600">
                Conheça todos os serviços que a CLYON oferece para si
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} className="bg-white rounded-lg overflow-hidden border border-cyan-100 shadow-sm hover:shadow-lg hover:border-cyan-300 transition-all">
                  <div className="w-full h-48 overflow-hidden bg-cyan-100">
                    <img 
                      src={service.image} 
                      alt={service.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {service.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-end">
                      <Button
                        size="sm"
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                        onClick={() => window.open("https://wa.me/351931632622", "_blank")}
                      >
                        Contratar
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-cyan-500 text-white">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Contacte-nos agora e receba uma resposta em até 11 minutos!
            </p>
            <Button
              size="lg"
              className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold shadow-lg"
              onClick={() => window.open("https://wa.me/351931632622", "_blank")}
            >
              <Phone className="mr-2 w-5 h-5" />
              Contactar via WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* Modal de Categoria */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-cyan-500 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{selectedCategory.icon}</div>
                <h2 className="text-3xl font-bold">{selectedCategory.name}</h2>
              </div>
              <button onClick={() => setSelectedCategory(null)} className="hover:bg-cyan-600 p-2 rounded-full transition">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <p className="text-slate-700 text-lg mb-6 leading-relaxed">{selectedCategory.fullDescription}</p>
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 mb-6 rounded">
                <p className="text-cyan-900 font-semibold">Pronto para começar?</p>
                <p className="text-cyan-800 text-sm mt-1">Clique no botão abaixo para ir direto ao simulador de orçamentos desta categoria.</p>
              </div>
              <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white" onClick={() => { setSelectedCategory(null); setLocation(`/simulador?categoria=${selectedCategory.simulatorCategory}`); }}>
                  <ArrowRight className="mr-2 w-5 h-5" />
                  Fazer Orçamento
                </Button>
                <Button size="lg" variant="outline" className="flex-1 border-cyan-400 text-cyan-600 hover:bg-cyan-50" onClick={() => setSelectedCategory(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
