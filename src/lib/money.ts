const KG_DECIMALS = 3;
const MONEY_DECIMALS = 2;

export function parseScaled(raw: string, decimals: number): bigint | null {
  const trimmed = raw.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, frac = ''] = trimmed.split('.');
  if (whole.length > 9 || frac.length > decimals) return null;
  const padded = frac.padEnd(decimals, '0');
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || '0');
}

export function formatScaled(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const abs = negative ? -value : value;
  const scale = 10n ** BigInt(decimals);
  const whole = abs / scale;
  const frac = (abs % scale).toString().padStart(decimals, '0');
  const body = decimals === 0 ? whole.toString() : `${whole.toString()}.${frac}`;
  return negative ? `-${body}` : body;
}

export function bigintToNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new Error('Cifra fuera de rango seguro.');
  }
  return Number(value);
}

/** Kilograms × price per kilogram, rounded half-up to centavos. */
export function totalCentavosFromGrams(grams: bigint, priceCentavos: bigint): bigint {
  if (grams < 0n || priceCentavos < 0n) {
    throw new Error('Los valores no pueden ser negativos.');
  }
  return (grams * priceCentavos + 500n) / 1000n;
}

export interface Quote {
  grams: bigint;
  priceCentavos: bigint;
  totalCentavos: bigint;
}

export function quoteTotal(weightKg: string, pricePerKg: string): Quote | null {
  const grams = parseScaled(weightKg, KG_DECIMALS);
  const priceCentavos = parseScaled(pricePerKg, MONEY_DECIMALS);
  if (grams === null || priceCentavos === null) return null;
  return {
    grams,
    priceCentavos,
    totalCentavos: totalCentavosFromGrams(grams, priceCentavos),
  };
}

export function formatFolio(sequence: number, year: number): string {
  return `MBX-${year}-${String(sequence).padStart(4, '0')}`;
}

export { KG_DECIMALS, MONEY_DECIMALS };
