import { useEffect } from 'react';

/**
 * Hook to update document title
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const baseTitle = 'Freesound API';
    document.title = title ? `${title} - ${baseTitle}` : baseTitle;

    return () => {
      document.title = baseTitle;
    };
  }, [title]);
}

