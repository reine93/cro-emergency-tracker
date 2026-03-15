import { afterEach, describe, expect, it } from 'vitest';
import {
  clearPushRegistrationsForTests,
  getAllPushRegistrations,
  upsertPushRegistration,
} from '../../src/data/push/push-registrations.store';

const basePreferences = {
  earthquakes: true,
  dailyChallenge: true,
  streakAtRisk: true,
  badgeUnlocked: true,
  levelUp: true,
  earthquakeTrainingCombo: true,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  cooldownSeconds: 120,
};

describe('push-registrations.store', () => {
  afterEach(() => {
    clearPushRegistrationsForTests();
  });

  it('upserts registration by device id', () => {
    upsertPushRegistration({
      deviceId: 'device-1',
      expoPushToken: 'ExponentPushToken[first]',
      platform: 'ios',
      preferences: basePreferences,
      nowIso: '2026-01-01T00:00:00.000Z',
    });
    upsertPushRegistration({
      deviceId: 'device-1',
      expoPushToken: 'ExponentPushToken[second]',
      platform: 'ios',
      preferences: basePreferences,
      nowIso: '2026-01-01T01:00:00.000Z',
    });

    const items = getAllPushRegistrations();
    expect(items).toHaveLength(1);
    expect(items[0].expoPushToken).toBe('ExponentPushToken[second]');
    expect(items[0].registeredAt).toBe('2026-01-01T01:00:00.000Z');
  });
});
