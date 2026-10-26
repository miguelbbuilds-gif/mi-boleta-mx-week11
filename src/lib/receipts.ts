import { formatFolio, quoteTotal } from './money.ts';
import type { AppData, Dispute, Material, PaymentStatus, Receipt, ReceiptDraft } from './types.ts';
import { validateReceipt } from './validation.ts';

export interface ReceiptFilters {
  query: string;
  material: Material | 'todos';
  status: PaymentStatus | 'todos';
  from: string;
  to: string;
  sort: 'fecha_desc' | 'fecha_asc' | 'monto_desc' | 'monto_asc';
}

export const EMPTY_FILTERS: ReceiptFilters = {
  query: '',
  material: 'todos',
  status: 'todos',
  from: '',
  to: '',
  sort: 'fecha_desc',
};

export function filterReceipts(receipts: Receipt[], filters: ReceiptFilters): { rows: Receipt[]; excluded: number } {
  const query = filters.query.trim().toLowerCase();
  const rows = receipts.filter((receipt) => {
    if (query && !`${receipt.folio} ${receipt.recyclerAlias}`.toLowerCase().includes(query)) return false;
    if (filters.material !== 'todos' && receipt.material !== filters.material) return false;
    if (filters.status !== 'todos' && receipt.paymentStatus !== filters.status) return false;
    const day = receipt.createdAt.slice(0, 10);
    if (filters.from && day < filters.from) return false;
    if (filters.to && day > filters.to) return false;
    return true;
  });
  const sorted = [...rows].sort((a, b) => {
    if (filters.sort === 'fecha_asc') return a.createdAt.localeCompare(b.createdAt);
    if (filters.sort === 'monto_desc') return b.totalCentavos - a.totalCentavos;
    if (filters.sort === 'monto_asc') return a.totalCentavos - b.totalCentavos;
    return b.createdAt.localeCompare(a.createdAt);
  });
  return { rows: sorted, excluded: receipts.length - sorted.length };
}

export function filterDisclosure(filters: ReceiptFilters, excluded: number): string | null {
  const active = filters.query || filters.material !== 'todos' || filters.status !== 'todos' || filters.from || filters.to;
  if (!active) return null;
  return `La búsqueda compara folio y alias. Los filtros ocultan ${excluded} boleta${excluded === 1 ? '' : 's'} de esta lista. No las borran, no las excluyen del patio y no califican a nadie. Quita los filtros para ver el archivo completo.`;
}

export interface Summary {
  count: number;
  grams: bigint;
  documentedCentavos: number;
  paidCentavos: number;
  paidGrams: bigint;
  averagePaidPerKgCentavos: number | null;
  materials: number;
}

export function summarize(receipts: Receipt[]): Summary {
  let grams = 0n;
  let documented = 0;
  let paidCentavos = 0;
  let paidGrams = 0n;
  const materials = new Set<string>();
  for (const receipt of receipts) {
    const quote = quoteTotal(receipt.weightKg, receipt.pricePerKg);
    const rowGrams = quote?.grams ?? 0n;
    grams += rowGrams;
    documented += receipt.totalCentavos;
    materials.add(receipt.material);
    if (receipt.paymentStatus === 'pagado') {
      paidCentavos += receipt.totalCentavos;
      paidGrams += rowGrams;
    }
  }
  return {
    count: receipts.length,
    grams,
    documentedCentavos: documented,
    paidCentavos,
    paidGrams,
    averagePaidPerKgCentavos: paidGrams === 0n ? null : Number((BigInt(paidCentavos) * 1000n) / paidGrams),
    materials: materials.size,
  };
}

export interface MonthBucket {
  month: string;
  label: string;
  count: number;
  centavos: number;
}

export function monthlySeries(receipts: Receipt[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>();
  for (const receipt of receipts) {
    const month = receipt.createdAt.slice(0, 7);
    const current = map.get(month) ?? { month, label: month, count: 0, centavos: 0 };
    current.count += 1;
    current.centavos += receipt.totalCentavos;
    map.set(month, current);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export interface MaterialBucket {
  material: string;
  grams: number;
}

export function materialSeries(receipts: Receipt[]): MaterialBucket[] {
  const map = new Map<string, number>();
  for (const receipt of receipts) {
    const quote = quoteTotal(receipt.weightKg, receipt.pricePerKg);
    map.set(receipt.material, (map.get(receipt.material) ?? 0) + Number(quote?.grams ?? 0n));
  }
  return [...map.entries()]
    .map(([material, grams]) => ({ material, grams }))
    .sort((a, b) => b.grams - a.grams);
}

export function createReceipt(data: AppData, draft: ReceiptDraft, now = new Date()): { ok: true; data: AppData; receipt: Receipt } | { ok: false; errors: Record<string, string> } {
  const validated = validateReceipt(draft, now);
  if (!validated.ok) return validated;
  const year = Number(validated.value.createdAt.slice(0, 4));
  const receipt: Receipt = {
    id: crypto.randomUUID(),
    folio: formatFolio(data.nextFolio, year),
    createdAt: validated.value.createdAt,
    yardName: validated.value.yardName,
    recyclerAlias: validated.value.recyclerAlias,
    material: validated.value.material,
    weightKg: validated.value.weightKg,
    pricePerKg: validated.value.pricePerKg,
    totalCentavos: validated.value.totalCentavos,
    notes: validated.value.notes,
    paymentStatus: validated.value.paymentStatus,
    copyDelivered: validated.value.copyDelivered,
    evidence: validated.value.evidence,
    origin: 'local',
  };
  return {
    ok: true,
    receipt,
    data: {
      ...data,
      receipts: [receipt, ...data.receipts],
      nextFolio: data.nextFolio + 1,
    },
  };
}

export function updateEvidence(data: AppData, receiptId: string, evidence: Receipt['evidence']): AppData {
  return {
    ...data,
    receipts: data.receipts.map((receipt) => (receipt.id === receiptId ? { ...receipt, evidence } : receipt)),
  };
}

export function sponsorAggregate(receipts: Receipt[]) {
  const summary = summarize(receipts);
  return {
    transacciones: summary.count,
    kilosGramos: summary.grams.toString(),
    valorDocumentadoCentavos: summary.documentedCentavos,
    pagadoCentavos: summary.paidCentavos,
    materiales: summary.materials,
    aviso: 'Agregado sin alias, sin historial individual y sin ubicación.',
  };
}

export function disputesFor(disputes: Dispute[], receiptId: string): Dispute[] {
  return disputes.filter((dispute) => dispute.receiptId === receiptId);
}
