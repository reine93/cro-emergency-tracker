import type { EmscFeatureCollection } from './emsc.types';

const EMSC_BASE_URL = 'https://www.seismicportal.eu/fdsnws/event/1/query';

export type FetchRecentEarthquakesParams = {
  from: Date;
  to: Date;
  bbox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
};

export async function fetchRecentEarthquakes(
  params: FetchRecentEarthquakesParams,
): Promise<EmscFeatureCollection> {
  const url = new URL(EMSC_BASE_URL);

  // Required params
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('starttime', params.from.toISOString());
  url.searchParams.set('endtime', params.to.toISOString());

  if (params.bbox) {
    url.searchParams.set('minlat', params.bbox.minLat.toString());
    url.searchParams.set('maxlat', params.bbox.maxLat.toString());
    url.searchParams.set('minlon', params.bbox.minLon.toString());
    url.searchParams.set('maxlon', params.bbox.maxLon.toString());
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`EMSC request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<EmscFeatureCollection>;
}
