import { useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Card, EmptyState, Field, PageHeader, PrimaryButton, StatusPill, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { formatMXN, formatWhen, localDateTimeInputValue } from '../lib/format.ts';
import { disputeReasonLabel, disputeStatusLabel, paymentLabel } from '../lib/labels.ts';
import { DISPUTE_REASONS, DISPUTE_STATUSES, PAYMENT_STATUSES, type DisputeStatus } from '../lib/types.ts';

export function Aclaraciones() {
  const { data, openDispute } = useApp();
  const [params] = useSearchParams();
  const preset = data.receipts.find((receipt) => receipt.folio === params.get('folio'));
  const [receiptId, setReceiptId] = useState(preset?.id ?? data.receipts[0]?.id ?? '');
  const [reason, setReason] = useState('peso');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = openDispute({ receiptId, reason, description, now: localDateTimeInputValue() });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setDescription('');
    setMessage(`Aclaración abierta para ${result.dispute.folio}. La boleta original no cambió.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Aclaraciones"
        title="Revisar sin borrar"
        description="Una aclaración guarda el motivo, la fecha y los valores originales. No reescribe la boleta y no declara fraude."
      />
      {data.receipts.length === 0 ? (
        <EmptyState title="No hay boletas para aclarar" body="Primero guarda una boleta. Si borraste el archivo local, puedes restaurar la demo." />
      ) : (
        <Card>
          <form onSubmit={submit} className="grid gap-4">
            <Field id="receiptId" label="Boleta" error={errors.receiptId}>
              <select id="receiptId" className={inputClass} value={receiptId} onChange={(event) => setReceiptId(event.target.value)}>
                {data.receipts.map((receipt) => (
                  <option key={receipt.id} value={receipt.id}>
                    {receipt.folio} · {receipt.material} · {formatMXN(receipt.totalCentavos)}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="reason" label="Motivo" error={errors.reason}>
              <select id="reason" className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)}>
                {DISPUTE_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {disputeReasonLabel[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="description" label="Descripción" error={errors.description} hint="Sin nombres legales, teléfonos ni RFC.">
              <textarea id="description" className={inputClass} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
            </Field>
            <PrimaryButton type="submit" testId="abrir-aclaracion">
              Abrir aclaración
            </PrimaryButton>
          </form>
          {message ? (
            <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950">
              {message}
            </p>
          ) : null}
        </Card>
      )}
      <section className="space-y-3">
        {data.disputes.length === 0 ? <p className="text-slate-600">Todavía no hay aclaraciones en este navegador.</p> : null}
        {data.disputes.map((dispute) => (
          <Link key={dispute.id} to={`/aclaraciones/${dispute.id}`} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-navy-900">
                {dispute.folio} · {disputeReasonLabel[dispute.reason]}
              </p>
              <StatusPill tone={dispute.status === 'resuelta' ? 'green' : dispute.status === 'abierta' ? 'amber' : 'slate'}>
                {disputeStatusLabel[dispute.status]}
              </StatusPill>
            </div>
            <p className="mt-2 text-sm text-slate-600">{dispute.description}</p>
            <p className="mt-2 text-xs text-slate-500">Abierta {formatWhen(dispute.openedAt)}. Original: {formatMXN(dispute.original.totalCentavos)}.</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function AclaracionDetalle() {
  const { id = '' } = useParams();
  const { data, resolveDispute } = useApp();
  const dispute = data.disputes.find((item) => item.id === id);
  const receipt = data.receipts.find((item) => item.id === dispute?.receiptId);
  const [status, setStatus] = useState<DisputeStatus>(dispute?.status ?? 'abierta');
  const [notes, setNotes] = useState(dispute?.resolutionNotes ?? '');
  const [recovered, setRecovered] = useState(dispute ? (dispute.recoveredCentavos / 100).toFixed(2) : '');
  const [weight, setWeight] = useState(dispute?.corrected?.weightKg ?? '');
  const [price, setPrice] = useState(dispute?.corrected?.pricePerKg ?? '');
  const [payment, setPayment] = useState<string>(dispute?.corrected?.paymentStatus ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  if (!dispute) return <EmptyState title="No está esta aclaración" body="Puede haberse borrado con el archivo local de este navegador." />;

  function save(event: FormEvent) {
    event.preventDefault();
    if (!dispute) return;
    const result = resolveDispute(dispute.id, {
      status,
      resolutionNotes: notes,
      recoveredMxn: recovered,
      correctedWeightKg: weight,
      correctedPricePerKg: price,
      correctedPaymentStatus: payment,
      now: localDateTimeInputValue(),
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setMessage('Actualización guardada en la aclaración. La boleta original sigue igual.');
  }

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Aclaración" title={`${dispute.folio}`} description={disputeReasonLabel[dispute.reason]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-display text-2xl text-navy-900">Valores originales</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Peso" value={`${dispute.original.weightKg} kg`} />
            <Row label="Precio" value={`${dispute.original.pricePerKg} MXN`} />
            <Row label="Total" value={formatMXN(dispute.original.totalCentavos)} />
            <Row label="Pago" value={paymentLabel[dispute.original.paymentStatus]} />
          </dl>
          <p className="mt-4 text-sm text-slate-600">{dispute.description}</p>
          {receipt ? (
            <p className="mt-3 text-sm font-semibold text-emerald-800">
              Boleta vigente: {receipt.weightKg} kg × {receipt.pricePerKg} = {formatMXN(receipt.totalCentavos)}.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">La boleta ya no está en el archivo, pero esta aclaración conserva la copia original.</p>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-2xl text-navy-900">Corrección aparte</h2>
          <p className="mt-1 text-sm text-slate-500">Estos campos viven en la aclaración. Guardarlos no modifica la boleta.</p>
          <form onSubmit={save} className="mt-4 space-y-3">
            <Field id="status" label="Estatus">
              <select id="status" className={inputClass} value={status} onChange={(event) => setStatus(event.target.value as DisputeStatus)}>
                {DISPUTE_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {disputeStatusLabel[item]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="resolutionNotes" label="Notas de resolución" error={errors.resolutionNotes}>
              <textarea id="resolutionNotes" className={inputClass} rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </Field>
            <Field id="recoveredMxn" label="Monto recuperado (MXN)" error={errors.recoveredMxn} hint="Opcional. Es un apunte, no un depósito verificado.">
              <input id="recoveredMxn" className={inputClass} inputMode="decimal" value={recovered} onChange={(event) => setRecovered(event.target.value)} />
            </Field>
            <Field id="correctedWeightKg" label="Peso corregido" error={errors.correctedWeightKg}>
              <input id="correctedWeightKg" className={inputClass} value={weight} onChange={(event) => setWeight(event.target.value)} />
            </Field>
            <Field id="correctedPricePerKg" label="Precio corregido" error={errors.correctedPricePerKg}>
              <input id="correctedPricePerKg" className={inputClass} value={price} onChange={(event) => setPrice(event.target.value)} />
            </Field>
            <Field id="correctedPaymentStatus" label="Pago corregido" error={errors.correctedPaymentStatus} hint="Déjalo vacío si no hay corrección de pago.">
              <select id="correctedPaymentStatus" className={inputClass} value={payment} onChange={(event) => setPayment(event.target.value)}>
                <option value="">Sin corrección de pago</option>
                {PAYMENT_STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {paymentLabel[item]}
                  </option>
                ))}
              </select>
            </Field>
            <PrimaryButton type="submit">Guardar en la aclaración</PrimaryButton>
          </form>
          {message ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
          {dispute.corrected ? (
            <p className="mt-4 text-sm text-slate-700">
              Corrección anotada: {dispute.corrected.weightKg} kg × {dispute.corrected.pricePerKg} = {formatMXN(dispute.corrected.totalCentavos)}.
            </p>
          ) : null}
        </Card>
      </div>
      <Card>
        <h2 className="font-display text-2xl text-navy-900">Historial</h2>
        <ol className="mt-3 space-y-3">
          {dispute.audit.map((event, index) => (
            <li key={`${event.at}-${index}`} className="border-l-2 border-emerald-700 pl-3">
              <p className="text-sm font-semibold text-navy-900">{formatWhen(event.at)} · {event.action}</p>
              <p className="text-sm text-slate-600">{event.detail}</p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-navy-900">{value}</dd>
    </div>
  );
}
