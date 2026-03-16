import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import DeferredCookieConsent from "@/components/DeferredCookieConsent";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { TrpcProvider } from "@/components/TrpcProvider";
import {
  BUSINESS_ADDRESS,
  BUSINESS_EMAIL,
  BUSINESS_INSTAGRAM,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  REGIONS,
  SITE_URL,
} from "@/lib/seo-data";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Recolha de Entulho, Móveis e Monos em Lisboa e Margem Sul | CLYON",
    template: "%s | CLYON",
  },
  description:
    "Recolha de entulho, móveis velhos, monos, esvaziamentos, limpeza pós-obra e mudanças em Lisboa, Margem Sul e Setúbal. Orçamento rápido e resposta no mesmo dia.",
  keywords: [
    "recolha de entulho lisboa",
    "recolha de moveis lisboa",
    "recolha de monos margem sul",
    "limpeza pos obra lisboa",
    "mudancas margem sul",
    "esvaziamento de casas lisboa",
    "camiao com motorista lisboa",
  ],
  authors: [{ name: BUSINESS_NAME }],
  creator: BUSINESS_NAME,
  publisher: BUSINESS_NAME,
  category: "Serviços locais",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "pt-PT": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: SITE_URL,
    siteName: BUSINESS_NAME,
    title: "Recolha de Entulho, Móveis e Monos em Lisboa e Margem Sul | CLYON",
    description:
      "Serviço rápido para recolha de entulho, móveis, monos, limpeza pós-obra e mudanças em Lisboa, Margem Sul e Setúbal.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CLYON - Recolha de Entulho, Móveis e Monos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recolha de Entulho, Móveis e Monos em Lisboa e Margem Sul | CLYON",
    description:
      "Orçamento rápido para recolha de entulho, móveis, monos, mudanças e limpeza pós-obra.",
    images: ["/og-image.jpg"],
  },
  other: {
    "geo.region": "PT-11",
    "geo.placename": "Amora, Portugal",
    "geo.position": "38.6120;-9.1152",
    ICBM: "38.6120, -9.1152",
    language: "pt-PT",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HomeAndConstructionBusiness"],
  "@id": `${SITE_URL}/#localbusiness`,
  name: BUSINESS_NAME,
  url: SITE_URL,
  telephone: BUSINESS_PHONE,
  email: BUSINESS_EMAIL,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "Empresa especializada em recolha de entulho, móveis, monos, esvaziamento de casas, limpeza pós-obra e mudanças em Lisboa, Margem Sul e Setúbal.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua dos Jasmins 3",
    addressLocality: "Amora",
    addressRegion: "Setúbal",
    postalCode: "2845-513",
    addressCountry: "PT",
  },
  sameAs: [BUSINESS_INSTAGRAM],
  areaServed: REGIONS.map((region) => ({
    "@type": "AdministrativeArea",
    name: region.name,
  })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "20:00",
    },
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BUSINESS_PHONE,
    contactType: "customer service",
    areaServed: "PT",
    availableLanguage: ["pt-PT"],
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: BUSINESS_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo-clyon-icon.webp`,
  sameAs: [BUSINESS_INSTAGRAM],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    contactType: "customer service",
    areaServed: "PT",
    availableLanguage: ["pt-PT"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: BUSINESS_NAME,
  url: SITE_URL,
  inLanguage: "pt-PT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#00B4CC" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="address" content={BUSINESS_ADDRESS} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <TrpcProvider>
          <Header />
          <main className="pt-[64px]">{children}</main>
          <Footer />
          <DeferredCookieConsent />
        </TrpcProvider>
      </body>
    </html>
  );
}
