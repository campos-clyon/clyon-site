import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaEntulhoSetubal() {
  return (
    <ServiceCityPage
      service="Recolha de Entulho"
      city="Setúbal"
      description="Serviço profissional de recolha e remoção de entulho de obras, construção e reformas em Setúbal. Transporte responsável com separação seletiva, reciclagem certificada e descarte legal. Conhecemos as regras locais de Setúbal (incluindo sistema de big bags da SMS) e garantimos conformidade total. Resposta rápida, preços competitivos e 100% de satisfação garantida."
      whatIncludes={[
        "Avaliação gratuita do volume de entulho no local",
        "Mão de obra especializada para carregamento",
        "Transporte até centro de reciclagem certificado",
        "Separação seletiva de materiais recicláveis (betão, cerâmica, madeira, metal)",
        "Limpeza final do local após recolha",
        "Certificado de descarte legal (se solicitado)",
        "Seguro de responsabilidade civil",
        "Atendimento em toda a região de Setúbal (centro, Palmela, Sesimbra, Azeitão, etc.)",
        "Conformidade com regulamento SMS-Setúbal",
      ]}
      whatNotIncluded={[
        "Resíduos perigosos (amianto, produtos químicos, tintas, solventes)",
        "Resíduos hospitalares ou biológicos",
        "Lixo orgânico ou doméstico comum",
        "Pneus e baterias de veículos",
        "Materiais radioativos",
        "Demolição de estruturas (serviço separado)",
        "Big bags municipais (fornecidos pela SMS-Setúbal)",
      ]}
      howItWorks={[
        "Contacte-nos via WhatsApp (+351 931 632 622) ou telefone com fotos do entulho",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a recolha para o dia e hora que preferir",
        "Nossa equipa chega, carrega e transporta tudo com segurança",
        "Descarte certificado em centro de reciclagem legal (cumprindo normas SMS)",
        "Pagamento apenas após conclusão do serviço",
      ]}
      pricing="O preço varia conforme o volume (m³), tipo de material e localização exata em Setúbal. Em média, recolhas pequenas (1-2m³) custam entre €70-130, médias (3-5m³) entre €130-280, e grandes (6m³+) a partir de €280. Setúbal tem custos ligeiramente inferiores a Lisboa devido à proximidade dos centros de reciclagem. Orçamento sempre gratuito e sem compromisso."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia (conforme disponibilidade) ou data de sua preferência. Serviço completo dura entre 30 minutos a 3 horas, dependendo do volume. Atendemos Setúbal, Palmela, Sesimbra e arredores."
      legal="Todo o entulho recolhido é transportado para centros de triagem e reciclagem certificados pela APA (Agência Portuguesa do Ambiente). Cumprimos rigorosamente o Decreto-Lei n.º 178/2006 sobre gestão de resíduos de construção e demolição (RCD) e o regulamento municipal da SMS-Setúbal. Fornecemos guias de transporte e certificados de descarte quando solicitado. Conhecemos o sistema de big bags municipal e orientamos sobre alternativas. Não aceitamos resíduos perigosos ou ilegais."
      faqs={[
        {
          question: "Quanto custa a recolha de entulho em Setúbal?",
          answer:
            "O preço depende do volume (m³), tipo de material e localização. Recolhas pequenas (1-2m³) custam entre €70-130. Setúbal tem preços ligeiramente mais baixos que Lisboa. Para orçamento exato, envie fotos via WhatsApp.",
        },
        {
          question: "Qual a diferença entre vocês e os big bags da SMS-Setúbal?",
          answer:
            "Os big bags municipais são para pequenos volumes (até 1m³) e têm custo fixo de €25-30, mas você precisa encomendar, aguardar entrega, encher e aguardar recolha (pode demorar dias/semanas). Nós recolhemos qualquer volume, no mesmo dia se necessário, com equipa que carrega tudo. Ideal para obras maiores ou quando precisa de rapidez.",
        },
        {
          question: "Vocês atendem Palmela e Sesimbra?",
          answer:
            "Sim! Atendemos toda a região de Setúbal, incluindo Palmela, Sesimbra, Azeitão e arredores. Informe a localização exata no orçamento.",
        },
        {
          question: "Preciso separar o entulho antes?",
          answer:
            "Não é obrigatório, mas ajuda a reduzir o custo. Nossa equipa faz separação básica no local e triagem completa no centro de reciclagem.",
        },
        {
          question: "Vocês recolhem no mesmo dia em Setúbal?",
          answer:
            "Sim! Conforme disponibilidade da equipa, podemos fazer recolhas no mesmo dia. Entre em contacto pela manhã para maior probabilidade.",
        },
        {
          question: "O que acontece com o entulho recolhido?",
          answer:
            "Todo o material é levado para centros de triagem certificados, onde é separado para reciclagem (betão, metal, madeira, cerâmica) ou descarte legal, cumprindo regulamentos da SMS-Setúbal e APA.",
        },
      ]}
      testimonials={[
        {
          name: "Pedro S. (Setúbal)",
          text: "Excelente serviço! Recolheram entulho de uma remodelação em Setúbal. Rápidos, profissionais e preço justo. Recomendo!",
          rating: 5,
        },
        {
          name: "Luísa M. (Palmela)",
          text: "Precisava recolher entulho urgentemente em Palmela. Vieram no mesmo dia e fizeram tudo impecável. Muito satisfeita!",
          rating: 5,
        },
        {
          name: "António R. (Sesimbra)",
          text: "Serviço profissional em Sesimbra. Recolheram entulho de obra e deixaram tudo limpo. Preço melhor que os big bags municipais!",
          rating: 5,
        },
      ]}
    />
  );
}
