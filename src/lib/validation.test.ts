import { describe, expect, it } from 'vitest';
import { emptyDraft, validateReceipt } from './validation.ts';

const now = new Date('2026-10-20T15:00');

function draft(patch: Partial<ReturnType<typeof emptyDraft>> = {}) {
  return { ...emptyDraft(now), weightKg: '4', pricePerKg: '8.50', ...patch };
}

describe('validación', () => {
  it('rechaza peso cero', () => {
    const result = validateReceipt(draft({ weightKg: '0' }), now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.weightKg).toMatch(/mayor que cero/);
  });

  it('rechaza precio negativo', () => {
    const result = validateReceipt(draft({ pricePerKg: '-8' }), now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.pricePerKg).toMatch(/negativo/);
  });

  it('rechaza fecha imposible, alias con RFC y texto enorme', () => {
    const badDate = validateReceipt(draft({ createdAt: '2026-02-31T10:00' }), now);
    const future = validateReceipt(draft({ createdAt: '2026-12-01T10:00' }), now);
    const rfc = validateReceipt(draft({ recyclerAlias: 'XAXX010101000' }), now);
    const huge = validateReceipt(draft({ notes: 'a'.repeat(501) }), now);
    expect(badDate.ok).toBe(false);
    expect(future.ok).toBe(false);
    expect(rfc.ok).toBe(false);
    expect(huge.ok).toBe(false);
  });
});
