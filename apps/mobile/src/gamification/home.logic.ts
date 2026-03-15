export type HomeSafetyCategory = 'furniture' | 'bedroom' | 'kitchen' | 'planning' | 'utilities';

export type HomeSafetyItem = {
  id: string;
  category: HomeSafetyCategory;
  weight: number;
};

export type HomeSafetyRiskTier = 'high' | 'moderate' | 'low';

export type HomeSafetyEvaluation = {
  score: number;
  completedWeight: number;
  totalWeight: number;
  riskTier: HomeSafetyRiskTier;
  categoryScores: Record<HomeSafetyCategory, number>;
};

export function toRiskTier(score: number): HomeSafetyRiskTier {
  if (score >= 75) return 'low';
  if (score >= 45) return 'moderate';
  return 'high';
}

export function evaluateHomeSafety(
  items: HomeSafetyItem[],
  completedIds: Set<string>,
): HomeSafetyEvaluation {
  let completedWeight = 0;
  let totalWeight = 0;

  const categoryTotals: Record<HomeSafetyCategory, { completed: number; total: number }> = {
    furniture: { completed: 0, total: 0 },
    bedroom: { completed: 0, total: 0 },
    kitchen: { completed: 0, total: 0 },
    planning: { completed: 0, total: 0 },
    utilities: { completed: 0, total: 0 },
  };

  for (const item of items) {
    totalWeight += item.weight;
    categoryTotals[item.category].total += item.weight;

    if (completedIds.has(item.id)) {
      completedWeight += item.weight;
      categoryTotals[item.category].completed += item.weight;
    }
  }

  const score = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  const categoryScores: Record<HomeSafetyCategory, number> = {
    furniture:
      categoryTotals.furniture.total > 0
        ? Math.round((categoryTotals.furniture.completed / categoryTotals.furniture.total) * 100)
        : 0,
    bedroom:
      categoryTotals.bedroom.total > 0
        ? Math.round((categoryTotals.bedroom.completed / categoryTotals.bedroom.total) * 100)
        : 0,
    kitchen:
      categoryTotals.kitchen.total > 0
        ? Math.round((categoryTotals.kitchen.completed / categoryTotals.kitchen.total) * 100)
        : 0,
    planning:
      categoryTotals.planning.total > 0
        ? Math.round((categoryTotals.planning.completed / categoryTotals.planning.total) * 100)
        : 0,
    utilities:
      categoryTotals.utilities.total > 0
        ? Math.round((categoryTotals.utilities.completed / categoryTotals.utilities.total) * 100)
        : 0,
  };

  return {
    score,
    completedWeight,
    totalWeight,
    riskTier: toRiskTier(score),
    categoryScores,
  };
}

export function topHomeSafetyRecommendations<T extends HomeSafetyItem>(
  items: T[],
  completedIds: Set<string>,
  limit = 3,
): T[] {
  return items
    .filter((item) => !completedIds.has(item.id))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, Math.max(0, limit));
}

export function xpForHomeSafetyScore(score: number): number {
  if (score >= 90) return 45;
  if (score >= 75) return 35;
  if (score >= 60) return 25;
  return 15;
}
