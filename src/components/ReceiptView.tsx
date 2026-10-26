import { useState } from 'react';
import { Check, Copy, Printer } from 'lucide-react';
import { receiptPlainText } from '../lib/export.ts';
import { formatMXN, formatWhen } from '../lib/format.ts';
import { evidenceLabel, paymentLabel } from '../lib/labels.ts';
import type { Receipt } from '../lib/types.ts';
import { SecondaryButton } from './ui.tsx';

export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const [large, setLarge] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = receiptPlainText(receipt);
  const size = large ? 'text-lg' : 'text-base';

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article data-print-root className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${size}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-emerald-800">MI BOLETA MX</p>
          <h2 className="mt-1 font-display text-3xl text-navy-900">{receipt.folio}</h2>
          <p className="mt-1 text-sm text-slate-500">Copia local. No es un comprobante certificado ni una factura.</p>
        </div>
        <p className={`font-display font-semibold tabular-nums text-navy-900 ${large ? 'text-5xl' : 'text-4xl'}`}>{formatMXN(receipt.totalCentavos)}</p>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <Item label="Fecha y hora" value={formatWhen(receipt.createdAt)} />
        <Item label="Patio" value={receipt.yardName} />
        <Item label="Alias" value={receipt.recyclerAlias || 'Sin alias'} />
        <Item label="Material" value={receipt.material} />
        <Item label="Peso" value={`${receipt.weightKg} kg`} />
        <Item label="Precio por kilo" value={formatMXN(Math.round(Number(receipt.pricePerKg) * 100))} />
        <Item label="Total" value={`${receipt.weightKg} kg × ${receipt.pricePerKg} = ${formatMXN(receipt.totalCentavos)}`} />
        <Item label="Pago" value={paymentLabel[receipt.paymentStatus]} />
        <Item label="Copia entregada" value={receipt.copyDelivered ? 'Sí' : 'No. La boleta sigue siendo válida.'} />
        <Item label="Báscula" value={receipt.evidence.scaleRef || 'Sin referencia'} />
        <Item label="Factura de salida" value={receipt.evidence.invoiceRef || 'Sin referencia'} />
        <Item label="Evidencia" value={evidenceLabel[receipt.evidence.status]} />
      </dl>
      {receipt.notes ? <p className="mt-4 rounded-xl bg-slate-50 p-3 text-slate-700">Notas: {receipt.notes}</p> : null}
      {receipt.evidence.note ? <p className="mt-3 rounded-xl bg-amber-50 p-3 text-amber-950">Evidencia: {receipt.evidence.note}</p> : null}
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Para aclarar un peso, un precio, el total o un pago pendiente, conserva este folio. No hace falta RFC, cuenta bancaria ni instalar una aplicación para quedarse con el papel.
      </p>
      <div className="no-print mt-5 flex flex-wrap gap-2">
        <SecondaryButton onClick={() => window.print()} testId="imprimir-boleta">
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" /> Imprimir boleta de papel
        </SecondaryButton>
        <SecondaryButton onClick={() => void copy()} testId="copiar-boleta">
          {copied ? <Check className="mr-2 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-2 h-4 w-4" aria-hidden="true" />}
          Copiar texto
        </SecondaryButton>
        <SecondaryButton onClick={() => setLarge((value) => !value)}>{large ? 'Texto normal' : 'Texto grande'}</SecondaryButton>
      </div>
      <details className="no-print mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-navy-900">Ver texto para WhatsApp</summary>
        <p className="mt-2 text-sm text-slate-500">El texto queda en el portapapeles o aquí para copiarlo a mano. Esta aplicación no envía el mensaje.</p>
        <textarea readOnly className="mt-2 h-48 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm" value={text} />
      </details>
    </article>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-navy-900">{value}</dd>
    </div>
  );
}
