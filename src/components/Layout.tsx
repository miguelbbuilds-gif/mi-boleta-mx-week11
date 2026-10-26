import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppState.tsx';
import { NAV_ITEMS } from '../lib/nav.ts';
import { TOUR_STEPS } from '../lib/tour.ts';
import { DemoBadge, Logo } from './ui.tsx';

export function AppLayout() {
  const { data, tourIndex, setTourIndex, startTour } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const step = tourIndex === null ? null : TOUR_STEPS[tourIndex];

  function goNext() {
    if (tourIndex === null) return;
    const next = tourIndex + 1;
    const following = TOUR_STEPS[next];
    if (!following) {
      setTourIndex(null);
      return;
    }
    setTourIndex(next);
    navigate(following.path);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
        Saltar al contenido
      </a>
      <aside data-testid="sidebar" className="no-print hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <Logo />
          <p className="mt-3 text-sm text-slate-500">Cada kilo cuenta. Cada peso también.</p>
        </div>
        <NavList />
        <div className="mt-auto space-y-3 p-4">
          <button
            type="button"
            onClick={() => {
              startTour();
              navigate('/resumen');
            }}
            className="w-full rounded-xl bg-navy-900 px-3 py-2.5 text-sm font-semibold text-white"
          >
            Recorrido guiado
          </button>
          <DemoBadge live={data.usingDemo} />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <Logo />
          <button
            type="button"
            data-testid="nav-toggle"
            aria-expanded={open}
            aria-controls="menu-movil"
            className="rounded-xl border border-slate-300 p-2"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </header>
        {open ? (
          <div className="no-print fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-navy-950/40" aria-label="Cerrar menú" onClick={() => setOpen(false)} />
            <nav id="menu-movil" aria-label="Principal" className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <Logo />
                <button type="button" className="rounded-lg p-2" onClick={() => setOpen(false)} aria-label="Cerrar">
                  <X aria-hidden="true" />
                </button>
              </div>
              <NavList />
            </nav>
          </div>
        ) : null}
        <main id="contenido" className={`mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 ${step ? 'pb-44' : ''}`}>
          <Outlet />
        </main>
      </div>
      {step ? (
        <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-emerald-900/10 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-800">Recorrido demo · {step.title}</p>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-700">{step.body}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold" onClick={() => setTourIndex(null)}>
                Cerrar
              </button>
              <button type="button" data-testid="tour-next" className="rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white" onClick={goNext}>
                {tourIndex === TOUR_STEPS.length - 1 ? 'Terminar' : 'Siguiente'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NavList() {
  return (
    <ul className="space-y-1 px-2">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}
