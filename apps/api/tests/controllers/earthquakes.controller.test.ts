import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../../src/services/earthquakes.service', () => ({
  getRecentEarthquakes: vi.fn(),
}));

vi.mock('../../src/data/debug/injected-earthquakes.store', () => ({
  injectDebugEarthquake: vi.fn(),
}));

import { getRecentEarthquakes } from '../../src/services/earthquakes.service';
import { injectDebugEarthquake } from '../../src/data/debug/injected-earthquakes.store';
import {
  getRecentEarthquakesHandler,
  injectDebugEarthquakeHandler,
} from '../../src/controllers/earthquakes.controller';
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
    delete process.env.NODE_ENV;
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

  it('returns 502 when service throws', async () => {
    vi.mocked(getRecentEarthquakes).mockRejectedValueOnce(new Error('upstream failed'));

    const req = {
      query: { hours: '24', minMag: '2.5' },
    } as unknown as Request;
    const res = createResponseMock();

    await getRecentEarthquakesHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch earthquake data',
    });
  });
});

describe('injectDebugEarthquakeHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.NODE_ENV;
  });

  it('returns 201 with injected item in non-production mode', () => {
    vi.mocked(injectDebugEarthquake).mockReturnValueOnce({
      id: 'debug_1',
      source: 'EMSC',
      time: '2026-01-01T00:00:00Z',
      magnitude: 4.2,
      latitude: 45.8,
      longitude: 16.0,
      place: 'CROATIA (DEBUG)',
    });

    const req = {
      body: { magnitude: 4.2 },
    } as unknown as Request;
    const res = createResponseMock();

    injectDebugEarthquakeHandler(req, res);

    expect(injectDebugEarthquake).toHaveBeenCalledWith({ magnitude: 4.2 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      item: expect.objectContaining({ id: 'debug_1' }),
    });
  });

  it('returns 404 in production mode', () => {
    process.env.NODE_ENV = 'production';
    const req = { body: { magnitude: 5 } } as unknown as Request;
    const res = createResponseMock();

    injectDebugEarthquakeHandler(req, res);

    expect(injectDebugEarthquake).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });

  it('returns 400 when payload is invalid', () => {
    vi.mocked(injectDebugEarthquake).mockImplementationOnce(() => {
      throw new Error('"magnitude" must be a finite number');
    });

    const req = { body: { magnitude: 'oops' } } as unknown as Request;
    const res = createResponseMock();

    injectDebugEarthquakeHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: '"magnitude" must be a finite number',
    });
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

  it('registers POST /api/debug/earthquakes/inject', () => {
    type ExpressLayer = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    };

    const app = createApp() as unknown as { _router?: { stack?: ExpressLayer[] } };
    const stack = app._router?.stack ?? [];
    const layer = stack.find(
      (entry) => entry.route?.path === '/api/debug/earthquakes/inject' && entry.route.methods.post,
    );

    expect(layer).toBeDefined();
  });
});
