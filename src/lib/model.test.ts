import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENARIOS, calculateModel, marginSeries } from './model.ts';
import type { ModelInputs } from './types.ts';

describe('modelo de negocio', () => {
  it('separa el ingreso del patrocinador y el costo operativo del escenario base', () => {
    const result = calculateModel(DEFAULT_SCENARIOS.base);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.monthlySponsorCentavos).toBe(3_600_000);
    expect(result.result.monthlyOperatingCentavos).toBe(1_705_600);
    expect(result.result.monthlyMarginCentavos).toBe(1_894_400);
    expect(result.result.monthlyMaterialCentavos).not.toBe(result.result.monthlySponsorCentavos);
  });

  it('calcula el equilibrio en 3 patios para el escenario base', () => {
    const result = calculateModel(DEFAULT_SCENARIOS.base);
    if (!result.ok) throw new Error('modelo inválido');
    expect(result.result.breakEvenYards).toBe(3);
    const series = marginSeries(DEFAULT_SCENARIOS.base);
    const before = series.find((point) => point.yards === 2);
    const at = series.find((point) => point.yards === 3);
    expect(before && before.marginCentavos).toBeLessThan(0);
    expect(at && at.marginCentavos).toBeGreaterThanOrEqual(0);
  });

  it('con cuota cero el ingreso de plataforma es cero aunque el material valga', () => {
    const inputs: ModelInputs = {
      ...DEFAULT_SCENARIOS.base,
      yards: 4,
      sponsorFeePerYard: '0',
      pilotIncentivePerYard: '0',
      costPerTransaction: '0',
      monthlyHosting: '100',
      monthlySupport: '0',
      setupCostPerYard: '0',
      disputeRatePct: '0',
      resolutionRatePct: '0',
      avgRecovered: '0',
    };
    const result = calculateModel(inputs);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.result.monthlySponsorCentavos).toBe(0);
    expect(result.result.monthlyMaterialCentavos).toBeGreaterThan(0);
    expect(result.result.monthlyMarginCentavos).toBeLessThan(0);
    expect(result.result.breakEvenYards).toBeNull();
  });

  it('cambiar de escenario no mezcla los supuestos', () => {
    const base = calculateModel(DEFAULT_SCENARIOS.base);
    const optimistic = calculateModel(DEFAULT_SCENARIOS.optimista);
    const conservative = calculateModel(DEFAULT_SCENARIOS.conservador);
    if (!base.ok || !optimistic.ok || !conservative.ok) throw new Error('escenario inválido');
    expect(optimistic.result.monthlySponsorCentavos).toBeGreaterThan(base.result.monthlySponsorCentavos);
    expect(base.result.monthlySponsorCentavos).toBeGreaterThan(conservative.result.monthlySponsorCentavos);
    expect(DEFAULT_SCENARIOS.base.yards).toBe(8);
  });

  it('más patios empeoran el margen si no hay cuota y sí hay costo variable', () => {
    const inputs: ModelInputs = {
      ...DEFAULT_SCENARIOS.base,
      sponsorFeePerYard: '0',
      pilotIncentivePerYard: '0',
      costPerTransaction: '2',
      monthlyHosting: '0',
      monthlySupport: '0',
    };
    const one = calculateModel({ ...inputs, yards: 1 });
    const five = calculateModel({ ...inputs, yards: 5 });
    if (!one.ok || !five.ok) throw new Error('modelo inválido');
    expect(five.result.monthlyMarginCentavos).toBeLessThan(one.result.monthlyMarginCentavos);
    expect(one.result.monthlySponsorCentavos).toBe(0);
  });
});
