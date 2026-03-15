import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import {
  previewGamificationRemindersHandler,
  registerExpoPushTokenHandler,
} from '../../src/controllers/notifications.controller';
import { createApp } from '../../src/app';

vi.mock('../../src/data/push/push-registrations.store', () => ({
  upsertPushRegistration: vi.fn().mockReturnValue({
    registeredAt: '2026-01-01T00:00:00.000Z',
  }),
  getAllPushRegistrations: vi.fn().mockReturnValue([]),
}));

vi.mock('../../src/services/push/push-reminders.service', () => ({
  planGamificationReminders: vi.fn().mockReturnValue([]),
}));

function createResponseMock(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('registerExpoPushTokenHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  it('returns 200 for valid payload', () => {
    const req = {
      body: {
        deviceId: 'device-1',
        expoPushToken: 'ExponentPushToken[test]',
        platform: 'ios',
        preferences: {
          earthquakes: true,
          dailyChallenge: true,
          streakAtRisk: true,
          badgeUnlocked: true,
          levelUp: true,
          earthquakeTrainingCombo: true,
          quietHoursStart: 22,
          quietHoursEnd: 7,
          cooldownSeconds: 120,
        },
      },
    } as unknown as Request;
    const res = createResponseMock();

    registerExpoPushTokenHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      registeredAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('returns 400 for invalid payload', () => {
    const req = {
      body: {
        deviceId: '',
      },
    } as unknown as Request;
    const res = createResponseMock();

    registerExpoPushTokenHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid push registration payload',
    });
  });
});

describe('previewGamificationRemindersHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  it('returns 200 with items in non-production mode', () => {
    const req = {} as Request;
    const res = createResponseMock();

    previewGamificationRemindersHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ items: [] });
  });

  it('returns 404 in production mode', () => {
    process.env.NODE_ENV = 'production';
    const req = {} as Request;
    const res = createResponseMock();

    previewGamificationRemindersHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
  });
});

describe('notifications route registration', () => {
  it('registers POST /api/notifications/expo/register', () => {
    type ExpressLayer = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    };

    const app = createApp() as unknown as { _router?: { stack?: ExpressLayer[] } };
    const stack = app._router?.stack ?? [];
    const layer = stack.find(
      (entry) =>
        entry.route?.path === '/api/notifications/expo/register' && entry.route.methods.post,
    );

    expect(layer).toBeDefined();
  });

  it('registers GET /api/debug/notifications/reminders/preview', () => {
    type ExpressLayer = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
      };
    };

    const app = createApp() as unknown as { _router?: { stack?: ExpressLayer[] } };
    const stack = app._router?.stack ?? [];
    const layer = stack.find(
      (entry) =>
        entry.route?.path === '/api/debug/notifications/reminders/preview' &&
        entry.route.methods.get,
    );

    expect(layer).toBeDefined();
  });
});
