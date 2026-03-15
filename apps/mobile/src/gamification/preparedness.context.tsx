import type { PropsWithChildren } from 'react';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  applyModuleScore,
  applyXpActivity,
  createDefaultPreparednessProfile,
} from './preparedness.logic';
import { loadPreparednessProfile, savePreparednessProfile } from './preparedness.storage';
import type {
  PreparednessModule,
  PreparednessProfile,
  PreparednessXpDelta,
} from './preparedness.types';

type PreparednessContextValue = {
  profile: PreparednessProfile;
  lastXpDelta: PreparednessXpDelta | null;
  addXp: (amount: number, reason: string) => void;
  updateModuleScore: (module: PreparednessModule, score: number, reason?: string) => void;
  completeDailyAction: () => void;
};

const PreparednessContext = createContext<PreparednessContextValue | null>(null);

function nowIso(): string {
  return new Date().toISOString();
}

export function PreparednessProvider({ children }: PropsWithChildren) {
  const [profile, setProfile] = useState<PreparednessProfile>(() =>
    createDefaultPreparednessProfile(),
  );
  const [lastXpDelta, setLastXpDelta] = useState<PreparednessXpDelta | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const existing = await loadPreparednessProfile();
      if (!cancelled && existing) {
        setProfile(existing);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const addXp = useCallback((amount: number, reason: string) => {
    const delta = Math.round(amount);
    if (!Number.isFinite(delta) || delta === 0) return;

    const timestamp = nowIso();
    setProfile((current) => {
      const next = applyXpActivity(current, timestamp, delta);
      void savePreparednessProfile(next);
      return next;
    });
    setLastXpDelta({ amount: delta, reason, atIso: timestamp });
  }, []);

  const updateModuleScore = useCallback(
    (module: PreparednessModule, score: number, reason = '') => {
      const timestamp = nowIso();

      setProfile((current) => {
        const next = applyModuleScore(current, timestamp, module, score);
        void savePreparednessProfile(next);
        return next;
      });

      setLastXpDelta({
        amount: 0,
        reason,
        atIso: timestamp,
      });
    },
    [],
  );

  const completeDailyAction = useCallback(() => {
    addXp(20, 'daily_action');
  }, [addXp]);

  const value = useMemo<PreparednessContextValue>(
    () => ({
      profile,
      lastXpDelta,
      addXp,
      updateModuleScore,
      completeDailyAction,
    }),
    [addXp, completeDailyAction, lastXpDelta, profile, updateModuleScore],
  );

  return createElement(PreparednessContext.Provider, { value }, children);
}

export function usePreparedness(): PreparednessContextValue {
  const context = useContext(PreparednessContext);
  if (!context) {
    throw new Error('usePreparedness must be used inside PreparednessProvider.');
  }
  return context;
}
