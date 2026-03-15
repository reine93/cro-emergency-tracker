import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { EarthquakeListItem } from '../types/earthquake';
import { formatEventTimeCroatia, toEarthquakeListItem } from '../types/earthquake';
import { getRecentEarthquakes } from '../api/earthquakes.api';
import {
  loadEarthquakesCache,
  loadLatestEarthquakesCache,
  saveEarthquakesCache,
} from '../storage/earthquakes.storage';

export enum EarthquakeTimeWindow {
  Last24Hours = 'LAST_24_HOURS',
  LastWeek = 'LAST_WEEK',
  LastTwoWeeks = 'LAST_TWO_WEEKS',
  LastMonth = 'LAST_MONTH',
  LastSixMonths = 'LAST_SIX_MONTHS',
}

export const EARTHQUAKE_TIME_WINDOW_OPTIONS: Array<{
  value: EarthquakeTimeWindow;
  label: string;
}> = [
  { value: EarthquakeTimeWindow.Last24Hours, label: 'Last 24 hours' },
  { value: EarthquakeTimeWindow.LastWeek, label: 'Last week' },
  { value: EarthquakeTimeWindow.LastTwoWeeks, label: 'Last two weeks' },
  { value: EarthquakeTimeWindow.LastMonth, label: 'Last month' },
  { value: EarthquakeTimeWindow.LastSixMonths, label: 'Last six months' },
];

export function toHours(window: EarthquakeTimeWindow): number {
  switch (window) {
    case EarthquakeTimeWindow.Last24Hours:
      return 24;
    case EarthquakeTimeWindow.LastWeek:
      return 24 * 7;
    case EarthquakeTimeWindow.LastTwoWeeks:
      return 24 * 14;
    case EarthquakeTimeWindow.LastMonth:
      return 24 * 30;
    case EarthquakeTimeWindow.LastSixMonths:
      return 24 * 30 * 6;
    default:
      return 24 * 30;
  }
}

type UseRecentEarthquakesResult = {
  items: EarthquakeListItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  infoMessage: string | null;
  lastUpdatedLabel: string | null;
  dataSource: 'live' | 'cache' | null;
  refresh: () => Promise<void>;
};

const DEFAULT_POLL_INTERVAL_MS = 10 * 60 * 1000;
const DEV_POLL_INTERVAL_MS = 30 * 1000;
let sessionLastSuccess: {
  items: EarthquakeListItem[];
  updatedAtIso: string;
} | null = null;

function getPollIntervalMs(): number {
  const fromEnv = Number(process.env.EXPO_PUBLIC_POLL_MS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return fromEnv;
  }
  const isDev = process.env.NODE_ENV !== 'production';
  return isDev ? DEV_POLL_INTERVAL_MS : DEFAULT_POLL_INTERVAL_MS;
}

export function useRecentEarthquakes(timeWindow: EarthquakeTimeWindow): UseRecentEarthquakesResult {
  const [items, setItems] = useState<EarthquakeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'live' | 'cache' | null>(null);
  const isFetchingRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastSuccessRef = useRef<{
    items: EarthquakeListItem[];
    updatedAtIso: string;
  } | null>(null);

  const runFetch = useCallback(
    async (refreshing = false, silent = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (refreshing) {
        setIsRefreshing(true);
      } else if (!silent) {
        setIsLoading(true);
      }
      setError(null);
      setInfoMessage(null);

      try {
        const data = await getRecentEarthquakes({
          hours: toHours(timeWindow),
          minMag: 2.5,
        });
        setItems(data);
        setDataSource('live');
        setInfoMessage(null);
        const updatedAtIso = new Date().toISOString();
        setLastUpdatedLabel(formatEventTimeCroatia(updatedAtIso));
        lastSuccessRef.current = { items: data, updatedAtIso };
        sessionLastSuccess = { items: data, updatedAtIso };
        await saveEarthquakesCache(
          timeWindow,
          data.map((item) => item.raw),
        );
      } catch (fetchError) {
        const byWindow = await loadEarthquakesCache(timeWindow).catch(() => null);
        const latest = await loadLatestEarthquakesCache().catch(() => null);
        const fallback = byWindow ?? latest;

        if (fallback) {
          const mapped = fallback.events.map((event) => toEarthquakeListItem(event));
          setItems(mapped);
          setDataSource('cache');
          setLastUpdatedLabel(formatEventTimeCroatia(fallback.updatedAtIso));
          setInfoMessage('Showing cached data (offline fallback).');
          setError(null);
          lastSuccessRef.current = { items: mapped, updatedAtIso: fallback.updatedAtIso };
          sessionLastSuccess = { items: mapped, updatedAtIso: fallback.updatedAtIso };
        } else if (lastSuccessRef.current) {
          setItems(lastSuccessRef.current.items);
          setDataSource('cache');
          setLastUpdatedLabel(formatEventTimeCroatia(lastSuccessRef.current.updatedAtIso));
          setInfoMessage('Showing last in-memory data (offline fallback).');
          setError(null);
        } else if (sessionLastSuccess) {
          setItems(sessionLastSuccess.items);
          setDataSource('cache');
          setLastUpdatedLabel(formatEventTimeCroatia(sessionLastSuccess.updatedAtIso));
          setInfoMessage('Showing session fallback data (offline).');
          setError(null);
        } else {
          setError(
            fetchError instanceof Error ? fetchError.message : 'Failed to fetch earthquakes.',
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [timeWindow],
  );

  useEffect(() => {
    void runFetch();
  }, [runFetch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (appStateRef.current === 'active') {
        void runFetch(false, true);
      }
    }, getPollIntervalMs());

    return () => {
      clearInterval(interval);
    };
  }, [runFetch]);

  const refresh = useCallback(async () => {
    await runFetch(true);
  }, [runFetch]);

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    infoMessage,
    lastUpdatedLabel,
    dataSource,
    refresh,
  };
}
