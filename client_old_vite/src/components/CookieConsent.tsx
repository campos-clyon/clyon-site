import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Cookie Consent Banner Component
 * Exibe um banner de consentimento de cookies no rodapé
 * Armazena a preferência do utilizador no localStorage
 */

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    // Verificar se o utilizador já aceitou/rejeitou cookies
    const cookieConsent = localStorage.getItem("clyon_cookie_consent");
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("clyon_cookie_consent", "accepted");
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("clyon_cookie_consent", "rejected");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner de Cookies */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-700 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Texto */}
            <div className="flex-1 text-white text-sm">
              <p className="mb-2">
                Utilizamos cookies para melhorar a sua experiência no nosso site.
                Ao continuar a navegar, concorda com a nossa utilização de cookies.
              </p>
              <button
                onClick={() => setShowPolicy(true)}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
                style={{ color: "#0097b2" }}
              >
                Ver Política de Privacidade
              </button>
            </div>

            {/* Botões */}
            <div className="flex gap-3 flex-shrink-0">
              <Button
                onClick={handleReject}
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Rejeitar
              </Button>
              <Button
                onClick={handleAccept}
                className="text-white"
                style={{ backgroundColor: "#0097b2" }}
              >
                Aceitar
              </Button>
            </div>

            {/* Fechar */}
            <button
              onClick={handleReject}
              className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Política de Privacidade */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                Política de Privacidade
              </h2>
              <button
                onClick={() => setShowPolicy(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            <div className="p-6 text-slate-700 space-y-6">
              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  1. Introdução
                </h3>
                <p>
                  A Clyon ("nós", "nosso" ou "nos") opera o website clyon.pt
                  (o "Site"). Esta página informa-o sobre as nossas políticas
                  relativas à recolha, utilização e divulgação de dados pessoais
                  quando utiliza o nosso Site e as opções que tem associadas a
                  esses dados.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  2. Cookies
                </h3>
                <p>
                  Um cookie é um ficheiro que contém um identificador (uma série
                  de letras e números) que é enviado por um servidor web para um
                  navegador web e é armazenado pelo navegador. O identificador é
                  então reenviado para o servidor sempre que o navegador solicita
                  uma página do servidor.
                </p>
                <p className="mt-3">
                  Utilizamos cookies para:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Melhorar a experiência do utilizador</li>
                  <li>Recordar as suas preferências</li>
                  <li>Analisar o tráfego do site</li>
                  <li>Manter a sua sessão ativa</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  3. Tipos de Cookies
                </h3>
                <p>
                  <strong>Cookies Essenciais:</strong> Necessários para o
                  funcionamento do site.
                </p>
                <p className="mt-2">
                  <strong>Cookies de Análise:</strong> Utilizados para entender
                  como os visitantes utilizam o site.
                </p>
                <p className="mt-2">
                  <strong>Cookies de Preferência:</strong> Recordam as suas
                  escolhas e preferências.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  4. Dados Pessoais
                </h3>
                <p>
                  Quando contacta a Clyon através do nosso formulário de
                  orçamento, recolhemos informações como:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de email</li>
                  <li>Número de telefone</li>
                  <li>Descrição do serviço solicitado</li>
                </ul>
                <p className="mt-3">
                  Estes dados são utilizados exclusivamente para responder ao seu
                  pedido de orçamento e não serão partilhados com terceiros sem o
                  seu consentimento.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  5. Segurança dos Dados
                </h3>
                <p>
                  Implementamos medidas de segurança apropriadas para proteger os
                  seus dados pessoais contra acesso não autorizado, alteração,
                  divulgação ou destruição.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  6. Direitos do Utilizador
                </h3>
                <p>
                  Tem o direito de:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Aceder aos seus dados pessoais</li>
                  <li>Corrigir dados imprecisos</li>
                  <li>Solicitar a eliminação dos seus dados</li>
                  <li>Opor-se ao processamento dos seus dados</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  7. Contacto
                </h3>
                <p>
                  Se tiver questões sobre esta Política de Privacidade, contacte-nos:
                </p>
                <ul className="mt-3 space-y-1">
                  <li>WhatsApp: +351 931 632 622</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  8. Alterações a esta Política
                </h3>
                <p>
                  Reservamo-nos o direito de alterar esta Política de Privacidade
                  a qualquer momento. As alterações serão efetivas assim que
                  publicadas no Site.
                </p>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex gap-3">
              <Button
                onClick={() => setShowPolicy(false)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  handleAccept();
                  setShowPolicy(false);
                }}
                className="flex-1 text-white"
                style={{ backgroundColor: "#0097b2" }}
              >
                Aceitar e Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
