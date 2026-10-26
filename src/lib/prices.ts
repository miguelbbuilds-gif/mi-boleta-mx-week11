export const MIN_PRICE_OBSERVATIONS = 5;

export interface PriceComparison {
  count: number;
  medianCentavos: number | null;
  offeredCentavos: number;
  differenceCentavos: number | null;
  percentTimes100: number | null;
  from: string | null;
  to: string | null;
  insufficient: boolean;
}

export function medianCentavos(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? null;
  const left = sorted[mid - 1] ?? 0;
  const right = sorted[mid] ?? 0;
  return Math.round((left + right) / 2);
}

export function compareOfferedPrice(offeredCentavos: number, observations: { at: string; priceCentavos: number }[]): PriceComparison {
  const prices = observations.map((item) => item.priceCentavos);
  const median = medianCentavos(prices);
  const dates = observations.map((item) => item.at).sort();
  const difference = median === null ? null : offeredCentavos - median;
  const percentTimes100 = median === null || median === 0 || difference === null ? null : Math.round((difference * 10_000) / median);
  return {
    count: observations.length,
    medianCentavos: median,
    offeredCentavos,
    differenceCentavos: difference,
    percentTimes100,
    from: dates[0] ?? null,
    to: dates[dates.length - 1] ?? null,
    insufficient: observations.length < MIN_PRICE_OBSERVATIONS,
  };
}
