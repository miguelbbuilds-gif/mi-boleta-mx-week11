import { SAMPLE_TEXTS, extractReceiptSuggestions, sanitizeSuggestionInput } from '../../shared/interpret.mjs';

export { SAMPLE_TEXTS, extractReceiptSuggestions, sanitizeSuggestionInput };

export function applySuggestions<T extends Record<string, string>>(current: T, suggestions: Partial<T>, confirmed: boolean): T {
  if (!confirmed) return current;
  const next = { ...current };
  for (const [key, value] of Object.entries(suggestions)) {
    if (key === 'total' || key === 'totalCentavos') continue;
    if (typeof value === 'string' && value.trim()) next[key as keyof T] = value as T[keyof T];
  }
  return next;
}
