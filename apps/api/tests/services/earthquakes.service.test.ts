import { describe, expect, it, vi } from 'vitest';
import type { EmscFeature } from '../../src/data/emsc/emsc.types';
import type { EarthquakeEvent } from '../../src/domain/earthquake.types';
import {
  CROATIA_QUERY_BBOX,
  getRecentEarthquakes,
} from '../../src/services/earthquakes.service';

function makeFeature(id: string): EmscFeature {
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Point',
      coordinates: [0, 0, 0],
    },
    properties: {
      source_id: id,
      source_catalog: 'EMSC',
      lastupdate: '2026-01-01T01:00:00Z',
      time: '2026-01-01T00:00:00Z',
      flynn_region: 'UNKNOWN',
      lat: 0,
      lon: 0,
      depth: 0,
      evtype: 'ke',
      auth: 'EMSC',
      mag: 0,
      magtype: 'ml',
      unid: id,
    },
  };
}

describe('getRecentEarthquakes', () => {
  it('applies filtering and sorts by most recent first', async () => {
    const features = [
      makeFeature('inside-old'),
      makeFeature('outside-low'),
      makeFeature('outside-high'),
      makeFeature('inside-new'),
    ];

    const byId: Record<string, EarthquakeEvent> = {
      'inside-old': {
        id: 'inside-old',
        source: 'EMSC',
        time: '2026-01-01T01:00:00Z',
        magnitude: 1.2,
        latitude: 45.5,
        longitude: 16.2,
        place: 'CROATIA',
      },
      'outside-low': {
        id: 'outside-low',
        source: 'EMSC',
        time: '2026-01-01T02:00:00Z',
        magnitude: 1.9,
        latitude: 48.0,
        longitude: 21.0,
        place: 'OUTSIDE',
      },
      'outside-high': {
        id: 'outside-high',
        source: 'EMSC',
        time: '2026-01-01T03:00:00Z',
        magnitude: 3.8,
        latitude: 48.1,
        longitude: 21.1,
        place: 'OUTSIDE',
      },
      'inside-new': {
        id: 'inside-new',
        source: 'EMSC',
        time: '2026-01-01T04:00:00Z',
        magnitude: 1.0,
        latitude: 45.8,
        longitude: 16.0,
        place: 'CROATIA',
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      type: 'FeatureCollection',
      metadata: { count: features.length },
      features,
    });
    const mapMock = vi.fn((feature: EmscFeature) => byId[feature.id]);

    const result = await getRecentEarthquakes(
      { hours: 24, minMag: 2.5 },
      {
        fetchRecentEarthquakes: fetchMock,
        mapEmscToEarthquake: mapMock,
      },
    );

    expect(result.map((event) => event.id)).toEqual(['inside-new', 'outside-high', 'inside-old']);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(mapMock).toHaveBeenCalledTimes(features.length);

    const [{ from, to, bbox }] = fetchMock.mock.calls[0];
    expect(bbox).toEqual(CROATIA_QUERY_BBOX);
    expect(from).toBeInstanceOf(Date);
    expect(to).toBeInstanceOf(Date);
    expect(to.getTime()).toBeGreaterThan(from.getTime());
  });

  it('rejects invalid params', async () => {
    const deps = {
      fetchRecentEarthquakes: vi.fn(),
      mapEmscToEarthquake: vi.fn(),
    };

    await expect(getRecentEarthquakes({ hours: 0 }, deps)).rejects.toThrow('"hours"');
    await expect(getRecentEarthquakes({ minMag: -1 }, deps)).rejects.toThrow('"minMag"');
    expect(deps.fetchRecentEarthquakes).not.toHaveBeenCalled();
  });
});
