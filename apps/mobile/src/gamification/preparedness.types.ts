export type PreparednessModule = 'quiz' | 'kit' | 'home';

export type PreparednessBadgeId = 'first_action' | 'level_2' | 'level_4' | 'streak_7' | 'score_60';

export type PreparednessBadge = {
  id: PreparednessBadgeId;
  unlockedAt: string;
};

export type PreparednessModuleScores = Record<PreparednessModule, number>;

export type PreparednessProfile = {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  streakDays: number;
  lastActivityAt: string | null;
  badges: PreparednessBadge[];
  preparednessScore: number;
  moduleScores: PreparednessModuleScores;
};

export type PreparednessXpDelta = {
  amount: number;
  reason: string;
  atIso: string;
};
