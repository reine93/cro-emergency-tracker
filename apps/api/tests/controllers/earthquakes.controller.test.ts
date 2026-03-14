import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../../src/services/earthquakes.service', () => ({
  getRecentEarthquakes: vi.fn(),
}));

import { getRecentEarthquakes } from '../../src/services/earthquakes.service';
import { getRecentEarthquakesHandler } from '../../src/controllers/earthquakes.controller';
import { createApp } from '../../src/app';

function createResponseMock(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('getRecentEarthquakesHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 200 and expected JSON shape for valid query', async () => {
    vi.mocked(getRecentEarthquakes).mockResolvedValueOnce([
      {
        id: 'evt-1',
        source: 'EMSC',
        time: '2026-01-01T00:00:00Z',
        magnitude: 2.8,
        latitude: 45.8,
        longitude: 16.0,
        place: 'CROATIA',
      },
    ]);

    const req = {
      query: { hours: '24', minMag: '2.5' },
    } as unknown as Request;
    const res = createResponseMock();

    await getRecentEarthquakesHandler(req, res);

    expect(getRecentEarthquakes).toHaveBeenCalledWith({ hours: 24, minMag: 2.5 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      items: expect.any(Array),
    });
  });

  it('returns 400 for invalid query params', async () => {
    const req = {
      query: { hours: '-1', minMag: 'abc' },
    } as unknown as Request;
    const res = createResponseMock();

    await getRecentEarthquakesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: '"hours" must be a positive number',
    });
    expect(getRecentEarthquakes).not.toHaveBeenCalled();
  });
});

describe('earthquakes route registration', () => {
  it('registers GET /api/earthquakes/recent', () => {
    type ExpressLayer = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    };

    const app = createApp() as unknown as { _router?: { stack?: ExpressLayer[] } };
    const stack = app._router?.stack ?? [];
    const layer = stack.find(
      (entry) => entry.route?.path === '/api/earthquakes/recent' && entry.route.methods.get,
    );

    expect(layer).toBeDefined();
  });
});
