import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Componente que adiciona tag canônica dinâmica baseada na URL atual
 * Garante que cada página tem sua própria tag canônica apontando para https://clyon.pt/...
 */
export function CanonicalURL() {
  const [location] = useLocation();

  useEffect(() => {
    // Remover tag canônica existente
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Criar nova tag canônica com URL atual
    const canonicalURL = `https://clyon.pt${location}`;
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalURL;
    document.head.appendChild(link);

    // Atualizar og:url para redes sociais
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalURL);
    }
  }, [location]);

  return null;
}
