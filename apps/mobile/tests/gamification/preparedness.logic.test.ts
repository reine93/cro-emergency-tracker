import { describe, expect, it } from 'vitest';
import {
  applyModuleScore,
  applyXpActivity,
  clampScore,
  computePreparednessScore,
  createDefaultPreparednessProfile,
  deriveUnlockedBadges,
  getLevelFromXp,
  getLevelThreshold,
  getLevelProgress,
} from '../../src/gamification/preparedness.logic';

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

  it('expands thresholds predictably beyond base levels', () => {
    expect(getLevelThreshold(6)).toBe(1000);
    expect(getLevelThreshold(7)).toBe(1350);
    expect(getLevelFromXp(1349)).toBe(6);
    expect(getLevelFromXp(1350)).toBe(7);
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

  it('does not reduce streak with same-day activity', () => {
    const base = createDefaultPreparednessProfile();
    const first = applyXpActivity(base, '2026-01-01T08:00:00.000Z', 10);
    const second = applyXpActivity(first, '2026-01-01T20:00:00.000Z', 10);
    expect(second.streakDays).toBe(1);
  });

  it('clamps module scores and overall score safely', () => {
    const base = createDefaultPreparednessProfile();
    const next = applyModuleScore(base, '2026-01-01T08:00:00.000Z', 'home', 180);
    expect(next.moduleScores.home).toBe(100);
    expect(next.preparednessScore).toBeLessThanOrEqual(100);
    expect(clampScore(Number.NaN)).toBe(0);
    expect(clampScore(-999)).toBe(0);
  });

  it('unlocks expected badges when milestones are met', () => {
    const base = createDefaultPreparednessProfile();
    const withXp = applyXpActivity(base, '2026-01-01T08:00:00.000Z', 800);
    const boosted = {
      ...withXp,
      streakDays: 7,
      preparednessScore: 65,
    };
    const badges = deriveUnlockedBadges(boosted, '2026-01-02T08:00:00.000Z').map((b) => b.id);
    expect(badges).toContain('first_action');
    expect(badges).toContain('level_2');
    expect(badges).toContain('level_4');
    expect(badges).toContain('streak_7');
    expect(badges).toContain('score_60');
  });
});
