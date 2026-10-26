export interface SuggestionSet {
  suggestions: Partial<
    Record<
      'material' | 'weightKg' | 'pricePerKg' | 'recyclerAlias' | 'yardName' | 'paymentStatus' | 'notes',
      string
    >
  >;
  unmatched: string[];
}

export interface SampleText {
  id: string;
  label: string;
  text: string;
}

export function extractReceiptSuggestions(text: string): SuggestionSet;

export function interpretReceipt(
  text: string,
  options?: { apiKey?: string; model?: string; fetchImpl?: typeof fetch },
): Promise<{
  mode: 'simulacion' | 'llm';
  fallback: boolean;
  disclaimer: string;
  suggestions: SuggestionSet['suggestions'];
  unmatched: string[];
}>;

export function sanitizeSuggestionInput(input: unknown): SuggestionSet['suggestions'];

export const SAMPLE_TEXTS: SampleText[];
