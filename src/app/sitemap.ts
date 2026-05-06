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

  const localPages = CITIES.flatMap((city) =>
    SERVICES.filter((service) => {
      // Excluir mudanças para todas as cidades EXCETO Lisboa
      if (service.slug === "mudancas" && city.slug !== "lisboa") {
        return false;
      }
      // Incluir todas as outras combinações
      return true;
    }).map((service) => ({
      url: `${SITE_URL}/${getCityServiceSlug(service.slug, city.slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority:
        service.slug === "recolha-moveis" && city.slug === "lisboa"
          ? 0.97
          : service.slug === "recolha-moveis" && city.slug === "cascais"
            ? 0.94
          : service.slug === "recolha-moveis"
            ? 0.9
            : service.slug === "mudancas" && city.slug === "lisboa"
              ? 0.92
              : 0.85,
    })),
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
