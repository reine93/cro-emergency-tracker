import { describe, expect, it } from 'vitest';
import {
  buildGamificationAnalyticsSummary,
  summaryToCsv,
} from '../../src/services/analytics/analytics-summary.service';

describe('buildGamificationAnalyticsSummary', () => {
  it('computes module completion, notification open rate and xp progression', () => {
    const summary = buildGamificationAnalyticsSummary([
      {
        id: '1',
        atIso: '2026-01-01T10:00:00.000Z',
        deviceId: 'd1',
        sessionId: 's1',
        name: 'module_session_started',
        payload: { module: 'quiz' },
      },
      {
        id: '2',
        atIso: '2026-01-01T10:05:00.000Z',
        deviceId: 'd1',
        sessionId: 's1',
        name: 'module_session_completed',
        payload: { module: 'quiz' },
      },
      {
        id: '3',
        atIso: '2026-01-01T11:00:00.000Z',
        deviceId: 'd1',
        sessionId: 's1',
        name: 'notification_sent',
      },
      {
        id: '4',
        atIso: '2026-01-01T11:01:00.000Z',
        deviceId: 'd1',
        sessionId: 's1',
        name: 'notification_opened',
      },
      {
        id: '5',
        atIso: '2026-01-01T12:00:00.000Z',
        deviceId: 'd1',
        sessionId: 's1',
        name: 'xp_progress_snapshot',
        payload: { totalXp: 120, level: 2, streakDays: 3 },
      },
    ]);

    expect(summary.moduleSessions.quiz.started).toBe(1);
    expect(summary.moduleSessions.quiz.completed).toBe(1);
    expect(summary.moduleSessions.quiz.completionRate).toBe(100);
    expect(summary.notificationOpenRate.openRate).toBe(100);
    expect(summary.xpProgression).toHaveLength(1);
    expect(summary.streakRetention.bucket2to3).toBe(1);
  });
});

describe('summaryToCsv', () => {
  it('exports csv rows', () => {
    const csv = summaryToCsv(
      buildGamificationAnalyticsSummary([
        {
          id: '1',
          atIso: '2026-01-01T00:00:00.000Z',
          deviceId: 'd1',
          sessionId: 's1',
          name: 'xp_progress_snapshot',
          payload: { totalXp: 50, level: 1, streakDays: 1 },
        },
      ]),
    );

    expect(csv).toContain('section,key,value');
    expect(csv).toContain('xp_progression.2026-01-01,total_xp,50');
  });
});
