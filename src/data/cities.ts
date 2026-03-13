export interface CityData {
  slug: string;
  name: string;
  region: string;
}

export interface ServiceData {
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  keywords: string[];
}

export const CITIES: CityData[] = [
  { slug: "lisboa", name: "Lisboa", region: "Lisboa" },
  { slug: "setubal", name: "Set�bal", region: "Set�bal" },
  { slug: "almada", name: "Almada", region: "Set�bal" },
  { slug: "cascais", name: "Cascais", region: "Lisboa" },
  { slug: "sintra", name: "Sintra", region: "Lisboa" },
  { slug: "oeiras", name: "Oeiras", region: "Lisboa" },
  { slug: "amadora", name: "Amadora", region: "Lisboa" },
  { slug: "loures", name: "Loures", region: "Lisboa" },
  { slug: "odivelas", name: "Odivelas", region: "Lisboa" },
  { slug: "seixal", name: "Seixal", region: "Set�bal" },
  { slug: "barreiro", name: "Barreiro", region: "Set�bal" },
  { slug: "moita", name: "Moita", region: "Set�bal" },
  { slug: "montijo", name: "Montijo", region: "Set�bal" },
  { slug: "palmela", name: "Palmela", region: "Set�bal" },
  { slug: "sesimbra", name: "Sesimbra", region: "Set�bal" },
  { slug: "alcochete", name: "Alcochete", region: "Set�bal" },
  { slug: "amora", name: "Amora", region: "Set�bal" },
  { slug: "corroios", name: "Corroios", region: "Set�bal" },
  { slug: "carnaxide", name: "Carnaxide", region: "Lisboa" },
  { slug: "costa-da-caparica", name: "Costa da Caparica", region: "Set�bal" },
];

export const SERVICES: ServiceData[] = [
  {
    slug: "recolha-moveis",
    name: "Recolha de M�veis",
    description: "Recolha segura e r�pida de m�veis velhos, danificados ou indesejados.",
    longDescription: "A CLYON oferece um servi�o profissional de recolha de m�veis em toda a regi�o de Lisboa e Set�bal. Retiramos sof�s, camas, arm�rios, mesas, cadeiras e qualquer outro tipo de mobili�rio. Transporte direto para reciclagem ou doa��o.",
    keywords: ["recolha de m�veis", "remo��o de m�veis", "retirar m�veis velhos", "transporte de m�veis"],
  },
  {
    slug: "recolha-entulho",
    name: "Recolha de Entulho",
    description: "Remo��o r�pida e organizada de entulho de obras, remodela��es e constru��es.",
    longDescription: "Servi�o especializado em recolha de entulho de obras, remodela��es e demoli��es. A CLYON remove todo o tipo de res�duos de constru��o: tijolos, cimento, azulejos, madeiras e outros materiais. Transporte e disposi��o adequada em centros de reciclagem certificados.",
    keywords: ["recolha de entulho", "remo��o de entulho", "limpeza de obra", "entulho de constru��o"],
  },
  {
    slug: "recolha-monos",
    name: "Recolha de Monos",
    description: "Recolha profissional de monos, sucata e materiais diversos.",
    longDescription: "A CLYON realiza a recolha de monos e objetos volumosos que j� n�o s�o necess�rios. Eletrodom�sticos, equipamentos velhos, sucata e outros materiais s�o recolhidos de forma r�pida e respons�vel. Limpeza completa do espa�o ap�s a recolha.",
    keywords: ["recolha de monos", "remo��o de monos", "retirar objetos velhos", "sucata"],
  },
  {
    slug: "esvaziamento-casas",
    name: "Esvaziamento de Casas",
    description: "Esvaziamento completo de casas, apartamentos e escrit�rios.",
    longDescription: "Servi�o completo de esvaziamento de im�veis. A CLYON trata de tudo: m�veis, eletrodom�sticos, objetos pessoais e res�duos. Ideal para heran�as, mudan�as de casa, desocupa��o de im�veis para venda ou arrendamento.",
    keywords: ["esvaziamento de casas", "esvaziar casa", "desocupa��o de im�vel", "limpeza de casa"],
  },
  {
    slug: "limpeza-pos-obra",
    name: "Limpeza P�s-Obra",
    description: "Limpeza profissional ap�s obras e remodela��es.",
    longDescription: "Ap�s a conclus�o de obras e remodela��es, a CLYON realiza uma limpeza profissional completa. Removemos p�, res�duos de constru��o e deixamos o espa�o pronto a habitar. Servi�o dispon�vel para casas, apartamentos e escrit�rios.",
    keywords: ["limpeza p�s-obra", "limpeza ap�s obra", "limpeza de constru��o", "limpeza profissional"],
  },
  {
    slug: "mudancas",
    name: "Mudan�as",
    description: "Servi�o de mudan�as residenciais e comerciais.",
    longDescription: "A CLYON oferece um servi�o completo de mudan�as para particulares e empresas. Tratamos do transporte de todos os seus bens com cuidado e profissionalismo. Dispon�vel em Lisboa, Set�bal e toda a Margem Sul.",
    keywords: ["mudan�as", "servi�o de mudan�as", "transporte de mudan�as", "empresa de mudan�as"],
  },
];

// Gera todas as combina��es de cidade + servi�o
export function getAllCityServiceCombinations() {
  const combinations: { city: CityData; service: ServiceData }[] = [];
  for (const city of CITIES) {
    for (const service of SERVICES) {
      combinations.push({ city, service });
    }
  }
  return combinations;
}

// Gera o slug para uma combina��o cidade + servi�o
export function getCityServiceSlug(serviceSlug: string, citySlug: string): string {
  return `${serviceSlug}-${citySlug}`;
}

// Encontra cidade pelo slug
export function findCity(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}

// Encontra servi�o pelo slug
export function findService(slug: string): ServiceData | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
