/**
 * Utilitários gerais do backend
 */
export function formatErrorResponse(message: string, details?: unknown) {
  return {
    error: message,
    ...(details ? { details } : {}),
  };
}

export function isValidIsoDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
