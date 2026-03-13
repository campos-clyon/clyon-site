import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaMoveisLisboa() {
  return (
    <ServiceCityPage
      service="Recolha de Móveis"
      city="Lisboa"
      description="Serviço especializado de recolha e remoção de móveis antigos, danificados ou indesejados em Lisboa. Remoção segura de sofás, armários, camas, mesas, eletrodomésticos e todo o tipo de mobiliário. Transporte responsável até centro de reciclagem certificado com descarte legal. Resposta rápida, preços competitivos e 100% de satisfação garantida."
      whatIncludes={[
        "Avaliação gratuita do volume e tipo de móveis",
        "Mão de obra especializada para desmontagem (se necessário)",
        "Carregamento cuidadoso para evitar danos ao imóvel",
        "Transporte até centro de reciclagem ou doação",
        "Limpeza final do local após recolha",
        "Seguro de responsabilidade civil",
        "Atendimento em toda a região de Lisboa (Centro, Benfica, Lumiar, Olivais, Alvalade, Amadora, Odivelas, etc.)",
        "Subida/descida de escadas incluída",
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
        "Agendamos a recolha para o dia e hora que preferir (incluindo fins de semana)",
        "Nossa equipa chega, desmonta (se necessário), carrega e transporta tudo",
        "Móveis em bom estado são doados; restante vai para reciclagem certificada",
        "Pagamento apenas após conclusão do serviço",
      ]}
      pricing="O preço varia conforme o volume, peso e dificuldade de acesso. Em média: sofá 2-3 lugares (€40-60), armário grande (€50-80), cama de casal (€30-50), mesa + cadeiras (€40-60), frigorífico/máquina de lavar (€35-55). Recolha de conjunto completo de apartamento: €200-400. Orçamento sempre gratuito e sem compromisso."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia (conforme disponibilidade) ou data de sua preferência, incluindo sábados. Serviço completo dura entre 30 minutos a 2 horas, dependendo da quantidade e localização dos móveis."
      legal="Móveis em condições de uso são doados a instituições de caridade parceiras (IPSS, associações locais). Móveis danificados são transportados para centros de triagem certificados pela APA, onde madeira, metal e plástico são separados para reciclagem. Cumprimos o Decreto-Lei n.º 178/2006 sobre gestão de resíduos. Fornecemos guias de transporte quando solicitado."
      faqs={[
        {
          question: "Quanto custa recolher um sofá em Lisboa?",
          answer:
            "Um sofá de 2-3 lugares custa entre €40-60. Sofás maiores ou de canto podem custar €70-100. O preço inclui carregamento, transporte e descarte legal. Envie foto via WhatsApp para orçamento exato.",
        },
        {
          question: "Vocês desmontam os móveis?",
          answer:
            "Sim! Nossa equipa desmonta móveis quando necessário (camas, armários, estantes). Informe no orçamento se há móveis que precisam de desmontagem.",
        },
        {
          question: "Recolhem móveis em apartamentos sem elevador?",
          answer:
            "Sim, subimos e descemos escadas. Informe o número de andares no orçamento para cálculo correto do preço (pode haver acréscimo para andares altos).",
        },
        {
          question: "Vocês recolhem eletrodomésticos?",
          answer:
            "Sim! Recolhemos frigoríficos, máquinas de lavar, fogões, micro-ondas, etc. Eletrodomésticos são encaminhados para reciclagem certificada de REEE (Resíduos de Equipamentos Elétricos e Eletrónicos).",
        },
        {
          question: "Posso agendar para fim de semana?",
          answer:
            "Sim, trabalhamos aos sábados (09:00-14:00). Domingos mediante disponibilidade e com acréscimo. Contacte-nos para confirmar.",
        },
        {
          question: "O que acontece com os móveis recolhidos?",
          answer:
            "Móveis em bom estado são doados a instituições sociais. Móveis danificados vão para centros de reciclagem certificados, onde madeira, metal e plástico são separados e reciclados.",
        },
      ]}
      testimonials={[
        {
          name: "Maria T. (Lisboa)",
          text: "Muito eficientes, boa relação qualidade-preço. Recolheram um sofá velho e um armário. Estou extremamente satisfeita com o serviço!",
          rating: 5,
        },
        {
          name: "Ana F. (Alvalade)",
          text: "Serviço impecável! Recolheram móveis de um apartamento inteiro em 2 horas. Equipa simpática e profissional.",
          rating: 5,
        },
        {
          name: "João P. (Benfica)",
          text: "Precisava recolher uma cama e uma mesa urgentemente. Vieram no mesmo dia e fizeram tudo rapidamente. Recomendo!",
          rating: 5,
        },
      ]}
    />
  );
}
