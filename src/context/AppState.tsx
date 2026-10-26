import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { addHarm as addHarmRecord, openDispute as openDisputeRecord, resolveDispute as resolveDisputeRecord, type ResolveInput } from '../lib/disputes.ts';
import { buildDemoData } from '../lib/demoData.ts';
import { createReceipt, updateEvidence } from '../lib/receipts.ts';
import { deleteLocalState, loadState, resetDemoState, saveState, withScenario } from '../lib/storage.ts';
import type { AppData, HarmCategory, ModelInputs, ReceiptDraft, ScenarioId } from '../lib/types.ts';

interface Store {
  data: AppData;
  addReceipt: (draft: ReceiptDraft) => ReturnType<typeof createReceipt>;
  openDispute: (input: { receiptId: string; reason: string; description: string; now?: string }) => ReturnType<typeof openDisputeRecord>;
  resolveDispute: (id: string, input: ResolveInput) => ReturnType<typeof resolveDisputeRecord>;
  saveEvidence: (receiptId: string, evidence: AppData['receipts'][number]['evidence']) => void;
  resetDemo: () => void;
  deleteAll: () => void;
  setActiveScenario: (id: ScenarioId) => void;
  updateScenario: (id: ScenarioId, patch: Partial<ModelInputs>) => void;
  restoreScenario: (id: ScenarioId) => void;
  reportHarm: (category: HarmCategory, description: string) => { ok: true } | { ok: false; error: string };
  tourIndex: number | null;
  startTour: () => void;
  setTourIndex: (index: number | null) => void;
}

const AppContext = createContext<Store | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadState());
  const [tourIndex, setTourIndex] = useState<number | null>(null);

  useEffect(() => {
    saveState(data);
  }, [data]);

  const store: Store = {
    data,
    addReceipt: (draft) => {
      let result: ReturnType<typeof createReceipt> = { ok: false, errors: { form: 'No se pudo guardar.' } };
      setData((current) => {
        result = createReceipt(current, draft);
        return result.ok ? result.data : current;
      });
      return result;
    },
    openDispute: (input) => {
      let result: ReturnType<typeof openDisputeRecord> = { ok: false, errors: { form: 'No se pudo abrir.' } };
      setData((current) => {
        result = openDisputeRecord(current, input);
        return result.ok ? result.data : current;
      });
      return result;
    },
    resolveDispute: (id, input) => {
      let result: ReturnType<typeof resolveDisputeRecord> = { ok: false, errors: { form: 'No se pudo actualizar.' } };
      setData((current) => {
        result = resolveDisputeRecord(current, id, input);
        return result.ok ? result.data : current;
      });
      return result;
    },
    saveEvidence: (receiptId, evidence) => setData((current) => updateEvidence(current, receiptId, evidence)),
    resetDemo: () => setData(resetDemoState()),
    deleteAll: () => setData(deleteLocalState()),
    setActiveScenario: (id) => setData((current) => ({ ...current, activeScenario: id })),
    updateScenario: (id, patch) => setData((current) => withScenario(current, id, patch)),
    restoreScenario: (id) => {
      const seed = buildDemoData();
      setData((current) => ({
        ...current,
        scenarios: { ...current.scenarios, [id]: { ...seed.scenarios[id] } },
      }));
    },
    reportHarm: (category, description) => {
      let result: { ok: true } | { ok: false; error: string } = { ok: false, error: 'No se pudo registrar.' };
      setData((current) => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        const next = addHarmRecord(current, category, description, stamp);
        if (!next.ok) {
          result = next;
          return current;
        }
        result = { ok: true };
        return next.data;
      });
      return result;
    },
    tourIndex,
    startTour: () => setTourIndex(0),
    setTourIndex,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp(): Store {
  const value = useContext(AppContext);
  if (!value) throw new Error('La aplicación no está lista.');
  return value;
}
