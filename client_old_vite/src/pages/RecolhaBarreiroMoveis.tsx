import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaBarreiroMoveis() {
  return (
    <ServiceCityPage
      service="Recolha de Móveis"
      city="Barreiro"
      description="Serviço especializado de recolha e remoção de móveis antigos, danificados ou indesejados em Barreiro. Remoção segura de sofás, armários, camas, mesas, eletrodomésticos e todo o tipo de mobiliário. Transporte responsável até centro de reciclagem certificado com descarte legal. Resposta rápida, preços competitivos e 100% de satisfação garantida."
      whatIncludes={[
        "Avaliação gratuita do volume e tipo de móveis",
        "Mão de obra especializada para desmontagem (se necessário)",
        "Carregamento cuidadoso para evitar danos ao imóvel",
        "Transporte até centro de reciclagem ou doação",
        "Limpeza final do local após recolha",
        "Seguro de responsabilidade civil",
        "Atendimento em toda a região de Barreiro e arredores",
        "Subida/descida de escadas incluída",
        "Doação de móveis em bom estado a IPSS locais",
      ]}
      whatNotIncluded={[
        "Móveis com infestação de pragas (cupins, percevejos)",
        "Resíduos perigosos (produtos químicos, tintas)",
        "Lixo orgânico ou doméstico comum",
        "Entulho de obras (serviço separado)",
        "Demolição de móveis fixos (armários embutidos)",
        "Desmontagem de móveis complexos sem aviso prévio",
      ]}
      howItWorks={[
        "Contacte-nos via WhatsApp (+351 931 632 622) ou telefone com fotos dos móveis",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a recolha para o dia e hora que preferir (incluindo sábados)",
        "Nossa equipa chega, desmonta (se necessário), carrega e transporta tudo",
        "Móveis em bom estado são doados a instituições locais; restante vai para reciclagem",
        "Pagamento apenas após conclusão do serviço",
      ]}
      pricing="O preço varia conforme o volume, peso e dificuldade de acesso. Em média: sofá 2-3 lugares (€35-55), armário grande (€45-75), cama de casal (€25-45), mesa + cadeiras (€35-55), frigorífico/máquina de lavar (€30-50). Recolha de conjunto completo de apartamento: €180-350. Preços em Barreiro podem variar conforme a localização. Orçamento sempre gratuito e sem compromisso."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia (conforme disponibilidade) ou data de sua preferência, incluindo sábados. Atendemos Barreiro e arredores. Serviço completo dura entre 30 minutos a 2 horas, dependendo da quantidade e localização dos móveis."
      legal="Móveis em condições de uso são doados a instituições de caridade parceiras em Barreiro (IPSS, associações locais, Cáritas). Móveis danificados são transportados para centros de triagem certificados pela APA, onde madeira, metal e plástico são separados para reciclagem. Cumprimos o Decreto-Lei n.º 178/2006 sobre gestão de resíduos. Fornecemos guias de transporte quando solicitado."
      faqs={[
        {
          question: "Quanto custa recolher um sofá em Barreiro?",
          answer: "Um sofá de 2-3 lugares custa entre €35-55. Sofás maiores ou de canto podem custar €60-90. O preço inclui carregamento, transporte e descarte legal. Preços em Barreiro podem variar. Envie foto via WhatsApp para orçamento exato.",
        },
        {
          question: "Vocês atendem toda a região de Barreiro?",
          answer: "Sim! Atendemos toda a região de Barreiro e arredores. Informe a localização exata no orçamento para confirmar se sua zona está incluída.",
        },
        {
          question: "Recolhem móveis em prédios sem elevador?",
          answer: "Sim, subimos e descemos escadas. Informe o número de andares no orçamento para cálculo correto do preço (pode haver acréscimo para andares altos).",
        },
        {
          question: "Vocês desmontam os móveis?",
          answer: "Sim! Nossa equipa desmonta móveis quando necessário (camas, armários, estantes). Informe no orçamento se há móveis que precisam de desmontagem.",
        },
        {
          question: "Recolhem eletrodomésticos em Barreiro?",
          answer: "Sim! Recolhemos frigoríficos, máquinas de lavar, fogões, micro-ondas, etc. Eletrodomésticos são encaminhados para reciclagem certificada de REEE (Resíduos de Equipamentos Elétricos e Eletrónicos).",
        },
        {
          question: "O que acontece com os móveis recolhidos?",
          answer: "Móveis em bom estado são doados a instituições sociais em Barreiro (IPSS, Cáritas). Móveis danificados vão para centros de reciclagem certificados, onde madeira, metal e plástico são separados e reciclados.",
        },
      ]}
      testimonials={[
        {
          name: "Cliente em Barreiro",
          text: "Serviço excelente! Recolheram móveis em Barreiro. Rápidos, simpáticos e preço justo. Recomendo!",
          rating: 5,
        },
        {
          name: "Cliente satisfeito em Barreiro",
          text: "Precisava recolher móveis em Barreiro. Vieram no dia seguinte e fizeram tudo impecável. Muito satisfeito!",
          rating: 5,
        },
        {
          name: "Referência em Barreiro",
          text: "Recolheram móveis antigos em Barreiro. Equipa profissional, trabalho rápido e preço melhor que esperava!",
          rating: 5,
        },
      ]}
    />
  );
}
