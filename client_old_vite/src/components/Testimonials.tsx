import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Quote } from "lucide-react";

export default function Testimonials() {
  const scrollToContact = () => {
    const contactSection = document.getElementById('cta-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "Empreiteiro Geral",
      location: "Lisboa",
      text: "A Clyon salvou a nossa obra no Parque das Nações. Estávamos com um atraso de 3 dias devido ao entulho acumulado. Eles resolveram tudo em uma manhã. Eficiência impressionante.",
      rating: 5
    },
    {
      name: "Ana Sofia Costa",
      role: "Gestora de Condomínios",
      location: "Setúbal",
      text: "Já trabalhei com várias empresas de recolha, mas nenhuma tem o profissionalismo da Clyon. A equipa é educada, pontual e deixa tudo impecável. Recomendo vivamente.",
      rating: 5
    },
    {
      name: "Pedro Ferreira",
      role: "Proprietário",
      location: "Cascais",
      text: "Contratei para a recolha de móveis antigos e entulho de uma remodelação. O preço foi justo e o serviço foi executado com uma rapidez que não esperava. Cinco estrelas.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white w-full overflow-hidden">
      <div className="container mx-auto px-4 max-w-full">
        <div className="text-center max-w-3xl mx-auto mb-16 px-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 mb-6">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold uppercase tracking-wide">Clientes Satisfeitos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            O Que Dizem Quem Já Escolheu a Eficiência
          </h2>
          <p className="text-lg text-slate-600">
            A nossa reputação é construída sobre a confiança e resultados consistentes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative hover:shadow-lg transition-shadow mx-2 md:mx-0">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-[#0097b2]/20" />
              
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-slate-700 mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0097b2] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                  <p className="text-sm text-slate-500">{testimonial.role} • {testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas de Confiança */}
        <div className="bg-gradient-to-r from-[#0097b2]/5 to-[#00d4ff]/5 rounded-2xl p-8 md:p-12 border border-[#0097b2]/20 mb-16 mx-2 md:mx-0">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-[#0097b2] mb-2">500+</p>
              <p className="text-slate-700 font-semibold">
                Projetos Concluídos
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#0097b2] mb-2">98%</p>
              <p className="text-slate-700 font-semibold">
                Taxa de Satisfação
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-[#0097b2] mb-2">10+</p>
              <p className="text-slate-700 font-semibold">
                Anos de Experiência
              </p>
            </div>
          </div>
        </div>

        {/* CTA de Prova Social */}
        <div className="text-center px-2">
          <p className="text-xl font-medium text-slate-800 mb-8">
            Junte-se a centenas de clientes satisfeitos na Grande Lisboa e Setúbal.
          </p>
          <Button 
            onClick={scrollToContact}
            className="bg-[#0097b2] hover:bg-[#007a99] text-white px-8 md:px-10 py-6 text-lg rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-none w-full md:w-auto whitespace-normal"
          >
            QUERO FAZER PARTE DESTE GRUPO
            <ArrowRight className="ml-2 h-5 w-5 flex-shrink-0" />
          </Button>
        </div>
      </div>
    </section>
  );
}
