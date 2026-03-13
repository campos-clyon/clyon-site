/**
 * Schema.org Markup Component
 * Adiciona JSON-LD para melhorar SEO e rich snippets no Google
 */

export function SchemaMarkup() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "CLYON",
    "description": "Serviços profissionais de limpeza, recolha de entulho e mudanças em Portugal",
    "url": "https://clyon.pt",
    "telephone": "+351 931 632 622",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua dos Jasmins 3, Belverde",
      "addressLocality": "Amora",
      "addressRegion": "Setúbal",
      "postalCode": "2845-513",
      "addressCountry": "PT"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "14:00"
      }
    ],
    "areaServed": [
      {
        "@type": "City",
        "name": "Lisboa"
      },
      {
        "@type": "City",
        "name": "Setúbal"
      },
      {
        "@type": "City",
        "name": "Margem Sul"
      }
    ],
    "image": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/tRXSEwxhtDnPrizK.png",
    "priceRange": "€€",
    "ratingValue": "5.0",
    "reviewCount": "163",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "163"
    },
    "sameAs": [
      "https://www.facebook.com/clyon",
      "https://www.instagram.com/clyon",
      "https://www.linkedin.com/company/clyon"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CLYON",
    "url": "https://clyon.pt",
    "logo": "https://files.manuscdn.com/user_upload_by_module/session_file/310519663108032375/tRXSEwxhtDnPrizK.png",
    "description": "Empresa de limpeza profissional, recolha de entulho e mudanças",
    "sameAs": [
      "https://www.facebook.com/clyon",
      "https://www.instagram.com/clyon"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "telephone": "+351 931 632 622",
      "availableLanguage": ["Portuguese"]
    }
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Serviços de Limpeza e Recolha de Entulho",
    "description": "Serviços profissionais de limpeza, recolha de entulho, mudanças e transporte",
    "provider": {
      "@type": "LocalBusiness",
      "name": "CLYON"
    },
    "areaServed": [
      "Lisboa",
      "Setúbal",
      "Margem Sul"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços CLYON",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Recolha de Móveis"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Recolha de Entulho"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Mudanças"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Recolha de Monos"
          }
        }
      ]
    }
  };

  // FAQPage removido - usar FAQSchema.tsx ou CentralAjuda.tsx para dados estruturados de FAQ
  // Isso evita duplicação de FAQPage que causa erro no Google Search Console

  return (
    <>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

    </>
  );
}
