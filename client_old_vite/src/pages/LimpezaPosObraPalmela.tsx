import ServiceCityPage from "./ServiceCityPage";

export default function LimpezaPosObraPalmela() {
  return (
    <ServiceCityPage
      service="Limpeza Pós-Obra"
      city="Palmela"
      description="Serviço profissional de limpeza pós-obra em Palmela. Após obras, remodelações ou construção, a CLYON deixa o espaço completamente limpo e pronto a usar no mesmo dia. Remoção de pó, resíduos, tinta e sujidade de obra."
      whatIncludes={[
        "Remoção de pó e resíduos de construção",
        "Limpeza de pavimentos, paredes e tectos",
        "Remoção de manchas de tinta, cimento e argamassa",
        "Limpeza de janelas e vidros",
        "Aspiração e lavagem de todas as superfícies",
        "Remoção de plásticos de protecção",
        "Limpeza de casas de banho e cozinha",
        "Espaço entregue pronto a usar"
      ]}
      whatNotIncluded={[
        "Remoção de entulho pesado (serviço separado)",
        "Resíduos perigosos (amianto, produtos químicos)",
        "Limpeza de fachadas exteriores (serviço separado)"
      ]}
      howItWorks={[
        "Contacte-nos com fotos ou vídeo da obra",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos para o dia que preferir",
        "A nossa equipa chega com todo o equipamento",
        "Limpeza profissional de todas as divisões",
        "Entrega do espaço pronto a usar"
      ]}
      pricing="O preço da limpeza pós-obra em Palmela depende da área (m²) e grau de sujidade. Em média, um T1 custa entre €150-300, um T2 entre €250-450, e um T3 a partir de €400. Orçamento sempre gratuito."
      timeline="Resposta ao orçamento em até 11 minutos. Limpeza pode ser agendada para o mesmo dia ou data de preferência. Um T2 típico demora entre 4-8 horas."
      legal="Utilizamos produtos de limpeza profissionais certificados e equipamentos de alta pressão. Cumprimos todas as normas de segurança e higiene. A nossa equipa é especializada em limpezas pós-obra."
      faqs={[
        {
          question: "Quanto custa a limpeza pós-obra em Palmela?",
          answer: "O preço depende da área e grau de sujidade. Um T1 custa entre €150-300, um T2 entre €250-450. Envie fotos para orçamento exacto e gratuito.",
        },
        {
          question: "Fazem limpeza pós-obra no mesmo dia em Palmela?",
          answer: "Sim! Conforme disponibilidade, podemos fazer limpezas no mesmo dia em Palmela. Entre em contacto pela manhã.",
        },
        {
          question: "A limpeza inclui janelas e vidros?",
          answer: "Sim, a limpeza de janelas e vidros está incluída no serviço padrão de limpeza pós-obra.",
        },
        {
          question: "Trazem os produtos e equipamentos?",
          answer: "Sim, a nossa equipa chega com todos os produtos de limpeza profissionais e equipamentos necessários.",
        },
        {
          question: "Fazem limpeza pós-obra em apartamentos e moradias?",
          answer: "Sim, fazemos limpeza pós-obra em apartamentos, moradias, escritórios e espaços comerciais em Palmela.",
        }
      ]}
      testimonials={[
        {
          name: "Pedro A.",
          text: "Fizeram a limpeza pós-obra do meu apartamento em Palmela de forma impecável. Ficou como novo!",
          rating: 5,
        },
        {
          name: "Sofia R.",
          text: "Excelente trabalho! Remodelei a cozinha e a CLYON limpou tudo em Palmela no mesmo dia. Muito profissionais.",
          rating: 5,
        },
        {
          name: "João C.",
          text: "Serviço de qualidade a bom preço em Palmela. Recomendo a toda a gente que precise de limpeza pós-obra.",
          rating: 5,
        }
      ]}
    />
  );
}
