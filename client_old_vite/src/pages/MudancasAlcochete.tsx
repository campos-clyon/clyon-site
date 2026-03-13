import ServiceCityPage from "./ServiceCityPage";

export default function MudancasAlcochete() {
  return (
    <ServiceCityPage
      service="Mudanças"
      city="Alcochete"
      description="Serviço profissional de mudanças residenciais e comerciais em Alcochete. A CLYON trata de tudo: embalagem, desmontagem, transporte e montagem no novo espaço. Mudanças rápidas, seguras e a preços competitivos."
      whatIncludes={[
        "Embalagem profissional de todos os itens",
        "Desmontagem e montagem de móveis",
        "Transporte seguro em veículo adequado",
        "Mão de obra especializada",
        "Protecção de móveis e objectos frágeis",
        "Seguro de transporte incluído",
        "Mudanças locais e regionais"
      ]}
      whatNotIncluded={[
        "Mudanças internacionais (serviço especializado)",
        "Transporte de animais ou plantas",
        "Armazenamento de longa duração"
      ]}
      howItWorks={[
        "Contacte-nos com detalhes da mudança (origem, destino, volume)",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a data e hora que preferir",
        "A nossa equipa chega e trata de tudo",
        "Transporte seguro para o novo espaço",
        "Montagem e organização incluídas"
      ]}
      pricing="O preço das mudanças em Alcochete depende do volume, distância e serviços incluídos. Uma mudança de T1 custa entre €200-400, T2 entre €350-600, T3 a partir de €500. Orçamento sempre gratuito."
      timeline="Resposta ao orçamento em até 11 minutos. Mudança pode ser agendada para o mesmo dia ou data de preferência. Uma mudança de T2 típica demora entre 4-8 horas."
      legal="Todos os transportes são realizados com veículos licenciados e segurados. Cumprimos todas as normas de segurança rodoviária. Fornecemos seguro de transporte para os seus bens."
      faqs={[
        {
          question: "Quanto custa uma mudança em Alcochete?",
          answer: "O preço depende do volume e distância. Uma mudança de T1 custa entre €200-400, T2 entre €350-600. Contacte-nos para orçamento gratuito.",
        },
        {
          question: "Fazem mudanças no mesmo dia em Alcochete?",
          answer: "Sim! Conforme disponibilidade, podemos fazer mudanças no mesmo dia em Alcochete. Entre em contacto pela manhã.",
        },
        {
          question: "Incluem embalagem e desmontagem de móveis?",
          answer: "Sim, a embalagem profissional e desmontagem/montagem de móveis estão incluídas no serviço completo de mudanças.",
        },
        {
          question: "Fazem mudanças de empresas e escritórios?",
          answer: "Sim, fazemos mudanças residenciais e comerciais em Alcochete. Temos experiência em mudanças de escritórios, lojas e armazéns.",
        },
        {
          question: "O serviço inclui seguro de transporte?",
          answer: "Sim, todos os nossos serviços de mudanças incluem seguro de transporte para os seus bens.",
        }
      ]}
      testimonials={[
        {
          name: "Luísa P.",
          text: "Mudança em Alcochete feita de forma rápida e profissional. A CLYON tratou de tudo, desde a embalagem até à montagem.",
          rating: 5,
        },
        {
          name: "Rui M.",
          text: "Excelente serviço de mudanças em Alcochete. Preço justo, equipa simpática e muito cuidadosa com os móveis.",
          rating: 5,
        },
        {
          name: "Catarina S.",
          text: "Recomendo a CLYON para mudanças em Alcochete. Profissionais, pontuais e muito eficientes.",
          rating: 5,
        }
      ]}
    />
  );
}
