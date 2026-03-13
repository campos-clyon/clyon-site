import ServiceCityPage from "./ServiceCityPage";

export default function RecolhaEntulhoSesimbra() {
  return (
    <ServiceCityPage
      service="Recolha de Entulho"
      city="Sesimbra"
      description="Serviço profissional de recolha e remoção de entulho em Sesimbra. Removemos entulho de obras, construção e reformas com transporte responsável, separação seletiva e descarte legal certificado. Resposta em 11 minutos."
      whatIncludes={[
        "Avaliação gratuita do volume de entulho",
        "Mão de obra especializada para carregamento",
        "Transporte até centro de reciclagem certificado",
        "Separação seletiva de materiais recicláveis",
        "Limpeza final do local após recolha",
        "Certificado de descarte legal (se solicitado)",
        "Seguro de responsabilidade civil"
      ]}
      whatNotIncluded={[
        "Resíduos perigosos (amianto, produtos químicos)",
        "Resíduos hospitalares ou biológicos",
        "Lixo orgânico ou doméstico comum",
        "Pneus e baterias de veículos",
        "Demolição de estruturas (serviço separado)"
      ]}
      howItWorks={[
        "Contacte-nos via WhatsApp ou telefone com fotos do entulho",
        "Receba orçamento gratuito em até 11 minutos",
        "Agendamos a recolha para o dia e hora que preferir",
        "A nossa equipa chega, carrega e transporta tudo",
        "Descarte certificado em centro de reciclagem legal",
        "Pagamento apenas após conclusão do serviço"
      ]}
      pricing="O preço da recolha de entulho em Sesimbra depende do volume (m³) e tipo de material. Recolhas pequenas (1-2m³) custam entre €80-150, médias (3-5m³) entre €150-300, e grandes (6m³+) a partir de €300. Orçamento sempre gratuito."
      timeline="Resposta ao orçamento em até 11 minutos. Recolha pode ser agendada para o mesmo dia ou data de preferência. O serviço dura entre 30 minutos a 3 horas, dependendo do volume."
      legal="Todo o entulho recolhido é transportado para centros de triagem e reciclagem certificados pela APA. Cumprimos rigorosamente o Decreto-Lei n.º 178/2006 sobre gestão de resíduos de construção e demolição. Fornecemos guias de transporte e certificados de descarte."
      faqs={[
        {
          question: "Quanto custa a recolha de entulho em Sesimbra?",
          answer: "O preço depende do volume e tipo de material. Recolhas pequenas (1-2m³) custam entre €80-150. Envie fotos via WhatsApp para orçamento exacto e gratuito.",
        },
        {
          question: "Fazem recolha de entulho no mesmo dia em Sesimbra?",
          answer: "Sim! Conforme disponibilidade, podemos fazer recolhas no mesmo dia em Sesimbra. Entre em contacto pela manhã.",
        },
        {
          question: "O descarte é legal e certificado em Sesimbra?",
          answer: "Sim, todo o entulho é depositado em centros de triagem licenciados, com separação seletiva e reciclagem. Emitimos certificado de descarte.",
        },
        {
          question: "Recolhem entulho de obras de remodelação?",
          answer: "Sim, recolhemos entulho de obras de remodelação, construção, demolição e reformas em Sesimbra.",
        },
        {
          question: "Precisam de acesso especial para recolher entulho?",
          answer: "Não é necessário acesso especial. Trabalhamos em apartamentos, moradias e espaços comerciais em Sesimbra.",
        }
      ]}
      testimonials={[
        {
          name: "Miguel T.",
          text: "Recolheram o entulho da minha obra em Sesimbra de forma rápida e profissional. Muito satisfeito!",
          rating: 5,
        },
        {
          name: "Paula N.",
          text: "Excelente serviço em Sesimbra. Orçamento rápido, preço justo e trabalho impecável.",
          rating: 5,
        },
        {
          name: "António L.",
          text: "Recomendo a CLYON para recolha de entulho em Sesimbra. Profissionais e pontuais.",
          rating: 5,
        }
      ]}
    />
  );
}
