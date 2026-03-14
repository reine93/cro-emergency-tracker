import { fetchRecentEarthquakes } from '../data/emsc/emsc.client';
import type { EmscFeature, EmscFeatureCollection } from '../data/emsc/emsc.types';
import type { EarthquakeEvent } from '../domain/earthquake.types';
import { mapEmscToEarthquake } from '../mappers/earthquake.mapper';

export type BBox = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

export const CROATIA_BBOX: BBox = {
  minLat: 42.0,
  maxLat: 46.7,
  minLon: 13.2,
  maxLon: 19.5,
};

export const CROATIA_QUERY_BBOX: BBox = {
  minLat: 41.5,
  maxLat: 47.2,
  minLon: 12.5,
  maxLon: 20.5,
};

export type GetRecentEarthquakesParams = {
  hours?: number;
  minMag?: number;
};

type EarthquakeServiceDeps = {
  fetchRecentEarthquakes: (params: {
    from: Date;
    to: Date;
    bbox?: BBox;
  }) => Promise<EmscFeatureCollection>;
  mapEmscToEarthquake: (feature: EmscFeature) => EarthquakeEvent;
};

const defaultDeps: EarthquakeServiceDeps = {
  fetchRecentEarthquakes,
  mapEmscToEarthquake,
};

function isInsideBBox(event: EarthquakeEvent, bbox: BBox): boolean {
  return (
    event.latitude >= bbox.minLat &&
    event.latitude <= bbox.maxLat &&
    event.longitude >= bbox.minLon &&
    event.longitude <= bbox.maxLon
  );
}

export async function getRecentEarthquakes(
  params: GetRecentEarthquakesParams = {},
  deps: EarthquakeServiceDeps = defaultDeps,
): Promise<EarthquakeEvent[]> {
  const hours = params.hours ?? 24;
  const minMag = params.minMag ?? 2.5;

  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error('"hours" must be a positive number');
  }
  if (!Number.isFinite(minMag) || minMag < 0) {
    throw new Error('"minMag" must be a non-negative number');
  }

  const to = new Date();
  const from = new Date(to.getTime() - hours * 60 * 60 * 1000);

  const data = await deps.fetchRecentEarthquakes({
    from,
    to,
    bbox: CROATIA_QUERY_BBOX,
  });

  return data.features
    .map((feature) => deps.mapEmscToEarthquake(feature))
    .filter((event) => isInsideBBox(event, CROATIA_BBOX) || event.magnitude >= minMag)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}
