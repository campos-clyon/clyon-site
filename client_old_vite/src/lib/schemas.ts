// Generated schema.org JSON-LD schemas for CLYON

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CLYON",
  "image": "https://clyon.pt/logo-clyon-icon.png",
  "description": "Serviço profissional de recolha de móveis, entulho, monos e limpeza pós-obra em Lisboa e Setúbal",
  "url": "https://clyon.pt",
  "telephone": "+351931632622",
  "email": "info@clyon.pt",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Rua da Recolha, 123",
    "addressLocality": "Lisboa",
    "addressRegion": "Lisboa",
    "postalCode": "1000-000",
    "addressCountry": "PT"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "38.7223",
    "longitude": "-9.1393"
  },
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
      "name": "Almada"
    },
    {
      "@type": "City",
      "name": "Cascais"
    }
  ],
  "priceRange": "€€",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "08:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.facebook.com/clyon",
    "https://www.instagram.com/clyon"
  ]
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "CLYON",
  "url": "https://clyon.pt",
  "logo": "https://clyon.pt/logo-clyon-icon.png",
  "description": "Empresa de recolha profissional e limpeza",
  "sameAs": [
    "https://www.facebook.com/clyon",
    "https://www.instagram.com/clyon"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "telephone": "+351931632622",
    "email": "info@clyon.pt"
  }
};

export const ratingSchema = {
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "ratingValue": "5.0",
  "ratingCount": "150",
  "bestRating": "5",
  "worstRating": "1"
};

export const serviceSchema = (serviceName: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": serviceName,
  "description": description,
  "provider": {
    "@type": "Organization",
    "name": "CLYON",
    "url": "https://clyon.pt"
  },
  "areaServed": {
    "@type": "Country",
    "name": "PT"
  },
  "priceRange": "€€"
});

export const breadcrumbSchema = (items: Array<{name: string; url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const faqSchema = (faqs: Array<{question: string; answer: string}>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
