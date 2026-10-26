import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, DemoBadge, EmptyState, PageHeader, PrimaryLink, SecondaryButton, inputClass } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { downloadText, receiptsToCsv } from '../lib/export.ts';
import { formatMXN, formatWhen } from '../lib/format.ts';
import { paymentLabel } from '../lib/labels.ts';
import { EMPTY_FILTERS, filterDisclosure, filterReceipts, type ReceiptFilters } from '../lib/receipts.ts';
import { MATERIALS, PAYMENT_STATUSES } from '../lib/types.ts';

export function Boletas() {
  const { data } = useApp();
  const [filters, setFilters] = useState<ReceiptFilters>(EMPTY_FILTERS);
  const result = useMemo(() => filterReceipts(data.receipts, filters), [data.receipts, filters]);
  const disclosure = filterDisclosure(filters, result.excluded);

  function update<K extends keyof ReceiptFilters>(key: K, value: ReceiptFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mis boletas"
        title="Archivo de este navegador"
        description="Busca por folio, filtra y descarga. Una aclaración no borra la boleta. Este archivo no está certificado por un tercero."
        actions={<DemoBadge live={data.usingDemo} />}
      />
      <Card className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-semibold text-navy-900">
          Buscar folio o alias
          <input className={`${inputClass} mt-1`} value={filters.query} onChange={(event) => update('query', event.target.value)} placeholder="MBX-2026-0001" />
        </label>
        <label className="text-sm font-semibold text-navy-900">
          Material
          <select className={`${inputClass} mt-1`} value={filters.material} onChange={(event) => update('material', event.target.value as ReceiptFilters['material'])}>
            <option value="todos">Todos</option>
            {MATERIALS.map((material) => (
              <option key={material}>{material}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-navy-900">
          Pago
          <select className={`${inputClass} mt-1`} value={filters.status} onChange={(event) => update('status', event.target.value as ReceiptFilters['status'])}>
            <option value="todos">Todos</option>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {paymentLabel[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-navy-900">
          Desde
          <input className={`${inputClass} mt-1`} type="date" value={filters.from} onChange={(event) => update('from', event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-navy-900">
          Hasta
          <input className={`${inputClass} mt-1`} type="date" value={filters.to} onChange={(event) => update('to', event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-navy-900">
          Orden
          <select className={`${inputClass} mt-1`} value={filters.sort} onChange={(event) => update('sort', event.target.value as ReceiptFilters['sort'])}>
            <option value="fecha_desc">Fecha, reciente primero</option>
            <option value="fecha_asc">Fecha, antigua primero</option>
            <option value="monto_desc">Monto, mayor primero</option>
            <option value="monto_asc">Monto, menor primero</option>
          </select>
        </label>
      </Card>
      {disclosure ? (
        <p data-testid="filtro-aviso" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {disclosure}
        </p>
      ) : (
        <p className="text-sm text-slate-500">Sin filtros: la lista muestra todas las boletas guardadas aquí.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <SecondaryButton
          onClick={() => downloadText('mi-boleta-lista.csv', receiptsToCsv(result.rows), 'text/csv;charset=utf-8')}
        >
          CSV de esta lista
        </SecondaryButton>
        <SecondaryButton onClick={() => downloadText('mi-boleta-completo.csv', receiptsToCsv(data.receipts), 'text/csv;charset=utf-8')} testId="csv-completo">
          CSV completo
        </SecondaryButton>
      </div>
      {data.receipts.length === 0 ? (
        <EmptyState title="No hay boletas" body="El archivo local está vacío. Puedes crear una boleta o restaurar la demo desde Tus datos." action={<PrimaryLink to="/nueva">Nueva boleta</PrimaryLink>} />
      ) : result.rows.length === 0 ? (
        <EmptyState title="Ninguna boleta coincide" body="Los filtros dejaron la lista vacía. Las boletas siguen guardadas." action={<SecondaryButton onClick={() => setFilters(EMPTY_FILTERS)}>Quitar filtros</SecondaryButton>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Folio</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Patio</th>
                <th className="px-4 py-3 font-medium">Alias</th>
                <th className="px-4 py-3 font-medium">Material</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Pago</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((receipt) => (
                <tr key={receipt.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">
                    <Link className="text-emerald-800" to={`/boletas/${receipt.folio}`}>
                      {receipt.folio}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatWhen(receipt.createdAt)}</td>
                  <td className="px-4 py-3">{receipt.yardName}</td>
                  <td className="px-4 py-3">{receipt.recyclerAlias || 'Sin alias'}</td>
                  <td className="px-4 py-3">{receipt.material}</td>
                  <td className="px-4 py-3 tabular-nums">{formatMXN(receipt.totalCentavos)}</td>
                  <td className="px-4 py-3">{paymentLabel[receipt.paymentStatus]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
