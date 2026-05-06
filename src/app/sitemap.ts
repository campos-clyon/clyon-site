import type { MetadataRoute } from "next";

import {
  CITIES,
  REGIONS,
  SERVICES,
  SITE_URL,
  getCityServiceSlug,
} from "@/lib/seo-data";
import { getAllBlogPosts } from "@/lib/blog-data";

const staticPages = [
  { url: `${SITE_URL}`, priority: 1.0, changeFrequency: "weekly" as const },
  {
    url: `${SITE_URL}/recolha-de-moveis`,
    priority: 0.98,
    changeFrequency: "weekly" as const,
  },
  { url: `${SITE_URL}/recolha-de-entulho`, priority: 0.97, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/mudancas`, priority: 0.96, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/servicos`, priority: 0.95, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/precos`, priority: 0.82, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/simulador`, priority: 0.95, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/trabalhos`, priority: 0.85, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/avaliacoes`, priority: 0.8, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/faq`, priority: 0.75, changeFrequency: "monthly" as const },
  { url: `${SITE_URL}/sobre-nos`, priority: 0.75, changeFrequency: "monthly" as const },
  { url: `${SITE_URL}/contactos`, priority: 0.7, changeFrequency: "monthly" as const },
  { url: `${SITE_URL}/blog`, priority: 0.7, changeFrequency: "weekly" as const },
  { url: `${SITE_URL}/regioes`, priority: 0.9, changeFrequency: "weekly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const regionPages = REGIONS.map((region) => ({
    url: `${SITE_URL}/regioes/${region.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Páginas prioritárias com dados reais do Search Console (maior oportunidade)
  const priorityPages = [
    "recolha-monos-lisboa",
    "recolha-moveis-lisboa",
    "recolha-moveis-setubal",
    "recolha-moveis-almada",
    "recolha-entulho-setubal",
    "recolha-entulho-lisboa",
  ];

  const localPages = CITIES.flatMap((city) =>
    SERVICES.filter((service) => {
      // Excluir mudanças para todas as cidades EXCETO Lisboa
      if (service.slug === "mudancas" && city.slug !== "lisboa") {
        return false;
      }
      // Incluir todas as outras combinações
      return true;
    }).map((service) => {
      const slug = getCityServiceSlug(service.slug, city.slug);
      const isPriority = priorityPages.includes(slug);
      
      return {
        url: `${SITE_URL}/${slug}`,
        lastModified: now,
        changeFrequency: isPriority ? "weekly" as const : "monthly" as const,
        priority:
          // Páginas prioritárias do Search Console
          slug === "recolha-monos-lisboa" ? 0.98
          : slug === "recolha-moveis-lisboa" ? 0.97
          : slug === "recolha-moveis-setubal" ? 0.95
          : slug === "recolha-moveis-almada" ? 0.95
          : slug === "recolha-entulho-setubal" ? 0.94
          : slug === "recolha-entulho-lisboa" ? 0.94
          // Outras páginas de recolha de móveis
          : service.slug === "recolha-moveis" && city.slug === "cascais" ? 0.92
          : service.slug === "recolha-moveis" ? 0.9
          // Mudanças Lisboa
          : service.slug === "mudancas" && city.slug === "lisboa" ? 0.92
          // Default
          : 0.85,
      };
    }),
  );

  const blogPages = getAllBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.72,
  }));

  return [
    ...staticPages.map((page) => ({ ...page, lastModified: now })),
    ...regionPages,
    ...blogPages,
    ...localPages,
  ];
}
