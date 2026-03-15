import AsyncStorage from '@react-native-async-storage/async-storage';
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

export type NotificationCategory =
  | 'earthquakes'
  | 'dailyChallenge'
  | 'streakAtRisk'
  | 'badgeUnlocked'
  | 'levelUp'
  | 'earthquakeTrainingCombo';

export type NotificationPolicy = {
  enabled: Record<NotificationCategory, boolean>;
  cooldownSeconds: number;
  quietHoursStart: number;
  quietHoursEnd: number;
};

type NotificationPolicyContextValue = {
  policy: NotificationPolicy;
  setCategoryEnabled: (category: NotificationCategory, enabled: boolean) => void;
  setCooldownSeconds: (seconds: number) => void;
  setQuietHours: (startHour: number, endHour: number) => void;
};

const NOTIFICATION_POLICY_KEY = 'notification_policy_v1';

const DEFAULT_POLICY: NotificationPolicy = {
  enabled: {
    earthquakes: true,
    dailyChallenge: true,
    streakAtRisk: true,
    badgeUnlocked: true,
    levelUp: true,
    earthquakeTrainingCombo: true,
  },
  cooldownSeconds: 120,
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

const PRESET_COOLDOWNS = [30, 60, 120, 300] as const;
const PRESET_QUIET_HOURS: ReadonlyArray<{ start: number; end: number }> = [
  { start: 22, end: 7 },
  { start: 23, end: 7 },
  { start: 0, end: 0 },
];

const NotificationPolicyContext = createContext<NotificationPolicyContextValue | null>(null);

let inMemoryPolicy: NotificationPolicy | null = null;

function clampHour(value: number): number {
  const rounded = Math.round(value);
  return Math.max(0, Math.min(23, rounded));
}

function isValidPolicy(value: unknown): value is NotificationPolicy {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<NotificationPolicy>;
  if (!candidate.enabled || typeof candidate.enabled !== 'object') return false;
  if (typeof candidate.cooldownSeconds !== 'number') return false;
  if (typeof candidate.quietHoursStart !== 'number') return false;
  if (typeof candidate.quietHoursEnd !== 'number') return false;
  return true;
}

async function loadPolicy(): Promise<NotificationPolicy> {
  if (inMemoryPolicy) return inMemoryPolicy;

  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_POLICY_KEY);
    if (!raw) return DEFAULT_POLICY;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidPolicy(parsed)) return DEFAULT_POLICY;
    inMemoryPolicy = parsed;
    return parsed;
  } catch {
    return DEFAULT_POLICY;
  }
}

async function savePolicy(policy: NotificationPolicy): Promise<void> {
  inMemoryPolicy = policy;
  try {
    await AsyncStorage.setItem(NOTIFICATION_POLICY_KEY, JSON.stringify(policy));
  } catch {
    // Graceful no-op when native storage is unavailable.
  }
}

export function NotificationPolicyProvider({ children }: PropsWithChildren) {
  const [policy, setPolicy] = useState<NotificationPolicy>(DEFAULT_POLICY);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const existing = await loadPolicy();
      if (!cancelled) setPolicy(existing);
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCategoryEnabled = useCallback((category: NotificationCategory, enabled: boolean) => {
    setPolicy((current) => {
      const next: NotificationPolicy = {
        ...current,
        enabled: {
          ...current.enabled,
          [category]: enabled,
        },
      };
      void savePolicy(next);
      return next;
    });
  }, []);

  const setCooldownSeconds = useCallback((seconds: number) => {
    setPolicy((current) => {
      const safe = PRESET_COOLDOWNS.includes(seconds as (typeof PRESET_COOLDOWNS)[number])
        ? seconds
        : DEFAULT_POLICY.cooldownSeconds;
      const next: NotificationPolicy = {
        ...current,
        cooldownSeconds: safe,
      };
      void savePolicy(next);
      return next;
    });
  }, []);

  const setQuietHours = useCallback((startHour: number, endHour: number) => {
    setPolicy((current) => {
      const next: NotificationPolicy = {
        ...current,
        quietHoursStart: clampHour(startHour),
        quietHoursEnd: clampHour(endHour),
      };
      void savePolicy(next);
      return next;
    });
  }, []);

  const value = useMemo<NotificationPolicyContextValue>(
    () => ({
      policy,
      setCategoryEnabled,
      setCooldownSeconds,
      setQuietHours,
    }),
    [policy, setCategoryEnabled, setCooldownSeconds, setQuietHours],
  );

  return createElement(NotificationPolicyContext.Provider, { value }, children);
}

export function useNotificationPolicy(): NotificationPolicyContextValue {
  const context = useContext(NotificationPolicyContext);
  if (!context) {
    throw new Error('useNotificationPolicy must be used inside NotificationPolicyProvider.');
  }
  return context;
}

export function getCooldownPresets(): ReadonlyArray<number> {
  return PRESET_COOLDOWNS;
}

export function getQuietHourPresets(): ReadonlyArray<{ start: number; end: number }> {
  return PRESET_QUIET_HOURS;
}
