import { useState } from 'react';
import { Card, PageHeader, PrimaryButton, SecondaryButton } from '../components/ui.tsx';
import { useApp } from '../context/AppState.tsx';
import { downloadText, receiptsToCsv } from '../lib/export.ts';
import { SHADOW_CLAUSE } from '../lib/safeguards.ts';
import { STORAGE_KEY } from '../lib/storage.ts';

export function Privacidad() {
  const { data, resetDemo, deleteAll } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tus datos"
        title="Lo que este navegador guarda"
        description="Mi Boleta MX, en esta demo pública, no tiene cuentas, no pide ubicación y no arma un perfil de comportamiento."
      />
      <Card className="space-y-3 text-slate-700">
        <p>Las boletas viven en localStorage de este navegador, con la clave <code className="rounded bg-slate-100 px-1">{STORAGE_KEY}</code>. Eso no es una base de datos multiusuario ni un archivo certificado.</p>
        <p>No pedimos nombre legal, teléfono, RFC, CLABE, tarjeta ni dirección precisa. Si un texto parece incluirlos, el formulario lo rechaza.</p>
        <p>No hay geolocalización, puntaje de confianza ni ranking público. Negarse a confirmar una copia no resta acceso.</p>
        <p>Un despliegue real, con varias personas y patios, necesitaría autenticación, autorización, una base protegida y una revisión de privacidad y legal antes de salir. Esta demo no simula ese backend.</p>
      </Card>
      <Card>
        <h2 className="font-display text-2xl text-navy-900">Cláusula de sombra</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          {SHADOW_CLAUSE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
      <Card className="flex flex-col gap-3">
        <h2 className="font-display text-2xl text-navy-900">Exportar o borrar</h2>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => downloadText('mi-boleta-boletas.csv', receiptsToCsv(data.receipts), 'text/csv;charset=utf-8')}>
            Exportar CSV
          </SecondaryButton>
          <SecondaryButton
            onClick={() => downloadText('mi-boleta-archivo.json', JSON.stringify(data, null, 2), 'application/json')}
          >
            Exportar JSON
          </SecondaryButton>
          <SecondaryButton
            testId="reset-demo"
            onClick={() => {
              resetDemo();
              setMessage('Volvió la demo ficticia. Lo que habías capturado en este navegador se reemplazó.');
              setConfirmDelete(false);
            }}
          >
            Restaurar demo
          </SecondaryButton>
          <PrimaryButton testId="delete-data" onClick={() => setConfirmDelete(true)}>
            Borrar archivo local
          </PrimaryButton>
        </div>
        {confirmDelete ? (
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-950">
            <p>Esto borra boletas, aclaraciones y daños de este navegador. No borra nada en un servidor, porque no hay servidor de datos.</p>
            <div className="mt-3 flex gap-2">
              <PrimaryButton
                onClick={() => {
                  deleteAll();
                  setConfirmDelete(false);
                  setMessage('El archivo local quedó vacío.');
                }}
              >
                Sí, borrar este navegador
              </PrimaryButton>
              <SecondaryButton onClick={() => setConfirmDelete(false)}>Cancelar</SecondaryButton>
            </div>
          </div>
        ) : null}
        {message ? <p role="status">{message}</p> : null}
        <p className="text-sm text-slate-500">
          Estado actual: {data.usingDemo ? 'demo ficticia cargada' : 'sin demo'}. {data.receipts.length} boletas, {data.disputes.length} aclaraciones.
        </p>
      </Card>
    </div>
  );
}
