/**
 * Extracts error message from Freesound API errors
 */
export function extractErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof XMLHttpRequest) {
    if (err.status === 401) {
      return 'Authentication failed. The API requires a valid OAuth2 token. Please check your credentials or authenticate via OAuth2.';
    }
    if (err.status === 400) {
      return 'Invalid request. Please check your API credentials.';
    }
    try {
      const response = JSON.parse(err.responseText || '{}');
      if (response.detail) {
        return `API Error: ${response.detail}`;
      }
    } catch {
      // Ignore parse errors
    }
  }
  return defaultMessage;
}

