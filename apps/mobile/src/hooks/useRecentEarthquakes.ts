import { useCallback, useEffect, useState } from 'react';
import type { EarthquakeListItem } from '../types/earthquake';
import { getRecentEarthquakes } from '../api/earthquakes.api';

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
  refresh: () => Promise<void>;
};

export function useRecentEarthquakes(timeWindow: EarthquakeTimeWindow): UseRecentEarthquakesResult {
  const [items, setItems] = useState<EarthquakeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runFetch = useCallback(
    async (refreshing = false) => {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await getRecentEarthquakes({
          hours: toHours(timeWindow),
          minMag: 2.5,
        });
        setItems(data);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch earthquakes.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeWindow],
  );

  useEffect(() => {
    void runFetch();
  }, [runFetch]);

  const refresh = useCallback(async () => {
    await runFetch(true);
  }, [runFetch]);

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
}
