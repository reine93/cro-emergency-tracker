import { describe, expect, it } from 'vitest';
import { planGamificationReminders } from '../../src/services/push/push-reminders.service';

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

describe('planGamificationReminders', () => {
  it('returns daily and streak reminders when due', () => {
    const items = planGamificationReminders(
      [
        {
          deviceId: 'd1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
          preferences: basePreferences,
          registeredAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Date('2026-01-03T12:00:00.000Z'),
    );

    expect(items.some((item) => item.type === 'daily_challenge')).toBe(true);
    expect(items.some((item) => item.type === 'streak_at_risk')).toBe(true);
  });

  it('respects quiet hours', () => {
    const items = planGamificationReminders(
      [
        {
          deviceId: 'd1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
          preferences: {
            ...basePreferences,
            quietHoursStart: 10,
            quietHoursEnd: 14,
          },
          registeredAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Date('2026-01-03T11:00:00.000Z'),
    );

    expect(items).toHaveLength(0);
  });

  it('treats equal quiet-hours bounds as disabled quiet-hours', () => {
    const items = planGamificationReminders(
      [
        {
          deviceId: 'd1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
          preferences: {
            ...basePreferences,
            quietHoursStart: 0,
            quietHoursEnd: 0,
          },
          registeredAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Date('2026-01-03T00:00:00.000Z'),
    );

    expect(items.some((item) => item.type === 'daily_challenge')).toBe(true);
  });

  it('respects category toggles for reminders', () => {
    const items = planGamificationReminders(
      [
        {
          deviceId: 'd1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
          preferences: {
            ...basePreferences,
            dailyChallenge: false,
            streakAtRisk: true,
          },
          registeredAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      new Date('2026-01-03T12:00:00.000Z'),
    );

    expect(items.some((item) => item.type === 'daily_challenge')).toBe(false);
    expect(items.some((item) => item.type === 'streak_at_risk')).toBe(true);
  });

  it('does not emit reminders before minimum age thresholds', () => {
    const items = planGamificationReminders(
      [
        {
          deviceId: 'd1',
          expoPushToken: 'ExponentPushToken[test]',
          platform: 'ios',
          preferences: basePreferences,
          registeredAt: '2026-01-03T00:00:00.000Z',
        },
      ],
      new Date('2026-01-03T12:00:00.000Z'),
    );

    expect(items).toHaveLength(0);
  });
});
