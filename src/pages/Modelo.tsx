import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, DemoBadge, PageHeader, SecondaryButton, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { formatGramsAsKg, formatMXN } from '../lib/format.ts';
import { scenarioLabel } from '../lib/labels.ts';
import { MODEL_FORMULAS, calculateModel, marginSeries } from '../lib/model.ts';
import { SCENARIO_IDS, type ModelInputs, type ScenarioId } from '../lib/types.ts';

const FIELDS: { key: keyof ModelInputs; label: string; kind: 'int' | 'text' }[] = [
  { key: 'yards', label: 'Patios participantes', kind: 'int' },
  { key: 'txPerYardPerDay', label: 'Transacciones por patio al día', kind: 'int' },
  { key: 'operatingDays', label: 'Días de operación al mes', kind: 'int' },
  { key: 'avgKg', label: 'Kilos promedio por boleta', kind: 'text' },
  { key: 'avgPayPerKg', label: 'Pago promedio por kilo (MXN)', kind: 'text' },
  { key: 'sponsorFeePerYard', label: 'Cuota supuesta del patrocinador por patio al mes', kind: 'text' },
  { key: 'setupCostPerYard', label: 'Costo de arranque por patio', kind: 'text' },
  { key: 'monthlyHosting', label: 'Hospedaje mensual', kind: 'text' },
  { key: 'monthlySupport', label: 'Soporte mensual', kind: 'text' },
  { key: 'costPerTransaction', label: 'Costo por transacción', kind: 'text' },
  { key: 'pilotIncentivePerYard', label: 'Incentivo piloto por patio al mes', kind: 'text' },
  { key: 'disputeRatePct', label: 'Aclaraciones estimadas (%)', kind: 'text' },
  { key: 'resolutionRatePct', label: 'Aclaraciones resueltas estimadas (%)', kind: 'text' },
  { key: 'avgRecovered', label: 'Monto promedio recuperado por aclaración resuelta', kind: 'text' },
];

export function Modelo() {
  const { data, setActiveScenario, updateScenario, restoreScenario } = useApp();
  const active = data.activeScenario;
  const inputs = data.scenarios[active];
  const calculated = calculateModel(inputs);
  const series = calculated.ok
    ? marginSeries(inputs).map((point) => ({ yards: point.yards, margen: point.marginCentavos / 100 }))
    : [];
  const comparisons = SCENARIO_IDS.map((id) => ({ id, result: calculateModel(data.scenarios[id]) }));

  function edit(key: keyof ModelInputs, raw: string) {
    if (key === 'yards' || key === 'txPerYardPerDay' || key === 'operatingDays') {
      updateScenario(active, { [key]: raw.trim() === '' ? 0 : Number(raw) });
      return;
    }
    updateScenario(active, { [key]: raw });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Modelo de negocio"
        title="Quién paga la transparencia"
        description="El valor del material no es ingreso de la plataforma. La cuota del patrocinador, el incentivo y la recuperación por aclaraciones son supuestos editables. Nadie ha firmado un acuerdo."
        actions={<DemoBadge live={data.usingDemo} />}
      />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Escenarios">
        {SCENARIO_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === active}
            data-testid={`scenario-${id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${id === active ? 'bg-navy-900 text-white' : 'bg-white text-navy-900 ring-1 ring-slate-200'}`}
            onClick={() => setActiveScenario(id)}
          >
            {scenarioLabel[id]}
          </button>
        ))}
        <SecondaryButton onClick={() => restoreScenario(active)}>Restaurar supuestos de este escenario</SecondaryButton>
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {FIELDS.map((field) => (
            <label key={field.key} className="text-sm font-semibold text-navy-900">
              {field.label}
              <input
                className={`${inputClass} mt-1`}
                inputMode={field.kind === 'int' ? 'numeric' : 'decimal'}
                value={String(inputs[field.key])}
                onChange={(event) => edit(field.key, event.target.value)}
              />
            </label>
          ))}
        </Card>
        <div className="space-y-4">
          {!calculated.ok ? (
            <div role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">
              {calculated.errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Out label="Transacciones del mes" value={String(calculated.result.monthlyTransactions)} formula={MODEL_FORMULAS.volume} />
                <Out label="Kilos documentados" value={formatGramsAsKg(calculated.result.monthlyGrams)} formula={MODEL_FORMULAS.kilograms} />
                <Out label="Valor del material" value={formatMXN(calculated.result.monthlyMaterialCentavos)} formula={MODEL_FORMULAS.material} testId="material-value" />
                <Out label="Ingreso supuesto del patrocinador" value={formatMXN(calculated.result.monthlySponsorCentavos)} formula={MODEL_FORMULAS.sponsor} testId="sponsor-revenue" />
                <Out label="Costo operativo del mes" value={formatMXN(calculated.result.monthlyOperatingCentavos)} formula={MODEL_FORMULAS.operating} testId="operating-cost" />
                <Out label="Margen de contribución" value={formatMXN(calculated.result.monthlyMarginCentavos)} formula={MODEL_FORMULAS.margin} testId="margin" />
                <Out
                  label="Patios de equilibrio"
                  value={calculated.result.breakEvenYards === null ? 'Sin equilibrio' : String(calculated.result.breakEvenYards)}
                  formula={`${MODEL_FORMULAS.breakEven} ${calculated.result.breakEvenReason}`}
                  testId="break-even"
                />
                <Out label="Beneficio estimado por aclaraciones" value={formatMXN(calculated.result.recoveredCentavos)} formula={MODEL_FORMULAS.recovered} />
                <Out
                  label="Costo por kilo documentado"
                  value={calculated.result.costPerKgCentavos === null ? '—' : formatMXN(calculated.result.costPerKgCentavos)}
                  formula={MODEL_FORMULAS.costPerKg}
                />
                <Out
                  label="Costo del patrocinador por kilo"
                  value={calculated.result.sponsorCostPerKgCentavos === null ? '—' : formatMXN(calculated.result.sponsorCostPerKgCentavos)}
                  formula={MODEL_FORMULAS.sponsorPerKg}
                />
                <Out label="Arranque, una sola vez" value={formatMXN(calculated.result.setupTotalCentavos)} formula="Patios × costo de arranque. No entra en el margen mensual." />
                <Out
                  label="Meses para cubrir el arranque"
                  value={calculated.result.setupRecoveryMonths === null ? 'El margen mensual no lo cubre' : String(calculated.result.setupRecoveryMonths)}
                  formula="Costo de arranque ÷ margen mensual, truncado a centésimas. Solo si el margen es positivo."
                />
              </div>
              <Card>
                <h2 className="font-display text-2xl text-navy-900">Margen según el número de patios</h2>
                <p className="mt-1 text-sm text-slate-500">{calculated.result.breakEvenReason}</p>
                <div className="mt-4 h-72" role="img" aria-label="Gráfica del margen mensual contra el número de patios.">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <CartesianGrid stroke="#e2e8f0" />
                      <XAxis dataKey="yards" tick={{ fill: '#475569', fontSize: 12 }} label={{ value: 'Patios', position: 'insideBottom', offset: -2 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatMXN(Math.round(Number(value) * 100))} />
                      <ReferenceLine y={0} stroke="#0b1f3a" />
                      {calculated.result.breakEvenYards !== null ? (
                        <ReferenceLine x={calculated.result.breakEvenYards} stroke="#0e7c66" label="Equilibrio" />
                      ) : null}
                      <Line type="monotone" dataKey="margen" name="Margen MXN" stroke="#0e7c66" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <table className="mt-4 w-full text-left text-sm">
                  <caption className="mb-2 text-left text-slate-500">Tabla del margen. Valores negativos indican que los costos superan la cuota supuesta.</caption>
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-1 font-medium">Patios</th>
                      <th className="py-1 font-medium">Margen mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {series.filter((point) => point.yards % 2 === 0).map((point) => (
                      <tr key={point.yards} className="border-t border-slate-100">
                        <td className="py-1">{point.yards}</td>
                        <td>{formatMXN(Math.round(point.margen * 100))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </div>
      <Card>
        <h2 className="font-display text-2xl text-navy-900">Comparación de escenarios</h2>
        <p className="mt-1 text-sm text-slate-500">Cada columna usa los supuestos editables de ese escenario, no una promesa comercial.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2 font-medium">Indicador</th>
                {comparisons.map((item) => (
                  <th key={item.id} className="py-2 font-medium">
                    {scenarioLabel[item.id]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Ingreso patrocinador" comparisons={comparisons} pick={(result) => formatMXN(result.monthlySponsorCentavos)} />
              <CompareRow label="Valor del material" comparisons={comparisons} pick={(result) => formatMXN(result.monthlyMaterialCentavos)} />
              <CompareRow label="Costo operativo" comparisons={comparisons} pick={(result) => formatMXN(result.monthlyOperatingCentavos)} />
              <CompareRow label="Margen" comparisons={comparisons} pick={(result) => formatMXN(result.monthlyMarginCentavos)} />
              <CompareRow label="Equilibrio (patios)" comparisons={comparisons} pick={(result) => (result.breakEvenYards === null ? 'Sin equilibrio' : String(result.breakEvenYards))} />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Out({ label, value, formula, testId }: { label: string; value: string; formula: string; testId?: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4" data-testid={testId}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-navy-900">{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{formula}</p>
    </article>
  );
}

function CompareRow({
  label,
  comparisons,
  pick,
}: {
  label: string;
  comparisons: { id: ScenarioId; result: ReturnType<typeof calculateModel> }[];
  pick: (result: Extract<ReturnType<typeof calculateModel>, { ok: true }>['result']) => string;
}) {
  return (
    <tr className="border-t border-slate-100">
      <th className="py-2 pr-3 font-medium text-navy-900">{label}</th>
      {comparisons.map((item) => (
        <td key={item.id} className="py-2 tabular-nums">
          {item.result.ok ? pick(item.result.result) : 'Supuesto inválido'}
        </td>
      ))}
    </tr>
  );
}
