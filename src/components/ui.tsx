import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base text-navy-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/15 aria-[invalid=true]:border-rose-600';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-sm font-bold text-white">MB</span>
      Mi Boleta MX
    </span>
  );
}

export function DemoBadge({ live = true }: { live?: boolean }) {
  return (
    <span data-testid="demo-badge" className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold tracking-wide text-amber-950">
      {live ? 'DEMO · DATOS FICTICIOS' : 'ARCHIVO LOCAL VACÍO'}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-1 text-sm font-semibold text-emerald-800">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 text-base leading-relaxed text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm leading-snug text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function PrimaryLink({ to, children, testId }: { to: string; children: ReactNode; testId?: string }) {
  return (
    <Link
      to={to}
      data-testid={testId}
      className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
    >
      {children}
    </Link>
  );
}

export function PrimaryButton({
  children,
  type = 'button',
  onClick,
  testId,
  disabled,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  testId?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      data-testid={testId}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  type = 'button',
  onClick,
  testId,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      data-testid={testId}
      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight text-navy-900">{value}</p>
      {hint ? <p className="mt-2 text-sm leading-snug text-slate-500">{hint}</p> : null}
    </article>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="font-display text-2xl text-navy-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-slate-600">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function StatusPill({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'green' | 'amber' | 'rose' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-50 text-emerald-900',
    amber: 'bg-amber-50 text-amber-950',
    rose: 'bg-rose-50 text-rose-900',
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
