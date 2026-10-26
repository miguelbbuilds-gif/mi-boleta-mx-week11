import { Link } from 'react-router-dom';
import { Card, PageHeader } from '../components/ui.tsx';

const CONDITIONS = [
  {
    title: '1. Acceso',
    body: 'Quien entrega material no necesita RFC, cuenta bancaria, instalar la aplicación ni tener teléfono inteligente. La boleta se imprime en papel.',
    to: '/nueva',
    link: 'Crear e imprimir',
  },
  {
    title: '2. Boleta completa',
    body: 'Cada boleta muestra peso, material, precio por kilo, total, fecha, patio y la ruta para aclarar.',
    to: '/boletas',
    link: 'Ver boletas',
  },
  {
    title: '3. Responsabilidad económica',
    body: 'El simulador separa cuota del patrocinador, incentivo al patio, costos del piloto y adopción. Nada de eso es un contrato verificado.',
    to: '/modelo',
    link: 'Abrir el modelo',
  },
  {
    title: '4. Integridad de la evidencia',
    body: 'La báscula y la factura de salida son evidencia. Una foto no prueba el origen. Una inconsistencia se explica y no se convierte en acusación.',
    to: '/evidencia',
    link: 'Ver evidencia',
  },
  {
    title: '5. Cláusula de sombra',
    body: 'No hay puntaje, ranking, geolocalización ni castigo por no confirmar. La boleta sirve igual. Un filtro dice qué oculta. El patrocinador solo ve agregados.',
    to: '/privacidad',
    link: 'Leer la cláusula',
  },
  {
    title: '6. Medición de daño',
    body: 'El piloto mira entrega de copias, aclaraciones, tiempo de cierre y daños. Si hay represalia, exclusión o mal uso, se detiene.',
    to: '/piloto',
    link: 'Ver métricas',
  },
];

export function Condiciones() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Blueprint"
        title="Seis condiciones de este borrador"
        description="El blueprint de T4 es un borrador de discusión. No hay constancia en este proyecto de una votación del equipo. Estas condiciones están construidas en la demo para poder revisarlas."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {CONDITIONS.map((item) => (
          <Card key={item.title}>
            <h2 className="font-display text-2xl text-navy-900">{item.title}</h2>
            <p className="mt-2 text-slate-700">{item.body}</p>
            <Link className="mt-4 inline-block text-sm font-semibold text-emerald-800" to={item.to}>
              {item.link}
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
