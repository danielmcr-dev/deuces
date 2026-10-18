import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Deuces` : 'Deuces — Tennis for fans';
  }, [title]);
}
