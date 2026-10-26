import { Link } from 'react-router-dom';
import { useApp } from '../context/AppState.tsx';
import { formatGramsAsKg, formatMXN } from '../lib/format.ts';
import { summarize } from '../lib/receipts.ts';
import { DemoBadge, Logo } from '../components/ui.tsx';

export function Landing() {
  const { data, startTour } = useApp();
  const summary = summarize(data.receipts);

  return (
    <div className="min-h-screen bg-white text-navy-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link to="/modelo" className="hidden text-slate-600 sm:inline">
            Modelo
          </Link>
          <Link to="/condiciones" className="hidden text-slate-600 sm:inline">
            Condiciones
          </Link>
          <Link to="/resumen" className="rounded-xl bg-navy-900 px-3 py-2 text-white">
            Entrar
          </Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div>
            <DemoBadge live={data.usingDemo} />
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-6xl">
              Cada kilo cuenta. Cada peso también.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Mi Boleta MX deja por escrito el peso, el material, el precio y el total de una entrega. Antes de llevarlo a un patio real, el modelo muestra quién pagaría la transparencia y si el reciclador queda mejor.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/resumen"
                data-testid="explorar-demo"
                onClick={startTour}
                className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white"
              >
                Explorar demo
              </Link>
              <Link to="/nueva" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">
                Nueva boleta
              </Link>
            </div>
            <p className="mt-4 max-w-xl text-sm text-slate-500">
              Datos ficticios. No hay entrevista de campo, ni patio inscrito, ni patrocinador firmado. El blueprint de equipo es un borrador, no un voto documentado.
            </p>
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <p className="text-xs font-bold tracking-[0.16em] text-emerald-800">EJEMPLO DE CAPTURA</p>
            <p className="mt-2 font-display text-3xl">Papel, sin cuenta</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Line label="Patio" value="Acopio Esperanza (demo)" />
              <Line label="Alias" value="Don Ernesto" />
              <Line label="Material" value="PET" />
              <Line label="Peso" value="12.5 kg" />
              <Line label="Precio" value="$8.50 / kg" />
              <Line label="Total" value="12.5 × 8.50 = $106.25" />
            </dl>
            <p className="mt-4 text-sm text-slate-500">Sirve en papel. No pide RFC ni cuenta bancaria.</p>
          </aside>
        </section>
        <section className="bg-navy-900 text-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
            <Number label="Kilos en este navegador" value={formatGramsAsKg(summary.grams)} />
            <Number label="MXN pagados en la demo" value={formatMXN(summary.paidCentavos)} />
            <Number label="Boletas locales" value={String(summary.count)} />
          </div>
        </section>
        <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-3">
          <Info title="Boleta completa" body="Peso, material, precio, total, fecha, patio y una ruta de aclaración. El cálculo queda a la vista." />
          <Info title="Quién paga" body="El simulador no confunde el valor del material con el ingreso de la plataforma. La cuota del patrocinador es un supuesto." />
          <Info title="Sin calificación" body="No hay ranking, geolocalización ni castigo si la persona no confirma la copia. El papel sigue sirviendo." />
        </section>
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-3xl bg-slate-50 p-8">
            <h2 className="font-display text-3xl">La pregunta de dinero</h2>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-700">
              Digitalizar la báscula no basta. Hay que ver si alguien cubre el costo de la boleta, por qué un patio la usaría y si, después de cuotas e incentivos, quien recoge el material recibe más.
            </p>
            <Link to="/modelo" className="mt-5 inline-block font-semibold text-emerald-800">
              Probar el modelo
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
        Proyecto educativo AI 2041 · Semana 11 · Miguel Bravo · Rol MONEY. Prototipo local, no un servicio financiero.
      </footer>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function Number({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-emerald-100">{label}</p>
      <p className="mt-1 font-display text-3xl">{value}</p>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2 text-slate-600">{body}</p>
    </article>
  );
}
