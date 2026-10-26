import { describe, expect, it } from 'vitest';
import { formatMXN, compactSpaces } from './format.ts';
import { quoteTotal, totalCentavosFromGrams } from './money.ts';

describe('cálculo de boleta', () => {
  it('multiplica kilos por precio', () => {
    const quote = quoteTotal('12.5', '8.50');
    expect(quote).not.toBeNull();
    expect(Number(quote?.totalCentavos)).toBe(10625);
    expect(compactSpaces(formatMXN(10625))).toContain('106.25');
  });

  it('redondea al centavo, mitad hacia arriba', () => {
    expect(totalCentavosFromGrams(500n, 1n)).toBe(1n);
    expect(totalCentavosFromGrams(499n, 1n)).toBe(0n);
    expect(Number(quoteTotal('1', '8.50')?.totalCentavos)).toBe(850);
    expect(Number(quoteTotal('0.1', '0.20')?.totalCentavos)).toBe(2);
  });
});
