/**
 * Conteúdo único e personalizado por cidade para páginas SEO locais.
 * Cada cidade tem intros locais, pontos de referência e dicas específicas.
 */

export interface CityContent {
  slug: string;
  name: string;
  region: "lisboa" | "margem-sul" | "setubal";
  localIntro: string;
  landmarks: string[];
  accessNotes: string;
  neighborhoodTips: string;
  typicalRequests: string[];
  nearbyAreas: string[];
}

export const CITY_CONTENT: Record<string, CityContent> = {
  // ========================
  // LISBOA (Grande Lisboa)
  // ========================
  lisboa: {
    slug: "lisboa",
    name: "Lisboa",
    region: "lisboa",
    localIntro:
      "Em Lisboa, a CLYON atua em todas as freguesias, desde o centro histórico até às zonas mais recentes como o Parque das Nações. Conhecemos bem os desafios dos prédios antigos sem elevador em Alfama e na Mouraria, assim como os acessos mais fáceis nas zonas residenciais modernas.",
    landmarks: [
      "Baixa-Chiado",
      "Alfama",
      "Parque das Nações",
      "Benfica",
      "Campo de Ourique",
      "Areeiro",
    ],
    accessNotes:
      "Nos bairros históricos (Alfama, Mouraria, Graça), os acessos são frequentemente por escadas estreitas. Avaliamos sempre o local para garantir o melhor preço e execução segura.",
    neighborhoodTips:
      "As zonas com estacionamento mais difícil (Baixa, Chiado) podem requerer coordenação prévia para descarga. Em Telheiras, Lumiar e Parque das Nações, o acesso é geralmente mais simples.",
    typicalRequests: [
      "Esvaziamento de apartamentos em prédios antigos",
      "Recolha de móveis após renovações",
      "Limpeza pós-obra em escritórios",
      "Mudanças de última hora",
    ],
    nearbyAreas: ["Amadora", "Odivelas", "Loures", "Oeiras"],
  },

  amadora: {
    slug: "amadora",
    name: "Amadora",
    region: "lisboa",
    localIntro:
      "Na Amadora, prestamos serviços em todas as freguesias, com foco especial na Reboleira, Alfragide e Damaia. A proximidade a Lisboa permite-nos responder rapidamente a pedidos urgentes.",
    landmarks: [
      "Alfragide",
      "Reboleira",
      "Damaia",
      "Brandoa",
      "Venda Nova",
      "Mina de Água",
    ],
    accessNotes:
      "A maioria dos prédios na Amadora tem elevador ou acessos razoáveis. Em algumas zonas mais antigas da Reboleira, pode haver escadas.",
    neighborhoodTips:
      "Alfragide tem bons acessos e estacionamento. A Damaia e Reboleira têm ruas mais estreitas que requerem planeamento.",
    typicalRequests: [
      "Recolha de móveis em mudanças",
      "Entulho de pequenas obras",
      "Esvaziamento de garagens",
      "Limpeza de caves",
    ],
    nearbyAreas: ["Lisboa", "Sintra", "Odivelas", "Oeiras"],
  },

  sintra: {
    slug: "sintra",
    name: "Sintra",
    region: "lisboa",
    localIntro:
      "Em Sintra, cobrimos desde a zona histórica até às urbanizações de Mem Martins, Rio de Mouro e Cacém. A diversidade geográfica do concelho exige experiência para avaliar corretamente cada pedido.",
    landmarks: [
      "Centro histórico de Sintra",
      "Mem Martins",
      "Rio de Mouro",
      "Cacém",
      "Queluz",
      "Agualva",
    ],
    accessNotes:
      "Na serra de Sintra e centro histórico, os acessos podem ser mais desafiantes devido a estradas estreitas e inclinadas. As zonas urbanas têm geralmente bons acessos.",
    neighborhoodTips:
      "Mem Martins e Cacém têm urbanizações com estacionamento fácil. O centro histórico de Sintra requer avaliação prévia devido às ruas de paralelepípedo.",
    typicalRequests: [
      "Esvaziamento de quintas e moradias",
      "Recolha de móveis de jardim",
      "Entulho de obras em moradias",
      "Mudanças residenciais",
    ],
    nearbyAreas: ["Amadora", "Cascais", "Oeiras", "Mafra"],
  },

  cascais: {
    slug: "cascais",
    name: "Cascais",
    region: "lisboa",
    localIntro:
      "Em Cascais, atuamos desde a linha de costa até ao interior do concelho, incluindo Estoril, Parede e Carcavelos. A zona é conhecida por moradias e apartamentos de alta qualidade que requerem cuidado na execução.",
    landmarks: [
      "Centro de Cascais",
      "Estoril",
      "Parede",
      "Carcavelos",
      "São Domingos de Rana",
      "Alcabideche",
    ],
    accessNotes:
      "As zonas residenciais de Cascais têm geralmente bons acessos. Algumas moradias em condomínios fechados requerem coordenação prévia.",
    neighborhoodTips:
      "O centro de Cascais e Estoril podem ter estacionamento limitado. As zonas interiores como Alcabideche têm acessos mais amplos.",
    typicalRequests: [
      "Esvaziamento de moradias",
      "Recolha de mobiliário antigo",
      "Limpeza pós-obra em renovações",
      "Mudanças de escritórios",
    ],
    nearbyAreas: ["Oeiras", "Sintra", "Lisboa"],
  },

  oeiras: {
    slug: "oeiras",
    name: "Oeiras",
    region: "lisboa",
    localIntro:
      "Em Oeiras, operamos em todas as freguesias, com destaque para Algés, Carnaxide, Linda-a-Velha e Paço de Arcos. A mistura de zonas empresariais e residenciais gera pedidos variados.",
    landmarks: [
      "Algés",
      "Carnaxide",
      "Linda-a-Velha",
      "Paço de Arcos",
      "Taguspark",
      "Porto Salvo",
    ],
    accessNotes:
      "Oeiras tem excelentes acessos rodoviários. As zonas empresariais como Taguspark e Lagoas Park facilitam operações de maior escala.",
    neighborhoodTips:
      "Carnaxide e Linda-a-Velha são zonas residenciais com bom estacionamento. Algés pode ter mais trânsito em horas de ponta.",
    typicalRequests: [
      "Recolha em escritórios e empresas",
      "Esvaziamento de apartamentos",
      "Entulho de obras comerciais",
      "Mudanças de empresas",
    ],
    nearbyAreas: ["Lisboa", "Amadora", "Cascais", "Sintra"],
  },

  loures: {
    slug: "loures",
    name: "Loures",
    region: "lisboa",
    localIntro:
      "Em Loures, cobrimos desde Sacavém e Moscavide até às zonas mais rurais como Lousa e Bucelas. A diversidade do concelho permite-nos atender tanto pedidos urbanos como rurais.",
    landmarks: [
      "Sacavém",
      "Moscavide",
      "Portela",
      "Camarate",
      "Santo António dos Cavaleiros",
      "Bobadela",
    ],
    accessNotes:
      "As zonas urbanas de Loures têm bons acessos. Algumas freguesias mais rurais podem ter estradas mais estreitas.",
    neighborhoodTips:
      "Sacavém e Portela têm urbanizações organizadas com bom acesso. Santo António dos Cavaleiros tem prédios com elevador.",
    typicalRequests: [
      "Recolha de móveis em apartamentos",
      "Entulho de obras residenciais",
      "Esvaziamento de arrecadações",
      "Limpeza de quintais",
    ],
    nearbyAreas: ["Lisboa", "Odivelas", "Vila Franca de Xira"],
  },

  odivelas: {
    slug: "odivelas",
    name: "Odivelas",
    region: "lisboa",
    localIntro:
      "Em Odivelas, atuamos em todo o concelho, incluindo Ramada, Pontinha, Caneças e Famões. A boa ligação ao Metro facilita a nossa mobilidade na região.",
    landmarks: [
      "Centro de Odivelas",
      "Ramada",
      "Pontinha",
      "Caneças",
      "Famões",
      "Olival Basto",
    ],
    accessNotes:
      "Odivelas tem uma mistura de prédios mais antigos e urbanizações recentes. A maioria tem elevador e bons acessos.",
    neighborhoodTips:
      "A Pontinha e Ramada são zonas residenciais com estacionamento acessível. O centro de Odivelas pode ter mais movimento.",
    typicalRequests: [
      "Recolha de móveis usados",
      "Entulho de pequenas remodelações",
      "Esvaziamento de caves",
      "Mudanças locais",
    ],
    nearbyAreas: ["Lisboa", "Loures", "Amadora", "Sintra"],
  },

  // ========================
  // MARGEM SUL
  // ========================
  almada: {
    slug: "almada",
    name: "Almada",
    region: "margem-sul",
    localIntro:
      "Em Almada, somos a escolha local para recolhas rápidas. Cobrimos desde a Costa da Caparica até ao Pragal e Cacilhas, com resposta ainda mais rápida por estarmos sediados na região.",
    landmarks: [
      "Costa da Caparica",
      "Cacilhas",
      "Pragal",
      "Feijó",
      "Cova da Piedade",
      "Almada Velha",
    ],
    accessNotes:
      "O centro de Almada e Cacilhas têm ruas mais estreitas. A Costa da Caparica tem bons acessos na maioria das zonas residenciais.",
    neighborhoodTips:
      "O Pragal e Feijó são zonas residenciais com prédios de vários andares e elevador. Almada Velha pode requerer avaliação prévia.",
    typicalRequests: [
      "Recolha de móveis de praia",
      "Esvaziamento de apartamentos de férias",
      "Entulho de obras residenciais",
      "Mudanças para o outro lado do rio",
    ],
    nearbyAreas: ["Seixal", "Lisboa", "Setúbal"],
  },

  seixal: {
    slug: "seixal",
    name: "Seixal",
    region: "margem-sul",
    localIntro:
      "No Seixal, estamos mesmo ao lado. Cobrimos Amora (onde temos a nossa base), Corroios, Arrentela, Paio Pires e Fernão Ferro com tempos de resposta imbatíveis.",
    landmarks: [
      "Amora",
      "Corroios",
      "Arrentela",
      "Paio Pires",
      "Fernão Ferro",
      "Cruz de Pau",
    ],
    accessNotes:
      "O Seixal tem zonas urbanas com bons acessos e zonas mais rurais como Fernão Ferro com moradias. Os prédios em Corroios e Amora têm geralmente elevador.",
    neighborhoodTips:
      "A nossa sede em Amora permite-nos chegar a qualquer ponto do Seixal em minutos. Corroios é uma zona muito acessível.",
    typicalRequests: [
      "Recolha de móveis e eletrodomésticos",
      "Entulho de obras em moradias",
      "Esvaziamento de garagens",
      "Limpeza de quintais e jardins",
    ],
    nearbyAreas: ["Almada", "Barreiro", "Sesimbra", "Setúbal"],
  },

  barreiro: {
    slug: "barreiro",
    name: "Barreiro",
    region: "margem-sul",
    localIntro:
      "No Barreiro, atuamos em todo o concelho, desde a zona ribeirinha até ao Alto do Seixalinho e Verderena. A proximidade ao Seixal permite-nos responder rapidamente.",
    landmarks: [
      "Centro do Barreiro",
      "Alto do Seixalinho",
      "Verderena",
      "Lavradio",
      "Santo António da Charneca",
      "Coina",
    ],
    accessNotes:
      "O Barreiro tem uma mistura de zonas industriais reconvertidas e áreas residenciais. A maioria dos prédios tem bons acessos.",
    neighborhoodTips:
      "A zona ribeirinha tem estacionamento mais limitado. O Alto do Seixalinho e Verderena são zonas residenciais com bom acesso.",
    typicalRequests: [
      "Recolha de móveis antigos",
      "Entulho de remodelações",
      "Esvaziamento de lojas e armazéns",
      "Mudanças residenciais",
    ],
    nearbyAreas: ["Seixal", "Moita", "Montijo", "Setúbal"],
  },

  moita: {
    slug: "moita",
    name: "Moita",
    region: "margem-sul",
    localIntro:
      "Na Moita, cobrimos todas as freguesias incluindo Baixa da Banheira, Alhos Vedros, Vale da Amoreira e Gaio-Rosário. A zona combina áreas urbanas com rurais.",
    landmarks: [
      "Baixa da Banheira",
      "Alhos Vedros",
      "Vale da Amoreira",
      "Moita",
      "Gaio-Rosário",
    ],
    accessNotes:
      "A Moita tem zonas residenciais com bons acessos. Algumas áreas mais antigas podem ter ruas mais estreitas.",
    neighborhoodTips:
      "A Baixa da Banheira e Alhos Vedros são as zonas mais urbanas. Vale da Amoreira tem urbanizações recentes.",
    typicalRequests: [
      "Recolha de móveis usados",
      "Entulho de obras pequenas",
      "Esvaziamento de arrecadações",
      "Limpeza de terrenos",
    ],
    nearbyAreas: ["Barreiro", "Montijo", "Alcochete", "Seixal"],
  },

  montijo: {
    slug: "montijo",
    name: "Montijo",
    region: "margem-sul",
    localIntro:
      "No Montijo, atuamos em todo o concelho, beneficiando da ponte Vasco da Gama para ligação rápida a Lisboa. Cobrimos Montijo, Afonsoeiro, Alto Estanqueiro e Sarilhos Grandes.",
    landmarks: [
      "Centro do Montijo",
      "Afonsoeiro",
      "Alto Estanqueiro",
      "Sarilhos Grandes",
      "Canha",
      "Pegões",
    ],
    accessNotes:
      "O Montijo tem bons acessos na zona urbana. As freguesias rurais como Canha e Pegões podem ter estradas mais estreitas.",
    neighborhoodTips:
      "O centro do Montijo tem boa infraestrutura. As zonas industriais têm acessos amplos para veículos de maior porte.",
    typicalRequests: [
      "Recolha de móveis residenciais",
      "Entulho de construções",
      "Esvaziamento de armazéns",
      "Mudanças entre margens",
    ],
    nearbyAreas: ["Alcochete", "Moita", "Palmela", "Lisboa"],
  },

  alcochete: {
    slug: "alcochete",
    name: "Alcochete",
    region: "margem-sul",
    localIntro:
      "Em Alcochete, servimos todo o concelho com especial atenção ao centro histórico e às novas urbanizações. A ligação pela ponte Vasco da Gama facilita operações com Lisboa.",
    landmarks: [
      "Centro histórico",
      "Urbanização do Freeport",
      "Passil",
      "Samouco",
    ],
    accessNotes:
      "O centro histórico de Alcochete tem ruas mais estreitas típicas de vilas tradicionais. As zonas novas têm excelentes acessos.",
    neighborhoodTips:
      "A zona junto ao Freeport é muito acessível. O centro histórico requer mais cuidado no planeamento.",
    typicalRequests: [
      "Recolha de móveis de casas de férias",
      "Entulho de renovações",
      "Esvaziamento de quintas",
      "Limpeza de terrenos",
    ],
    nearbyAreas: ["Montijo", "Moita", "Palmela", "Setúbal"],
  },

  // ========================
  // SETÚBAL
  // ========================
  setubal: {
    slug: "setubal",
    name: "Setúbal",
    region: "setubal",
    localIntro:
      "Em Setúbal, somos a referência para recolhas em toda a cidade e arredores. Desde a Avenida Luísa Todi até Azeitão, conhecemos bem a região e os seus desafios específicos.",
    landmarks: [
      "Centro histórico",
      "Avenida Luísa Todi",
      "Bairro Azul",
      "Manteigadas",
      "Praias da Arrábida",
      "Azeitão",
    ],
    accessNotes:
      "O centro de Setúbal tem zonas com estacionamento limitado. Os bairros residenciais têm geralmente bons acessos. A serra da Arrábida pode ter acessos mais desafiantes.",
    neighborhoodTips:
      "O Bairro Azul e Manteigadas são zonas residenciais acessíveis. Azeitão tem quintas e moradias que podem requerer avaliação.",
    typicalRequests: [
      "Esvaziamento de casas e quintas",
      "Recolha de móveis e eletrodomésticos",
      "Entulho de obras",
      "Limpeza pós-obra industrial",
    ],
    nearbyAreas: ["Palmela", "Sesimbra", "Seixal", "Barreiro"],
  },

  palmela: {
    slug: "palmela",
    name: "Palmela",
    region: "setubal",
    localIntro:
      "Em Palmela, cobrimos todo o concelho incluindo Pinhal Novo, Quinta do Anjo e a zona histórica de Palmela. A região combina áreas urbanas com rurais e vinhas.",
    landmarks: [
      "Centro de Palmela",
      "Pinhal Novo",
      "Quinta do Anjo",
      "Poceirão",
      "Marateca",
      "Águas de Moura",
    ],
    accessNotes:
      "Pinhal Novo tem excelentes acessos como centro urbano do concelho. A zona histórica de Palmela tem ruas mais estreitas. As quintas rurais podem ter acessos de terra batida.",
    neighborhoodTips:
      "Pinhal Novo é a zona mais urbana com bons acessos. Quinta do Anjo tem urbanizações recentes.",
    typicalRequests: [
      "Esvaziamento de quintas",
      "Recolha de móveis de adegas",
      "Entulho de obras em moradias",
      "Limpeza de terrenos agrícolas",
    ],
    nearbyAreas: ["Setúbal", "Seixal", "Montijo", "Sesimbra"],
  },

  sesimbra: {
    slug: "sesimbra",
    name: "Sesimbra",
    region: "setubal",
    localIntro:
      "Em Sesimbra, atuamos desde a vila piscatória até às praias e à serra da Arrábida. Conhecemos os desafios específicos de uma zona turística com acessos variados.",
    landmarks: [
      "Centro de Sesimbra",
      "Praia da California",
      "Lagoa de Albufeira",
      "Aldeia do Meco",
      "Quinta do Conde",
      "Fernão Ferro",
    ],
    accessNotes:
      "O centro de Sesimbra tem ruas estreitas típicas de vilas piscatórias. Quinta do Conde tem urbanizações com bons acessos. As praias podem ter estacionamento sazonal.",
    neighborhoodTips:
      "Quinta do Conde é uma grande urbanização com bom acesso. O centro de Sesimbra é mais difícil em época balnear.",
    typicalRequests: [
      "Esvaziamento de casas de férias",
      "Recolha de móveis de praia",
      "Entulho de remodelações",
      "Limpeza de terrenos",
    ],
    nearbyAreas: ["Seixal", "Setúbal", "Almada", "Palmela"],
  },
};

/**
 * Obtém o conteúdo específico de uma cidade pelo slug
 */
export function getCityContent(citySlug: string): CityContent | undefined {
  return CITY_CONTENT[citySlug.toLowerCase()];
}

/**
 * Lista todas as cidades de uma região
 */
export function getCitiesByRegion(
  region: "lisboa" | "margem-sul" | "setubal",
): CityContent[] {
  return Object.values(CITY_CONTENT).filter((city) => city.region === region);
}

/**
 * Obtém todas as cidades como array
 */
export function getAllCities(): CityContent[] {
  return Object.values(CITY_CONTENT);
}
