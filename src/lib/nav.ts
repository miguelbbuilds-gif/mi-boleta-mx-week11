import type { LucideIcon } from 'lucide-react';
import {
  BadgeDollarSign,
  ClipboardList,
  FilePlus2,
  Files,
  LayoutDashboard,
  LineChart,
  Lock,
  Scale,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/resumen', label: 'Resumen', icon: LayoutDashboard },
  { to: '/nueva', label: 'Nueva boleta', icon: FilePlus2 },
  { to: '/boletas', label: 'Mis boletas', icon: Files },
  { to: '/precios', label: 'Precios', icon: BadgeDollarSign },
  { to: '/modelo', label: 'Modelo de negocio', icon: LineChart },
  { to: '/aclaraciones', label: 'Aclaraciones', icon: TriangleAlert },
  { to: '/evidencia', label: 'Evidencia', icon: Scale },
  { to: '/piloto', label: 'Métricas del piloto', icon: ClipboardList },
  { to: '/privacidad', label: 'Tus datos', icon: Lock },
  { to: '/condiciones', label: 'Condiciones', icon: ShieldCheck },
];
