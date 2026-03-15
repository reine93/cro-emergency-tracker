import type { RecentEarthquakesQuery, RecentEarthquakesResponse } from '@cro/shared';
import { requestJson } from './client';
import { toEarthquakeListItem } from '../types/earthquake';

function assertRecentEarthquakesResponse(
  payload: unknown,
): asserts payload is RecentEarthquakesResponse {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid response shape: expected object.');
  }

  const candidate = payload as Partial<RecentEarthquakesResponse>;
  if (!Array.isArray(candidate.items)) {
    throw new Error('Invalid response shape: expected items array.');
  }
}

export async function getRecentEarthquakes(
  query: RecentEarthquakesQuery = {},
): Promise<ReturnType<typeof toEarthquakeListItem>[]> {
  const response = await requestJson<unknown>('/api/earthquakes/recent', {
    method: 'GET',
    query: {
      hours: query.hours,
      minMag: query.minMag,
    },
  });

  assertRecentEarthquakesResponse(response);
  return response.items.map((item) => toEarthquakeListItem(item));
}
