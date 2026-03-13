import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, MapPin, ArrowRight, Truck, Home, Trash2, Zap, Users, Briefcase } from "lucide-react";

export default function Trabalhos() {
  const services = [
    {
      name: "Recolha de Móveis",
      description: "Remoção segura e profissional de móveis antigos, danificados ou indesejados.",
      icon: Home,
      color: "from-cyan-400 to-cyan-600",
      slug: "recolha-moveis"
    },
    {
      name: "Recolha de Monos",
      description: "Limpeza de sótãos, caves e garagens com remoção de objetos volumosos.",
      icon: Trash2,
      color: "from-cyan-500 to-cyan-700",
      slug: "recolha-monos"
    },
    {
      name: "Recolha de Entulho",
      description: "Remoção de entulho de obras, construção e reformas com reciclagem.",
      icon: Truck,
      color: "from-cyan-400 to-cyan-600",
      slug: "recolha-entulho"
    },
    {
      name: "Demolição",
      description: "Demolição controlada de estruturas com segurança e conformidade legal.",
      icon: Zap,
      color: "from-cyan-500 to-cyan-700",
      slug: "demolicao"
    },
    {
      name: "Mudanças",
      description: "Mudanças residenciais e comerciais completas com profissionalismo.",
      icon: Truck,
      color: "from-cyan-400 to-cyan-600",
      slug: "mudancas"
    },
    {
      name: "Aluguer Caminhão",
      description: "Aluguer de caminhão com motorista profissional para qualquer volume.",
      icon: Truck,
      color: "from-cyan-500 to-cyan-700",
      slug: "aluguer-caminhao"
    }
  ];

  const professionals = [
    { name: "Ajudante de Obra", rating: 4.95, reviews: 248, desc: "Assistência profissional em obras" },
    { name: "Ajudante Móveis", rating: 4.98, reviews: 312, desc: "Mover móveis ou jogar no lixo" },
    { name: "Limpeza Quintal", rating: 4.93, reviews: 187, desc: "Limpeza profissional de quintais" },
    { name: "Ajudante Mudanças", rating: 4.97, reviews: 425, desc: "Assistência em mudanças" },
    { name: "Pedreiro", rating: 4.96, reviews: 356, desc: "Trabalhos de alvenaria" },
    { name: "Eletricista", rating: 4.99, reviews: 289, desc: "Serviços elétricos profissionais" },
    { name: "Encanador", rating: 4.94, reviews: 267, desc: "Reparações hidráulicas" },
    { name: "Limpeza Sofas", rating: 4.98, reviews: 198, desc: "Limpeza profissional de sofas" },
    { name: "Jardineiro", rating: 4.95, reviews: 234, desc: "Manutenção de jardins" }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section — fundo ciano consistente */}
      <section className="pt-32 pb-20 text-center bg-cyan-500">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Os Nossos Trabalhos
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Conheça os serviços profissionais que oferecemos e os especialistas que executam cada trabalho com excelência
          </p>
          <Link href="/simulador">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold shadow-lg">
              Pedir Orçamento Grátis <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Serviços Grid */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Serviços Disponíveis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.slug}
                className="group relative bg-white border-cyan-100 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
              >
                <div className="relative p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{service.description}</p>
                  <Link href={`/servicos`}>
                    <Button variant="outline" size="sm" className="w-full border-cyan-300 text-cyan-600 hover:bg-cyan-50">
                      Saiba Mais <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Profissionais Section */}
      <section className="px-4 py-16 bg-cyan-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Profissionais Especializados</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((prof) => (
              <Card
                key={prof.name}
                className="bg-white border-cyan-100 hover:border-cyan-400 hover:shadow-lg transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{prof.name}</h3>
                    <p className="text-slate-600 text-sm">{prof.desc}</p>
                  </div>
                  <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-cyan-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(prof.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200 fill-slate-200"}`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-700 font-semibold text-sm">{prof.rating}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">{prof.reviews} avaliações</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 text-center bg-cyan-500 mx-4 md:mx-8 rounded-2xl mt-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-white/90 mb-8">
            Solicite um orçamento gratuito e descubra como podemos ajudar com os seus trabalhos
          </p>
          <Link href="/solicitar-servico">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold shadow-lg">
              Solicitar Serviço <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
