/**
 * Conteúdo único e personalizado por cidade E por serviço para páginas SEO locais.
 * Cada combinação cidade+serviço tem conteúdo genuinamente diferente.
 */

export interface CityServiceContent {
  // Identificação
  citySlug: string;
  serviceSlug: string;

  // SEO único
  metaTitle: string;
  metaDescription: string;
  h1: string;

  // Conteúdo local único
  localIntro: string;
  accessNotes: string;
  neighborhoodHighlight: string;
  nearbyAreas: string[];

  // FAQs únicas (não parametrizadas)
  faqs: { q: string; a: string }[];

  // Preços específicos
  pricingNotes: string[];

  // CTA contextualizado
  ctaText: string;
}

// =============================================================================
// CONTEÚDO ÚNICO POR CIDADE+SERVIÇO (10 páginas prioritárias)
// =============================================================================

export const CITY_SERVICE_CONTENT: Record<string, CityServiceContent> = {
  // ---------------------------------------------------------------------------
  // 1. RECOLHA DE MÓVEIS EM LISBOA
  // ---------------------------------------------------------------------------
  "recolha-moveis-lisboa": {
    citySlug: "lisboa",
    serviceSlug: "recolha-moveis",
    metaTitle: "Recolha de Móveis em Lisboa - Sofás, Camas e Armários | CLYON",
    metaDescription:
      "Recolha de móveis usados em Lisboa com desmontagem incluída. Retiramos sofás, camas, armários e eletrodomésticos em Alfama, Benfica, Lumiar e toda Lisboa. Preço justo, resposta rápida.",
    h1: "Recolha de Móveis Usados em Lisboa",
    localIntro:
      "Em Lisboa, a recolha de móveis velhos tem desafios próprios: prédios antigos sem elevador em Alfama e na Mouraria, estacionamento difícil na Baixa, apartamentos pequenos no Parque das Nações. A CLYON conhece bem estas situações e adapta a equipa ao tipo de acesso. Se o sofá não passa na porta, desmontamos. Se há escadas estreitas, planificamos a descida com cuidado. Se o estacionamento é complicado, coordenamos horário para evitar multas.",
    accessNotes:
      "Nos bairros históricos (Alfama, Mouraria, Graça), os acessos são frequentemente por escadas em caracol ou ruas onde o camião não entra. Avaliamos sempre o local antes de fechar preço para evitar surpresas.",
    neighborhoodHighlight:
      "As zonas com mais pedidos em Lisboa são Benfica, Lumiar, Alvalade e Olivais. São bairros residenciais com muitas mudanças e renovações de apartamentos.",
    nearbyAreas: ["Amadora", "Odivelas", "Loures", "Oeiras"],
    faqs: [
      {
        q: "Quanto custa recolher um sofá em Lisboa?",
        a: "Um sofá de 2-3 lugares em Lisboa custa entre 35EUR e 55EUR, dependendo do piso e do acesso. Se for num 5º andar sem elevador em Alfama, o preço será diferente de um rés-do-chão em Telheiras.",
      },
      {
        q: "A CLYON retira móveis em prédios sem elevador em Lisboa?",
        a: "Sim, retiramos. Temos experiência em prédios antigos de Lisboa. Avaliamos as escadas, medimos os móveis e, se necessário, desmontamos armários e camas para conseguir descer.",
      },
      {
        q: "Fazem recolha de móveis ao fim de semana em Lisboa?",
        a: "Aos sábados conseguimos atender pedidos em Lisboa, mediante disponibilidade. É melhor contactar durante a semana para garantir vaga.",
      },
      {
        q: "Recolhem eletrodomésticos junto com os móveis em Lisboa?",
        a: "Sim. Frigoríficos, máquinas de lavar, fogões e micro-ondas podem ser recolhidos no mesmo serviço. O preço é ajustado ao volume total.",
      },
      {
        q: "Qual a diferença entre a CLYON e a recolha da Câmara de Lisboa?",
        a: "A recolha municipal em Lisboa é gratuita mas tem lista de espera, não entra no imóvel e não desmonta móveis. A CLYON entra, desmonta, carrega e retira no dia combinado.",
      },
    ],
    pricingNotes: [
      "Sofá de 2-3 lugares: 35EUR a 55EUR",
      "Cama de casal com estrado: 25EUR a 45EUR",
      "Armário de 2 portas: 35EUR a 55EUR",
      "Frigorífico combinado: 25EUR a 40EUR",
      "Apartamento T2 completo: 280EUR a 450EUR",
    ],
    ctaText: "Precisa de retirar móveis em Lisboa? Envie fotos e morada para orçamento em 15 minutos.",
  },

  // ---------------------------------------------------------------------------
  // 2. RECOLHA DE ENTULHO EM LISBOA
  // ---------------------------------------------------------------------------
  "recolha-entulho-lisboa": {
    citySlug: "lisboa",
    serviceSlug: "recolha-entulho",
    metaTitle: "Recolha de Entulho em Lisboa - Obras e Remodelações | CLYON",
    metaDescription:
      "Recolha de entulho de obras em Lisboa. Retiramos restos de construção, azulejos, tijolos e sacos de cimento. Preços desde 120EUR, resposta em 24h.",
    h1: "Recolha de Entulho de Obras em Lisboa",
    localIntro:
      "Lisboa está sempre em obras. Remodelações de apartamentos antigos, renovações de lojas no Chiado, restauros em Alfama. O entulho acumula-se e precisa de sair rápido para a obra avançar. A CLYON recolhe entulho em sacos, a granel ou em contentores, adaptando o serviço ao volume e ao tipo de acesso do imóvel.",
    accessNotes:
      "Em muitas obras de Lisboa, o acesso é por escadas ou ruas estreitas onde não entra contentor grande. Nestes casos, trabalhamos com sacos big bag ou recolha manual com carrinho de mão.",
    neighborhoodHighlight:
      "As zonas com mais obras em Lisboa são o centro histórico (Alfama, Mouraria, Baixa), Avenidas Novas e Parque das Nações. Cada zona tem desafios de acesso diferentes.",
    nearbyAreas: ["Amadora", "Loures", "Odivelas", "Oeiras"],
    faqs: [
      {
        q: "Quanto custa recolher entulho de uma obra em Lisboa?",
        a: "Depende do volume. Uma remodelação de casa de banho gera cerca de 10-15 sacos e custa entre 120EUR e 180EUR. Uma obra maior pode precisar de contentor e o preço sobe proporcionalmente.",
      },
      {
        q: "A CLYON fornece contentor para entulho em Lisboa?",
        a: "Fornecemos contentores de vários tamanhos para obras em Lisboa. O contentor fica no local o tempo combinado e depois vamos buscar. O preço inclui transporte e despejo.",
      },
      {
        q: "Recolhem entulho de obras ao sábado em Lisboa?",
        a: "Aos sábados de manhã conseguimos fazer recolhas em Lisboa, mediante marcação prévia. Domingos não trabalhamos.",
      },
      {
        q: "Podem recolher entulho de um 4º andar sem elevador em Lisboa?",
        a: "Sim, fazemos isso regularmente em prédios antigos de Lisboa. O preço é ajustado ao esforço de descida, mas temos equipa preparada para estes acessos.",
      },
    ],
    pricingNotes: [
      "Até 10 sacos de entulho: 120EUR a 150EUR",
      "Contentor pequeno (2m³): 180EUR a 220EUR",
      "Contentor médio (5m³): 280EUR a 350EUR",
      "Remodelação de WC completa: 150EUR a 200EUR",
      "Obra de cozinha: 200EUR a 300EUR",
    ],
    ctaText: "Tem entulho de obra em Lisboa? Diga-nos o volume e enviamos orçamento hoje.",
  },

  // ---------------------------------------------------------------------------
  // 3. RECOLHA DE MÓVEIS EM ALMADA
  // ---------------------------------------------------------------------------
  "recolha-moveis-almada": {
    citySlug: "almada",
    serviceSlug: "recolha-moveis",
    metaTitle: "Recolha de Móveis em Almada - Costa da Caparica e Cacilhas | CLYON",
    metaDescription:
      "Recolha de móveis usados em Almada, Costa da Caparica, Pragal e Cacilhas. Empresa local com resposta rápida. Retiramos sofás, camas e armários. Preços desde 35EUR.",
    h1: "Recolha de Móveis em Almada e Costa da Caparica",
    localIntro:
      "Almada é o nosso território. Estamos sediados no Seixal, a 10 minutos de qualquer ponto de Almada. Conhecemos bem as diferenças entre a Costa da Caparica (muitos apartamentos de férias que precisam de esvaziamento sazonal), Cacilhas (prédios mais antigos com escadas), e o Pragal (urbanizações mais recentes com elevador). Esta proximidade permite-nos responder mais depressa e com melhor preço do que empresas de Lisboa.",
    accessNotes:
      "Na Costa da Caparica, os acessos são geralmente bons, mas em época balnear o estacionamento complica. Em Cacilhas e Almada Velha, há prédios antigos onde é preciso desmontar móveis para descer.",
    neighborhoodHighlight:
      "A Costa da Caparica tem muitos apartamentos de férias que são esvaziados no final do verão. É uma das zonas onde fazemos mais recolhas de móveis em Almada.",
    nearbyAreas: ["Costa da Caparica", "Seixal", "Lisboa", "Setúbal"],
    faqs: [
      {
        q: "A CLYON é de Almada?",
        a: "Somos do Seixal, mesmo ao lado. Almada é uma das zonas onde mais trabalhamos. Conhecemos bem as ruas, os acessos e conseguimos chegar em minutos.",
      },
      {
        q: "Fazem recolha de móveis na Costa da Caparica?",
        a: "Sim, frequentemente. Muitos apartamentos de férias na Costa precisam de esvaziamento no final da época. Retiramos sofás-cama, colchões, móveis de jardim e eletrodomésticos.",
      },
      {
        q: "Quanto custa recolher móveis em Almada?",
        a: "Um sofá em Almada custa entre 35EUR e 50EUR. Por sermos locais, conseguimos preços mais competitivos do que empresas que vêm de Lisboa.",
      },
      {
        q: "Recolhem móveis em Cacilhas com escadas?",
        a: "Sim. Cacilhas tem muitos prédios antigos sem elevador. Temos experiência nesses acessos e ajustamos o preço ao esforço real.",
      },
    ],
    pricingNotes: [
      "Sofá de 2-3 lugares: 35EUR a 50EUR",
      "Cama de casal com estrado: 25EUR a 40EUR",
      "Armário grande: 40EUR a 60EUR",
      "Apartamento T1 na Costa: 180EUR a 280EUR",
      "Moradia com garagem: 350EUR a 500EUR",
    ],
    ctaText: "Precisa de recolha de móveis em Almada? Somos locais - resposta em minutos.",
  },

  // ---------------------------------------------------------------------------
  // 4. RECOLHA DE MÓVEIS NO SEIXAL
  // ---------------------------------------------------------------------------
  "recolha-moveis-seixal": {
    citySlug: "seixal",
    serviceSlug: "recolha-moveis",
    metaTitle: "Recolha de Móveis no Seixal - Amora, Corroios e Arrentela | CLYON",
    metaDescription:
      "Recolha de móveis usados no Seixal. A CLYON está sediada em Amora - resposta imediata para Corroios, Arrentela e Paio Pires. Preços desde 30EUR.",
    h1: "Recolha de Móveis no Seixal - A Nossa Base",
    localIntro:
      "O Seixal é a nossa casa. A sede da CLYON fica em Amora, na Rua dos Jasmins. Isto significa que para qualquer pedido no Seixal - seja em Corroios, Arrentela, Paio Pires ou Fernão Ferro - conseguimos responder em minutos e estar no local no mesmo dia. Os nossos preços no Seixal são os mais competitivos porque não temos deslocação.",
    accessNotes:
      "O Seixal tem uma mistura de prédios com elevador (Corroios, Cruz de Pau) e moradias (Fernão Ferro, Paio Pires). Conhecemos bem cada zona e adaptamos a equipa ao tipo de acesso.",
    neighborhoodHighlight:
      "Amora e Corroios são as zonas com mais pedidos. São bairros residenciais com muita rotação de inquilinos e renovações de apartamentos.",
    nearbyAreas: ["Almada", "Barreiro", "Sesimbra", "Setúbal"],
    faqs: [
      {
        q: "A CLYON é do Seixal?",
        a: "Sim, a nossa sede é em Amora, Seixal. Estamos na Rua dos Jasmins, 2845-513. Para pedidos no Seixal, conseguimos os melhores preços e tempos de resposta.",
      },
      {
        q: "Quanto custa recolher um sofá no Seixal?",
        a: "No Seixal, por sermos locais, um sofá custa a partir de 30EUR. É o nosso melhor preço porque não há deslocação.",
      },
      {
        q: "Fazem recolha de móveis em Fernão Ferro?",
        a: "Sim. Fernão Ferro tem muitas moradias com garagem e jardim. Retiramos móveis, equipamento de jardim e limpamos garagens.",
      },
      {
        q: "Podem recolher móveis no mesmo dia no Seixal?",
        a: "Na maioria dos casos, sim. Por estarmos em Amora, conseguimos encaixar pedidos urgentes no Seixal com facilidade.",
      },
    ],
    pricingNotes: [
      "Sofá de 2-3 lugares: 30EUR a 45EUR",
      "Cama de casal com estrado: 20EUR a 35EUR",
      "Armário de 2 portas: 30EUR a 45EUR",
      "Garagem com móveis e tralha: 150EUR a 250EUR",
      "Apartamento T2 completo: 200EUR a 350EUR",
    ],
    ctaText: "No Seixal, somos vizinhos. Envie fotos agora e respondemos em minutos.",
  },

  // ---------------------------------------------------------------------------
  // 5. RECOLHA DE ENTULHO EM ALMADA
  // ---------------------------------------------------------------------------
  "recolha-entulho-almada": {
    citySlug: "almada",
    serviceSlug: "recolha-entulho",
    metaTitle: "Recolha de Entulho em Almada - Obras na Margem Sul | CLYON",
    metaDescription:
      "Recolha de entulho de obras em Almada, Costa da Caparica e Cacilhas. Contentores e sacos big bag. Empresa local, preços desde 100EUR.",
    h1: "Recolha de Entulho de Obras em Almada",
    localIntro:
      "Almada tem muitas obras em curso: remodelações de apartamentos antigos em Cacilhas, renovações de casas de férias na Costa da Caparica, construções novas no Pragal. A CLYON está a 10 minutos de qualquer ponto de Almada e consegue responder rápido a pedidos de recolha de entulho, seja em sacos, a granel ou com contentor.",
    accessNotes:
      "Na Costa da Caparica, a maioria das obras tem bom acesso para contentor. Em Cacilhas e Almada Velha, trabalhamos mais com sacos por causa das ruas estreitas.",
    neighborhoodHighlight:
      "A Costa da Caparica é a zona com mais obras de renovação em Almada. Muitos apartamentos antigos estão a ser modernizados.",
    nearbyAreas: ["Seixal", "Lisboa", "Barreiro", "Setúbal"],
    faqs: [
      {
        q: "Quanto custa um contentor de entulho em Almada?",
        a: "Um contentor pequeno (2m³) em Almada custa entre 150EUR e 200EUR, incluindo transporte, aluguer e despejo. Somos locais, por isso conseguimos bom preço.",
      },
      {
        q: "A CLYON deixa contentor de entulho na Costa da Caparica?",
        a: "Sim. Deixamos contentores em obras na Costa da Caparica. O contentor fica o tempo combinado e depois vamos buscar.",
      },
      {
        q: "Recolhem entulho aos sacos em Almada?",
        a: "Sim. Para obras mais pequenas ou acessos difíceis, trabalhamos com sacos big bag. É mais prático em prédios sem elevador.",
      },
      {
        q: "Podem recolher entulho de uma obra ao sábado em Almada?",
        a: "Aos sábados de manhã conseguimos fazer recolhas em Almada, mediante marcação prévia.",
      },
    ],
    pricingNotes: [
      "Até 10 sacos de entulho: 100EUR a 140EUR",
      "Contentor pequeno (2m³): 150EUR a 200EUR",
      "Contentor médio (5m³): 250EUR a 320EUR",
      "Remodelação de WC: 120EUR a 180EUR",
      "Demolição de divisória: 150EUR a 220EUR",
    ],
    ctaText: "Obra em Almada? Somos locais - contentor ou sacos, entregamos rápido.",
  },

  // ---------------------------------------------------------------------------
  // 6. RECOLHA DE MÓVEIS EM CASCAIS
  // ---------------------------------------------------------------------------
  "recolha-moveis-cascais": {
    citySlug: "cascais",
    serviceSlug: "recolha-moveis",
    metaTitle: "Recolha de Móveis em Cascais - Estoril, Parede e Carcavelos | CLYON",
    metaDescription:
      "Recolha de móveis usados em Cascais, Estoril e Carcavelos. Retiramos sofás, camas e armários de moradias e apartamentos. Serviço cuidado, preços desde 40EUR.",
    h1: "Recolha de Móveis em Cascais e Estoril",
    localIntro:
      "Cascais tem características próprias: muitas moradias com jardim, apartamentos de gama alta no Estoril, e casas de férias em Carcavelos. Os móveis são frequentemente maiores e mais pesados do que a média. A CLYON adapta a equipa ao tipo de imóvel e tem cuidado extra com os acessos em condomínios fechados, onde é preciso coordenar com a portaria.",
    accessNotes:
      "Muitas moradias em Cascais têm acesso por escadas exteriores ou jardins que dificultam a passagem de móveis grandes. Em condomínios fechados, coordenamos a entrada com o porteiro ou administração.",
    neighborhoodHighlight:
      "O Estoril e São João do Estoril têm muitos apartamentos em renovação. Carcavelos tem casas de férias que são esvaziadas sazonalmente.",
    nearbyAreas: ["Oeiras", "Sintra", "Lisboa", "Estoril"],
    faqs: [
      {
        q: "A CLYON faz recolha de móveis em Cascais?",
        a: "Sim, regularmente. Cobrimos Cascais, Estoril, Parede, Carcavelos e São Domingos de Rana. Conhecemos bem a zona e os acessos.",
      },
      {
        q: "Quanto custa recolher móveis de uma moradia em Cascais?",
        a: "Depende do volume. Uma moradia típica em Cascais com sala, quartos e garagem pode custar entre 400EUR e 700EUR para esvaziamento completo.",
      },
      {
        q: "Recolhem móveis antigos e peças grandes em Cascais?",
        a: "Sim. Muitas casas em Cascais têm móveis antigos pesados. Temos equipa e equipamento para retirar aparadores, cómodas e armários grandes.",
      },
      {
        q: "Fazem recolha em condomínios fechados em Cascais?",
        a: "Sim. Coordenamos a entrada com a portaria ou administração. Já trabalhamos em vários condomínios na zona de Cascais e Estoril.",
      },
    ],
    pricingNotes: [
      "Sofá grande de 3-4 lugares: 45EUR a 65EUR",
      "Cama king size: 35EUR a 55EUR",
      "Armário de 3 portas: 50EUR a 75EUR",
      "Apartamento T3 no Estoril: 350EUR a 500EUR",
      "Moradia completa: 500EUR a 800EUR",
    ],
    ctaText: "Móveis para retirar em Cascais? Enviamos equipa preparada para qualquer acesso.",
  },

  // ---------------------------------------------------------------------------
  // 7. RECOLHA DE MÓVEIS EM SINTRA
  // ---------------------------------------------------------------------------
  "recolha-moveis-sintra": {
    citySlug: "sintra",
    serviceSlug: "recolha-moveis",
    metaTitle: "Recolha de Móveis em Sintra - Mem Martins, Cacém e Rio de Mouro | CLYON",
    metaDescription:
      "Recolha de móveis usados em Sintra, Mem Martins, Cacém e Rio de Mouro. Retiramos sofás, camas e armários. Preços desde 35EUR, resposta rápida.",
    h1: "Recolha de Móveis em Sintra e Arredores",
    localIntro:
      "Sintra é um concelho grande com zonas muito diferentes: o centro histórico com ruas estreitas e empedradas, Mem Martins e Rio de Mouro com urbanizações de prédios, Cacém com uma mistura de ambos. A CLYON conhece estas diferenças e adapta o serviço. No centro histórico de Sintra, os acessos são complicados. Em Mem Martins, a maioria dos prédios tem elevador e o trabalho é mais simples.",
    accessNotes:
      "O centro histórico de Sintra tem ruas de paralelepípedo e inclinações fortes. Aqui o trabalho é mais demorado. Mem Martins, Cacém e Rio de Mouro têm acessos normais de urbanização.",
    neighborhoodHighlight:
      "Mem Martins e Cacém são as zonas com mais pedidos em Sintra. São bairros residenciais com muita rotação de inquilinos.",
    nearbyAreas: ["Amadora", "Cascais", "Oeiras", "Mafra"],
    faqs: [
      {
        q: "A CLYON faz recolha de móveis no centro de Sintra?",
        a: "Sim, mas avisamos que os acessos no centro histórico são complicados. Avaliamos sempre antes de dar preço porque pode ser necessário mais tempo e equipa.",
      },
      {
        q: "Quanto custa recolher móveis em Mem Martins?",
        a: "Em Mem Martins, os preços são normais: um sofá custa entre 35EUR e 50EUR. A maioria dos prédios tem elevador e bom acesso.",
      },
      {
        q: "Recolhem móveis de quintas em Sintra?",
        a: "Sim. Sintra tem muitas quintas que precisam de esvaziamento. É um trabalho maior mas fazemos com frequência.",
      },
      {
        q: "Fazem recolha de móveis no mesmo dia em Sintra?",
        a: "Se tivermos disponibilidade, sim. Para Mem Martins e Cacém é mais fácil encaixar pedidos urgentes do que para o centro histórico.",
      },
    ],
    pricingNotes: [
      "Sofá de 2-3 lugares: 35EUR a 55EUR",
      "Cama de casal com estrado: 25EUR a 45EUR",
      "Armário de 2 portas: 35EUR a 55EUR",
      "Apartamento T2 em Mem Martins: 200EUR a 320EUR",
      "Quinta com móveis antigos: 600EUR a 1000EUR",
    ],
    ctaText: "Móveis para retirar em Sintra? Diga-nos a zona e damos preço ajustado ao acesso.",
  },

  // ---------------------------------------------------------------------------
  // 8. LIMPEZA PÓS-OBRA EM LISBOA
  // ---------------------------------------------------------------------------
  "limpeza-pos-obra-lisboa": {
    citySlug: "lisboa",
    serviceSlug: "limpeza-pos-obra",
    metaTitle: "Limpeza Pós-Obra em Lisboa - Apartamentos e Escritórios | CLYON",
    metaDescription:
      "Limpeza pós-obra em Lisboa para apartamentos, lojas e escritórios. Retiramos pó de obra, restos finos e deixamos o espaço pronto a usar. Orçamento grátis.",
    h1: "Limpeza Pós-Obra em Lisboa",
    localIntro:
      "Depois de uma obra em Lisboa, o espaço fica cheio de pó fino, restos de massa, manchas de tinta e sujidade acumulada. A CLYON faz a limpeza final para deixar o apartamento, loja ou escritório pronto a habitar ou entregar ao proprietário. Trabalhamos em remodelações de apartamentos antigos em Alfama, renovações de lojas na Baixa e obras em escritórios nas Avenidas Novas.",
    accessNotes:
      "Em obras de Lisboa, muitas vezes ainda há materiais e entulho a retirar antes da limpeza. Podemos coordenar os dois serviços para simplificar.",
    neighborhoodHighlight:
      "As Avenidas Novas e o Parque das Nações têm muitos escritórios que precisam de limpeza pós-obra. O centro histórico tem apartamentos em renovação constante.",
    nearbyAreas: ["Amadora", "Loures", "Odivelas", "Oeiras"],
    faqs: [
      {
        q: "O que inclui a limpeza pós-obra da CLYON em Lisboa?",
        a: "Retiramos pó de obra de todas as superfícies, limpamos vidros, removemos manchas de tinta e massa, aspiramos e lavamos pavimentos. O espaço fica pronto a usar.",
      },
      {
        q: "Quanto custa limpeza pós-obra de um T2 em Lisboa?",
        a: "Um apartamento T2 em Lisboa, após remodelação, custa entre 150EUR e 250EUR para limpeza completa. Depende do estado e da área.",
      },
      {
        q: "A CLYON também retira o entulho antes de limpar?",
        a: "Sim. Podemos fazer primeiro a recolha de entulho e depois a limpeza. Coordenamos os dois serviços para facilitar.",
      },
      {
        q: "Fazem limpeza pós-obra de escritórios em Lisboa?",
        a: "Sim. Limpamos escritórios após obras de remodelação. Trabalhamos fora do horário laboral se necessário.",
      },
    ],
    pricingNotes: [
      "Apartamento T1 (até 50m²): 100EUR a 150EUR",
      "Apartamento T2 (50-80m²): 150EUR a 250EUR",
      "Apartamento T3 (80-120m²): 200EUR a 350EUR",
      "Loja pequena: 120EUR a 200EUR",
      "Escritório (100m²): 180EUR a 280EUR",
    ],
    ctaText: "Obra acabada em Lisboa? Fazemos a limpeza final e deixamos pronto a usar.",
  },

  // ---------------------------------------------------------------------------
  // 9. RECOLHA DE MÓVEIS EM SETÚBAL
  // ---------------------------------------------------------------------------
  "recolha-moveis-setubal": {
    citySlug: "setubal",
    serviceSlug: "recolha-moveis",
    metaTitle: "Recolha de Móveis em Setúbal - Centro, Azeitão e Arrábida | CLYON",
    metaDescription:
      "Recolha de móveis usados em Setúbal, Azeitão e zona da Arrábida. Retiramos sofás, camas e armários de apartamentos e quintas. Preços desde 40EUR.",
    h1: "Recolha de Móveis em Setúbal e Azeitão",
    localIntro:
      "Setúbal é a cidade maior da região e tem características próprias: um centro histórico com prédios antigos, bairros residenciais como o Bairro Azul e Manteigadas, e a zona de Azeitão com quintas e moradias. A CLYON cobre toda a área de Setúbal com tempos de resposta bons, apesar de ser mais longe da nossa base no Seixal. Conhecemos bem os acessos e adaptamos a equipa ao tipo de imóvel.",
    accessNotes:
      "O centro de Setúbal tem estacionamento limitado em algumas ruas. Azeitão tem quintas com acessos de terra batida que avaliamos antes de dar preço.",
    neighborhoodHighlight:
      "O Bairro Azul e Manteigadas são zonas residenciais com muita procura. Azeitão tem quintas que precisam de esvaziamento completo.",
    nearbyAreas: ["Palmela", "Sesimbra", "Seixal", "Barreiro"],
    faqs: [
      {
        q: "A CLYON faz recolha de móveis em Setúbal?",
        a: "Sim. Setúbal faz parte da nossa área de cobertura. Os preços são ligeiramente mais altos do que na Margem Sul por causa da distância, mas continuamos competitivos.",
      },
      {
        q: "Recolhem móveis em quintas de Azeitão?",
        a: "Sim. Azeitão tem muitas quintas com móveis antigos. Avaliamos o acesso antes de dar preço porque pode ser necessário equipamento especial.",
      },
      {
        q: "Quanto custa recolher um sofá em Setúbal?",
        a: "Um sofá em Setúbal custa entre 40EUR e 60EUR, dependendo do piso e acesso. É ligeiramente mais caro do que no Seixal por causa da deslocação.",
      },
      {
        q: "Fazem esvaziamento de casas em Setúbal?",
        a: "Sim. Esvaziamos apartamentos e moradias em Setúbal. É um serviço frequente, especialmente em heranças e arrendamentos.",
      },
    ],
    pricingNotes: [
      "Sofá de 2-3 lugares: 40EUR a 60EUR",
      "Cama de casal com estrado: 30EUR a 50EUR",
      "Armário de 2 portas: 40EUR a 60EUR",
      "Apartamento T2 em Setúbal: 250EUR a 400EUR",
      "Quinta com móveis antigos: 500EUR a 900EUR",
    ],
    ctaText: "Móveis para retirar em Setúbal? Cobrimos toda a zona - peça orçamento.",
  },

  // ---------------------------------------------------------------------------
  // 10. ESVAZIAMENTO DE CASAS EM LISBOA
  // ---------------------------------------------------------------------------
  "esvaziamento-casas-lisboa": {
    citySlug: "lisboa",
    serviceSlug: "esvaziamento-casas",
    metaTitle: "Esvaziamento de Casas em Lisboa - Heranças e Arrendamentos | CLYON",
    metaDescription:
      "Esvaziamento de casas e apartamentos em Lisboa. Retiramos tudo: móveis, eletrodomésticos, roupa, papéis. Serviço completo para heranças, vendas e arrendamentos.",
    h1: "Esvaziamento de Casas e Apartamentos em Lisboa",
    localIntro:
      "Esvaziar uma casa em Lisboa é um trabalho grande: há móveis para retirar, eletrodomésticos, roupa, papéis, tralha acumulada. A CLYON faz o esvaziamento completo, desde a sala aos armários da cozinha. Este serviço é muito procurado em casos de herança (o imóvel precisa de ser libertado para venda), fim de arrendamento (o inquilino deixou tudo) e mudanças (não vale a pena levar os móveis velhos).",
    accessNotes:
      "Em Lisboa, os esvaziamentos são frequentemente em prédios antigos sem elevador. Avaliamos sempre o acesso antes de dar preço final porque faz grande diferença no custo.",
    neighborhoodHighlight:
      "Os bairros com mais pedidos de esvaziamento em Lisboa são Benfica, Lumiar, Alvalade e o centro histórico. São zonas com muitos apartamentos antigos.",
    nearbyAreas: ["Amadora", "Odivelas", "Loures", "Oeiras"],
    faqs: [
      {
        q: "O que inclui o esvaziamento de casa da CLYON em Lisboa?",
        a: "Retiramos tudo o que o cliente quiser: móveis, eletrodomésticos, roupa, livros, papéis, decoração, plantas. Deixamos o espaço vazio e varrido.",
      },
      {
        q: "Quanto custa esvaziar um apartamento T2 em Lisboa?",
        a: "Um T2 em Lisboa custa entre 350EUR e 600EUR para esvaziamento completo. Depende do volume de coisas, do piso e do acesso.",
      },
      {
        q: "Fazem esvaziamento de casas de herança em Lisboa?",
        a: "Sim, é um dos nossos serviços mais frequentes. Compreendemos que é uma situação delicada e trabalhamos com respeito e discrição.",
      },
      {
        q: "A CLYON separa o que pode ser doado?",
        a: "Sim. Móveis e objetos em bom estado podem ser encaminhados para doação ou reaproveitamento. Informamos o cliente do que pode ter esse destino.",
      },
      {
        q: "Podem esvaziar só uma parte da casa em Lisboa?",
        a: "Sim. Se quiser manter alguns móveis e retirar o resto, fazemos isso. O preço é ajustado ao volume que sai.",
      },
    ],
    pricingNotes: [
      "Apartamento T1 completo: 250EUR a 400EUR",
      "Apartamento T2 completo: 350EUR a 600EUR",
      "Apartamento T3 completo: 500EUR a 800EUR",
      "Garagem ou arrecadação: 100EUR a 200EUR",
      "Só quarto com armário cheio: 80EUR a 150EUR",
    ],
    ctaText: "Precisa de esvaziar uma casa em Lisboa? Fazemos tudo - envie fotos para orçamento.",
  },
};

// =============================================================================
// CONTEÚDO BASE POR CIDADE (para páginas não prioritárias)
// =============================================================================

export interface CityBaseContent {
  slug: string;
  name: string;
  region: "lisboa" | "margem-sul" | "setubal";
  localIntro: string;
  landmarks: string[];
  accessNotes: string;
  nearbyAreas: string[];
}

export const CITY_BASE_CONTENT: Record<string, CityBaseContent> = {
  lisboa: {
    slug: "lisboa",
    name: "Lisboa",
    region: "lisboa",
    localIntro: "Em Lisboa, a CLYON atua em todas as freguesias, desde o centro histórico até às zonas mais recentes como o Parque das Nações.",
    landmarks: ["Baixa-Chiado", "Alfama", "Parque das Nações", "Benfica", "Campo de Ourique", "Areeiro"],
    accessNotes: "Nos bairros históricos (Alfama, Mouraria, Graça), os acessos são frequentemente por escadas estreitas.",
    nearbyAreas: ["Amadora", "Odivelas", "Loures", "Oeiras"],
  },
  almada: {
    slug: "almada",
    name: "Almada",
    region: "margem-sul",
    localIntro: "Em Almada, somos a escolha local para recolhas rápidas. Cobrimos desde a Costa da Caparica até ao Pragal e Cacilhas.",
    landmarks: ["Costa da Caparica", "Cacilhas", "Pragal", "Feijó", "Cova da Piedade", "Almada Velha"],
    accessNotes: "O centro de Almada e Cacilhas têm ruas mais estreitas. A Costa da Caparica tem bons acessos.",
    nearbyAreas: ["Seixal", "Lisboa", "Setúbal"],
  },
  seixal: {
    slug: "seixal",
    name: "Seixal",
    region: "margem-sul",
    localIntro: "No Seixal, estamos mesmo ao lado. A nossa sede fica em Amora, permitindo tempos de resposta imbatíveis.",
    landmarks: ["Amora", "Corroios", "Arrentela", "Paio Pires", "Fernão Ferro", "Cruz de Pau"],
    accessNotes: "O Seixal tem zonas urbanas com bons acessos e zonas mais rurais com moradias.",
    nearbyAreas: ["Almada", "Barreiro", "Sesimbra", "Setúbal"],
  },
  cascais: {
    slug: "cascais",
    name: "Cascais",
    region: "lisboa",
    localIntro: "Em Cascais, atuamos desde a linha de costa até ao interior do concelho, incluindo Estoril, Parede e Carcavelos.",
    landmarks: ["Centro de Cascais", "Estoril", "Parede", "Carcavelos", "São Domingos de Rana", "Alcabideche"],
    accessNotes: "As zonas residenciais de Cascais têm geralmente bons acessos. Condomínios fechados requerem coordenação.",
    nearbyAreas: ["Oeiras", "Sintra", "Lisboa"],
  },
  sintra: {
    slug: "sintra",
    name: "Sintra",
    region: "lisboa",
    localIntro: "Em Sintra, cobrimos desde a zona histórica até às urbanizações de Mem Martins, Rio de Mouro e Cacém.",
    landmarks: ["Centro histórico de Sintra", "Mem Martins", "Rio de Mouro", "Cacém", "Queluz", "Agualva"],
    accessNotes: "Na serra de Sintra e centro histórico, os acessos podem ser desafiantes. As zonas urbanas têm bons acessos.",
    nearbyAreas: ["Amadora", "Cascais", "Oeiras", "Mafra"],
  },
  setubal: {
    slug: "setubal",
    name: "Setúbal",
    region: "setubal",
    localIntro: "Em Setúbal, somos a referência para recolhas em toda a cidade e arredores, desde a Avenida Luísa Todi até Azeitão.",
    landmarks: ["Centro histórico", "Avenida Luísa Todi", "Bairro Azul", "Manteigadas", "Arrábida", "Azeitão"],
    accessNotes: "O centro de Setúbal tem zonas com estacionamento limitado. Azeitão tem quintas com acessos variados.",
    nearbyAreas: ["Palmela", "Sesimbra", "Seixal", "Barreiro"],
  },
  oeiras: {
    slug: "oeiras",
    name: "Oeiras",
    region: "lisboa",
    localIntro: "Em Oeiras, operamos em todas as freguesias, com destaque para Algés, Carnaxide, Linda-a-Velha e Paço de Arcos.",
    landmarks: ["Algés", "Carnaxide", "Linda-a-Velha", "Paço de Arcos", "Taguspark", "Porto Salvo"],
    accessNotes: "Oeiras tem excelentes acessos rodoviários. As zonas empresariais facilitam operações de maior escala.",
    nearbyAreas: ["Lisboa", "Amadora", "Cascais", "Sintra"],
  },
  amadora: {
    slug: "amadora",
    name: "Amadora",
    region: "lisboa",
    localIntro: "Na Amadora, prestamos serviços em todas as freguesias, com foco especial na Reboleira, Alfragide e Damaia.",
    landmarks: ["Alfragide", "Reboleira", "Damaia", "Brandoa", "Venda Nova", "Mina de Água"],
    accessNotes: "A maioria dos prédios na Amadora tem elevador ou acessos razoáveis.",
    nearbyAreas: ["Lisboa", "Sintra", "Odivelas", "Oeiras"],
  },
  barreiro: {
    slug: "barreiro",
    name: "Barreiro",
    region: "margem-sul",
    localIntro: "No Barreiro, atuamos em todo o concelho, desde a zona ribeirinha até ao Alto do Seixalinho e Verderena.",
    landmarks: ["Centro do Barreiro", "Alto do Seixalinho", "Verderena", "Lavradio", "Santo António da Charneca", "Coina"],
    accessNotes: "O Barreiro tem uma mistura de zonas industriais reconvertidas e áreas residenciais.",
    nearbyAreas: ["Seixal", "Moita", "Montijo", "Setúbal"],
  },
  palmela: {
    slug: "palmela",
    name: "Palmela",
    region: "setubal",
    localIntro: "Em Palmela, cobrimos todo o concelho incluindo Pinhal Novo, Quinta do Anjo e a zona histórica.",
    landmarks: ["Centro de Palmela", "Pinhal Novo", "Quinta do Anjo", "Poceirão", "Marateca", "Águas de Moura"],
    accessNotes: "Pinhal Novo tem excelentes acessos. A zona histórica de Palmela tem ruas mais estreitas.",
    nearbyAreas: ["Setúbal", "Seixal", "Montijo", "Sesimbra"],
  },
  sesimbra: {
    slug: "sesimbra",
    name: "Sesimbra",
    region: "setubal",
    localIntro: "Em Sesimbra, atuamos desde a vila piscatória até às praias e à Quinta do Conde.",
    landmarks: ["Centro de Sesimbra", "Praia da California", "Lagoa de Albufeira", "Aldeia do Meco", "Quinta do Conde"],
    accessNotes: "O centro de Sesimbra tem ruas estreitas. Quinta do Conde tem urbanizações com bons acessos.",
    nearbyAreas: ["Seixal", "Setúbal", "Almada", "Palmela"],
  },
  loures: {
    slug: "loures",
    name: "Loures",
    region: "lisboa",
    localIntro: "Em Loures, cobrimos desde Sacavém e Moscavide até às zonas mais rurais como Lousa e Bucelas.",
    landmarks: ["Sacavém", "Moscavide", "Portela", "Camarate", "Santo António dos Cavaleiros", "Bobadela"],
    accessNotes: "As zonas urbanas de Loures têm bons acessos. Algumas freguesias rurais têm estradas mais estreitas.",
    nearbyAreas: ["Lisboa", "Odivelas", "Vila Franca de Xira"],
  },
  odivelas: {
    slug: "odivelas",
    name: "Odivelas",
    region: "lisboa",
    localIntro: "Em Odivelas, atuamos em todo o concelho, incluindo Ramada, Pontinha, Caneças e Famões.",
    landmarks: ["Centro de Odivelas", "Ramada", "Pontinha", "Caneças", "Famões", "Olival Basto"],
    accessNotes: "Odivelas tem uma mistura de prédios mais antigos e urbanizações recentes com elevador.",
    nearbyAreas: ["Lisboa", "Loures", "Amadora", "Sintra"],
  },
  moita: {
    slug: "moita",
    name: "Moita",
    region: "margem-sul",
    localIntro: "Na Moita, cobrimos todas as freguesias incluindo Baixa da Banheira, Alhos Vedros e Vale da Amoreira.",
    landmarks: ["Baixa da Banheira", "Alhos Vedros", "Vale da Amoreira", "Moita", "Gaio-Rosário"],
    accessNotes: "A Moita tem zonas residenciais com bons acessos. Algumas áreas mais antigas têm ruas mais estreitas.",
    nearbyAreas: ["Barreiro", "Montijo", "Alcochete", "Seixal"],
  },
  montijo: {
    slug: "montijo",
    name: "Montijo",
    region: "margem-sul",
    localIntro: "No Montijo, atuamos em todo o concelho, beneficiando da ponte Vasco da Gama para ligação rápida a Lisboa.",
    landmarks: ["Centro do Montijo", "Afonsoeiro", "Alto Estanqueiro", "Sarilhos Grandes", "Canha", "Pegões"],
    accessNotes: "O Montijo tem bons acessos na zona urbana. As freguesias rurais podem ter estradas mais estreitas.",
    nearbyAreas: ["Alcochete", "Moita", "Palmela", "Lisboa"],
  },
  alcochete: {
    slug: "alcochete",
    name: "Alcochete",
    region: "margem-sul",
    localIntro: "Em Alcochete, servimos todo o concelho com especial atenção ao centro histórico e às novas urbanizações.",
    landmarks: ["Centro histórico", "Urbanização do Freeport", "Passil", "Samouco"],
    accessNotes: "O centro histórico de Alcochete tem ruas mais estreitas. As zonas novas têm excelentes acessos.",
    nearbyAreas: ["Montijo", "Moita", "Palmela", "Setúbal"],
  },
};

// =============================================================================
// FUNÇÕES DE ACESSO
// =============================================================================

/**
 * Obtém conteúdo único para uma combinação cidade+serviço (páginas prioritárias)
 */
export function getCityServiceContent(citySlug: string, serviceSlug: string): CityServiceContent | undefined {
  const key = `${serviceSlug}-${citySlug}`;
  return CITY_SERVICE_CONTENT[key];
}

/**
 * Obtém conteúdo base de uma cidade (para páginas não prioritárias)
 */
export function getCityBaseContent(citySlug: string): CityBaseContent | undefined {
  return CITY_BASE_CONTENT[citySlug.toLowerCase()];
}

/**
 * Verifica se uma combinação cidade+serviço tem conteúdo prioritário
 */
export function hasPriorityContent(citySlug: string, serviceSlug: string): boolean {
  const key = `${serviceSlug}-${citySlug}`;
  return key in CITY_SERVICE_CONTENT;
}

/**
 * Lista todas as páginas prioritárias
 */
export function getPriorityPages(): string[] {
  return Object.keys(CITY_SERVICE_CONTENT);
}

// =============================================================================
// FUNÇÕES AUXILIARES PARA COMPATIBILIDADE
// =============================================================================

/**
 * Alias para getCityBaseContent (compatibilidade com código existente)
 */
export function getCityContent(citySlug: string): CityBaseContent | undefined {
  return getCityBaseContent(citySlug);
}

/**
 * Lista todas as cidades de uma região específica
 */
export function getCitiesByRegion(region: "lisboa" | "margem-sul" | "setubal"): CityBaseContent[] {
  return Object.values(CITY_BASE_CONTENT).filter((city) => city.region === region);
}

/**
 * Lista todas as cidades
 */
export function getAllCities(): CityBaseContent[] {
  return Object.values(CITY_BASE_CONTENT);
}
