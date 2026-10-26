import { SAMPLE_TEXTS, extractReceiptSuggestions, sanitizeSuggestionInput } from '../../shared/interpret.mjs';

export { SAMPLE_TEXTS, extractReceiptSuggestions, sanitizeSuggestionInput };

export interface Interpretation {
  mode: 'simulacion' | 'llm';
  fallback: boolean;
  disclaimer: string;
  suggestions: Record<string, string>;
  unmatched: string[];
}

export function localSimulation(text: string): Interpretation {
  const extracted = extractReceiptSuggestions(text);
  return {
    mode: 'simulacion',
    fallback: true,
    disclaimer:
      'SIMULACIÓN: estas sugerencias salen de reglas fijas en este navegador. No es un modelo de lenguaje y no cambian una boleta ya guardada.',
    suggestions: extracted.suggestions,
    unmatched: extracted.unmatched,
  };
}

export function acceptInterpretation(raw: string, sourceText: string): Interpretation {
  const local = localSimulation(sourceText);
  try {
    const parsed = JSON.parse(raw) as {
      mode?: unknown;
      fallback?: unknown;
      disclaimer?: unknown;
      suggestions?: unknown;
      unmatched?: unknown;
    };
    if (parsed.mode !== 'simulacion' && parsed.mode !== 'llm') return local;
    const suggestions = sanitizeSuggestionInput(parsed.suggestions);
    const unmatched = Array.isArray(parsed.unmatched)
      ? parsed.unmatched.filter((item): item is string => typeof item === 'string')
      : local.unmatched;
    if (parsed.mode === 'llm') {
      return {
        mode: 'llm',
        fallback: false,
        disclaimer:
          typeof parsed.disclaimer === 'string'
            ? parsed.disclaimer
            : 'Sugerencia de un modelo configurado en el servidor. No se aplica sola. El total lo calcula este sistema, no el modelo.',
        suggestions,
        unmatched,
      };
    }
    const disclaimer =
      typeof parsed.disclaimer === 'string' && parsed.disclaimer.toUpperCase().includes('SIMULACIÓN')
        ? parsed.disclaimer
        : local.disclaimer;
    return { mode: 'simulacion', fallback: true, disclaimer, suggestions, unmatched };
  } catch {
    return local;
  }
}

export function applySuggestions<T extends Record<string, string>>(current: T, suggestions: Partial<T>, confirmed: boolean): T {
  if (!confirmed) return current;
  const next = { ...current };
  for (const [key, value] of Object.entries(suggestions)) {
    if (key === 'total' || key === 'totalCentavos') continue;
    if (typeof value === 'string' && value.trim()) next[key as keyof T] = value as T[keyof T];
  }
  return next;
}
