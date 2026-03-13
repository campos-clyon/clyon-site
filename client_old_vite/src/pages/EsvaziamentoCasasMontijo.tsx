import ServiceCityPage from "./ServiceCityPage";

export default function EsvaziamentoCasasMontijo() {
  return (
    <ServiceCityPage
      service="Esvaziamento de Casas"
      city="Montijo"
      description="Serviço profissional de esvaziamento de casas, apartamentos e vivendas em Montijo. Removemos todos os móveis, eletrodomésticos, monos e entulho, deixando o espaço completamente limpo e pronto para venda, arrendamento ou renovação."
      whatIncludes={[
        "Remoção completa de móveis e eletrodomésticos",
        "Recolha de monos, tralha e objetos antigos",
        "Remoção de entulho e resíduos de obras",
        "Limpeza final do espaço após esvaziamento",
        "Separação de itens para doação ou reciclagem",
        "Transporte para centros de triagem certificados",
        "Certificado de descarte legal (se solicitado)"
      ]}
      whatNotIncluded={[
        "Resíduos perigosos (amianto, produtos químicos)",
        "Resíduos hospitalares ou biológicos",
        "Demolição de estruturas (serviço separado)"
      ]}
      howItWorks={[
        "Contacte-nos com fotos ou vídeo do espaço",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a data e hora que preferir",
        "A nossa equipa chega e esvazia tudo",
        "Limpeza final incluída no serviço",
        "Pagamento apenas após conclusão"
      ]}
      pricing="O preço do esvaziamento de casas em Montijo depende da dimensão do espaço (T0, T1, T2, T3+) e quantidade de itens. Em média, um T1 custa entre €200-400, um T2 entre €350-600, e um T3 a partir de €500. Orçamento sempre gratuito."
      timeline="Resposta ao orçamento em até 11 minutos. Esvaziamento pode ser agendado para o mesmo dia ou data de preferência. Um T2 típico demora entre 3-6 horas."
      legal="Todo o material recolhido é transportado para centros de triagem e reciclagem certificados pela APA. Cumprimos rigorosamente a legislação portuguesa sobre gestão de resíduos. Fornecemos certificados de descarte quando solicitado."
      faqs={[
        {
          question: "Quanto custa o esvaziamento de uma casa em Montijo?",
          answer: "O preço depende da dimensão e quantidade de itens. Um T1 custa entre €200-400, um T2 entre €350-600. Envie fotos via WhatsApp para orçamento exacto e gratuito.",
        },
        {
          question: "Fazem esvaziamento no mesmo dia em Montijo?",
          answer: "Sim! Conforme disponibilidade, podemos fazer esvaziamentos no mesmo dia em Montijo. Entre em contacto pela manhã para maior probabilidade.",
        },
        {
          question: "Incluem limpeza após o esvaziamento?",
          answer: "Sim, a limpeza final do espaço está incluída no serviço de esvaziamento. Entregamos o espaço varrido e limpo.",
        },
        {
          question: "Podem fazer doação dos itens em bom estado?",
          answer: "Sim! Separamos os itens em bom estado e fazemos doação a instituições de solidariedade social, sem custo adicional.",
        },
        {
          question: "Precisam de acesso especial para esvaziamento em apartamentos?",
          answer: "Não é necessário acesso especial. Trabalhamos em apartamentos com ou sem elevador, em qualquer andar.",
        }
      ]}
      testimonials={[
        {
          name: "Ana S.",
          text: "Excelente serviço! Esvaziaram o apartamento da minha mãe em Montijo em menos de 4 horas. Profissionais, rápidos e deixaram tudo limpo.",
          rating: 5,
        },
        {
          name: "Carlos M.",
          text: "Precisava de esvaziar uma vivenda em Montijo para venda. A CLYON fez tudo num dia, incluindo a limpeza. Recomendo!",
          rating: 5,
        },
        {
          name: "Maria F.",
          text: "Serviço impecável. Orçamento rápido, preço justo e trabalho bem feito em Montijo.",
          rating: 5,
        }
      ]}
    />
  );
}
