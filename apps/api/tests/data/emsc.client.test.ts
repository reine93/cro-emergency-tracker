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

    const [calledUrl, options] = fetchSpy.mock.calls[0];
    const url = new URL(calledUrl as string);

    expect(url.searchParams.get('format')).toBe('json');
    expect(url.searchParams.get('starttime')).toBe(from.toISOString());
    expect(url.searchParams.get('endtime')).toBe(to.toISOString());
    expect(options).toMatchObject({
      headers: {
        Accept: 'application/json',
      },
    });
  });

  it('includes bbox parameters when provided', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        metadata: { count: 0 },
        features: [],
      }),
    } as Response);

    await fetchRecentEarthquakes({
      from: new Date('2026-01-01T00:00:00Z'),
      to: new Date('2026-01-02T00:00:00Z'),
      bbox: {
        minLat: 40,
        maxLat: 50,
        minLon: 10,
        maxLon: 20,
      },
    });

    const url = new URL(fetchSpy.mock.calls[0][0] as string);

    expect(url.searchParams.get('minlatitude')).toBe('40');
    expect(url.searchParams.get('maxlatitude')).toBe('50');
    expect(url.searchParams.get('minlongitude')).toBe('10');
    expect(url.searchParams.get('maxlongitude')).toBe('20');
  });

  it('throws when EMSC responds with error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Server exploded',
    } as Response);

    await expect(
      fetchRecentEarthquakes({
        from: new Date('2026-01-01'),
        to: new Date('2026-01-02'),
      }),
    ).rejects.toThrow('EMSC request failed');
  });

  it('throws when network request fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetchRecentEarthquakes({
        from: new Date('2026-01-01'),
        to: new Date('2026-01-02'),
      }),
    ).rejects.toThrow('Network error');
  });

  it('throws on invalid date range', async () => {
    await expect(
      fetchRecentEarthquakes({
        from: new Date('2026-01-02'),
        to: new Date('2026-01-01'),
      }),
    ).rejects.toThrow('Invalid date range');
  });
});
