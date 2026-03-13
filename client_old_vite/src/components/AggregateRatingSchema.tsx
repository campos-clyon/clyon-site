import { useEffect } from "react";

interface AggregateRatingSchemaProps {
  ratingValue: number; // 0-5
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export default function AggregateRatingSchema({
  ratingValue,
  reviewCount,
  bestRating = 5,
  worstRating = 1
}: AggregateRatingSchemaProps) {
  useEffect(() => {
    const schemaMarkup = {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "bestRating": bestRating,
      "worstRating": worstRating,
      "reviewCount": reviewCount
    };

    let schemaScript = document.getElementById('aggregate-rating-schema') as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'aggregate-rating-schema';
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaMarkup);
      document.head.appendChild(schemaScript);
    }
  }, [ratingValue, reviewCount, bestRating, worstRating]);

  return null;
}
