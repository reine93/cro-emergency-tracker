import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import {
  exportAnalyticsCsvHandler,
  getAnalyticsSummaryHandler,
  ingestAnalyticsEventsHandler,
} from '../../src/controllers/analytics.controller';
import { createApp } from '../../src/app';

vi.mock('../../src/data/analytics/analytics-events.store', () => ({
  appendAnalyticsEvents: vi.fn().mockReturnValue(2),
  getAnalyticsEvents: vi.fn().mockReturnValue([]),
}));

vi.mock('../../src/services/analytics/analytics-summary.service', () => ({
  buildGamificationAnalyticsSummary: vi.fn().mockReturnValue({
    totals: { events: 0, devices: 0 },
    moduleSessions: {
      quiz: { started: 0, completed: 0, completionRate: 0 },
      kit: { started: 0, completed: 0, completionRate: 0 },
      home: { started: 0, completed: 0, completionRate: 0 },
    },
    streakSessionState: { latestStreakDays: 0, maxStreakDaysSeen: 0, snapshotCount: 0 },
    notificationOpenRate: { sent: 0, opened: 0, openRate: 0 },
    xpProgression: [],
  }),
  summaryToCsv: vi.fn().mockReturnValue('section,key,value\n'),
}));

function createResponseMock(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
}

describe('ingestAnalyticsEventsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts valid events payload', () => {
    const req = {
      body: {
        events: [
          {
            id: 'e1',
            atIso: '2026-01-01T00:00:00.000Z',
            deviceId: 'd1',
            sessionId: 's1',
            name: 'module_session_started',
          },
          {
            id: 'e2',
            atIso: '2026-01-01T00:01:00.000Z',
            deviceId: 'd1',
            sessionId: 's1',
            name: 'xp_progress_snapshot',
          },
        ],
      },
    } as unknown as Request;
    const res = createResponseMock();

    ingestAnalyticsEventsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true, accepted: 2 });
  });

  it('rejects invalid payload', () => {
    const req = { body: { events: [{ id: 'e1' }] } } as unknown as Request;
    const res = createResponseMock();

    ingestAnalyticsEventsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid analytics events payload' });
  });
});

describe('summary/export handlers', () => {
  it('returns json summary', () => {
    const req = {} as Request;
    const res = createResponseMock();

    getAnalyticsSummaryHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('returns csv export', () => {
    const req = {} as Request;
    const res = createResponseMock();

    exportAnalyticsCsvHandler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('section,key,value\n');
  });
});

describe('analytics route registration', () => {
  it('registers analytics routes', () => {
    type ExpressLayer = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    };

    const app = createApp() as unknown as { _router?: { stack?: ExpressLayer[] } };
    const stack = app._router?.stack ?? [];

    const ingest = stack.find(
      (entry) => entry.route?.path === '/api/analytics/events' && entry.route.methods.post,
    );
    const summary = stack.find(
      (entry) => entry.route?.path === '/api/analytics/summary' && entry.route.methods.get,
    );
    const csv = stack.find(
      (entry) => entry.route?.path === '/api/analytics/export.csv' && entry.route.methods.get,
    );

    expect(ingest).toBeDefined();
    expect(summary).toBeDefined();
    expect(csv).toBeDefined();
  });
});
