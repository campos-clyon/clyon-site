/**
 * Privacy Policy Page - Página de Política de Privacidade
 * RGPD-compliant privacy policy for Clyon
 */


export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Política de Privacidade</h1>
          <p className="text-cyan-100">Última atualização: Fevereiro de 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg leading-relaxed mb-4">
            A CLYON ("nós", "nos", "nosso" ou "Empresa") opera o site clyon.pt (doravante referido como "Serviço"). Esta página informa-o das nossas políticas relativas à recolha, uso e divulgação de dados pessoais quando utiliza o nosso Serviço e as escolhas que tem associadas a esses dados.
          </p>
          <p className="text-lg leading-relaxed">
            Utilizamos os seus dados para fornecer e melhorar o Serviço. Ao utilizar o Serviço, concorda com a recolha e utilização de informações de acordo com esta política. Se não concordar com as nossas políticas e práticas, não utilize o nosso Serviço.
          </p>
        </section>

        {/* 1. Definições */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">1. Definições</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Dados Pessoais</h3>
              <p>Qualquer informação relativa a uma pessoa singular identificada ou identificável. Isto inclui informações como nome, endereço de correio eletrónico, número de telefone, endereço postal e informações de localização.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Dados de Utilização</h3>
              <p>Dados recolhidos automaticamente durante a utilização do Serviço, como endereços IP, tipo de navegador, páginas visitadas, hora e data da visita, e outras informações de diagnóstico.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Cookies</h3>
              <p>Pequenos ficheiros de dados armazenados no seu dispositivo que contêm informações sobre a sua navegação e preferências.</p>
            </div>
          </div>
        </section>

        {/* 2. Recolha de Dados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">2. Recolha de Dados Pessoais</h2>
          <p className="mb-4">Recolhemos dados pessoais de várias formas:</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">2.1 Dados que Nos Fornece Diretamente</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Quando preenche formulários (contacto, orçamento, etc.)</li>
                <li>Quando se regista numa conta</li>
                <li>Quando solicita um serviço</li>
                <li>Quando nos contacta por email ou telefone</li>
                <li>Quando participa em pesquisas ou avaliações</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2.2 Dados Recolhidos Automaticamente</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Endereço IP</li>
                <li>Tipo e versão do navegador</li>
                <li>Páginas visitadas e tempo de permanência</li>
                <li>Referrer (página anterior)</li>
                <li>Sistema operativo</li>
                <li>Informações de localização (se autorizado)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Uso de Dados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">3. Uso de Dados Pessoais</h2>
          <p className="mb-4">Utilizamos os dados pessoais recolhidos para:</p>
          
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Fornecer e manter o Serviço</li>
            <li>Notificá-lo sobre mudanças no Serviço</li>
            <li>Permitir-lhe participar em funcionalidades interativas do Serviço</li>
            <li>Fornecer apoio ao cliente</li>
            <li>Recolher análises e informações para melhorar o Serviço</li>
            <li>Monitorizar o uso do Serviço</li>
            <li>Detectar, prevenir e resolver problemas técnicos e fraude</li>
            <li>Enviar-lhe informações de marketing (com o seu consentimento)</li>
            <li>Cumprir obrigações legais</li>
          </ul>
        </section>

        {/* 4. Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">4. Cookies e Tecnologias Similares</h2>
          
          <div className="space-y-4">
            <p>Utilizamos cookies e tecnologias similares para rastrear atividades no nosso Serviço e manter certas informações. Os cookies são ficheiros com uma pequena quantidade de dados que podem incluir um identificador único anónimo.</p>

            <div>
              <h3 className="font-semibold text-lg mb-2">Tipos de Cookies que Utilizamos:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento do site</li>
                <li><strong>Cookies de Análise:</strong> Para entender como os utilizadores utilizam o site</li>
                <li><strong>Cookies de Marketing:</strong> Para rastrear e medir a eficácia de campanhas publicitárias</li>
                <li><strong>Cookies de Preferências:</strong> Para lembrar as suas escolhas</li>
              </ul>
            </div>

            <p>Pode controlar e/ou eliminar cookies conforme desejado. Pode eliminar todos os cookies que já estão no seu computador e pode configurar a maioria dos navegadores para evitar que sejam colocados. No entanto, se fizer isto, poderá ter de ajustar manualmente algumas preferências sempre que visitar o nosso site.</p>
          </div>
        </section>

        {/* 5. Segurança */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">5. Segurança de Dados</h2>
          <p>A segurança dos seus dados é importante para nós, mas lembre-se que nenhum método de transmissão pela Internet ou método de armazenamento eletrónico é 100% seguro. Embora nos esforcemos por utilizar meios comercialmente aceitáveis para proteger os seus dados pessoais, não podemos garantir a sua segurança absoluta.</p>
        </section>

        {/* 6. Direitos do Utilizador */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">6. Seus Direitos (RGPD)</h2>
          <p className="mb-4">De acordo com o Regulamento Geral sobre a Proteção de Dados (RGPD), tem os seguintes direitos:</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Direito de Acesso</h3>
              <p>Tem o direito de aceder aos seus dados pessoais e receber uma cópia deles.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Direito de Retificação</h3>
              <p>Pode solicitar a correção de dados pessoais inexatos ou incompletos.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Direito de Eliminação</h3>
              <p>Pode solicitar a eliminação dos seus dados pessoais em certas circunstâncias.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Direito de Restrição</h3>
              <p>Pode solicitar a restrição do processamento dos seus dados.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Direito de Portabilidade</h3>
              <p>Pode solicitar uma cópia dos seus dados num formato estruturado e legível por máquina.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Direito de Oposição</h3>
              <p>Pode opor-se ao processamento dos seus dados para fins de marketing direto.</p>
            </div>
          </div>
        </section>

        {/* 7. Retenção de Dados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">7. Retenção de Dados</h2>
          <p>Retenho os seus dados pessoais apenas pelo tempo necessário para os fins para os quais foram recolhidos ou conforme exigido pela lei. O período de retenção pode variar dependendo do contexto do processamento e das nossas obrigações legais.</p>
        </section>

        {/* 8. Partilha de Dados */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">8. Partilha de Dados</h2>
          <p className="mb-4">Não vendemos, negociamos ou transferimos de outra forma os seus dados pessoais identificáveis a terceiros. Isto não inclui terceiros de confiança que nos ajudam a operar o nosso site, conduzir o nosso negócio ou servir-vos, desde que essas partes concordem em manter estas informações confidenciais.</p>
          
          <p>Podemos divulgar informações pessoais quando obrigado por lei ou quando acreditamos de boa fé que tal divulgação é necessária para proteger os nossos direitos, a sua segurança ou a segurança de outros.</p>
        </section>

        {/* 9. Links Externos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">9. Links para Outros Sites</h2>
          <p>O nosso Serviço pode conter links para sites externos que não são operados por nós. Esta Política de Privacidade não se aplica a esses sites externos, e não somos responsáveis pelos seus conteúdos ou práticas de privacidade. Recomendamos que revise a política de privacidade de qualquer site antes de fornecer informações pessoais.</p>
        </section>

        {/* 10. Contacto */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">10. Contacte-nos</h2>
          <p className="mb-4">Se tem dúvidas sobre esta Política de Privacidade ou sobre as nossas práticas de privacidade, contacte-nos em:</p>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <p className="font-semibold mb-2">CLYON</p>
            <p className="mb-2">Email: <a href="mailto:privacidade@clyon.pt" className="text-cyan-600 hover:underline">privacidade@clyon.pt</a></p>
            <p>Pode também exercer os seus direitos contactando-nos através do formulário de contacto no nosso site.</p>
          </div>
        </section>

        {/* 11. Alterações */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-cyan-600">11. Alterações a Esta Política</h2>
          <p>Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificá-lo-emos de qualquer alteração publicando a nova Política de Privacidade nesta página e atualizando a data de "Última atualização" no topo desta página.</p>
        </section>

        {/* Footer Note */}
        <div className="border-t pt-8 mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Esta Política de Privacidade é compatível com o Regulamento Geral sobre a Proteção de Dados (RGPD) da União Europeia e a Lei da Proteção de Dados Pessoais de Portugal.
          </p>
        </div>
      </div>
    </div>
  );
}
