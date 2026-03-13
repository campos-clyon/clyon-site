import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaMonosSetubal() {
  return (
    <ServiceCityPage
      service="Recolha de Monos"
      city="Setúbal"
      description="Serviço especializado de recolha de monos (lixo volumoso) em Setúbal. Limpeza completa de sótãos, caves, garagens, arrecadações e espaços acumulados. Remoção de objetos volumosos, móveis antigos, eletrodomésticos, caixas, entulho doméstico e tudo o que já não precisa. Conhecemos as particularidades de Setúbal, Palmela e Sesimbra. Transporte responsável até centro de reciclagem certificado com descarte legal. Resposta rápida, preços competitivos e 100% de satisfação garantida."
      whatIncludes={[
        "Avaliação gratuita do volume de monos no local",
        "Mão de obra especializada para carregamento",
        "Limpeza completa de sótãos, caves, garagens ou arrecadações",
        "Remoção de móveis, eletrodomésticos, caixas, objetos volumosos",
        "Transporte até centro de reciclagem ou doação",
        "Separação seletiva de materiais recicláveis",
        "Limpeza final do espaço após recolha",
        "Seguro de responsabilidade civil",
        "Atendimento em toda a região de Setúbal (centro, Palmela, Sesimbra, Azeitão, etc.)",
        "Doação de objetos em bom estado a IPSS locais",
      ]}
      whatNotIncluded={[
        "Resíduos perigosos (amianto, produtos químicos, tintas)",
        "Resíduos hospitalares ou biológicos",
        "Lixo orgânico em decomposição",
        "Entulho de obras de construção (serviço separado)",
        "Demolição de estruturas",
        "Limpeza profunda com produtos químicos (apenas remoção de objetos)",
      ]}
      howItWorks={[
        "Contacte-nos via WhatsApp (+351 931 632 622) ou telefone com fotos do espaço",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a recolha para o dia e hora que preferir",
        "Nossa equipa chega, separa, carrega e transporta tudo",
        "Objetos em bom estado são doados a instituições locais; restante vai para reciclagem",
        "Deixamos o espaço limpo e organizado",
        "Pagamento apenas após conclusão do serviço",
      ]}
      pricing="O preço varia conforme o volume (m³), tipo de objetos e dificuldade de acesso. Em média: cave/sótão pequeno (2-3m³) custa €100-180, médio (4-6m³) entre €180-320, grande (7m³+) a partir de €320. Garagens completas: €130-280. Setúbal tem preços mais acessíveis que Lisboa. Inclui mão de obra, transporte e descarte legal. Orçamento sempre gratuito e sem compromisso."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia (conforme disponibilidade) ou data de sua preferência, incluindo sábados. Atendemos Setúbal, Palmela, Sesimbra e arredores. Serviço completo dura entre 1 a 4 horas, dependendo do volume e acesso."
      legal="Objetos em condições de uso (móveis, eletrodomésticos funcionais, livros, roupas) são doados a instituições de caridade parceiras em Setúbal (IPSS, Cáritas, associações locais). Objetos danificados são transportados para centros de triagem certificados pela APA, onde são separados para reciclagem (madeira, metal, plástico, papel). Eletrodomésticos vão para reciclagem REEE. Cumprimos o Decreto-Lei n.º 178/2006 sobre gestão de resíduos. Fornecemos guias de transporte quando solicitado."
      faqs={[
        {
          question: "O que são 'monos'?",
          answer:
            "Monos é o termo popular para lixo volumoso: móveis velhos, eletrodomésticos, caixas acumuladas, objetos grandes que não cabem no lixo comum. Inclui tudo o que se acumula em caves, sótãos e garagens ao longo dos anos.",
        },
        {
          question: "Quanto custa limpar uma cave em Setúbal?",
          answer:
            "Depende do volume. Uma cave pequena (2-3m³) custa €100-180. Caves médias (4-6m³) entre €180-320. Setúbal tem preços mais acessíveis que Lisboa. Para orçamento exato, envie fotos via WhatsApp.",
        },
        {
          question: "Vocês atendem Palmela e Sesimbra?",
          answer:
            "Sim! Atendemos toda a região de Setúbal, incluindo Palmela, Sesimbra, Azeitão e arredores. Informe a localização exata no orçamento.",
        },
        {
          question: "Preciso separar os objetos antes?",
          answer:
            "Não! Nossa equipa faz toda a separação, carregamento e limpeza. Você só precisa indicar o que deve ser recolhido.",
        },
        {
          question: "Vocês recolhem eletrodomésticos velhos?",
          answer:
            "Sim! Recolhemos frigoríficos, máquinas de lavar, fogões, micro-ondas, etc. Eletrodomésticos são encaminhados para reciclagem certificada de REEE.",
        },
        {
          question: "O que acontece com os objetos recolhidos?",
          answer:
            "Objetos em bom estado são doados a instituições sociais em Setúbal (IPSS, Cáritas). Objetos danificados vão para centros de reciclagem certificados, onde são separados por material e reciclados.",
        },
      ]}
      testimonials={[
        {
          name: "Manuel F. (Setúbal)",
          text: "Limparam uma cave cheia de monos em Setúbal. Equipa eficiente, trabalho rápido e preço justo. Recomendo!",
          rating: 5,
        },
        {
          name: "Isabel C. (Palmela)",
          text: "Precisava limpar um sótão em Palmela. Vieram no dia seguinte e fizeram tudo impecável. Muito satisfeita!",
          rating: 5,
        },
        {
          name: "Rui S. (Sesimbra)",
          text: "Serviço excelente! Recolheram monos de uma garagem em Sesimbra. Rápidos, profissionais e deixaram tudo limpo!",
          rating: 5,
        },
      ]}
    />
  );
}
