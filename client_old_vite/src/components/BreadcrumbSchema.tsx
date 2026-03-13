import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  useEffect(() => {
    if (!items || items.length === 0) return;

    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    let schemaScript = document.getElementById('breadcrumb-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'breadcrumb-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }
  }, [items]);

  return null;
}
