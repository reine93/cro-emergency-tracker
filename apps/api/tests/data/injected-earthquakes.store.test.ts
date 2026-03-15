import { afterEach, describe, expect, it } from 'vitest';
import {
  clearDebugEarthquakesForTests,
  getActiveDebugEarthquakes,
  injectDebugEarthquake,
} from '../../src/data/debug/injected-earthquakes.store';

describe('injected-earthquakes.store', () => {
  afterEach(() => {
    clearDebugEarthquakesForTests();
  });

  it('stores and returns injected debug events', () => {
    const event = injectDebugEarthquake({ magnitude: 5 }, new Date('2026-01-01T00:00:00Z'));

    const events = getActiveDebugEarthquakes(new Date('2026-01-01T00:10:00Z').getTime());
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe(event.id);
    expect(events[0].magnitude).toBe(5);
  });

  it('expires injected events after ttl', () => {
    injectDebugEarthquake({ magnitude: 4, ttlMinutes: 1 }, new Date('2026-01-01T00:00:00Z'));

    const events = getActiveDebugEarthquakes(new Date('2026-01-01T00:02:00Z').getTime());
    expect(events).toHaveLength(0);
  });
});
