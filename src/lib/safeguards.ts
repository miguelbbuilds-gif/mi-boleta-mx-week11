export const privacyGuarantees = {
  collectsGeolocation: false,
  scoresWorkers: false,
  ranksWorkersPublicly: false,
  requiresRfc: false,
  requiresBankAccount: false,
  requiresSmartphoneForPaperCopy: false,
  hiddenProfiles: false,
} as const;

export const SHADOW_CLAUSE = [
  'No calificamos ni ordenamos a las personas por confianza.',
  'Negarse a confirmar la copia no resta acceso ni genera una pena.',
  'La boleta sirve aunque nadie marque que recibió la copia.',
  'No hay geolocalización ni perfil oculto de comportamiento.',
  'Un patrocinador, en esta demo, solo puede ver cifras agregadas y sin alias.',
  'Cualquier filtro dice cuántas boletas oculta de la lista.',
] as const;
