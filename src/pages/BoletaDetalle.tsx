import { Link, useParams } from 'react-router-dom';
import { ReceiptView } from '../components/ReceiptView.tsx';
import { EmptyState, PageHeader } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { formatMXN, formatWhen } from '../lib/format.ts';
import { disputeStatusLabel } from '../lib/labels.ts';

export function BoletaDetalle() {
  const { folio = '' } = useParams();
  const { data } = useApp();
  const receipt = data.receipts.find((item) => item.folio === folio);
  if (!receipt) {
    return <EmptyState title="No está esta boleta" body="El folio no existe en el archivo de este navegador." />;
  }
  const disputes = data.disputes.filter((item) => item.receiptId === receipt.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Detalle"
        title={receipt.folio}
        description="La boleta original se muestra completa. Las aclaraciones viven aparte y no la sustituyen."
      />
      <ReceiptView receipt={receipt} />
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display text-2xl text-navy-900">Aclaraciones de este folio</h2>
        {disputes.length === 0 ? (
          <p className="mt-2 text-slate-600">No hay aclaraciones. Abrir una no borra esta boleta.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {disputes.map((dispute) => (
              <li key={dispute.id}>
                <Link className="font-semibold text-emerald-800" to={`/aclaraciones/${dispute.id}`}>
                  {disputeStatusLabel[dispute.status]} · {formatWhen(dispute.openedAt)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link className="mt-4 inline-block text-sm font-semibold text-navy-900" to={`/aclaraciones?folio=${receipt.folio}`}>
          Abrir una aclaración con este folio
        </Link>
        <p className="mt-4 text-sm text-slate-500">Total original conservado: {formatMXN(receipt.totalCentavos)}.</p>
      </section>
    </div>
  );
}
