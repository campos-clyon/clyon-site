import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import FAQSchema from "@/components/FAQSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import RelatedRegions from "@/components/RelatedRegions";
import {
  Star,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
} from "lucide-react";

interface ServiceCityPageProps {
  service: string; // "Recolha de Entulho", "Recolha de Móveis", etc.
  city: string; // "Lisboa", "Setúbal", etc.
  description: string;
  whatIncludes: string[];
  whatNotIncluded: string[];
  howItWorks: string[];
  pricing: string;
  timeline: string;
  legal: string;
  faqs: { question: string; answer: string }[];
  testimonials?: { name: string; text: string; rating: number }[];
}

export default function ServiceCityPage({
  service,
  city,
  description,
  whatIncludes,
  whatNotIncluded,
  howItWorks,
  pricing,
  timeline,
  legal,
  faqs,
  testimonials = [],
}: ServiceCityPageProps) {
  const pageTitle = `${service} em ${city} - Clyon | Grátis em 11 min`;
  const metaDescription = `${service} em ${city}. Orçamento em 11 minutos, recolha no mesmo dia. Descartes legal certificado. Contacte Clyon agora!`;

  useEffect(() => {
    document.title = pageTitle;
    
    // Update meta description
    let metaTag = document.querySelector('meta[name="description"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', metaDescription);

    // Add LocalBusiness Schema Markup
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `CLYON - ${service} em ${city}`,
      "description": metaDescription,
      "url": `https://clyon.pt/recolha-moveis-${city.toLowerCase().replace(/\s+/g, '-')}`,
      "telephone": "+351931632622",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressCountry": "PT"
      },
      "areaServed": city,
      "serviceType": service,
      "priceRange": "€€"
    };

    let schemaScript = document.getElementById('local-business-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'local-business-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }
  }, [pageTitle, metaDescription]);

  const breadcrumbItems = [
    { name: "Inicio", url: "https://clyon.pt" },
    { name: "Servicos", url: "https://clyon.pt/servicos" },
    { name: city, url: `https://clyon.pt/recolha-moveis-${city.toLowerCase().replace(/\s+/g, '-')}` }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbItems} />
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-cyan-500 text-white">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <div className="text-center">
              <div className="mb-6 inline-block px-4 py-2 bg-white/20 border border-white/40 rounded-full">
                <span className="text-white text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {city}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {service} em {city}
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-3xl mx-auto">
                {description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-cyan-600 hover:bg-cyan-50 font-semibold shadow-lg"
                  onClick={() =>
                    window.open("https://wa.me/351931632622", "_blank")
                  }
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  Orçamento Grátis via WhatsApp
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/60 text-white hover:bg-white/10"
                  onClick={() => window.open("tel:+351931632622", "_self")}
                >
                  <Phone className="mr-2 w-5 h-5" />
                  Ligar Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-cyan-50 py-12 border-b border-cyan-100">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-cyan-600">5.0</div>
                <p className="text-gray-600 mt-2">Avaliação</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">163+</div>
                <p className="text-gray-600 mt-2">Avaliações</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">11 min</div>
                <p className="text-gray-600 mt-2">Tempo de Resposta</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <p className="text-gray-600 mt-2">Garantia de Satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O que está incluído */}
      <section className="py-16">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              O que está incluído
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {whatIncludes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* O que NÃO está incluído */}
      <section className="py-16 bg-gray-50">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              O que NÃO recolhemos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {whatNotIncluded.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 border-2 border-red-500 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <div className="w-2 h-0.5 bg-red-500"></div>
                  </div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Como funciona
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, idx) => (
                <Card key={idx} className="p-6 text-center">
                  <div className="w-12 h-12 bg-cyan-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Preços e Prazos */}
      <section className="py-16 bg-gray-50">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Preços
                </h3>
                <p className="text-gray-700">{pricing}</p>
              </Card>
              <Card className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Prazos
                </h3>
                <p className="text-gray-700">{timeline}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Conformidade Legal */}
      <section className="py-16">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Descarte Legal e Certificado
            </h2>
            <Card className="p-8 bg-cyan-50 border-cyan-200">
              <p className="text-gray-700">{legal}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Perguntas Frequentes
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="py-16 bg-gray-50">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Áreas que Atendemos em {city}
            </h2>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAaBoP7ba_1s74URKHeDyAgpactRjS0xO8&q=${city}+Portugal&zoom=12`}
              ></iframe>
            </div>
            <p className="text-gray-600 text-center mt-6">
              Atendemos toda a região de {city} e arredores. Contacte-nos para confirmar se sua localização está incluída.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16">
          <div className="flex justify-center px-4">
            <div className="w-full max-w-6xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                O que dizem nossos clientes em {city}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {testimonials.map((testimonial, idx) => (
                  <Card key={idx} className="p-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-br from-cyan-600 to-cyan-700 text-white">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg text-cyan-100 mb-8">
              Contacte-nos agora para um orçamento gratuito em 11 minutos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-cyan-600 hover:bg-gray-100"
                onClick={() =>
                  window.open("https://wa.me/351931632622", "_blank")
                }
              >
                <MessageCircle className="mr-2 w-5 h-5" />
                WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window.open("tel:+351931632622", "_self")}
              >
                <Phone className="mr-2 w-5 h-5" />
                Ligar: +351 931 632 622
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Regions */}
      <RelatedRegions currentRegion={city} maxItems={4} />

      {/* Footer */}
      <footer className="bg-white border-t border-cyan-100 text-slate-500 py-8">
        <div className="flex justify-center px-4">
          <div className="w-full max-w-6xl text-center">
            <p>&copy; 2026 CLYON. Todos os direitos reservados.</p>
            <p className="text-sm mt-2">
              Descarte legal certificado | Atendimento 24/7
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
