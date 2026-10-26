import { blankData, buildDemoData } from './demoData.ts';
import type { AppData, ScenarioId } from './types.ts';

export const STORAGE_KEY = 'mi-boleta-mx-week11-v1';

export function normalizeData(value: unknown): AppData {
  if (!value || typeof value !== 'object') return buildDemoData();
  const data = value as Partial<AppData>;
  if (data.version !== 1 || !Array.isArray(data.receipts) || !Array.isArray(data.disputes)) return buildDemoData();
  const seed = buildDemoData();
  return {
    version: 1,
    usingDemo: Boolean(data.usingDemo),
    receipts: data.receipts,
    disputes: data.disputes,
    harms: Array.isArray(data.harms) ? data.harms : [],
    nextFolio: typeof data.nextFolio === 'number' ? data.nextFolio : seed.nextFolio,
    scenarios: data.scenarios ?? seed.scenarios,
    activeScenario: data.activeScenario ?? 'base',
  };
}

export function loadState(storage: Pick<Storage, 'getItem'> = localStorage): AppData {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return buildDemoData();
    return normalizeData(JSON.parse(raw));
  } catch {
    return buildDemoData();
  }
}

export function saveState(data: AppData, storage: Pick<Storage, 'setItem'> = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDemoState(): AppData {
  return buildDemoData();
}

export function deleteLocalState(): AppData {
  return blankData();
}

export function withScenario(data: AppData, id: ScenarioId, patch: Partial<AppData['scenarios'][ScenarioId]>): AppData {
  return {
    ...data,
    scenarios: {
      ...data.scenarios,
      [id]: { ...data.scenarios[id], ...patch },
    },
  };
}
