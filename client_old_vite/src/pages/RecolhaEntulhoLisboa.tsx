import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaEntulhoLisboa() {
  return (
    <ServiceCityPage
      service="Recolha de Entulho"
      city="Lisboa"
      description="Serviço profissional de recolha e remoção de entulho de obras, construção e reformas em Lisboa. Transporte responsável com separação seletiva, reciclagem certificada e descarte legal. Resposta rápida, preços competitivos e 100% de satisfação garantida."
      whatIncludes={[
        "Avaliação gratuita do volume de entulho no local",
        "Mão de obra especializada para carregamento",
        "Transporte até centro de reciclagem certificado",
        "Separação seletiva de materiais recicláveis",
        "Limpeza final do local após recolha",
        "Certificado de descarte legal (se solicitado)",
        "Seguro de responsabilidade civil",
        "Atendimento em toda a região de Lisboa (Centro, Benfica, Lumiar, Olivais, Alvalade, etc.)",
      ]}
      whatNotIncluded={[
        "Resíduos perigosos (amianto, produtos químicos, tintas)",
        "Resíduos hospitalares ou biológicos",
        "Lixo orgânico ou doméstico comum",
        "Pneus e baterias de veículos",
        "Materiais radioativos",
        "Demolição de estruturas (serviço separado)",
      ]}
      howItWorks={[
        "Contacte-nos via WhatsApp ou telefone com fotos do entulho",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a recolha para o dia e hora que preferir",
        "Nossa equipa chega, carrega e transporta tudo",
        "Descarte certificado em centro de reciclagem legal",
        "Pagamento apenas após conclusão do serviço",
      ]}
      pricing="O preço varia conforme o volume (m³), tipo de material e localização exata em Lisboa. Em média, recolhas pequenas (1-2m³) custam entre €80-150, médias (3-5m³) entre €150-300, e grandes (6m³+) a partir de €300. Orçamento sempre gratuito e sem compromisso."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia (conforme disponibilidade) ou data de sua preferência. Serviço completo dura entre 30 minutos a 3 horas, dependendo do volume."
      legal="Todo o entulho recolhido é transportado para centros de triagem e reciclagem certificados pela APA (Agência Portuguesa do Ambiente). Cumprimos rigorosamente o Decreto-Lei n.º 178/2006 sobre gestão de resíduos de construção e demolição (RCD). Fornecemos guias de transporte e certificados de descarte quando solicitado. Não aceitamos resíduos perigosos ou ilegais."
      faqs={[
        {
          question: "Quanto custa a recolha de entulho em Lisboa?",
          answer:
            "O preço depende do volume (m³), tipo de material e localização. Recolhas pequenas (1-2m³) custam entre €80-150. Para orçamento exato, envie fotos via WhatsApp.",
        },
        {
          question: "Vocês recolhem no mesmo dia?",
          answer:
            "Sim! Conforme disponibilidade da equipa, podemos fazer recolhas no mesmo dia. Entre em contacto pela manhã para maior probabilidade.",
        },
        {
          question: "Preciso estar presente durante a recolha?",
          answer:
            "Não é obrigatório, mas recomendamos que alguém esteja presente para indicar o que deve ser recolhido e autorizar o serviço.",
        },
        {
          question: "Vocês sobem escadas ou usam elevador?",
          answer:
            "Sim, nossa equipa sobe escadas e usa elevadores quando necessário. Informe no orçamento se há dificuldades de acesso.",
        },
        {
          question: "O que acontece com o entulho recolhido?",
          answer:
            "Todo o material é levado para centros de triagem certificados, onde é separado para reciclagem (betão, metal, madeira) ou descarte legal.",
        },
      ]}
      testimonials={[
        {
          name: "Carlos F. (Lisboa)",
          text: "Excelente trabalho de toda a equipa, muito profissionais e extrema simpatia. Fizeram o trabalho e deixaram tudo limpo. Recomendo vivamente!",
          rating: 5,
        },
        {
          name: "Ines A. (Benfica)",
          text: "Excelente serviço, rápido e com uma ótima relação qualidade-preço. Trabalho impecável, tudo removido em duas horas.",
          rating: 5,
        },
        {
          name: "Christian M. (Olivais)",
          text: "Fizeram proposta em menos de meia hora e vieram passado 2h no mesmo dia. Super profissional e célere. 5 estrelas!",
          rating: 5,
        },
      ]}
    />
  );
}
