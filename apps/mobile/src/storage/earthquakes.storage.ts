import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EarthquakeEvent } from '@cro/shared';
import type { EarthquakeTimeWindow } from '../hooks/useRecentEarthquakes';

type CachedEarthquakeFeed = {
  window: EarthquakeTimeWindow;
  updatedAtIso: string;
  events: EarthquakeEvent[];
};

const LATEST_CACHE_KEY = 'earthquakes_cache_latest';
const memoryCacheByWindow: Partial<Record<EarthquakeTimeWindow, CachedEarthquakeFeed>> = {};
let memoryLatestCache: CachedEarthquakeFeed | null = null;

function keyForWindow(window: EarthquakeTimeWindow): string {
  return `earthquakes_cache_${window}`;
}

export async function saveEarthquakesCache(
  window: EarthquakeTimeWindow,
  events: EarthquakeEvent[],
): Promise<void> {
  const payload: CachedEarthquakeFeed = {
    window,
    updatedAtIso: new Date().toISOString(),
    events,
  };
  memoryCacheByWindow[window] = payload;
  memoryLatestCache = payload;

  try {
    await AsyncStorage.setItem(keyForWindow(window), JSON.stringify(payload));
    await AsyncStorage.setItem(LATEST_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Graceful no-op when native storage is unavailable in the current runtime.
  }
}

export async function loadEarthquakesCache(
  window: EarthquakeTimeWindow,
): Promise<CachedEarthquakeFeed | null> {
  const inMemory = memoryCacheByWindow[window];
  if (inMemory) {
    return inMemory;
  }

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(keyForWindow(window));
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedEarthquakeFeed;
    if (!parsed || !Array.isArray(parsed.events) || typeof parsed.updatedAtIso !== 'string') {
      return null;
    }
    memoryCacheByWindow[window] = parsed;
    memoryLatestCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export async function loadLatestEarthquakesCache(): Promise<CachedEarthquakeFeed | null> {
  if (memoryLatestCache) {
    return memoryLatestCache;
  }

  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(LATEST_CACHE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedEarthquakeFeed;
    if (!parsed || !Array.isArray(parsed.events) || typeof parsed.updatedAtIso !== 'string') {
      return null;
    }
    memoryLatestCache = parsed;
    memoryCacheByWindow[parsed.window] = parsed;
    return parsed;
  } catch {
    return null;
  }
}
