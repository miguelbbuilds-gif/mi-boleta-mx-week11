import { describe, expect, it } from 'vitest';
import { buildDemoData } from './demoData.ts';
import { openDispute, pilotShouldStop, resolveDispute } from './disputes.ts';

describe('aclaraciones', () => {
  it('abre una aclaración y conserva la boleta original', () => {
    const data = buildDemoData();
    const receipt = data.receipts[0];
    if (!receipt) throw new Error('sin boleta');
    const before = structuredClone(receipt);
    const opened = openDispute(data, {
      receiptId: receipt.id,
      reason: 'peso',
      description: 'El peso se ve distinto en la báscula.',
      now: '2026-10-01T10:00',
    });
    expect(opened.ok).toBe(true);
    if (!opened.ok) return;
    expect(opened.data.receipts.find((item) => item.id === receipt.id)).toEqual(before);
    expect(opened.data.disputes[0]?.original.totalCentavos).toBe(before.totalCentavos);
  });

  it('una resolución tampoco modifica la boleta', () => {
    const data = buildDemoData();
    const receipt = data.receipts[4];
    if (!receipt) throw new Error('sin boleta');
    const opened = openDispute(data, {
      receiptId: receipt.id,
      reason: 'total',
      description: 'Quiero revisar la multiplicación del total.',
      now: '2026-10-02T10:00',
    });
    if (!opened.ok) throw new Error('no abrió');
    const resolved = resolveDispute(opened.data, opened.dispute.id, {
      status: 'resuelta',
      resolutionNotes: 'Se anota un peso distinto solo aquí.',
      recoveredMxn: '15.50',
      correctedWeightKg: '5',
      correctedPricePerKg: receipt.pricePerKg,
      correctedPaymentStatus: '',
      now: '2026-10-04T10:00',
    });
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.data.receipts.find((item) => item.id === receipt.id)).toEqual(receipt);
    const dispute = resolved.data.disputes.find((item) => item.id === opened.dispute.id);
    expect(dispute?.corrected?.weightKg).toBe('5');
    expect(dispute?.recoveredCentavos).toBe(1550);
    expect(dispute?.original.weightKg).toBe(receipt.weightKg);
  });

  it('la regla de paro no depende de un puntaje', () => {
    expect(pilotShouldStop([])).toBe(false);
    expect(pilotShouldStop([{ id: '1', at: '2026-10-01T10:00', category: 'represalia', description: 'ensayo', simulated: true }])).toBe(true);
    expect(pilotShouldStop([{ id: '2', at: '2026-10-01T10:00', category: 'otro', description: 'nota', simulated: true }])).toBe(false);
  });
});
