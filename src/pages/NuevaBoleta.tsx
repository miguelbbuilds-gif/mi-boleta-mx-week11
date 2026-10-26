import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ReceiptView } from '../components/ReceiptView.tsx';
import { Card, DemoBadge, Field, PageHeader, PrimaryButton, SecondaryButton, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { formatMXN } from '../lib/format.ts';
import { SAMPLE_TEXTS, acceptInterpretation, localSimulation, type Interpretation } from '../lib/interpret.ts';
import { quoteTotal } from '../lib/money.ts';
import { EVIDENCE_STATUSES, MATERIALS, PAYMENT_STATUSES, type Receipt, type ReceiptDraft } from '../lib/types.ts';
import { emptyDraft } from '../lib/validation.ts';
import { evidenceLabel, paymentLabel } from '../lib/labels.ts';

export function NuevaBoleta() {
  const { data, addReceipt } = useApp();
  const [draft, setDraft] = useState<ReceiptDraft>(() => emptyDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Receipt | null>(null);
  const [sample, setSample] = useState(SAMPLE_TEXTS[0]?.text ?? '');
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [confirmSuggestions, setConfirmSuggestions] = useState(false);
  const [busy, setBusy] = useState(false);
  const quote = useMemo(() => quoteTotal(draft.weightKg, draft.pricePerKg), [draft.weightKg, draft.pricePerKg]);

  function update<K extends keyof ReceiptDraft>(key: K, value: ReceiptDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function describedBy(id: string) {
    if (errors[id]) return `${id}-error`;
    return `${id}-hint`;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const result = addReceipt(draft);
    if (!result.ok) {
      setErrors(result.errors);
      const first = Object.keys(result.errors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setSaved(result.receipt);
    setDraft(emptyDraft());
    setInterpretation(null);
    setConfirmSuggestions(false);
  }

  function fillErnesto() {
    setDraft({
      ...emptyDraft(),
      yardName: 'Acopio Esperanza (demo)',
      recyclerAlias: 'Don Ernesto',
      material: 'PET',
      weightKg: '12.5',
      pricePerKg: '8.50',
      paymentStatus: 'pagado',
      copyDelivered: true,
      notes: 'Ejemplo de papel. No incluye RFC ni cuenta bancaria.',
    });
    setErrors({});
  }

  async function interpret() {
    setBusy(true);
    setConfirmSuggestions(false);
    const local = localSimulation(sample);
    setInterpretation(local);
    try {
      const response = await fetch('/api/interpret', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'text/plain; charset=utf-8' },
        body: JSON.stringify({ text: sample }),
      });
      const raw = await response.text();
      setInterpretation(acceptInterpretation(raw, sample));
    } catch {
      setInterpretation(local);
    } finally {
      setBusy(false);
    }
  }

  function apply() {
    if (!interpretation || !confirmSuggestions) return;
    const suggestions = interpretation.suggestions;
    setDraft((current) => ({
      ...current,
      material: suggestions.material || current.material,
      weightKg: suggestions.weightKg || current.weightKg,
      pricePerKg: suggestions.pricePerKg || current.pricePerKg,
      recyclerAlias: suggestions.recyclerAlias || current.recyclerAlias,
      yardName: suggestions.yardName || current.yardName,
      notes: suggestions.notes || current.notes,
      paymentStatus: suggestions.paymentStatus || current.paymentStatus,
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nueva boleta"
        title="Registrar una entrega"
        description="El total se calcula aquí: kilos por precio. La persona puede llevarse el papel sin instalar nada, sin RFC y sin cuenta bancaria."
        actions={<DemoBadge live={data.usingDemo} />}
      />
      <div className="flex flex-wrap gap-2">
        <SecondaryButton onClick={fillErnesto}>Llenar ejemplo de Don Ernesto</SecondaryButton>
        <p className="self-center text-sm text-slate-500">Siguiente folio: MBX-{draft.createdAt.slice(0, 4)}-{String(data.nextFolio).padStart(4, '0')}</p>
      </div>
      <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]" noValidate>
        <Card className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="createdAt" label="Fecha y hora" error={errors.createdAt} hint="Hora de este dispositivo. No puede ser futura.">
              <input id="createdAt" className={inputClass} type="datetime-local" value={draft.createdAt} aria-invalid={Boolean(errors.createdAt)} aria-describedby={describedBy('createdAt')} onChange={(event) => update('createdAt', event.target.value)} />
            </Field>
            <Field id="yardName" label="Patio o centro de acopio" error={errors.yardName} hint="Nombre del lugar. No pongas una dirección precisa.">
              <input id="yardName" className={inputClass} value={draft.yardName} autoComplete="off" aria-invalid={Boolean(errors.yardName)} aria-describedby={describedBy('yardName')} onChange={(event) => update('yardName', event.target.value)} />
            </Field>
            <Field id="recyclerAlias" label="Alias de quien entrega" error={errors.recyclerAlias} hint="Opcional. No uses nombre legal, RFC ni teléfono.">
              <input id="recyclerAlias" className={inputClass} value={draft.recyclerAlias} autoComplete="off" aria-invalid={Boolean(errors.recyclerAlias)} aria-describedby={describedBy('recyclerAlias')} onChange={(event) => update('recyclerAlias', event.target.value)} />
            </Field>
            <Field id="material" label="Material" error={errors.material}>
              <select id="material" className={inputClass} value={draft.material} aria-invalid={Boolean(errors.material)} onChange={(event) => update('material', event.target.value)}>
                {MATERIALS.map((material) => (
                  <option key={material}>{material}</option>
                ))}
              </select>
            </Field>
            <Field id="weightKg" label="Peso en kilogramos" error={errors.weightKg} hint="Mayor que cero. Hasta 3 decimales.">
              <input id="weightKg" className={inputClass} inputMode="decimal" value={draft.weightKg} aria-invalid={Boolean(errors.weightKg)} aria-describedby={describedBy('weightKg')} onChange={(event) => update('weightKg', event.target.value)} />
            </Field>
            <Field id="pricePerKg" label="Precio por kilogramo (MXN)" error={errors.pricePerKg} hint="No se aceptan precios negativos.">
              <input id="pricePerKg" className={inputClass} inputMode="decimal" value={draft.pricePerKg} aria-invalid={Boolean(errors.pricePerKg)} aria-describedby={describedBy('pricePerKg')} onChange={(event) => update('pricePerKg', event.target.value)} />
            </Field>
          </div>
          <div data-testid="total-preview" aria-live="polite" className="rounded-2xl bg-navy-900 p-5 text-white">
            <p className="text-sm font-semibold text-emerald-100">Total que debe recibir</p>
            {quote && quote.grams > 0n ? (
              <>
                <p className="mt-2 text-sm text-emerald-100">
                  {draft.weightKg} kg × {draft.pricePerKg} MXN
                </p>
                <p className="mt-1 font-display text-4xl font-semibold tabular-nums">{formatMXN(Number(quote.totalCentavos))}</p>
                <p className="mt-2 text-sm text-slate-200">Redondeo al centavo, mitad hacia arriba. Este número no lo escribe un modelo.</p>
              </>
            ) : (
              <p className="mt-2 text-lg">Escribe un peso mayor que cero y un precio para ver el total.</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="paymentStatus" label="Estado del pago" error={errors.paymentStatus}>
              <select id="paymentStatus" className={inputClass} value={draft.paymentStatus} onChange={(event) => update('paymentStatus', event.target.value)}>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {paymentLabel[status]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="scaleRef" label="Referencia de báscula" error={errors.scaleRef} hint="Opcional. La foto no sustituye la lectura manual.">
              <input id="scaleRef" className={inputClass} value={draft.scaleRef} aria-invalid={Boolean(errors.scaleRef)} onChange={(event) => update('scaleRef', event.target.value)} />
            </Field>
            <Field id="invoiceRef" label="Referencia de factura de salida" error={errors.invoiceRef} hint="Opcional. No demuestra por sí sola el origen del material.">
              <input id="invoiceRef" className={inputClass} value={draft.invoiceRef} onChange={(event) => update('invoiceRef', event.target.value)} />
            </Field>
            <Field id="evidenceStatus" label="Estado de la evidencia" error={errors.evidenceStatus}>
              <select id="evidenceStatus" className={inputClass} value={draft.evidenceStatus} onChange={(event) => update('evidenceStatus', event.target.value)}>
                {EVIDENCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {evidenceLabel[status]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="notes" label="Notas" error={errors.notes} hint="Si el material es Otro, descríbelo aquí. Sin datos personales.">
            <textarea id="notes" className={inputClass} rows={3} value={draft.notes} onChange={(event) => update('notes', event.target.value)} />
          </Field>
          <Field id="evidenceNote" label="Nota de evidencia" error={errors.evidenceNote} hint="Obligatoria solo si marcas una inconsistencia. La nota explica; no acusa.">
            <textarea id="evidenceNote" className={inputClass} rows={2} value={draft.evidenceNote} onChange={(event) => update('evidenceNote', event.target.value)} />
          </Field>
          <Field id="imageLabel" label="Referencia de imagen" error={errors.imageLabel} hint="Esta demo no guarda fotografías. Una imagen no prueba el origen del material.">
            <input id="imageLabel" className={inputClass} value={draft.imageLabel} onChange={(event) => update('imageLabel', event.target.value)} />
          </Field>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" checked={draft.operatorConfirmed} onChange={(event) => update('operatorConfirmed', event.target.checked)} />
            Quien opera el patio confirma que capturó estos datos. Esa confirmación no certifica el origen.
          </label>
          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input type="checkbox" className="mt-1" checked={draft.copyDelivered} onChange={(event) => update('copyDelivered', event.target.checked)} />
            <span>La persona recibió una copia. Si no la confirma, la boleta sigue siendo válida y no hay penalización.</span>
          </label>
          <PrimaryButton type="submit" testId="guardar-boleta">
            Guardar boleta
          </PrimaryButton>
        </Card>
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl text-navy-900">Interpretar un texto</h2>
              <span data-testid="sim-badge" className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-950">
                {interpretation?.mode === 'llm' ? 'SUGERENCIA DE MODELO' : 'SIMULACIÓN'}
              </span>
            </div>
            <p className="text-sm text-slate-600">Pega un texto de ejemplo. Nada se aplica al formulario hasta que lo confirmes. Una boleta ya guardada no se reescribe.</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTS.map((item) => (
                <button key={item.id} type="button" className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold" onClick={() => setSample(item.text)}>
                  {item.label}
                </button>
              ))}
            </div>
            <textarea className={inputClass} rows={5} value={sample} onChange={(event) => setSample(event.target.value)} aria-label="Texto de boleta para interpretar" />
            <SecondaryButton onClick={() => void interpret()}>{busy ? 'Leyendo…' : 'Proponer campos'}</SecondaryButton>
            {interpretation ? (
              <div className="rounded-xl bg-slate-50 p-3 text-sm" data-testid="interpret-result">
                <p>{interpretation.disclaimer}</p>
                <ul className="mt-2 space-y-1">
                  {Object.entries(interpretation.suggestions).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-semibold">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
                {interpretation.unmatched && interpretation.unmatched.length > 0 ? (
                  <p className="mt-2 text-slate-500">No se encontró: {interpretation.unmatched.join(', ')}.</p>
                ) : null}
                <label className="mt-3 flex items-start gap-2">
                  <input type="checkbox" checked={confirmSuggestions} onChange={(event) => setConfirmSuggestions(event.target.checked)} />
                  Confirmo usar estas sugerencias en el formulario. Entiendo que el total se recalcula y que las boletas guardadas no cambian.
                </label>
                <div className="mt-3">
                  <PrimaryButton onClick={apply} disabled={!confirmSuggestions}>
                    Usar sugerencias en el formulario
                  </PrimaryButton>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </form>
      {saved ? (
        <div className="space-y-3">
          <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-950">
            Boleta {saved.folio} guardada en este navegador. Puedes imprimirla o copiar el texto.
          </p>
          <ReceiptView receipt={saved} />
          <Link className="inline-block text-sm font-semibold text-emerald-800" to={`/boletas/${saved.folio}`}>
            Abrir el detalle
          </Link>
        </div>
      ) : null}
    </div>
  );
}
