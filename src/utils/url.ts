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

/**
 * Builds user profile URL with page parameter
 */
export function buildUserUrl(username: string, page: number): string {
  if (page > 1) {
    return `/user/${encodeURIComponent(username)}?page=${page}`;
  }
  return `/user/${encodeURIComponent(username)}`;
}

/**
 * Builds tag search URL with page parameter
 */
export function buildTagUrl(tagName: string, page: number): string {
  if (page > 1) {
    return `/tag/${encodeURIComponent(tagName)}?page=${page}`;
  }
  return `/tag/${encodeURIComponent(tagName)}`;
}
