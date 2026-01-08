import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRecentEarthquakes } from '../../src/data/emsc/emsc.client';
describe('fetchRecentEarthquakes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds correct query and returns data', async () => {
    const mockResponse = {
      type: 'FeatureCollection',
      metadata: { count: 1 },
      features: [],
    };

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const from = new Date('2026-01-01T00:00:00Z');
    const to = new Date('2026-01-02T00:00:00Z');

    const result = await fetchRecentEarthquakes({ from, to });

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(result).toEqual(mockResponse);

    const calledUrl = new URL(fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl.searchParams.get('format')).toBe('geojson');
    expect(calledUrl.searchParams.get('starttime')).toBe(from.toISOString());
    expect(calledUrl.searchParams.get('endtime')).toBe(to.toISOString());
  });

  it('throws when EMSC responds with error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(
      fetchRecentEarthquakes({
        from: new Date(),
        to: new Date(),
      }),
    ).rejects.toThrow('EMSC request failed');
  });
});
