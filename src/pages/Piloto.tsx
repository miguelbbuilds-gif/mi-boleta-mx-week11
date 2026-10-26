import { useState, type FormEvent } from 'react';
import { Card, DemoBadge, Field, PageHeader, PrimaryButton, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { pilotMetrics } from '../lib/disputes.ts';
import { formatDuration, formatMXN } from '../lib/format.ts';
import { harmLabel } from '../lib/labels.ts';
import { sponsorAggregate } from '../lib/receipts.ts';
import { HARM_CATEGORIES, type HarmCategory } from '../lib/types.ts';

export function Piloto() {
  const { data, reportHarm } = useApp();
  const metrics = pilotMetrics(data);
  const [category, setCategory] = useState<HarmCategory>('otro');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [showAggregate, setShowAggregate] = useState(false);
  const aggregate = sponsorAggregate(data.receipts);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = reportHarm(category, description);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setDescription('');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Métricas del piloto"
        title="Medir daño, no solo kilos"
        description="Estas cifras salen del archivo local de demostración. Los datos de campo observados son cero: el piloto no ha empezado."
        actions={<DemoBadge live={data.usingDemo} />}
      />
      <Card className="border-amber-200 bg-amber-50">
        <p className="font-semibold text-amber-950">Datos de campo observados: ninguno.</p>
        <p className="mt-1 text-sm text-amber-950">Todo lo de abajo es simulado a partir de boletas ficticias o de lo que captures en este navegador.</p>
      </Card>
      {metrics.stopped ? (
        <p data-testid="paro-piloto" className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-950">
          Regla de paro activa. Se registró represalia, exclusión o mal uso. El piloto debe detenerse hasta una revisión humana. Las boletas ya emitidas siguen disponibles. No se activa un castigo ni un ranking.
        </p>
      ) : (
        <p className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-700 ring-1 ring-slate-200">
          Regla de paro: si aparece represalia, exclusión o mal uso, el piloto se detiene. Compartir el agregado con un patrocinador también se pausa. Nadie pierde el acceso a su boleta.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Boletas emitidas" value={String(metrics.issued)} hint="Simulado" />
        <Metric label="Entrega de copia" value={metrics.deliveryRate === null ? '—' : `${Math.round(metrics.deliveryRate * 100)} %`} hint={`${metrics.delivered} de ${metrics.issued}. No confirmar no anula la boleta.`} />
        <Metric label="Aclaraciones abiertas en total" value={String(metrics.opened)} hint="Simulado" />
        <Metric label="Aclaraciones cerradas" value={String(metrics.resolved)} hint="Resueltas o cerradas sin cambio." />
        <Metric label="Tiempo mediano de cierre" value={metrics.medianResolutionMs === null ? '—' : formatDuration(metrics.medianResolutionMs)} hint="Solo entre las que tienen fecha de cierre." />
        <Metric label="Pago recuperado anotado" value={formatMXN(metrics.recoveredCentavos)} hint="Suma de apuntes en aclaraciones resueltas. No es dinero verificado." />
        <Metric label="Adopción simulada" value={metrics.adoptionRate === null ? '—' : `${Math.round(metrics.adoptionRate * 100)} %`} hint={`${metrics.yardsWithReceipts} patios con boletas ÷ patios supuestos del escenario activo. El denominador no es un censo.`} />
        <Metric label="Daños reportados" value={String(metrics.harms)} hint="Incluye ensayos marcados como simulados." />
      </div>
      <Card>
        <h2 className="font-display text-2xl text-navy-900">Registrar un daño simulado</h2>
        <p className="mt-1 text-sm text-slate-600">Sirve para ensayar la regla de paro. No es un reporte de campo y no debe incluir datos personales.</p>
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <Field id="harm-category" label="Tipo">
            <select id="harm-category" className={inputClass} value={category} onChange={(event) => setCategory(event.target.value as HarmCategory)}>
              {HARM_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {harmLabel[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="harm-description" label="Qué pasó" error={error}>
            <textarea id="harm-description" className={inputClass} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <PrimaryButton type="submit">Anotar daño simulado</PrimaryButton>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {data.harms.map((harm) => (
            <li key={harm.id} className="rounded-xl bg-slate-50 px-3 py-2">
              <span className="font-semibold">{harmLabel[harm.category]}</span> · simulado · {harm.description}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-navy-900">Vista para un patrocinador</h2>
        <p className="mt-1 text-sm text-slate-600">Solo totales. Sin alias, sin folios y sin historial de una persona.</p>
        <PrimaryButton
          onClick={() => {
            if (metrics.stopped) return;
            setShowAggregate(true);
          }}
          disabled={metrics.stopped}
        >
          {metrics.stopped ? 'Compartir agregado está en pausa' : 'Ver agregado'}
        </PrimaryButton>
        {metrics.stopped ? <p className="mt-2 text-sm text-rose-800">La regla de paro impide mostrar el agregado hasta una revisión humana.</p> : null}
        {showAggregate && !metrics.stopped ? (
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>Transacciones: {aggregate.transacciones}</div>
            <div>Gramos: {aggregate.kilosGramos}</div>
            <div>Valor documentado: {formatMXN(aggregate.valorDocumentadoCentavos)}</div>
            <div>Pagado: {formatMXN(aggregate.pagadoCentavos)}</div>
            <div>Materiales: {aggregate.materiales}</div>
            <div>{aggregate.aviso}</div>
          </dl>
        ) : null}
      </Card>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-display text-3xl text-navy-900">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p>
    </article>
  );
}
