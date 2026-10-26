import { useState } from 'react';
import { Card, DemoBadge, EmptyState, Field, PageHeader, PrimaryButton, StatusPill, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { evidenceLabel } from '../lib/labels.ts';
import { EVIDENCE_STATUSES, type Evidence, type EvidenceStatus } from '../lib/types.ts';

export function Evidencia() {
  const { data, saveEvidence } = useApp();
  const [selected, setSelected] = useState(data.receipts[0]?.id ?? '');
  const receipt = data.receipts.find((item) => item.id === selected) ?? data.receipts[0];
  const [form, setForm] = useState<Evidence | null>(receipt?.evidence ?? null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function choose(id: string) {
    const next = data.receipts.find((item) => item.id === id);
    setSelected(id);
    setForm(next?.evidence ?? null);
    setMessage('');
    setError('');
  }

  function save() {
    if (!receipt || !form) return;
    if (form.status === 'inconsistencia_detectada' && form.note.trim().length < 10) {
      setError('Explica la inconsistencia en al menos 10 caracteres. La marca no puede quedar muda.');
      return;
    }
    saveEvidence(receipt.id, form);
    setError('');
    setMessage('Evidencia actualizada. El peso, el precio y el total de la boleta no cambiaron.');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Evidencia"
        title="Una referencia no es una prueba"
        description="La lectura de una báscula analógica se escribe a mano. Una fotografía, si existiera, sería evidencia, no demostración del origen. Esta demo no sube imágenes."
        actions={<DemoBadge live={data.usingDemo} />}
      />
      <div className="grid gap-3 md:grid-cols-4">
        {EVIDENCE_STATUSES.map((status) => (
          <article key={status} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{evidenceLabel[status]}</p>
            <p className="mt-1 font-display text-3xl text-navy-900">{data.receipts.filter((item) => item.evidence.status === status).length}</p>
          </article>
        ))}
      </div>
      {data.receipts.length === 0 || !receipt || !form ? (
        <EmptyState title="Sin boletas" body="No hay evidencia que mostrar porque el archivo local está vacío." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="max-h-[32rem] space-y-2 overflow-auto">
            {data.receipts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => choose(item.id)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${item.id === receipt.id ? 'bg-navy-900 text-white' : 'hover:bg-slate-50'}`}
              >
                <span className="font-semibold">{item.folio}</span>
                <span className="mt-1 block opacity-80">{evidenceLabel[item.evidence.status]}</span>
              </button>
            ))}
          </Card>
          <Card className="space-y-3">
            <h2 className="font-display text-2xl text-navy-900">{receipt.folio}</h2>
            <p className="text-sm text-slate-600">
              Peso escrito: {receipt.weightKg} kg. Precio: {receipt.pricePerKg}. Estos números no se editan desde aquí.
            </p>
            <Field id="scaleRef" label="Referencia de báscula" hint="No pegues una fotografía. Anota el identificador.">
              <input id="scaleRef" className={inputClass} value={form.scaleRef} onChange={(event) => setForm({ ...form, scaleRef: event.target.value })} />
            </Field>
            <Field id="invoiceRef" label="Referencia de factura de salida">
              <input id="invoiceRef" className={inputClass} value={form.invoiceRef} onChange={(event) => setForm({ ...form, invoiceRef: event.target.value })} />
            </Field>
            <Field id="imageLabel" label="Referencia de imagen, sin archivo">
              <input id="imageLabel" className={inputClass} value={form.imageLabel} onChange={(event) => setForm({ ...form, imageLabel: event.target.value })} />
            </Field>
            <Field id="evidence-status" label="Estado">
              <select
                id="evidence-status"
                className={inputClass}
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as EvidenceStatus })}
              >
                {EVIDENCE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {evidenceLabel[status]}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.operatorConfirmed} onChange={(event) => setForm({ ...form, operatorConfirmed: event.target.checked })} />
              Quien opera el patio confirma la captura. No es una certificación.
            </label>
            <Field id="evidence-note" label="Nota" error={error} hint="Si hay inconsistencia, explica la diferencia. No atribuyas fraude.">
              <textarea id="evidence-note" className={inputClass} rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </Field>
            <PrimaryButton onClick={save}>Guardar evidencia</PrimaryButton>
            {message ? <p role="status" className="text-sm font-semibold text-emerald-800">{message}</p> : null}
            <StatusPill tone={form.status === 'inconsistencia_detectada' ? 'amber' : 'slate'}>{evidenceLabel[form.status]}</StatusPill>
          </Card>
        </div>
      )}
    </div>
  );
}
