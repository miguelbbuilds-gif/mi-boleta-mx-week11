export const MATERIALS = ['PET', 'Cartón', 'Aluminio', 'Cobre', 'Fierro', 'Vidrio', 'Otro'] as const;
export type Material = (typeof MATERIALS)[number];

export const PAYMENT_STATUSES = ['pagado', 'pendiente', 'parcial'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const DISPUTE_REASONS = ['peso', 'precio', 'total', 'pago', 'otro'] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const DISPUTE_STATUSES = ['abierta', 'en_revision', 'resuelta', 'cerrada_sin_cambio'] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const EVIDENCE_STATUSES = [
  'sin_verificar',
  'evidencia_registrada',
  'revision_pendiente',
  'inconsistencia_detectada',
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

export const HARM_CATEGORIES = ['represalia', 'exclusion', 'mal_uso', 'otro'] as const;
export type HarmCategory = (typeof HARM_CATEGORIES)[number];

export const SCENARIO_IDS = ['conservador', 'base', 'optimista'] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

export interface Evidence {
  scaleRef: string;
  operatorConfirmed: boolean;
  invoiceRef: string;
  status: EvidenceStatus;
  note: string;
  imageLabel: string;
}

export interface Receipt {
  id: string;
  folio: string;
  createdAt: string;
  yardName: string;
  recyclerAlias: string;
  material: Material;
  weightKg: string;
  pricePerKg: string;
  totalCentavos: number;
  notes: string;
  paymentStatus: PaymentStatus;
  copyDelivered: boolean;
  evidence: Evidence;
  origin: 'demo' | 'local';
}

export interface AuditEvent {
  at: string;
  action: string;
  detail: string;
}

export interface DisputeCorrection {
  weightKg: string;
  pricePerKg: string;
  totalCentavos: number;
  paymentStatus: PaymentStatus | '';
}

export interface Dispute {
  id: string;
  receiptId: string;
  folio: string;
  reason: DisputeReason;
  description: string;
  openedAt: string;
  status: DisputeStatus;
  resolutionNotes: string;
  resolvedAt: string | null;
  recoveredCentavos: number;
  original: {
    weightKg: string;
    pricePerKg: string;
    totalCentavos: number;
    paymentStatus: PaymentStatus;
  };
  corrected: DisputeCorrection | null;
  audit: AuditEvent[];
}

export interface HarmReport {
  id: string;
  at: string;
  category: HarmCategory;
  description: string;
  simulated: true;
}

export interface ModelInputs {
  yards: number;
  txPerYardPerDay: number;
  operatingDays: number;
  avgKg: string;
  avgPayPerKg: string;
  sponsorFeePerYard: string;
  setupCostPerYard: string;
  monthlyHosting: string;
  monthlySupport: string;
  costPerTransaction: string;
  pilotIncentivePerYard: string;
  disputeRatePct: string;
  resolutionRatePct: string;
  avgRecovered: string;
}

export interface AppData {
  version: 1;
  usingDemo: boolean;
  receipts: Receipt[];
  disputes: Dispute[];
  harms: HarmReport[];
  nextFolio: number;
  scenarios: Record<ScenarioId, ModelInputs>;
  activeScenario: ScenarioId;
}

export interface ReceiptDraft {
  createdAt: string;
  yardName: string;
  recyclerAlias: string;
  material: string;
  weightKg: string;
  pricePerKg: string;
  scaleRef: string;
  notes: string;
  paymentStatus: string;
  copyDelivered: boolean;
  operatorConfirmed: boolean;
  invoiceRef: string;
  evidenceStatus: string;
  evidenceNote: string;
  imageLabel: string;
}
