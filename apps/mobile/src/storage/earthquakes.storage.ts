import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EarthquakeListItem } from '../types/earthquake';
import type { EarthquakeTimeWindow } from '../hooks/useRecentEarthquakes';

type CachedEarthquakeFeed = {
  window: EarthquakeTimeWindow;
  updatedAtIso: string;
  items: EarthquakeListItem[];
};

function keyForWindow(window: EarthquakeTimeWindow): string {
  return `earthquakes_cache_${window}`;
}

export async function saveEarthquakesCache(
  window: EarthquakeTimeWindow,
  items: EarthquakeListItem[],
): Promise<void> {
  const payload: CachedEarthquakeFeed = {
    window,
    updatedAtIso: new Date().toISOString(),
    items,
  };

  await AsyncStorage.setItem(keyForWindow(window), JSON.stringify(payload));
}

export async function loadEarthquakesCache(
  window: EarthquakeTimeWindow,
): Promise<CachedEarthquakeFeed | null> {
  const raw = await AsyncStorage.getItem(keyForWindow(window));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedEarthquakeFeed;
    if (!parsed || !Array.isArray(parsed.items) || typeof parsed.updatedAtIso !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
