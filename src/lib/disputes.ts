import { quoteTotal } from './money.ts';
import type { AppData, Dispute, DisputeReason, DisputeStatus, PaymentStatus, Receipt } from './types.ts';
import { validateDisputeDraft, validateReceipt, type FieldErrors } from './validation.ts';

export interface OpenDisputeInput {
  receiptId: string;
  reason: string;
  description: string;
  now?: string;
}

export function openDispute(data: AppData, input: OpenDisputeInput): { ok: true; data: AppData; dispute: Dispute } | { ok: false; errors: FieldErrors } {
  const errors = validateDisputeDraft(input);
  const receipt = data.receipts.find((item) => item.id === input.receiptId);
  if (!receipt) errors.receiptId = 'No encontramos esa boleta en este navegador.';
  if (Object.keys(errors).length || !receipt) return { ok: false, errors };
  const now = input.now ?? receipt.createdAt;
  const dispute: Dispute = {
    id: crypto.randomUUID(),
    receiptId: receipt.id,
    folio: receipt.folio,
    reason: input.reason as DisputeReason,
    description: input.description.trim(),
    openedAt: now,
    status: 'abierta',
    resolutionNotes: '',
    resolvedAt: null,
    recoveredCentavos: 0,
    original: {
      weightKg: receipt.weightKg,
      pricePerKg: receipt.pricePerKg,
      totalCentavos: receipt.totalCentavos,
      paymentStatus: receipt.paymentStatus,
    },
    corrected: null,
    audit: [{ at: now, action: 'apertura', detail: 'Se abrió la aclaración. La boleta original no cambió.' }],
  };
  return { ok: true, dispute, data: { ...data, disputes: [dispute, ...data.disputes] } };
}

export interface ResolveInput {
  status: DisputeStatus;
  resolutionNotes: string;
  recoveredMxn: string;
  correctedWeightKg: string;
  correctedPricePerKg: string;
  correctedPaymentStatus: string;
  now?: string;
}

export function resolveDispute(data: AppData, disputeId: string, input: ResolveInput): { ok: true; data: AppData } | { ok: false; errors: FieldErrors } {
  const dispute = data.disputes.find((item) => item.id === disputeId);
  const errors: FieldErrors = {};
  if (!dispute) errors.disputeId = 'No encontramos la aclaración.';
  const notes = input.resolutionNotes.trim();
  if (notes.length > 500) errors.resolutionNotes = 'Las notas admiten hasta 500 caracteres.';
  if ((input.status === 'resuelta' || input.status === 'cerrada_sin_cambio') && notes.length < 5) {
    errors.resolutionNotes = 'Escribe una nota de resolución.';
  }
  let recoveredCentavos = 0;
  if (input.recoveredMxn.trim()) {
    const parsed = quoteTotal('1', input.recoveredMxn);
    if (!parsed || input.recoveredMxn.trim().startsWith('-')) errors.recoveredMxn = 'Escribe el monto recuperado en MXN, sin negativos.';
    else recoveredCentavos = Number(parsed.totalCentavos);
  }
  let corrected: Dispute['corrected'] = null;
  const wantsCorrection = input.correctedWeightKg.trim() || input.correctedPricePerKg.trim() || input.correctedPaymentStatus;
  if (wantsCorrection) {
    const weight = input.correctedWeightKg.trim() || dispute?.original.weightKg || '';
    const price = input.correctedPricePerKg.trim() || dispute?.original.pricePerKg || '';
    const payment = input.correctedPaymentStatus || dispute?.original.paymentStatus || 'pagado';
    const check = validateReceipt(
      {
        createdAt: '2026-01-01T10:00',
        yardName: 'Patio',
        recyclerAlias: '',
        material: 'PET',
        weightKg: weight,
        pricePerKg: price,
        scaleRef: '',
        notes: '',
        paymentStatus: payment,
        copyDelivered: false,
        operatorConfirmed: false,
        invoiceRef: '',
        evidenceStatus: 'sin_verificar',
        evidenceNote: '',
        imageLabel: '',
      },
      new Date('2026-12-31T00:00'),
    );
    if (!check.ok) {
      if (check.errors.weightKg) errors.correctedWeightKg = check.errors.weightKg;
      if (check.errors.pricePerKg) errors.correctedPricePerKg = check.errors.pricePerKg;
      if (check.errors.paymentStatus) errors.correctedPaymentStatus = check.errors.paymentStatus;
    } else {
      corrected = {
        weightKg: check.value.weightKg,
        pricePerKg: check.value.pricePerKg,
        totalCentavos: check.value.totalCentavos,
        paymentStatus: check.value.paymentStatus,
      };
    }
  }
  if (Object.keys(errors).length || !dispute) return { ok: false, errors };
  const at = input.now ?? dispute.openedAt;
  const next: Dispute = {
    ...dispute,
    status: input.status,
    resolutionNotes: notes,
    recoveredCentavos,
    corrected,
    resolvedAt: input.status === 'resuelta' || input.status === 'cerrada_sin_cambio' ? at : null,
    audit: [
      ...dispute.audit,
      {
        at,
        action: 'actualizacion',
        detail: `Estatus: ${input.status}. La boleta original permanece sin cambios.`,
      },
    ],
  };
  return {
    ok: true,
    data: {
      ...data,
      disputes: data.disputes.map((item) => (item.id === disputeId ? next : item)),
    },
  };
}

export function receiptUnchanged(before: Receipt, after: Receipt): boolean {
  return JSON.stringify(before) === JSON.stringify(after);
}

export function pilotShouldStop(harms: AppData['harms']): boolean {
  return harms.some((harm) => harm.category === 'represalia' || harm.category === 'exclusion' || harm.category === 'mal_uso');
}

export interface PilotMetrics {
  issued: number;
  delivered: number;
  deliveryRate: number | null;
  opened: number;
  resolved: number;
  medianResolutionMs: number | null;
  recoveredCentavos: number;
  yardsWithReceipts: number;
  adoptionRate: number | null;
  harms: number;
  stopped: boolean;
  fieldObservations: 0;
}

export function pilotMetrics(data: AppData): PilotMetrics {
  const delivered = data.receipts.filter((receipt) => receipt.copyDelivered).length;
  const resolved = data.disputes.filter((dispute) => dispute.resolvedAt && (dispute.status === 'resuelta' || dispute.status === 'cerrada_sin_cambio'));
  const durations = resolved
    .map((dispute) => new Date(dispute.resolvedAt ?? '').getTime() - new Date(dispute.openedAt).getTime())
    .filter((value) => Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);
  const medianResolutionMs = middleValue(durations);
  const recoveredCentavos = data.disputes
    .filter((dispute) => dispute.status === 'resuelta')
    .reduce((sum, dispute) => sum + dispute.recoveredCentavos, 0);
  const yardsWithReceipts = new Set(data.receipts.map((receipt) => receipt.yardName)).size;
  const assumedYards = data.scenarios[data.activeScenario].yards;
  return {
    issued: data.receipts.length,
    delivered,
    deliveryRate: data.receipts.length === 0 ? null : delivered / data.receipts.length,
    opened: data.disputes.length,
    resolved: resolved.length,
    medianResolutionMs,
    recoveredCentavos,
    yardsWithReceipts,
    adoptionRate: assumedYards <= 0 ? null : yardsWithReceipts / assumedYards,
    harms: data.harms.length,
    stopped: pilotShouldStop(data.harms),
    fieldObservations: 0,
  };
}

function middleValue(values: number[]): number | null {
  if (values.length === 0) return null;
  const mid = Math.floor(values.length / 2);
  if (values.length % 2 === 1) return values[mid] ?? null;
  return ((values[mid - 1] ?? 0) + (values[mid] ?? 0)) / 2;
}

export function addHarm(data: AppData, category: AppData['harms'][number]['category'], description: string, now: string): { ok: true; data: AppData } | { ok: false; error: string } {
  const text = description.trim();
  if (text.length < 10) return { ok: false, error: 'Describe el daño en al menos 10 caracteres, sin datos personales.' };
  if (text.length > 500) return { ok: false, error: 'La nota admite hasta 500 caracteres.' };
  return {
    ok: true,
    data: {
      ...data,
      harms: [
        {
          id: crypto.randomUUID(),
          at: now,
          category,
          description: text,
          simulated: true,
        },
        ...data.harms,
      ],
    },
  };
}

export type { PaymentStatus };
