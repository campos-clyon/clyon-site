import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaMonosLisboa() {
  return (
    <ServiceCityPage
      service="Recolha de Monos"
      city="Lisboa"
      description="Serviço especializado de recolha de monos (lixo volumoso) em Lisboa. Limpeza completa de sótãos, caves, garagens, arrecadações e espaços acumulados. Remoção de objetos volumosos, móveis antigos, eletrodomésticos, caixas, entulho doméstico e tudo o que já não precisa. Transporte responsável até centro de reciclagem certificado com descarte legal. Resposta rápida, preços competitivos e 100% de satisfação garantida."
      whatIncludes={[
        "Avaliação gratuita do volume de monos no local",
        "Mão de obra especializada para carregamento",
        "Limpeza completa de sótãos, caves, garagens ou arrecadações",
        "Remoção de móveis, eletrodomésticos, caixas, objetos volumosos",
        "Transporte até centro de reciclagem ou doação",
        "Separação seletiva de materiais recicláveis",
        "Limpeza final do espaço após recolha",
        "Seguro de responsabilidade civil",
        "Atendimento em toda a região de Lisboa (Centro, Benfica, Lumiar, Olivais, Alvalade, etc.)",
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
        "Objetos em bom estado são doados; restante vai para reciclagem certificada",
        "Deixamos o espaço limpo e organizado",
        "Pagamento apenas após conclusão do serviço",
      ]}
      pricing="O preço varia conforme o volume (m³), tipo de objetos e dificuldade de acesso. Em média: cave/sótão pequeno (2-3m³) custa €120-200, médio (4-6m³) entre €200-350, grande (7m³+) a partir de €350. Garagens completas: €150-300. Inclui mão de obra, transporte e descarte legal. Orçamento sempre gratuito e sem compromisso."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia (conforme disponibilidade) ou data de sua preferência, incluindo sábados. Serviço completo dura entre 1 a 4 horas, dependendo do volume e acesso. Atendemos toda Lisboa e arredores."
      legal="Objetos em condições de uso (móveis, eletrodomésticos funcionais, livros, roupas) são doados a instituições de caridade parceiras (IPSS, associações locais). Objetos danificados são transportados para centros de triagem certificados pela APA, onde são separados para reciclagem (madeira, metal, plástico, papel). Eletrodomésticos vão para reciclagem REEE. Cumprimos o Decreto-Lei n.º 178/2006 sobre gestão de resíduos. Fornecemos guias de transporte quando solicitado."
      faqs={[
        {
          question: "O que são 'monos'?",
          answer:
            "Monos é o termo popular para lixo volumoso: móveis velhos, eletrodomésticos, caixas acumuladas, objetos grandes que não cabem no lixo comum. Inclui tudo o que se acumula em caves, sótãos e garagens ao longo dos anos.",
        },
        {
          question: "Quanto custa limpar uma cave em Lisboa?",
          answer:
            "Depende do volume. Uma cave pequena (2-3m³) custa €120-200. Caves médias (4-6m³) entre €200-350. Para orçamento exato, envie fotos via WhatsApp.",
        },
        {
          question: "Vocês sobem escadas ou usam elevador?",
          answer:
            "Sim, subimos escadas e usamos elevadores quando necessário. Informe no orçamento se há dificuldades de acesso (caves profundas, sótãos altos, etc.).",
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
            "Objetos em bom estado são doados a instituições sociais. Objetos danificados vão para centros de reciclagem certificados, onde são separados por material (madeira, metal, plástico) e reciclados.",
        },
      ]}
      testimonials={[
        {
          name: "Ricardo M. (Lisboa)",
          text: "Limparam uma cave cheia de monos acumulados há anos. Equipa eficiente, trabalho rápido e preço justo. Recomendo!",
          rating: 5,
        },
        {
          name: "Teresa P. (Benfica)",
          text: "Precisava limpar um sótão em Benfica. Vieram no dia seguinte e fizeram tudo impecável. Muito satisfeita!",
          rating: 5,
        },
        {
          name: "José A. (Olivais)",
          text: "Serviço excelente! Recolheram monos de uma garagem nos Olivais. Rápidos, profissionais e deixaram tudo limpo!",
          rating: 5,
        },
      ]}
    />
  );
}
