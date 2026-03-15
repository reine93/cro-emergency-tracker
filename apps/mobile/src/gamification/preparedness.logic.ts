import type {
  PreparednessBadge,
  PreparednessBadgeId,
  PreparednessModule,
  PreparednessModuleScores,
  PreparednessProfile,
} from './preparedness.types';

const BASE_LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000] as const;
const LEVEL_STEP_AFTER_BASE = 350;

const PREPAREDNESS_WEIGHTS: Record<PreparednessModule, number> = {
  quiz: 0.3,
  kit: 0.25,
  home: 0.35,
};

const STREAK_WEIGHT = 0.1;
const MAX_STREAK_SCORE_DAYS = 7;

export const DEFAULT_MODULE_SCORES: PreparednessModuleScores = {
  quiz: 0,
  kit: 0,
  home: 0,
};

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getLevelThreshold(level: number): number {
  if (level <= 1) return 0;

  if (level <= BASE_LEVEL_THRESHOLDS.length) {
    return BASE_LEVEL_THRESHOLDS[level - 1] ?? 0;
  }

  const beyondBase = level - BASE_LEVEL_THRESHOLDS.length;
  const baseMax = BASE_LEVEL_THRESHOLDS[BASE_LEVEL_THRESHOLDS.length - 1] ?? 1000;
  return baseMax + beyondBase * LEVEL_STEP_AFTER_BASE;
}

export function getLevelFromXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;

  while (xp >= getLevelThreshold(level + 1)) {
    level += 1;
  }

  return level;
}

export function getLevelProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
} {
  const xp = Math.max(0, Math.floor(totalXp));
  const level = getLevelFromXp(xp);
  const levelFloor = getLevelThreshold(level);
  const nextFloor = getLevelThreshold(level + 1);

  return {
    level,
    currentLevelXp: xp - levelFloor,
    nextLevelXp: Math.max(1, nextFloor - levelFloor),
  };
}

function dayStamp(dateIso: string): string {
  const date = new Date(dateIso);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayDiff(fromIso: string, toIso: string): number {
  const from = Date.parse(dayStamp(fromIso));
  const to = Date.parse(dayStamp(toIso));
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.floor((to - from) / (24 * 60 * 60 * 1000));
}

export function getNextStreakDays(
  lastActivityAt: string | null,
  nowIso: string,
  currentStreak: number,
): number {
  if (!lastActivityAt) return 1;

  const diff = dayDiff(lastActivityAt, nowIso);
  if (diff <= 0) return Math.max(1, currentStreak);
  if (diff === 1) return Math.max(1, currentStreak + 1);
  return 1;
}

export function computePreparednessScore(
  moduleScores: PreparednessModuleScores,
  streakDays: number,
): number {
  const moduleContribution =
    clampScore(moduleScores.quiz) * PREPAREDNESS_WEIGHTS.quiz +
    clampScore(moduleScores.kit) * PREPAREDNESS_WEIGHTS.kit +
    clampScore(moduleScores.home) * PREPAREDNESS_WEIGHTS.home;

  const streakRatio =
    Math.min(MAX_STREAK_SCORE_DAYS, Math.max(0, streakDays)) / MAX_STREAK_SCORE_DAYS;
  const streakContribution = streakRatio * 100 * STREAK_WEIGHT;

  return clampScore(moduleContribution + streakContribution);
}

function hasBadge(badges: PreparednessBadge[], id: PreparednessBadgeId): boolean {
  return badges.some((badge) => badge.id === id);
}

export function deriveUnlockedBadges(
  profile: PreparednessProfile,
  nowIso: string,
): PreparednessBadge[] {
  const next = [...profile.badges];

  const unlock = (id: PreparednessBadgeId) => {
    if (!hasBadge(next, id)) {
      next.push({ id, unlockedAt: nowIso });
    }
  };

  if (profile.totalXp > 0) unlock('first_action');
  if (profile.level >= 2) unlock('level_2');
  if (profile.level >= 4) unlock('level_4');
  if (profile.streakDays >= 7) unlock('streak_7');
  if (profile.preparednessScore >= 60) unlock('score_60');

  return next;
}

export function createDefaultPreparednessProfile(): PreparednessProfile {
  const levelProgress = getLevelProgress(0);
  return {
    totalXp: 0,
    level: levelProgress.level,
    currentLevelXp: levelProgress.currentLevelXp,
    nextLevelXp: levelProgress.nextLevelXp,
    streakDays: 0,
    lastActivityAt: null,
    badges: [],
    preparednessScore: 0,
    moduleScores: { ...DEFAULT_MODULE_SCORES },
  };
}

export function applyXpActivity(
  profile: PreparednessProfile,
  nowIso: string,
  xpDelta: number,
): PreparednessProfile {
  const totalXp = Math.max(0, profile.totalXp + Math.round(xpDelta));
  const streakDays = getNextStreakDays(profile.lastActivityAt, nowIso, profile.streakDays);
  const levelProgress = getLevelProgress(totalXp);

  const next: PreparednessProfile = {
    ...profile,
    totalXp,
    level: levelProgress.level,
    currentLevelXp: levelProgress.currentLevelXp,
    nextLevelXp: levelProgress.nextLevelXp,
    streakDays,
    lastActivityAt: nowIso,
    preparednessScore: computePreparednessScore(profile.moduleScores, streakDays),
  };

  return {
    ...next,
    badges: deriveUnlockedBadges(next, nowIso),
  };
}

export function applyModuleScore(
  profile: PreparednessProfile,
  nowIso: string,
  module: PreparednessModule,
  score: number,
): PreparednessProfile {
  const moduleScores: PreparednessModuleScores = {
    ...profile.moduleScores,
    [module]: clampScore(score),
  };
  const streakDays = getNextStreakDays(profile.lastActivityAt, nowIso, profile.streakDays);

  const next: PreparednessProfile = {
    ...profile,
    moduleScores,
    streakDays,
    lastActivityAt: nowIso,
    preparednessScore: computePreparednessScore(moduleScores, streakDays),
  };

  return {
    ...next,
    badges: deriveUnlockedBadges(next, nowIso),
  };
}
