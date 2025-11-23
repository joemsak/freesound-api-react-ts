/**
 * Builds search URL with query and page parameters
 */
export function buildSearchUrl(query: string, page: number): string {
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
  }
  if (page > 1) {
    params.set('page', page.toString());
  }
  return `/?${params.toString()}`;
}

