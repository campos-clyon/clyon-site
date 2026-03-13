import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function StandardHeader() {
  const [, navigate] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      {/* Back Button Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl flex items-center">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2 border-cyan-500 text-cyan-500 hover:bg-cyan-50"
            >
              <ArrowLeft size={18} />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex justify-center px-4 py-4">
          <div className="w-full max-w-6xl flex items-center justify-between">
            {/* Logo */}
            <div
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="text-2xl font-bold text-cyan-500">CLYON</div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8">
              <a
                href="/servicos"
                className="text-gray-700 hover:text-cyan-500 transition-colors"
              >
                Serviços
              </a>
              <a
                href="/#trabalhos"
                className="text-gray-700 hover:text-cyan-500 transition-colors"
              >
                Trabalhos
              </a>
              <a
                href="/#avaliacoes"
                className="text-gray-700 hover:text-cyan-500 transition-colors"
              >
                Avaliações
              </a>
              <a
                href="/#sobre"
                className="text-gray-700 hover:text-cyan-500 transition-colors"
              >
                Sobre Nós
              </a>
              <a
                href="/contactos"
                className="text-gray-700 hover:text-cyan-500 transition-colors"
              >
                Contacto
              </a>
            </nav>

            {/* Call Button */}
            <a
              href="https://wa.me/351931632622"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-cyan-500 text-white px-6 py-2 rounded-full hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >
              <span>📞</span>
              Ligar Agora
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
