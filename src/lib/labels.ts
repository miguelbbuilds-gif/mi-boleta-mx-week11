import type { DisputeReason, DisputeStatus, EvidenceStatus, HarmCategory, PaymentStatus, ScenarioId } from './types.ts';

export const paymentLabel: Record<PaymentStatus, string> = {
  pagado: 'Pagado',
  pendiente: 'Pendiente',
  parcial: 'Pago parcial',
};

export const disputeReasonLabel: Record<DisputeReason, string> = {
  peso: 'Peso incorrecto',
  precio: 'Precio incorrecto',
  total: 'Total incorrecto',
  pago: 'Pago pendiente',
  otro: 'Otro',
};

export const disputeStatusLabel: Record<DisputeStatus, string> = {
  abierta: 'Abierta',
  en_revision: 'En revisión',
  resuelta: 'Resuelta',
  cerrada_sin_cambio: 'Cerrada sin cambio',
};

export const evidenceLabel: Record<EvidenceStatus, string> = {
  sin_verificar: 'Sin verificar',
  evidencia_registrada: 'Evidencia registrada',
  revision_pendiente: 'Revisión pendiente',
  inconsistencia_detectada: 'Inconsistencia detectada',
};

export const harmLabel: Record<HarmCategory, string> = {
  represalia: 'Represalia',
  exclusion: 'Exclusión',
  mal_uso: 'Mal uso',
  otro: 'Otro',
};

export const scenarioLabel: Record<ScenarioId, string> = {
  conservador: 'Conservador',
  base: 'Base',
  optimista: 'Optimista',
};
