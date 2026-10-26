export function formatMXN(centavos: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centavos / 100);
}

export function formatKg(value: string | number): string {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return '—';
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 }).format(numeric)} kg`;
}

export function formatGramsAsKg(grams: bigint): string {
  const whole = grams / 1000n;
  const frac = (grams % 1000n).toString().padStart(3, '0').replace(/0+$/, '');
  const body = frac ? `${whole.toString()}.${frac}` : whole.toString();
  return formatKg(body);
}

export function formatWhen(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] ?? 0), Number(match[5] ?? 0));
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: match[4] ? 'short' : undefined,
  }).format(date);
}

export function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  return new Intl.DateTimeFormat('es-MX', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

export function formatDuration(ms: number): string {
  const hours = Math.round(ms / 36e5);
  if (hours < 48) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} días`;
}

export function localDateTimeInputValue(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function compactSpaces(value: string): string {
  return value.replace(/\s/g, '');
}
