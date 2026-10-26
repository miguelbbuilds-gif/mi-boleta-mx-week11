import { bigintToNumber, parseScaled, totalCentavosFromGrams } from './money.ts';
import type { ModelInputs, ScenarioId } from './types.ts';

export interface ModelResult {
  monthlyTransactions: number;
  monthlyGrams: bigint;
  monthlyMaterialCentavos: number;
  monthlySponsorCentavos: number;
  monthlyOperatingCentavos: number;
  monthlyMarginCentavos: number;
  contributionPerYardCentavos: number;
  fixedCentavos: number;
  variablePerYardCentavos: number;
  breakEvenYards: number | null;
  breakEvenReason: string;
  recoveredCentavos: number;
  costPerKgCentavos: number | null;
  sponsorCostPerKgCentavos: number | null;
  setupTotalCentavos: number;
  setupRecoveryMonths: number | null;
}

export interface MarginPoint {
  yards: number;
  marginCentavos: number;
}

const base: ModelInputs = {
  yards: 8,
  txPerYardPerDay: 15,
  operatingDays: 24,
  avgKg: '9.5',
  avgPayPerKg: '11.00',
  sponsorFeePerYard: '4500',
  setupCostPerYard: '3500',
  monthlyHosting: '1200',
  monthlySupport: '6000',
  costPerTransaction: '1.20',
  pilotIncentivePerYard: '800',
  disputeRatePct: '6',
  resolutionRatePct: '65',
  avgRecovered: '48',
};

export const DEFAULT_SCENARIOS: Record<ScenarioId, ModelInputs> = {
  conservador: {
    yards: 3,
    txPerYardPerDay: 8,
    operatingDays: 22,
    avgKg: '6',
    avgPayPerKg: '7.50',
    sponsorFeePerYard: '2500',
    setupCostPerYard: '4000',
    monthlyHosting: '800',
    monthlySupport: '3500',
    costPerTransaction: '1.50',
    pilotIncentivePerYard: '500',
    disputeRatePct: '8',
    resolutionRatePct: '50',
    avgRecovered: '35',
  },
  base,
  optimista: {
    yards: 20,
    txPerYardPerDay: 25,
    operatingDays: 26,
    avgKg: '12',
    avgPayPerKg: '14.00',
    sponsorFeePerYard: '7000',
    setupCostPerYard: '2500',
    monthlyHosting: '2000',
    monthlySupport: '9000',
    costPerTransaction: '0.80',
    pilotIncentivePerYard: '400',
    disputeRatePct: '4',
    resolutionRatePct: '80',
    avgRecovered: '60',
  },
};

export const MODEL_FORMULAS = {
  volume: 'Transacciones del mes = patios × transacciones por patio al día × días de operación.',
  kilograms: 'Kilos documentados = transacciones del mes × kilos promedio por boleta.',
  material: 'Valor del material = kilos documentados × pago promedio por kilo. Este dinero es del reciclador y del patio. No es ingreso de la plataforma.',
  sponsor: 'Ingreso del patrocinador = patios × cuota mensual por patio. Es un supuesto, no un contrato firmado.',
  operating:
    'Costo operativo del mes = hospedaje + soporte + (transacciones × costo por transacción) + (patios × incentivo piloto). El costo de arranque no entra en este mensual.',
  margin: 'Margen de contribución = ingreso del patrocinador − costo operativo del mes.',
  breakEven:
    'Patios de equilibrio = costos fijos mensuales ÷ (cuota por patio − costo variable por patio), redondeado hacia arriba. Si la cuota no cubre el costo variable, no hay equilibrio.',
  recovered:
    'Beneficio estimado por aclaraciones = transacciones × porcentaje aclarado × porcentaje resuelto × monto promedio recuperado. Es un supuesto, no un resultado observado.',
  costPerKg: 'Costo por kilo documentado = costo operativo del mes ÷ kilos documentados.',
  sponsorPerKg: 'Costo del patrocinador por kilo = ingreso supuesto del patrocinador ÷ kilos documentados.',
} as const;

function money(raw: string, label: string, errors: string[]): bigint | null {
  if (raw.trim().startsWith('-')) {
    errors.push(`${label} no puede ser negativo.`);
    return null;
  }
  const parsed = parseScaled(raw, 2);
  if (parsed === null) {
    errors.push(`${label} debe ser un monto en MXN con hasta 2 decimales.`);
    return null;
  }
  if (parsed > 100_000_000n) {
    errors.push(`${label} es demasiado alto para esta demo.`);
    return null;
  }
  return parsed;
}

function percent(raw: string, label: string, errors: string[]): bigint | null {
  if (raw.trim().startsWith('-')) {
    errors.push(`${label} no puede ser negativo.`);
    return null;
  }
  const parsed = parseScaled(raw, 2);
  if (parsed === null || parsed > 10_000n) {
    errors.push(`${label} debe estar entre 0 y 100, con hasta 2 decimales.`);
    return null;
  }
  return parsed;
}

function whole(value: number, label: string, max: number, errors: string[]): number | null {
  if (!Number.isInteger(value) || value < 0 || value > max) {
    errors.push(`${label} debe ser un entero entre 0 y ${max}.`);
    return null;
  }
  return value;
}

export function calculateModel(inputs: ModelInputs): { ok: true; result: ModelResult } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const yards = whole(inputs.yards, 'El número de patios', 500, errors);
  const tx = whole(inputs.txPerYardPerDay, 'Las transacciones por patio', 500, errors);
  const days = whole(inputs.operatingDays, 'Los días de operación', 31, errors);
  const avgGrams = parseScaled(inputs.avgKg, 3);
  if (inputs.avgKg.trim().startsWith('-') || avgGrams === null || avgGrams > 5_000_000n) {
    errors.push('Los kilos promedio deben ser un número entre 0 y 5,000, con hasta 3 decimales.');
  }
  const pay = money(inputs.avgPayPerKg, 'El pago promedio por kilo', errors);
  const fee = money(inputs.sponsorFeePerYard, 'La cuota del patrocinador', errors);
  const setup = money(inputs.setupCostPerYard, 'El costo de arranque', errors);
  const hosting = money(inputs.monthlyHosting, 'El hospedaje', errors);
  const support = money(inputs.monthlySupport, 'El soporte', errors);
  const perTx = money(inputs.costPerTransaction, 'El costo por transacción', errors);
  const incentive = money(inputs.pilotIncentivePerYard, 'El incentivo piloto', errors);
  const disputeBps = percent(inputs.disputeRatePct, 'El porcentaje de aclaraciones', errors);
  const resolutionBps = percent(inputs.resolutionRatePct, 'El porcentaje resuelto', errors);
  const recoveredEach = money(inputs.avgRecovered, 'El monto recuperado', errors);

  if (errors.length || yards === null || tx === null || days === null || avgGrams === null || pay === null || fee === null || setup === null || hosting === null || support === null || perTx === null || incentive === null || disputeBps === null || resolutionBps === null || recoveredEach === null) {
    return { ok: false, errors };
  }

  const monthlyTx = BigInt(yards) * BigInt(tx) * BigInt(days);
  const monthlyGrams = monthlyTx * avgGrams;
  const material = totalCentavosFromGrams(monthlyGrams, pay);
  const sponsor = BigInt(yards) * fee;
  const variablePerYard = BigInt(tx) * BigInt(days) * perTx + incentive;
  const fixed = hosting + support;
  const operating = fixed + BigInt(yards) * variablePerYard;
  const margin = sponsor - operating;
  const contribution = fee - variablePerYard;
  const setupTotal = BigInt(yards) * setup;
  const recovered = (monthlyTx * disputeBps * resolutionBps * recoveredEach) / 10_000n / 10_000n;

  let breakEvenYards: number | null = null;
  let breakEvenReason: string;
  if (contribution < 0n) {
    breakEvenReason = 'La cuota no cubre el costo variable de un patio. Sumar patios aumenta la pérdida. No hay punto de equilibrio.';
  } else if (contribution === 0n) {
    breakEvenYards = fixed === 0n ? 0 : null;
    breakEvenReason = fixed === 0n
      ? 'Sin costos fijos ni aporte por patio, el margen es cero en cualquier escala.'
      : 'Cada patio cubre solo su costo variable y no aporta a hospedaje ni soporte. Los costos fijos no se recuperan.';
  } else if (fixed === 0n) {
    breakEvenYards = 0;
    breakEvenReason = 'No hay costos fijos mensuales. Con cuota mayor al costo variable, el primer patio ya deja margen.';
  } else {
    breakEvenYards = bigintToNumber((fixed + contribution - 1n) / contribution);
    breakEvenReason = 'Número de patios para cubrir hospedaje, soporte y el costo variable de cada patio con la cuota supuesta.';
  }

  const costPerKg = monthlyGrams === 0n ? null : bigintToNumber((operating * 1000n) / monthlyGrams);
  const sponsorPerKg = monthlyGrams === 0n ? null : bigintToNumber((sponsor * 1000n) / monthlyGrams);
  const setupRecoveryMonths = margin > 0n ? Math.trunc(bigintToNumber((setupTotal * 100n) / margin)) / 100 : null;

  return {
    ok: true,
    result: {
      monthlyTransactions: bigintToNumber(monthlyTx),
      monthlyGrams,
      monthlyMaterialCentavos: bigintToNumber(material),
      monthlySponsorCentavos: bigintToNumber(sponsor),
      monthlyOperatingCentavos: bigintToNumber(operating),
      monthlyMarginCentavos: bigintToNumber(margin),
      contributionPerYardCentavos: bigintToNumber(contribution),
      fixedCentavos: bigintToNumber(fixed),
      variablePerYardCentavos: bigintToNumber(variablePerYard),
      breakEvenYards,
      breakEvenReason,
      recoveredCentavos: bigintToNumber(recovered),
      costPerKgCentavos: costPerKg,
      sponsorCostPerKgCentavos: sponsorPerKg,
      setupTotalCentavos: bigintToNumber(setupTotal),
      setupRecoveryMonths,
    },
  };
}

export function marginSeries(inputs: ModelInputs, upper?: number): MarginPoint[] {
  const current = calculateModel(inputs);
  if (!current.ok) return [];
  const breakEven = current.result.breakEvenYards ?? 0;
  const max = upper ?? Math.min(40, Math.max(inputs.yards, breakEven + 3, 8));
  const points: MarginPoint[] = [];
  for (let yards = 0; yards <= max; yards += 1) {
    const next = calculateModel({ ...inputs, yards });
    if (next.ok) points.push({ yards, marginCentavos: next.result.monthlyMarginCentavos });
  }
  return points;
}

export function cloneScenarios(): Record<ScenarioId, ModelInputs> {
  return {
    conservador: { ...DEFAULT_SCENARIOS.conservador },
    base: { ...DEFAULT_SCENARIOS.base },
    optimista: { ...DEFAULT_SCENARIOS.optimista },
  };
}
