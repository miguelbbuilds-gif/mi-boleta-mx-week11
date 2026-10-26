import { quoteTotal } from './money.ts';
import {
  DISPUTE_REASONS,
  EVIDENCE_STATUSES,
  MATERIALS,
  PAYMENT_STATUSES,
  type DisputeReason,
  type Evidence,
  type EvidenceStatus,
  type Material,
  type PaymentStatus,
  type ReceiptDraft,
} from './types.ts';

export type FieldErrors = Record<string, string>;

const TEXT_OK = /^[\p{L}\p{N}\s.'()/_-]{0,80}$/u;

export function findForbiddenIdentifier(value: string): string | null {
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) return 'un correo';
  if (/\b[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}\b/i.test(value)) return 'un RFC';
  const compact = value.replace(/[\s-]/g, '');
  if (/\d{16,18}/.test(compact)) return 'una cuenta o tarjeta';
  if (/\d{10,13}/.test(compact)) return 'un teléfono';
  return null;
}

function forbid(value: string, label: string): string | null {
  const found = findForbiddenIdentifier(value);
  if (!found) return null;
  return `${label} parece incluir ${found}. Esta demo no guarda RFC, teléfono, correo ni datos bancarios.`;
}

export function parseLocalDateTime(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || hour > 23 || minute > 59 || year < 2020 || year > 2100) return null;
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export interface ValidReceiptFields {
  createdAt: string;
  yardName: string;
  recyclerAlias: string;
  material: Material;
  weightKg: string;
  pricePerKg: string;
  notes: string;
  paymentStatus: PaymentStatus;
  copyDelivered: boolean;
  evidence: Evidence;
  totalCentavos: number;
}

export function validateReceipt(draft: ReceiptDraft, now = new Date()): { ok: true; value: ValidReceiptFields } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const created = parseLocalDateTime(draft.createdAt);
  if (!created) errors.createdAt = 'Escribe una fecha y hora válidas.';
  else if (created.getTime() > now.getTime() + 60_000) errors.createdAt = 'La fecha no puede estar en el futuro.';

  const yardName = draft.yardName.trim();
  if (!yardName) errors.yardName = 'Escribe el nombre del patio o centro de acopio.';
  else if (yardName.length > 80) errors.yardName = 'El nombre del patio es demasiado largo (máximo 80).';
  else if (!TEXT_OK.test(yardName)) errors.yardName = 'Usa letras y números. Evita símbolos raros.';
  else {
    const blocked = forbid(yardName, 'El patio');
    if (blocked) errors.yardName = blocked;
  }

  const recyclerAlias = draft.recyclerAlias.trim();
  if (recyclerAlias.length > 40) errors.recyclerAlias = 'El alias es demasiado largo (máximo 40).';
  else if (recyclerAlias && !/^[\p{L}\p{N}\s.'-]{2,40}$/u.test(recyclerAlias)) {
    errors.recyclerAlias = 'El alias solo puede tener letras, números y espacios.';
  } else {
    const blocked = forbid(recyclerAlias, 'El alias');
    if (blocked) errors.recyclerAlias = blocked;
  }

  if (!MATERIALS.includes(draft.material as Material)) errors.material = 'Elige un material de la lista.';

  if (draft.weightKg.trim().startsWith('-')) errors.weightKg = 'El peso no puede ser negativo.';
  if (draft.pricePerKg.trim().startsWith('-')) errors.pricePerKg = 'El precio no puede ser negativo.';

  const quote = quoteTotal(draft.weightKg, draft.pricePerKg);
  if (!errors.weightKg) {
    if (quote === null && draft.weightKg.trim()) errors.weightKg = 'Escribe el peso en kilos, con hasta 3 decimales. Ejemplo: 12.5';
    else if (!draft.weightKg.trim()) errors.weightKg = 'El peso es obligatorio.';
    else if (quote && quote.grams === 0n) errors.weightKg = 'El peso debe ser mayor que cero.';
    else if (quote && quote.grams > 5_000_000n) errors.weightKg = 'El peso máximo en esta demo es 5,000 kg.';
  }
  if (!errors.pricePerKg) {
    if (quote === null && draft.pricePerKg.trim()) errors.pricePerKg = 'Escribe el precio por kilo en MXN, con hasta 2 decimales.';
    else if (!draft.pricePerKg.trim()) errors.pricePerKg = 'El precio por kilo es obligatorio.';
    else if (quote && quote.priceCentavos > 500_000n) errors.pricePerKg = 'El precio máximo en esta demo es 5,000 MXN por kilo.';
  }

  const notes = draft.notes.trim();
  if (notes.length > 500) errors.notes = 'Las notas admiten hasta 500 caracteres.';
  else {
    const blocked = forbid(notes, 'Las notas');
    if (blocked) errors.notes = blocked;
  }
  if (draft.material === 'Otro' && notes.length < 3) {
    errors.notes = 'Si el material es Otro, descríbelo en las notas.';
  }

  if (!PAYMENT_STATUSES.includes(draft.paymentStatus as PaymentStatus)) {
    errors.paymentStatus = 'Elige el estado del pago.';
  }

  const scaleRef = draft.scaleRef.trim();
  const invoiceRef = draft.invoiceRef.trim();
  const imageLabel = draft.imageLabel.trim();
  const evidenceNote = draft.evidenceNote.trim();
  if (scaleRef.length > 40 || (scaleRef && !/^[A-Za-z0-9._\-\s]+$/.test(scaleRef))) {
    errors.scaleRef = 'La referencia de báscula admite hasta 40 letras, números y guiones.';
  }
  if (invoiceRef.length > 40 || (invoiceRef && !/^[A-Za-z0-9._\-\s]+$/.test(invoiceRef))) {
    errors.invoiceRef = 'La referencia de factura admite hasta 40 letras, números y guiones.';
  }
  if (imageLabel.length > 40) errors.imageLabel = 'La referencia de imagen admite hasta 40 caracteres.';
  if (evidenceNote.length > 500) errors.evidenceNote = 'La nota de evidencia admite hasta 500 caracteres.';
  const blockedEvidence = forbid(`${scaleRef} ${invoiceRef} ${imageLabel} ${evidenceNote}`, 'La evidencia');
  if (blockedEvidence) errors.evidenceNote = blockedEvidence;

  if (!EVIDENCE_STATUSES.includes(draft.evidenceStatus as EvidenceStatus)) {
    errors.evidenceStatus = 'Elige un estado de evidencia.';
  }
  if (draft.evidenceStatus === 'inconsistencia_detectada' && evidenceNote.length < 10) {
    errors.evidenceNote = 'Explica la inconsistencia. Una marca sin explicación no se guarda.';
  }

  if (Object.keys(errors).length > 0 || !quote || !created) return { ok: false, errors };

  const normalizedWeight = formatWeight(quote.grams);
  const normalizedPrice = formatPrice(quote.priceCentavos);

  return {
    ok: true,
    value: {
      createdAt: draft.createdAt,
      yardName,
      recyclerAlias,
      material: draft.material as Material,
      weightKg: normalizedWeight,
      pricePerKg: normalizedPrice,
      notes,
      paymentStatus: draft.paymentStatus as PaymentStatus,
      copyDelivered: draft.copyDelivered,
      totalCentavos: Number(quote.totalCentavos),
      evidence: {
        scaleRef,
        operatorConfirmed: draft.operatorConfirmed,
        invoiceRef,
        status: draft.evidenceStatus as EvidenceStatus,
        note: evidenceNote,
        imageLabel,
      },
    },
  };
}

function formatWeight(grams: bigint): string {
  const whole = grams / 1000n;
  const frac = (grams % 1000n).toString().padStart(3, '0').replace(/0+$/, '');
  return frac ? `${whole.toString()}.${frac}` : whole.toString();
}

function formatPrice(centavos: bigint): string {
  const whole = centavos / 100n;
  const frac = (centavos % 100n).toString().padStart(2, '0');
  return `${whole.toString()}.${frac}`;
}

export function validateDisputeDraft(input: { receiptId: string; reason: string; description: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.receiptId) errors.receiptId = 'Elige la boleta que quieres aclarar.';
  if (!DISPUTE_REASONS.includes(input.reason as DisputeReason)) errors.reason = 'Elige un motivo.';
  const description = input.description.trim();
  if (description.length < 10) errors.description = 'Describe lo ocurrido en al menos 10 caracteres.';
  if (description.length > 500) errors.description = 'La descripción admite hasta 500 caracteres.';
  const blocked = forbid(description, 'La descripción');
  if (blocked) errors.description = blocked;
  return errors;
}

export function emptyDraft(now = new Date()): ReceiptDraft {
  const pad = (n: number) => String(n).padStart(2, '0');
  const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return {
    createdAt,
    yardName: 'Acopio Esperanza (demo)',
    recyclerAlias: '',
    material: 'PET',
    weightKg: '',
    pricePerKg: '',
    scaleRef: '',
    notes: '',
    paymentStatus: 'pagado',
    copyDelivered: false,
    operatorConfirmed: false,
    invoiceRef: '',
    evidenceStatus: 'sin_verificar',
    evidenceNote: '',
    imageLabel: '',
  };
}
