import { useEffect } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export default function FAQSchema({ faqs }: FAQSchemaProps) {
  useEffect(() => {
    if (!faqs || faqs.length === 0) return;

    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    let schemaScript = document.getElementById('faq-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'faq-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }
  }, [faqs]);

  return null;
}
