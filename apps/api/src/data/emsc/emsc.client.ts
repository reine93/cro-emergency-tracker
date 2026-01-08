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
  // ---- Parameter validation ----
  if (params.from >= params.to) {
    throw new Error('Invalid date range: "from" must be before "to"');
  }

  if (params.bbox) {
    const { minLat, maxLat, minLon, maxLon } = params.bbox;

    if (minLat < -90 || minLat > 90 || maxLat < -90 || maxLat > 90) {
      throw new Error('Latitude values must be between -90 and 90');
    }

    if (minLon < -180 || minLon > 180 || maxLon < -180 || maxLon > 180) {
      throw new Error('Longitude values must be between -180 and 180');
    }

    if (minLat >= maxLat) {
      throw new Error('minLat must be less than maxLat');
    }

    if (minLon >= maxLon) {
      throw new Error('minLon must be less than maxLon');
    }
  }

  // ---- Build request ----
  const url = new URL(EMSC_BASE_URL);
  url.searchParams.set('format', 'geojson');
  url.searchParams.set('starttime', params.from.toISOString());
  url.searchParams.set('endtime', params.to.toISOString());

  if (params.bbox) {
    url.searchParams.set('minlat', params.bbox.minLat.toString());
    url.searchParams.set('maxlat', params.bbox.maxLat.toString());
    url.searchParams.set('minlon', params.bbox.minLon.toString());
    url.searchParams.set('maxlon', params.bbox.maxLon.toString());
  }

  // ---- Fetch ----
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch (err) {
    throw new Error(`Network error while contacting EMSC: ${(err as Error).message}`);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read response body');

    throw new Error(
      `EMSC request failed: ${response.status} ${response.statusText}. Body: ${errorBody}`,
    );
  }

  // ---- Runtime validation ----
  const data = await response.json();

  if (
    typeof data !== 'object' ||
    data === null ||
    data.type !== 'FeatureCollection' ||
    !data.metadata ||
    !Array.isArray(data.features)
  ) {
    throw new Error('Invalid response format from EMSC API');
  }

  return data as EmscFeatureCollection;
}
