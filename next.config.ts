import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async redirects() {
    return [
      // Redirect orçamento para simulador
      {
        source: "/orcamento",
        destination: "/simulador",
        permanent: true,
      },
      {
        source: "/orçamento",
        destination: "/simulador",
        permanent: true,
      },
      // URLs antigas deprecated
      {
        source: "/contato",
        destination: "/contactos",
        permanent: true,
      },
      {
        source: "/avaliacoes-clientes",
        destination: "/avaliacoes",
        permanent: true,
      },
      {
        source: "/central-ajuda",
        destination: "/faq",
        permanent: true,
      },
      {
        source: "/credito-fiscal",
        destination: "/contactos",
        permanent: true,
      },
      {
        source: "/recolha-moveis-parque-das-nacoes",
        destination: "/recolha-moveis-lisboa",
        permanent: true,
      },
      // Redirects de mudanças fracas para hub principal
      {
        source: "/mudancas-alcochete",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-sintra",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-montijo",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-carnaxide",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-oeiras",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-corroios",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-barreiro",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-palmela",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-odivelas",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-lumiar",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-sesimbra",
        destination: "/mudancas",
        permanent: true,
      },
      {
        source: "/mudancas-costa-da-caparica",
        destination: "/mudancas",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
      {
        source: "/site.webmanifest",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
