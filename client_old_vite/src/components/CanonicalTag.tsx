import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function CanonicalTag() {
  const [location] = useLocation();

  useEffect(() => {
    // Remover canonical anterior se existir
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Criar novo canonical tag com base na rota atual
    const canonicalUrl = `https://clyon.pt${location === '/' ? '' : location}`;
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);

    return () => {
      // Cleanup não é necessário pois o próximo useEffect removerá
    };
  }, [location]);

  return null;
}
