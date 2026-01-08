import { describe, it, expect } from 'vitest';
import { mapEmscToEarthquake } from '../../src/mappers/earthquake.mapper';
import type { EmscFeature } from '../../src/data/emsc/emsc.types';

type EmscPropertyOverrides = {
  [Key in keyof EmscFeature['properties']]?: EmscFeature['properties'][Key] | undefined;
};

type EmscFeatureOverrides = Omit<Partial<EmscFeature>, 'properties'> & {
  properties?: EmscPropertyOverrides;
};

/**
 * Test helper to construct valid EmscFeature objects
 * while allowing partial overrides for edge cases.
 */
function makeEmscFeature(overrides: EmscFeatureOverrides = {}): EmscFeature {
  const base: EmscFeature = {
    type: 'Feature',
    id: 'default-id',
    geometry: {
      type: 'Point',
      coordinates: [0, 0, 0],
    },
    properties: {
      source_id: 'source',
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
      unid: 'default-id',
    },
  };

  return {
    ...base,
    ...overrides,
    properties: {
      ...base.properties,
      ...overrides.properties,
    },
  };
}

describe('mapEmscToEarthquake', () => {
  it('maps a valid EMSC feature to the domain model', () => {
    const feature = makeEmscFeature({
      id: 'fallback-id',
      geometry: {
        type: 'Point',
        coordinates: [19.13, 43.96, 10],
      },
      properties: {
        unid: '20260108_0000162',
        lat: 43.96,
        lon: 19.13,
        depth: 10,
        mag: 2.6,
        magtype: 'ml',
        flynn_region: 'BOSNIA AND HERZEGOVINA',
        auth: 'EMSC',
      },
    });

    const result = mapEmscToEarthquake(feature);

    expect(result).toEqual({
      id: '20260108_0000162',
      source: 'EMSC',
      time: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T01:00:00Z',
      magnitude: 2.6,
      magnitudeType: 'ml',
      depthKm: 10,
      latitude: 43.96,
      longitude: 19.13,
      place: 'BOSNIA AND HERZEGOVINA',
      authority: 'EMSC',
    });
  });

  it('falls back to feature.id when unid is missing', () => {
    const feature = makeEmscFeature({
      id: 'feature-id',
      properties: {
        unid: undefined,
      },
    });

    const result = mapEmscToEarthquake(feature);

    expect(result.id).toBe('feature-id');
  });

  it('drops negative depth values', () => {
    const feature = makeEmscFeature({
      geometry: {
        type: 'Point',
        coordinates: [10, 20, -5],
      },
      properties: {
        depth: -5,
      },
    });

    const result = mapEmscToEarthquake(feature);

    expect(result.depthKm).toBeUndefined();
  });

  it('falls back to geometry coordinates when lat/lon are missing', () => {
    const feature = makeEmscFeature({
      geometry: {
        type: 'Point',
        coordinates: [15, 45, 12],
      },
      properties: {
        lat: undefined,
        lon: undefined,
      },
    });

    const result = mapEmscToEarthquake(feature);

    expect(result.latitude).toBe(45);
    expect(result.longitude).toBe(15);
  });
});
