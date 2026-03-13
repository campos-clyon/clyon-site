import { useEffect } from "react";
import { Link } from "wouter";
import { Phone, MapPin, Clock, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function Contactos() {
  useEffect(() => {
    document.title = "Contactos - CLYON | Recolha de Entulho e Móveis";
  }, []);

  const handleWhatsApp = () => {
    window.open("https://wa.me/351931632622", "_blank");
  };

  const servicos = [
    "Recolha de Entulho", "Recolha de Móveis", "Recolha de Monos",
    "Demolições", "Mudanças", "Aluguer de Camião + Motorista"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero ciano */}
      <div className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 60%, #22d3ee 100%)' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20" style={{ background: 'white' }}></div>
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-15" style={{ background: 'white' }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Contacte-nos</h1>
          <p className="text-lg text-white/80">Estamos aqui para responder às suas dúvidas e fornecer um orçamento rápido</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Cards de contacto */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Contacto Direto */}
          <div className="p-8 rounded-2xl border-2 hover:shadow-lg transition-all duration-300" style={{ borderColor: '#a5f3fc', background: 'white' }}>
            <h2 className="text-xl font-black mb-6" style={{ color: '#0f172a' }}>Contacto Direto</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.1)' }}>
                  <Phone className="w-5 h-5" style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>Telefone</p>
                  <a href="tel:+351931632622" className="font-bold text-lg transition-colors" style={{ color: '#06b6d4' }}>
                    +351 931 632 622
                  </a>
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Disponível para chamadas e WhatsApp</p>
                </div>
              </div>
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{ background: '#06b6d4', boxShadow: '0 4px 16px rgba(6,182,212,0.3)' }}
              >
                <MessageCircle className="w-5 h-5" />
                Enviar Mensagem WhatsApp
              </button>
            </div>
          </div>

          {/* Informações da Empresa */}
          <div className="p-8 rounded-2xl border-2 hover:shadow-lg transition-all duration-300" style={{ borderColor: '#a5f3fc', background: 'white' }}>
            <h2 className="text-xl font-black mb-6" style={{ color: '#0f172a' }}>Informações da Empresa</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.1)' }}>
                  <MapPin className="w-5 h-5" style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>Morada</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                    Rua dos Jasmins 3<br />Belverde, Amora<br />2845-513 Portugal
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(6,182,212,0.1)' }}>
                  <Clock className="w-5 h-5" style={{ color: '#06b6d4' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>Horário</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                    Segunda a Sábado: 08:00 - 20:00<br />Domingo: Apenas mensagem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="rounded-2xl p-8 mb-10" style={{ background: 'linear-gradient(135deg, #f0fdff, #e0f9ff)' }}>
          <h2 className="text-xl font-black mb-6" style={{ color: '#0f172a' }}>Serviços Disponíveis</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {servicos.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#06b6d4' }} />
                <span className="text-sm font-medium" style={{ color: '#475569' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="relative rounded-3xl p-10 text-center overflow-hidden" style={{ background: '#06b6d4' }}>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20" style={{ background: 'white' }}></div>
          <div className="relative">
            <h3 className="text-2xl font-black text-white mb-3">Pronto para começar?</h3>
            <p className="text-white/80 mb-6">Contacte-nos agora para um orçamento rápido e sem compromisso</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-white transition-all hover:scale-105"
                style={{ color: '#06b6d4' }}
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
              <a
                href="tel:+351931632622"
                className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold border-2 border-white text-white transition-all hover:bg-white/15"
              >
                <Phone className="w-5 h-5" />
                Ligar Agora
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 bg-white py-12 mt-8" style={{ borderColor: '#06b6d4' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="font-black text-2xl mb-1" style={{ color: '#06b6d4' }}>CLYON</h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Recolha e limpeza profissional em Lisboa e Setúbal</p>
            </div>
            <div className="flex gap-6 text-sm" style={{ color: '#64748b' }}>
              <Link href="/" className="hover:text-cyan-500 transition-colors">Início</Link>
              <Link href="/servicos" className="hover:text-cyan-500 transition-colors">Serviços</Link>
              <Link href="/privacidade" className="hover:text-cyan-500 transition-colors">Privacidade</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t text-center text-sm" style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}>
            © CLYON 2025 — Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
