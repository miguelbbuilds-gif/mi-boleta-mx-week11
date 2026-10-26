import { describe, expect, it } from 'vitest';
import { buildDemoData } from './demoData.ts';
import { receiptsToCsv } from './export.ts';
import { deleteLocalState, loadState, resetDemoState, saveState, withScenario } from './storage.ts';

function memory() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe('archivo local', () => {
  it('restaura la demo', () => {
    const data = resetDemoState();
    expect(data.usingDemo).toBe(true);
    expect(data.receipts.length).toBeGreaterThanOrEqual(25);
    expect(data.disputes.length).toBeGreaterThanOrEqual(3);
  });

  it('borra los registros locales y conserva el modelo editable', () => {
    const empty = deleteLocalState();
    expect(empty.receipts).toHaveLength(0);
    expect(empty.disputes).toHaveLength(0);
    expect(empty.usingDemo).toBe(false);
    expect(empty.scenarios.base.yards).toBe(8);
  });

  it('guarda y vuelve a leer sin inventar un servidor', () => {
    const store = memory();
    const demo = buildDemoData();
    saveState(withScenario(demo, 'base', { sponsorFeePerYard: '999' }), store);
    const loaded = loadState(store);
    expect(loaded.scenarios.base.sponsorFeePerYard).toBe('999');
    expect(loaded.scenarios.optimista.sponsorFeePerYard).not.toBe('999');
  });

  it('exporta CSV con folio y aviso de archivo no certificado', () => {
    const csv = receiptsToCsv(buildDemoData().receipts);
    expect(csv).toContain('folio');
    expect(csv).toContain('MBX-2026-0001');
    expect(csv).toContain('archivo-local-no-certificado');
  });
});
