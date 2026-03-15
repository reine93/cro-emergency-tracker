export type KitItemCategory = 'essential' | 'useful' | 'unnecessary' | 'unsafe';

export type KitItemDefinition = {
  id: string;
  category: KitItemCategory;
};

export type KitEvaluation = {
  score: number;
  stars: 1 | 2 | 3 | 4 | 5;
  points: number;
  maxPoints: number;
  selectedEssentialCount: number;
  missedEssentialCount: number;
};

const CATEGORY_POINTS: Record<KitItemCategory, { correct: number; incorrect: number }> = {
  essential: { correct: 12, incorrect: 0 },
  useful: { correct: 8, incorrect: 4 },
  unnecessary: { correct: 6, incorrect: 0 },
  unsafe: { correct: 8, incorrect: 0 },
};

function toStars(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
}

export function evaluateKitSelection(
  definitions: KitItemDefinition[],
  selectedIds: Set<string>,
): KitEvaluation {
  let points = 0;
  let maxPoints = 0;
  let selectedEssentialCount = 0;
  let missedEssentialCount = 0;

  for (const item of definitions) {
    const scoring = CATEGORY_POINTS[item.category];
    const isSelected = selectedIds.has(item.id);
    const shouldSelect = item.category === 'essential' || item.category === 'useful';

    maxPoints += scoring.correct;

    if (item.category === 'essential') {
      if (isSelected) selectedEssentialCount += 1;
      if (!isSelected) missedEssentialCount += 1;
    }

    if ((shouldSelect && isSelected) || (!shouldSelect && !isSelected)) {
      points += scoring.correct;
    } else {
      points += scoring.incorrect;
    }
  }

  const score = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;

  return {
    score,
    stars: toStars(score),
    points,
    maxPoints,
    selectedEssentialCount,
    missedEssentialCount,
  };
}

export function xpForKitScore(score: number): number {
  if (score >= 90) return 40;
  if (score >= 75) return 30;
  if (score >= 60) return 20;
  return 10;
}
