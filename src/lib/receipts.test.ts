import { describe, expect, it } from 'vitest';
import { buildDemoData, blankData } from './demoData.ts';
import { quoteTotal } from './money.ts';
import { EMPTY_FILTERS, createReceipt, filterDisclosure, filterReceipts, sponsorAggregate } from './receipts.ts';
import { emptyDraft } from './validation.ts';

describe('boletas', () => {
  it('crea una boleta con el total calculado', () => {
    const now = new Date('2026-10-20T12:00');
    const result = createReceipt(blankData(), { ...emptyDraft(now), weightKg: '12.5', pricePerKg: '8.50', recyclerAlias: 'Don Ernesto' }, now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.receipt.folio).toBe('MBX-2026-0001');
    expect(result.receipt.totalCentavos).toBe(10625);
    expect(result.data.receipts).toHaveLength(1);
  });

  it('no crea boletas con peso cero o precio negativo', () => {
    const now = new Date('2026-10-20T12:00');
    const zero = createReceipt(blankData(), { ...emptyDraft(now), weightKg: '0', pricePerKg: '8' }, now);
    const negative = createReceipt(blankData(), { ...emptyDraft(now), weightKg: '2', pricePerKg: '-1' }, now);
    expect(zero.ok).toBe(false);
    expect(negative.ok).toBe(false);
  });

  it('filtra por material y avisa cuántas oculta', () => {
    const data = buildDemoData();
    const filtered = filterReceipts(data.receipts, { ...EMPTY_FILTERS, material: 'PET', query: 'MBX' });
    expect(filtered.rows.length).toBeGreaterThan(0);
    expect(filtered.rows.every((row) => row.material === 'PET')).toBe(true);
    expect(filtered.excluded).toBe(data.receipts.length - filtered.rows.length);
    expect(filterDisclosure({ ...EMPTY_FILTERS, material: 'PET' }, filtered.excluded)).toMatch(/ocultan/);
  });

  it('la demo cuadra kilos por precio y no rankea personas', () => {
    const data = buildDemoData();
    expect(data.receipts.length).toBeGreaterThanOrEqual(25);
    for (const receipt of data.receipts) {
      expect(Number(quoteTotal(receipt.weightKg, receipt.pricePerKg)?.totalCentavos)).toBe(receipt.totalCentavos);
    }
    expect(Object.keys(sponsorAggregate(data.receipts)).join(' ')).not.toMatch(/alias|score|latitud/i);
  });
});
