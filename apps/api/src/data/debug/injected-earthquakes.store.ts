import type { EarthquakeEvent } from '@cro/shared';

type InjectDebugEarthquakeInput = {
  magnitude?: number;
  time?: string;
  depthKm?: number;
  latitude?: number;
  longitude?: number;
  place?: string;
  authority?: string;
  ttlMinutes?: number;
};

type StoredDebugEvent = {
  event: EarthquakeEvent;
  expiresAtMs: number;
};

const DEFAULT_TTL_MINUTES = 30;
const DEFAULT_PLACE = 'CROATIA (DEBUG)';
const DEFAULT_AUTHORITY = 'DEBUG';
const DEFAULT_MAGNITUDE = 4.2;
const DEFAULT_DEPTH_KM = 10;
const DEFAULT_LATITUDE = 45.815;
const DEFAULT_LONGITUDE = 15.982;

const store: StoredDebugEvent[] = [];

function cleanupExpired(nowMs = Date.now()) {
  for (let i = store.length - 1; i >= 0; i -= 1) {
    if (store[i].expiresAtMs <= nowMs) {
      store.splice(i, 1);
    }
  }
}

function assertFinite(name: string, value: number) {
  if (!Number.isFinite(value)) {
    throw new Error(`"${name}" must be a finite number`);
  }
}

export function injectDebugEarthquake(
  input: InjectDebugEarthquakeInput = {},
  now = new Date(),
): EarthquakeEvent {
  const nowMs = now.getTime();
  const ttlMinutes = input.ttlMinutes ?? DEFAULT_TTL_MINUTES;
  assertFinite('ttlMinutes', ttlMinutes);
  if (ttlMinutes <= 0) {
    throw new Error('"ttlMinutes" must be greater than 0');
  }

  const magnitude = input.magnitude ?? DEFAULT_MAGNITUDE;
  assertFinite('magnitude', magnitude);

  const depthKm = input.depthKm ?? DEFAULT_DEPTH_KM;
  assertFinite('depthKm', depthKm);

  const latitude = input.latitude ?? DEFAULT_LATITUDE;
  assertFinite('latitude', latitude);
  if (latitude < -90 || latitude > 90) {
    throw new Error('"latitude" must be between -90 and 90');
  }

  const longitude = input.longitude ?? DEFAULT_LONGITUDE;
  assertFinite('longitude', longitude);
  if (longitude < -180 || longitude > 180) {
    throw new Error('"longitude" must be between -180 and 180');
  }

  const eventTime = input.time ?? now.toISOString();
  if (Number.isNaN(new Date(eventTime).getTime())) {
    throw new Error('"time" must be a valid ISO date');
  }

  cleanupExpired(nowMs);

  const event: EarthquakeEvent = {
    id: `debug_${nowMs}_${Math.random().toString(36).slice(2, 8)}`,
    source: 'EMSC',
    time: eventTime,
    updatedAt: now.toISOString(),
    magnitude,
    depthKm,
    latitude,
    longitude,
    place: input.place ?? DEFAULT_PLACE,
    authority: input.authority ?? DEFAULT_AUTHORITY,
  };

  store.push({
    event,
    expiresAtMs: nowMs + ttlMinutes * 60 * 1000,
  });

  return event;
}

export function getActiveDebugEarthquakes(nowMs = Date.now()): EarthquakeEvent[] {
  cleanupExpired(nowMs);
  return store.map((entry) => entry.event);
}

export function clearDebugEarthquakesForTests() {
  store.length = 0;
}
