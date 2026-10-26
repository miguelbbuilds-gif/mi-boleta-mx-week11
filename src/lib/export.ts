import { formatMXN, formatWhen } from './format.ts';
import { paymentLabel } from './labels.ts';
import type { Receipt } from './types.ts';

export function receiptPlainText(receipt: Receipt): string {
  const lines = [
    'MI BOLETA MX',
    'Copia de demostración. No es un comprobante certificado ni una factura.',
    `Folio: ${receipt.folio}`,
    `Fecha: ${formatWhen(receipt.createdAt)}`,
    `Patio: ${receipt.yardName}`,
    `Alias: ${receipt.recyclerAlias || 'Sin alias'}`,
    `Material: ${receipt.material}`,
    `Peso: ${receipt.weightKg} kg`,
    `Precio: ${formatMXN(Math.round(Number(receipt.pricePerKg) * 100))} por kg`,
    `Total: ${formatMXN(receipt.totalCentavos)}`,
    `Cálculo: ${receipt.weightKg} kg × ${receipt.pricePerKg} MXN`,
    `Pago: ${paymentLabel[receipt.paymentStatus]}`,
    `Copia entregada: ${receipt.copyDelivered ? 'sí' : 'no (la boleta sigue siendo válida)'}`,
    receipt.evidence.scaleRef ? `Referencia de báscula: ${receipt.evidence.scaleRef}` : 'Referencia de báscula: no anotada',
    'Aclaración: conserva este folio y pide la revisión en el patio. También puedes abrirla en Aclaraciones.',
    'No se necesita RFC, cuenta bancaria ni teléfono inteligente para guardar el papel.',
  ];
  return lines.join('\n');
}

export function receiptsToCsv(receipts: Receipt[]): string {
  const header = [
    'folio',
    'fecha',
    'patio',
    'alias',
    'material',
    'kg',
    'precio_mxn_por_kg',
    'total_mxn',
    'estatus_pago',
    'copia_entregada',
    'estatus_evidencia',
    'origen',
    'aviso',
  ];
  const rows = receipts.map((receipt) => [
    receipt.folio,
    receipt.createdAt,
    receipt.yardName,
    receipt.recyclerAlias,
    receipt.material,
    receipt.weightKg,
    receipt.pricePerKg,
    (receipt.totalCentavos / 100).toFixed(2),
    receipt.paymentStatus,
    receipt.copyDelivered ? 'si' : 'no',
    receipt.evidence.status,
    receipt.origin,
    'archivo-local-no-certificado',
  ]);
  return `\uFEFF${[header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')}`;
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function downloadText(filename: string, content: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
