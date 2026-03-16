export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  readingTime: string;
  publishDate: string;
  heroLabel: string;
  intro: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "recolha-de-moveis-como-funciona",
    title: "Recolha de móveis: como funciona, quanto custa e quando pedir apoio",
    description:
      "Guia sobre recolha de móveis usados, móveis velhos e despejo de sofás, camas, armários e recheios em Lisboa, Margem Sul e Setúbal.",
    category: "Móveis",
    keywords: ["recolha de móveis", "despejo de móveis", "retirar móveis velhos", "recolha de sofás"],
    readingTime: "6 min",
    publishDate: "2026-03-16",
    heroLabel: "Guia prático",
    intro:
      "A recolha de móveis é um dos pedidos mais comuns na operação da CLYON. Seja por mudança, renovação, herança, venda de casa ou despejo de recheios, o objectivo costuma ser sempre o mesmo: retirar volume depressa, com segurança e sem complicar o acesso ao imóvel.",
    sections: [
      {
        title: "Quando faz sentido pedir recolha de móveis",
        paragraphs: [
          "Este serviço é útil quando existem peças grandes, pesadas ou em quantidade suficiente para tornar inviável a remoção por meios próprios. Sofás, camas, roupeiros, cómodas, electrodomésticos e recheios mistos são casos típicos.",
          "Também é frequente em apartamentos sem elevador, mudanças parciais, imóveis para arrendamento e casas que precisam de ser libertadas antes de obras ou entrega de chave.",
        ],
        bullets: ["Sofás, colchões, camas e estrados", "Armários, mesas, cómodas e aparadores", "Electrodomésticos e recheios antigos"],
      },
      {
        title: "O que influencia o preço",
        paragraphs: [
          "O valor final depende do volume, distância, acessibilidade, número de andares, existência de elevador e necessidade de equipa extra. Em alguns casos, o tempo de desmontagem também entra no cálculo.",
          "Por isso, o orçamento é mais rápido e mais preciso quando o cliente envia morada, lista básica do que vai sair e condições de acesso ao local.",
        ],
      },
    ],
    faq: [
      {
        question: "A CLYON recolhe apenas uma peça, como um sofá?",
        answer: "Sim. A recolha pode ser para uma única peça ou para vários móveis, dependendo da disponibilidade e das condições do pedido.",
      },
      {
        question: "É possível recolher móveis no mesmo dia?",
        answer: "Em muitos casos sim. A disponibilidade depende da zona, da carga operacional e da clareza do pedido enviado.",
      },
    ],
  },
  {
    slug: "doacao-de-moveis-ou-despejo",
    title: "Doação de móveis ou despejo: como decidir o melhor destino para cada peça",
    description:
      "Artigo sobre doação de móveis usados, reaproveitamento, reciclagem e despejo responsável de peças sem utilidade.",
    category: "Doações",
    keywords: ["doação de móveis", "onde doar móveis usados", "despejo de móveis", "reutilização de móveis"],
    readingTime: "7 min",
    publishDate: "2026-03-16",
    heroLabel: "Decisão útil",
    intro:
      "Nem todos os móveis têm de seguir para despejo. Em muitos casos, ainda podem ser doados, reaproveitados ou encaminhados de forma mais responsável. A diferença está no estado da peça, na urgência do serviço e na logística necessária para retirar tudo do local.",
    sections: [
      {
        title: "Quando vale a pena doar",
        paragraphs: [
          "Peças em bom estado, sem danos graves, com portas, gavetas e estofos utilizáveis, podem ainda ter valor social ou funcional. Nestes casos, a doação é uma alternativa forte.",
          "É especialmente útil em mudanças, trocas de mobília e esvaziamentos onde o objectivo é reduzir desperdício sem atrasar a libertação do espaço.",
        ],
      },
      {
        title: "Quando o despejo é a opção mais realista",
        paragraphs: [
          "Se o mobiliário está partido, degradado, com humidade, infestação, ferragens danificadas ou sem viabilidade de reutilização, o mais prático costuma ser o despejo.",
          "Em operações urgentes, o cliente normalmente prefere uma solução directa: retirar tudo numa só visita, sem depender de terceiros para recolha selectiva.",
        ],
      },
    ],
    faq: [
      {
        question: "A CLYON faz recolha para doação?",
        answer: "Pode apoiar na retirada e organização do processo, dependendo do tipo de mobiliário, destino e condições do pedido.",
      },
    ],
  },
  {
    slug: "recolha-de-entulho-legal-e-organizada",
    title: "Recolha de entulho: como fazer de forma legal, rápida e organizada",
    description:
      "Guia sobre recolha de entulho, resíduos de obra, sacos, restos de remodelação e boas práticas para remoção segura.",
    category: "Entulho",
    keywords: ["recolha de entulho", "remoção de entulho", "entulho de obra", "sacos de entulho"],
    readingTime: "6 min",
    publishDate: "2026-03-16",
    heroLabel: "Entulho",
    intro:
      "Depois de uma obra, remodelação ou limpeza pesada, o entulho torna-se rapidamente um problema de espaço, segurança e logística. A recolha profissional evita acumulação, atrasos na obra e risco desnecessário para quem tenta resolver tudo sem meios adequados.",
    sections: [
      {
        title: "Que tipos de entulho aparecem com mais frequência",
        paragraphs: [
          "Os pedidos mais comuns incluem restos de azulejo, cerâmica, madeira, gesso, loiças partidas, sacos de obra, pedra, metal e materiais mistos de demolição ligeira.",
          "Quando o material está no chão, o esforço operacional tende a ser maior do que quando já está ensacado e pronto para retirada.",
        ],
      },
      {
        title: "Ensacado ou no chão: porque faz diferença",
        paragraphs: [
          "Entulho no chão exige mais tempo de carga, mais organização e, muitas vezes, mais mão de obra. Quando o material já está ensacado, a operação fica mais linear e previsível.",
        ],
      },
    ],
    faq: [
      {
        question: "A CLYON recolhe entulho ensacado e também no chão?",
        answer: "Sim. Os dois cenários são possíveis, mas devem ser indicados no pedido porque alteram o tempo e o esforço da operação.",
      },
    ],
  },
  {
    slug: "recolha-de-monos-o-que-inclui",
    title: "Recolha de monos: o que inclui, quando pedir e como acelerar o serviço",
    description:
      "Artigo sobre recolha de monos, volumosos, objectos sem uso, despejo rápido e libertação de espaço.",
    category: "Monos",
    keywords: ["recolha de monos", "volumosos", "retirar monos", "despejo de monos"],
    readingTime: "5 min",
    publishDate: "2026-03-16",
    heroLabel: "Volumosos",
    intro:
      "Monos é um termo muito usado para definir objectos grandes, velhos ou sem utilidade que ocupam espaço e são difíceis de remover. A diferença para um pedido simples está no volume, na mistura de materiais e na falta de organização prévia do que vai sair.",
    sections: [
      {
        title: "Exemplos de monos mais comuns",
        paragraphs: [
          "Sofás velhos, colchões, madeira solta, electrodomésticos fora de uso, cadeiras partidas, restos de arrumos, material acumulado em arrecadações e objectos sem valor de reaproveitamento entram frequentemente nesta categoria.",
        ],
      },
      {
        title: "Como acelerar a recolha",
        paragraphs: [
          "O mais eficaz é concentrar os itens, confirmar acesso e enviar uma lista ou fotos antes do agendamento. Isso reduz imprevistos e melhora o orçamento.",
        ],
      },
    ],
    faq: [
      {
        question: "Monos e móveis velhos são a mesma coisa?",
        answer: "Nem sempre. Alguns pedidos são só mobiliário. Outros incluem uma mistura de peças, tralha acumulada e volumosos diversos, o que entra mais na lógica de monos.",
      },
    ],
  },
  {
    slug: "limpeza-pos-obra-e-retirada-de-residuos",
    title: "Limpeza pós-obra e retirada de resíduos: como deixar o espaço pronto",
    description:
      "Conteúdo sobre limpeza pós-obra, remoção de resíduos, restos de materiais e preparação do espaço para uso.",
    category: "Pós-obra",
    keywords: ["limpeza pós-obra", "retirada de resíduos de obra", "entulho pós-obra", "limpeza final obra"],
    readingTime: "6 min",
    publishDate: "2026-03-16",
    heroLabel: "Acabamento",
    intro:
      "A limpeza pós-obra é a fase que transforma um espaço intervencionado num espaço pronto a usar. O problema é que essa fase costuma juntar pó, restos de material, embalagens, sobras de montagem e pontos de difícil acesso que atrasam a entrega.",
    sections: [
      {
        title: "O que costuma ficar por fazer depois da obra",
        paragraphs: [
          "Mesmo quando a obra terminou, ainda é comum existirem restos de corte, embalagens, pó fino, resíduos mistos e áreas que precisam de limpeza final para o imóvel ficar apresentável.",
        ],
      },
      {
        title: "Porque limpeza e remoção devem andar juntas",
        paragraphs: [
          "Quando a mesma operação resolve resíduos, entulho final e limpeza de acabamento, a entrega do espaço torna-se mais simples. Isso é útil em apartamentos, lojas, escritórios e imóveis para arrendamento.",
        ],
      },
    ],
    faq: [
      {
        question: "A CLYON faz só limpeza pós-obra ou também retira resíduos?",
        answer: "Pode fazer ambos, dependendo do pedido. Isso é precisamente o que torna o serviço mais prático para o cliente.",
      },
    ],
  },
  {
    slug: "esvaziamento-de-casas-com-recheio",
    title: "Esvaziamento de casas com recheio: heranças, mudanças e imóveis para venda",
    description:
      "Guia sobre esvaziamento de casas, recheios completos, heranças, imóveis para venda e retirada de móveis, monos e objectos acumulados.",
    category: "Esvaziamentos",
    keywords: ["esvaziamento de casas", "retirar recheio de casa", "casa com móveis antigos", "desocupar casa herdada"],
    readingTime: "7 min",
    publishDate: "2026-03-16",
    heroLabel: "Recheios",
    intro:
      "O esvaziamento de casas é um serviço que junta várias necessidades ao mesmo tempo: avaliar o que fica, o que sai, o que pode ser doado e o que precisa mesmo de despejo. Isso acontece muito em heranças, mudanças longas, imóveis para venda e casas fechadas há anos.",
    sections: [
      {
        title: "Situações mais frequentes",
        paragraphs: [
          "Casas herdadas, apartamentos devolvidos ao senhorio, imóveis que precisam de staging, divisões usadas como arrecadação e mudanças em que parte do recheio deixa de fazer sentido.",
        ],
      },
      {
        title: "Como organizar o esvaziamento por fases",
        paragraphs: [
          "Separar doação, retenção, lixo e despejo antes do dia da recolha reduz erros e acelera a operação. Quando isso não é possível, a triagem no local deve ser pensada com critério para não atrasar a saída.",
        ],
      },
    ],
    faq: [
      {
        question: "A CLYON faz esvaziamentos completos?",
        answer: "Sim, desde pedidos parciais até recheios completos, conforme o volume, o tipo de objectos e as condições de acesso.",
      },
    ],
  },
];

export function getAllBlogPosts() {
  return BLOG_POSTS;
}

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
