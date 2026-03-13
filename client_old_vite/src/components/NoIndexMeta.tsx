import { useEffect } from 'react';

export function NoIndexMeta() {
  useEffect(() => {
    // Adicionar meta tag noindex ao head
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return null;
}
