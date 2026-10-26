import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/Layout.tsx';
import { AclaracionDetalle, Aclaraciones } from './pages/Aclaraciones.tsx';
import { BoletaDetalle } from './pages/BoletaDetalle.tsx';
import { Boletas } from './pages/Boletas.tsx';
import { Condiciones } from './pages/Condiciones.tsx';
import { Evidencia } from './pages/Evidencia.tsx';
import { Landing } from './pages/Landing.tsx';
import { Modelo } from './pages/Modelo.tsx';
import { NuevaBoleta } from './pages/NuevaBoleta.tsx';
import { Piloto } from './pages/Piloto.tsx';
import { Precios } from './pages/Precios.tsx';
import { Privacidad } from './pages/Privacidad.tsx';
import { Resumen } from './pages/Resumen.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/resumen" element={<Resumen />} />
        <Route path="/nueva" element={<NuevaBoleta />} />
        <Route path="/boletas" element={<Boletas />} />
        <Route path="/boletas/:folio" element={<BoletaDetalle />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/modelo" element={<Modelo />} />
        <Route path="/aclaraciones" element={<Aclaraciones />} />
        <Route path="/aclaraciones/:id" element={<AclaracionDetalle />} />
        <Route path="/evidencia" element={<Evidencia />} />
        <Route path="/piloto" element={<Piloto />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/condiciones" element={<Condiciones />} />
      </Route>
      <Route
        path="*"
        element={
          <main className="mx-auto max-w-lg px-6 py-20 text-center">
            <h1 className="font-display text-4xl text-navy-900">Esta página no existe</h1>
            <p className="mt-3 text-slate-600">El enlace no corresponde a una sección de Mi Boleta MX.</p>
            <Link className="mt-5 inline-block font-semibold text-emerald-800" to="/">
              Volver al inicio
            </Link>
          </main>
        }
      />
    </Routes>
  );
}
