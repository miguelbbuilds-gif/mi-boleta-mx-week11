import { useMemo, useState } from 'react';
import { Card, DemoBadge, Field, PageHeader, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { formatMXN, formatWhen } from '../lib/format.ts';
import { parseScaled } from '../lib/money.ts';
import { MIN_PRICE_OBSERVATIONS, compareOfferedPrice } from '../lib/prices.ts';
import { MATERIALS, type Material } from '../lib/types.ts';

export function Precios() {
  const { data } = useApp();
  const [material, setMaterial] = useState<Material>('PET');
  const [offered, setOffered] = useState('8.50');
  const observations = useMemo(
    () =>
      data.receipts
        .filter((receipt) => receipt.material === material)
        .map((receipt) => ({
          folio: receipt.folio,
          at: receipt.createdAt,
          yardName: receipt.yardName,
          priceCentavos: Math.round(Number(receipt.pricePerKg) * 100),
        })),
    [data.receipts, material],
  );
  const parsed = parseScaled(offered, 2);
  const comparison = parsed === null ? null : compareOfferedPrice(Number(parsed), observations);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Precios"
        title="Referencia interna, no precio de mercado"
        description="Compara un precio que el patio quiere ofrecer contra las boletas guardadas en este navegador. No fabricamos un benchmark nacional y una diferencia no significa fraude."
        actions={<DemoBadge live={data.usingDemo} />}
      />
      <Card className="grid gap-4 md:grid-cols-2">
        <Field id="material-precio" label="Material">
          <select id="material-precio" className={inputClass} value={material} onChange={(event) => setMaterial(event.target.value as Material)}>
            {MATERIALS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field id="offered" label="Precio ofrecido hoy (MXN por kg)" hint="Esto no crea una boleta. Solo sirve para la comparación.">
          <input id="offered" className={inputClass} inputMode="decimal" value={offered} onChange={(event) => setOffered(event.target.value)} />
        </Field>
      </Card>
      {parsed === null ? (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Escribe un precio válido, sin negativos y con hasta 2 decimales.
        </p>
      ) : comparison ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Metric label="Precio ofrecido" value={formatMXN(comparison.offeredCentavos)} />
          <Metric label="Mediana histórica interna" value={comparison.medianCentavos === null ? '—' : formatMXN(comparison.medianCentavos)} />
          <Metric label="Diferencia en pesos" value={comparison.differenceCentavos === null ? '—' : formatMXN(comparison.differenceCentavos)} />
          <Metric
            label="Diferencia porcentual"
            value={comparison.percentTimes100 === null ? '—' : `${(comparison.percentTimes100 / 100).toFixed(2)} %`}
          />
          <Metric label="Observaciones" value={String(comparison.count)} />
          <Metric
            label="Rango de fechas"
            value={comparison.from && comparison.to ? `${formatWhen(comparison.from)} — ${formatWhen(comparison.to)}` : '—'}
          />
        </div>
      ) : null}
      {comparison?.insufficient ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Hay menos de {MIN_PRICE_OBSERVATIONS} observaciones de {material}. La mediana se muestra, pero no alcanza para una comparación estable. No concluye nada sobre el patio.
        </p>
      ) : null}
      <Card>
        <h2 className="font-display text-2xl text-navy-900">Observaciones usadas</h2>
        <p className="mt-1 text-sm text-slate-500">Incluye todos los patios de este archivo. La lista va por fecha, no por una calificación de personas.</p>
        {observations.length === 0 ? (
          <p className="mt-4 text-slate-600">No hay boletas de {material} en este navegador.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 font-medium">Folio</th>
                  <th className="font-medium">Fecha</th>
                  <th className="font-medium">Patio</th>
                  <th className="font-medium">Precio</th>
                </tr>
              </thead>
              <tbody>
                {observations
                  .sort((a, b) => a.at.localeCompare(b.at))
                  .map((row) => (
                    <tr key={row.folio} className="border-t border-slate-100">
                      <td className="py-2">{row.folio}</td>
                      <td>{formatWhen(row.at)}</td>
                      <td>{row.yardName}</td>
                      <td className="tabular-nums">{formatMXN(row.priceCentavos)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-navy-900">{value}</p>
    </article>
  );
}
