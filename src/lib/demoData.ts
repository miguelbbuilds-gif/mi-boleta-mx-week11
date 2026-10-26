import { quoteTotal } from './money.ts';
import { cloneScenarios } from './model.ts';
import type { AppData, Dispute, EvidenceStatus, Material, PaymentStatus, Receipt } from './types.ts';

const ALIASES = ['Don Ernesto', 'Alias Nube', 'Alias Río', 'Alias Sol', 'Alias Palma', 'Alias Barrio', ''];
const YARDS = ['Acopio Esperanza (demo)', 'Patio Norte ficticio'];
const MATERIALS: Material[] = ['PET', 'Cartón', 'Aluminio', 'PET', 'Fierro', 'Cartón', 'Vidrio', 'Cobre', 'Aluminio', 'Otro'];
const PRICES: Record<Material, string[]> = {
  PET: ['7.50', '8.00', '8.50', '9.20', '6.80'],
  Cartón: ['1.80', '2.00', '2.20', '2.40', '1.50'],
  Aluminio: ['24.00', '26.50', '28.00', '31.00', '22.00'],
  Cobre: ['138.00', '145.00', '152.50', '160.00'],
  Fierro: ['5.50', '6.00', '6.80', '7.20'],
  Vidrio: ['0.80', '1.00', '1.20', '1.50'],
  Otro: ['3.00', '4.50', '5.00', '8.00'],
};
const WEIGHTS: Record<Material, string[]> = {
  PET: ['6.000', '8.500', '12.500', '18.000', '4.250'],
  Cartón: ['15.000', '22.000', '35.000', '40.000', '9.500'],
  Aluminio: ['2.000', '3.400', '5.800', '7.250'],
  Cobre: ['0.800', '1.250', '2.400', '3.100'],
  Fierro: ['18.000', '25.000', '40.000', '12.500'],
  Vidrio: ['10.000', '16.000', '21.500', '8.000'],
  Otro: ['5.000', '7.500', '11.000', '3.200'],
};
const STATUSES: PaymentStatus[] = ['pagado', 'pagado', 'pagado', 'pendiente', 'parcial', 'pagado', 'pagado'];
const EVIDENCE: EvidenceStatus[] = ['evidencia_registrada', 'sin_verificar', 'revision_pendiente', 'evidencia_registrada', 'sin_verificar'];

function addDays(start: string, days: number): string {
  const [year, month, day] = start.split('-').map(Number);
  const date = new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildReceipts(): Receipt[] {
  const receipts: Receipt[] = [];
  for (let index = 0; index < 30; index += 1) {
    const material = MATERIALS[index % MATERIALS.length] ?? 'PET';
    const weights = WEIGHTS[material];
    const prices = PRICES[material];
    const weightKg = weights[index % weights.length] ?? '1.000';
    const pricePerKg = prices[index % prices.length] ?? '1.00';
    const quote = quoteTotal(weightKg, pricePerKg);
    if (!quote) throw new Error('La demo produjo un cálculo inválido.');
    const day = addDays('2026-03-03', index * 8);
    const hour = [9, 11, 13, 16][index % 4];
    const folio = `MBX-2026-${String(index + 1).padStart(4, '0')}`;
    const copyDelivered = ![6, 13, 20, 27].includes(index);
    const inconsistent = index === 11;
    receipts.push({
      id: folio,
      folio,
      createdAt: `${day}T${String(hour).padStart(2, '0')}:${index % 2 === 0 ? '10' : '40'}`,
      yardName: YARDS[index % YARDS.length] ?? YARDS[0],
      recyclerAlias: ALIASES[index % ALIASES.length] ?? '',
      material,
      weightKg: weightKg.replace(/\.?0+$/, (end) => (end.startsWith('.') ? '' : end)),
      pricePerKg,
      totalCentavos: Number(quote.totalCentavos),
      notes: inconsistent
        ? 'La lectura manual y la referencia de báscula no coinciden. Se conserva el peso escrito. No es una acusación.'
        : material === 'Otro'
          ? 'Mezcla de plástico rígido, dato ficticio.'
          : '',
      paymentStatus: index > 26 ? 'pendiente' : (STATUSES[index % STATUSES.length] ?? 'pagado'),
      copyDelivered,
      origin: 'demo',
      evidence: {
        scaleRef: index % 3 === 0 ? `BSC-${index + 1}` : '',
        operatorConfirmed: index % 4 === 0,
        invoiceRef: index % 5 === 0 ? `FAC-DEMO-${index + 1}` : '',
        status: inconsistent ? 'inconsistencia_detectada' : (EVIDENCE[index % EVIDENCE.length] ?? 'sin_verificar'),
        note: inconsistent ? 'Diferencia anotada entre el ticket de báscula y el peso capturado. Hace falta revisión humana.' : '',
        imageLabel: '',
      },
    });
  }
  return receipts;
}

function dispute(receipt: Receipt, partial: Omit<Dispute, 'receiptId' | 'folio' | 'original'>): Dispute {
  return {
    ...partial,
    receiptId: receipt.id,
    folio: receipt.folio,
    original: {
      weightKg: receipt.weightKg,
      pricePerKg: receipt.pricePerKg,
      totalCentavos: receipt.totalCentavos,
      paymentStatus: receipt.paymentStatus,
    },
  };
}

export function buildDemoData(): AppData {
  const receipts = buildReceipts();
  const pet = receipts[2];
  const price = receipts[11];
  const pending = receipts[20];
  const closed = receipts[24];
  if (!pet || !price || !pending || !closed) throw new Error('Faltan boletas de demo.');
  const correctedQuote = quoteTotal('14', pet.pricePerKg);
  if (!correctedQuote) throw new Error('No se pudo calcular la corrección de demo.');
  const disputes: Dispute[] = [
    dispute(pet, {
      id: 'acl-demo-1',
      reason: 'peso',
      description: 'Don Ernesto recuerda más kilos de PET que los escritos en la boleta. Dato ficticio.',
      openedAt: '2026-03-20T10:00',
      status: 'resuelta',
      resolutionNotes: 'Se anotó un peso corregido solo en la aclaración. La boleta original sigue igual.',
      resolvedAt: '2026-03-22T15:00',
      recoveredCentavos: Number(correctedQuote.totalCentavos) - pet.totalCentavos,
      corrected: {
        weightKg: '14',
        pricePerKg: pet.pricePerKg,
        totalCentavos: Number(correctedQuote.totalCentavos),
        paymentStatus: pet.paymentStatus,
      },
      audit: [
        { at: '2026-03-20T10:00', action: 'apertura', detail: 'Se abrió la aclaración. La boleta original no cambió.' },
        { at: '2026-03-22T15:00', action: 'resolucion', detail: 'Se registró una corrección aparte y un monto recuperado de demostración.' },
      ],
    }),
    dispute(price, {
      id: 'acl-demo-2',
      reason: 'precio',
      description: 'El precio anotado no coincide con el que se dijo en el patio. Dato ficticio.',
      openedAt: '2026-06-02T11:00',
      status: 'en_revision',
      resolutionNotes: '',
      resolvedAt: null,
      recoveredCentavos: 0,
      corrected: null,
      audit: [{ at: '2026-06-02T11:00', action: 'apertura', detail: 'Quedó en revisión. No hay veredicto de fraude.' }],
    }),
    dispute(pending, {
      id: 'acl-demo-3',
      reason: 'pago',
      description: 'La boleta quedó pendiente y la persona quiere una fecha de pago. Dato ficticio.',
      openedAt: '2026-08-12T09:30',
      status: 'abierta',
      resolutionNotes: '',
      resolvedAt: null,
      recoveredCentavos: 0,
      corrected: null,
      audit: [{ at: '2026-08-12T09:30', action: 'apertura', detail: 'Aclaración abierta por pago pendiente.' }],
    }),
    dispute(closed, {
      id: 'acl-demo-4',
      reason: 'total',
      description: 'Se revisó la multiplicación y el total coincidió. Dato ficticio.',
      openedAt: '2026-09-15T13:00',
      status: 'cerrada_sin_cambio',
      resolutionNotes: 'El total calculado coincide con kilos por precio. No hubo ajuste.',
      resolvedAt: '2026-09-18T13:00',
      recoveredCentavos: 0,
      corrected: null,
      audit: [
        { at: '2026-09-15T13:00', action: 'apertura', detail: 'Se pidió revisar el total.' },
        { at: '2026-09-18T13:00', action: 'cierre', detail: 'Se cerró sin cambiar la boleta.' },
      ],
    }),
  ];
  return {
    version: 1,
    usingDemo: true,
    receipts,
    disputes,
    harms: [],
    nextFolio: 31,
    scenarios: cloneScenarios(),
    activeScenario: 'base',
  };
}

export function blankData(): AppData {
  return {
    version: 1,
    usingDemo: false,
    receipts: [],
    disputes: [],
    harms: [],
    nextFolio: 1,
    scenarios: cloneScenarios(),
    activeScenario: 'base',
  };
}
