import { describe, expect, it } from 'vitest';
import {
  applyModuleScore,
  applyXpActivity,
  computePreparednessScore,
  createDefaultPreparednessProfile,
  getLevelFromXp,
  getLevelProgress,
} from './preparedness.logic';

describe('preparedness level logic', () => {
  it('calculates expected levels for baseline thresholds', () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(99)).toBe(1);
    expect(getLevelFromXp(100)).toBe(2);
    expect(getLevelFromXp(250)).toBe(3);
    expect(getLevelFromXp(450)).toBe(4);
    expect(getLevelFromXp(700)).toBe(5);
  });

  it('returns current/next progress values', () => {
    const progress = getLevelProgress(275);
    expect(progress.level).toBe(3);
    expect(progress.currentLevelXp).toBe(25);
    expect(progress.nextLevelXp).toBe(200);
  });
});

describe('preparedness score and streak updates', () => {
  it('aggregates module scores with streak contribution', () => {
    const score = computePreparednessScore({ quiz: 80, kit: 60, home: 90 }, 7);
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('increments streak on next day activity', () => {
    const base = createDefaultPreparednessProfile();
    const day1 = applyXpActivity(base, '2026-01-01T08:00:00.000Z', 20);
    const day2 = applyXpActivity(day1, '2026-01-02T08:00:00.000Z', 20);
    expect(day2.streakDays).toBe(2);
  });

  it('resets streak when gap is more than one day', () => {
    const base = createDefaultPreparednessProfile();
    const day1 = applyXpActivity(base, '2026-01-01T08:00:00.000Z', 20);
    const day4 = applyXpActivity(day1, '2026-01-04T08:00:00.000Z', 20);
    expect(day4.streakDays).toBe(1);
  });

  it('updates module score and recalculates preparedness score', () => {
    const base = createDefaultPreparednessProfile();
    const next = applyModuleScore(base, '2026-01-01T08:00:00.000Z', 'quiz', 75);
    expect(next.moduleScores.quiz).toBe(75);
    expect(next.preparednessScore).toBeGreaterThan(0);
  });
});
