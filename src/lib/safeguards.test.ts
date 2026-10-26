import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { applySuggestions, extractReceiptSuggestions, sanitizeSuggestionInput } from './interpret.ts';
import { privacyGuarantees } from './safeguards.ts';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    if (!/\.(ts|tsx)$/.test(path) || /\.test\.(ts|tsx)$/.test(path)) return [];
    return [path];
  });
}

describe('salvaguardas', () => {
  it('no califica personas ni declara perfiles ocultos', () => {
    expect(privacyGuarantees.scoresWorkers).toBe(false);
    expect(privacyGuarantees.ranksWorkersPublicly).toBe(false);
    expect(privacyGuarantees.hiddenProfiles).toBe(false);
    expect(privacyGuarantees.requiresRfc).toBe(false);
  });

  it('el código de la aplicación no pide geolocalización', () => {
    const blob = sourceFiles(join(process.cwd(), 'src'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    expect(blob).not.toContain('navigator.geolocation');
    expect(blob).not.toContain('getCurrentPosition');
    expect(blob).not.toMatch(/trustScore|workerScore|rankingScore/);
    expect(privacyGuarantees.collectsGeolocation).toBe(false);
  });

  it('una sugerencia no se aplica sola ni puede fijar el total', () => {
    const extracted = extractReceiptSuggestions('Material: PET\nPeso: 12.5 kg\nPrecio: 8.50 por kilo\nAlias: Don Ernesto');
    expect(extracted.suggestions.material).toBe('PET');
    expect(extracted.suggestions.weightKg).toBe('12.5');
    expect(extracted.suggestions).not.toHaveProperty('total');
    const current = { weightKg: '1', pricePerKg: '2', total: '0' };
    expect(applySuggestions(current, { weightKg: '9', total: '999' }, false)).toEqual(current);
    const applied = applySuggestions(current, { weightKg: '9', total: '999' }, true);
    expect(applied.weightKg).toBe('9');
    expect(applied.total).toBe('0');
    expect(sanitizeSuggestionInput({ total: '50', weightKg: '3', latitude: '19.4' })).toEqual({ weightKg: '3' });
  });
});
