import { useEffect } from "react";

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  logo?: string;
  telephone?: string;
  sameAs?: string[];
}

export default function OrganizationSchema({
  name = "CLYON",
  description = "Serviço de recolha de móveis, entulho e limpeza em Portugal",
  url = "https://clyon.pt",
  logo = "https://clyon.pt/logo-clyon-icon.webp",
  telephone = "+351931632622",
  sameAs = [
    "https://www.facebook.com/clyon",
    "https://www.instagram.com/clyon",
    "https://www.linkedin.com/company/clyon"
  ]
}: OrganizationSchemaProps) {
  useEffect(() => {
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": name,
      "description": description,
      "url": url,
      "logo": logo,
      "telephone": telephone,
      "sameAs": sameAs
    };

    let schemaScript = document.getElementById('organization-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'organization-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }
  }, [name, description, url, logo, telephone, sameAs]);

  return null;
}
