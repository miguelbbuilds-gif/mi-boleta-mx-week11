import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppState.tsx';
import { formatGramsAsKg, formatMXN, formatWhen, monthLabel } from '../lib/format.ts';
import { paymentLabel } from '../lib/labels.ts';
import { materialSeries, monthlySeries, summarize } from '../lib/receipts.ts';
import { Card, DemoBadge, PageHeader, PrimaryLink, Stat } from '../components/ui.tsx';

export function Resumen() {
  const { data } = useApp();
  const summary = summarize(data.receipts);
  const months = monthlySeries(data.receipts).map((row) => ({
    ...row,
    label: monthLabel(row.month),
    pesos: row.centavos / 100,
  }));
  const materials = materialSeries(data.receipts).map((row) => ({
    material: row.material,
    kilos: Math.round((row.grams / 1000) * 10) / 10,
  }));
  const recent = [...data.receipts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const average = summary.averagePaidPerKgCentavos === null ? '—' : formatMXN(summary.averagePaidPerKgCentavos);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumen"
        title="Lo que ya quedó escrito"
        description="Kilos, precios y pagos guardados en este navegador. El dinero pagado solo suma boletas con estatus Pagado."
        actions={
          <>
            <DemoBadge live={data.usingDemo} />
            <PrimaryLink to="/nueva" testId="nueva-boleta">
              Nueva boleta
            </PrimaryLink>
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Kilos registrados" value={formatGramsAsKg(summary.grams)} hint="Suma de todas las boletas de este archivo." />
        <Stat label="MXN pagados a recicladores" value={formatMXN(summary.paidCentavos)} hint="Solo estatus Pagado. Un pendiente no cuenta como pagado." />
        <Stat label="Valor documentado" value={formatMXN(summary.documentedCentavos)} hint="Suma de totales, incluido lo que aún no se paga." />
        <Stat label="Transacciones" value={String(summary.count)} />
        <Stat label="Pago promedio por kilo" value={average} hint="MXN pagados ÷ kilos de las boletas pagadas." />
        <Stat label="Materiales activos" value={String(summary.materials)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="font-display text-2xl text-navy-900">Valor documentado por mes</h2>
          <p className="mt-1 text-sm text-slate-500">Cifra de las boletas locales. No es un flujo de caja auditado.</p>
          {months.length === 0 ? (
            <p className="mt-8 text-slate-600">Todavía no hay meses para graficar.</p>
          ) : (
            <>
              <div className="mt-4 h-72" role="img" aria-label="Gráfica de barras con el valor documentado de cada mes.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={months}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatMXN(Math.round(Number(value) * 100))} />
                    <Bar dataKey="pesos" name="MXN documentados" fill="#0e7c66" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <table className="mt-4 w-full text-left text-sm">
                <caption className="mb-2 text-left text-slate-500">Tabla equivalente de la gráfica mensual.</caption>
                <thead>
                  <tr className="text-slate-500">
                    <th className="py-1 font-medium">Mes</th>
                    <th className="py-1 font-medium">Boletas</th>
                    <th className="py-1 font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {months.map((row) => (
                    <tr key={row.month} className="border-t border-slate-100">
                      <td className="py-1.5">{row.label}</td>
                      <td>{row.count}</td>
                      <td>{formatMXN(row.centavos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-display text-2xl text-navy-900">Kilos por material</h2>
          <p className="mt-1 text-sm text-slate-500">Distribución del archivo local. No es un inventario nacional.</p>
          {materials.length === 0 ? (
            <p className="mt-8 text-slate-600">Sin materiales registrados.</p>
          ) : (
            <>
              <div className="mt-4 h-72" role="img" aria-label="Gráfica de barras con los kilos de cada material.">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materials} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#475569', fontSize: 12 }} />
                    <YAxis type="category" dataKey="material" width={96} tick={{ fill: '#475569', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="kilos" name="Kilos" fill="#0b1f3a" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {materials.map((row) => (
                  <li key={row.material}>
                    {row.material}: {row.kilos} kg
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-navy-900">Boletas recientes</h2>
          <Link to="/boletas" className="text-sm font-semibold text-emerald-800">
            Ver todas
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-slate-600">Cuando guardes la primera boleta, aparecerá aquí.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="py-2 font-medium">Folio</th>
                  <th className="font-medium">Fecha</th>
                  <th className="font-medium">Material</th>
                  <th className="font-medium">Alias</th>
                  <th className="font-medium">Total</th>
                  <th className="font-medium">Pago</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((receipt) => (
                  <tr key={receipt.id} className="border-t border-slate-100">
                    <td className="py-2 font-semibold">
                      <Link className="text-emerald-800" to={`/boletas/${receipt.folio}`}>
                        {receipt.folio}
                      </Link>
                    </td>
                    <td>{formatWhen(receipt.createdAt)}</td>
                    <td>{receipt.material}</td>
                    <td>{receipt.recyclerAlias || 'Sin alias'}</td>
                    <td className="tabular-nums">{formatMXN(receipt.totalCentavos)}</td>
                    <td>{paymentLabel[receipt.paymentStatus]}</td>
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
