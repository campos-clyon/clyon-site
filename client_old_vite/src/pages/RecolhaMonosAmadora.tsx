import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaMonosAmadora() {
  return (
    <ServiceCityPage
      service="Recolha de Monos"
      city="Amadora"
      description="Serviço profissional de recolha de monos ao domicílio em Amadora. Removemos móveis velhos, eletrodomésticos, objetos volumosos e tralha doméstica de forma rápida e económica. Orçamento gratuito em 11 minutos."
      whatIncludes={[
        "Recolha de móveis velhos e danificados",
        "Remoção de eletrodomésticos",
        "Recolha de objetos volumosos e tralha",
        "Transporte para centros de reciclagem",
        "Separação de itens para doação",
        "Limpeza do local após recolha",
        "Serviço ao domicílio em toda a área"
      ]}
      whatNotIncluded={[
        "Resíduos perigosos (produtos químicos, tintas)",
        "Resíduos hospitalares ou biológicos",
        "Entulho de obras (serviço separado)"
      ]}
      howItWorks={[
        "Contacte-nos com fotos dos monos a recolher",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a recolha para o dia que preferir",
        "A nossa equipa vai ao seu domicílio",
        "Recolhemos e transportamos tudo",
        "Pagamento apenas após conclusão"
      ]}
      pricing="O preço da recolha de monos em Amadora depende da quantidade e tipo de itens. Uma recolha pequena (1-3 itens) custa entre €40-80, média (4-8 itens) entre €80-150, e grande (9+ itens) a partir de €150. Orçamento sempre gratuito."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia ou data de preferência. O serviço dura entre 30 minutos a 2 horas, dependendo da quantidade."
      legal="Todos os monos recolhidos são transportados para centros de triagem e reciclagem certificados. Os itens em bom estado são doados a instituições de solidariedade social. Cumprimos a legislação portuguesa sobre gestão de resíduos."
      faqs={[
        {
          question: "Quanto custa a recolha de monos em Amadora?",
          answer: "O preço depende da quantidade e tipo de itens. Uma recolha pequena custa entre €40-80. Envie fotos via WhatsApp para orçamento exacto e gratuito.",
        },
        {
          question: "Fazem recolha de monos no mesmo dia em Amadora?",
          answer: "Sim! Conforme disponibilidade, podemos fazer recolhas no mesmo dia em Amadora. Entre em contacto pela manhã.",
        },
        {
          question: "Recolhem eletrodomésticos velhos em Amadora?",
          answer: "Sim, recolhemos eletrodomésticos velhos, incluindo frigoríficos, máquinas de lavar, fogões e micro-ondas em Amadora.",
        },
        {
          question: "Fazem doação dos itens em bom estado?",
          answer: "Sim! Separamos os itens em bom estado e fazemos doação a instituições de solidariedade social, sem custo adicional.",
        },
        {
          question: "Precisam de acesso especial para recolher monos?",
          answer: "Não é necessário acesso especial. Trabalhamos em apartamentos, moradias e espaços comerciais em Amadora.",
        }
      ]}
      testimonials={[
        {
          name: "Helena V.",
          text: "Recolheram os monos do meu apartamento em Amadora de forma rápida e profissional. Muito satisfeita!",
          rating: 5,
        },
        {
          name: "Bruno A.",
          text: "Excelente serviço em Amadora. Levaram tudo em poucas horas e ainda fizeram doação dos itens em bom estado.",
          rating: 5,
        },
        {
          name: "Filipa C.",
          text: "Recomendo a CLYON para recolha de monos em Amadora. Preço justo e trabalho impecável.",
          rating: 5,
        }
      ]}
    />
  );
}
