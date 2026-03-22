import { describe, expect, it } from 'vitest';
import {
  evaluateHomeSafety,
  topHomeSafetyRecommendations,
  toRiskTier,
  xpForHomeSafetyScore,
  type HomeSafetyItem,
} from '../../src/gamification/home.logic';

const ITEMS: HomeSafetyItem[] = [
  { id: 'secure_shelves', category: 'furniture', weight: 20 },
  { id: 'clear_bedroom', category: 'bedroom', weight: 15 },
  { id: 'kitchen_cabinets', category: 'kitchen', weight: 15 },
  { id: 'family_plan', category: 'planning', weight: 25 },
  { id: 'gas_shutoff', category: 'utilities', weight: 25 },
];

describe('evaluateHomeSafety', () => {
  it('returns weighted score and category scores', () => {
    const completed = new Set(['secure_shelves', 'family_plan']);
    const result = evaluateHomeSafety(ITEMS, completed);

    expect(result.score).toBe(45);
    expect(result.categoryScores.furniture).toBe(100);
    expect(result.categoryScores.planning).toBe(100);
    expect(result.categoryScores.utilities).toBe(0);
    expect(result.riskTier).toBe('moderate');
  });
});

describe('home safety helpers', () => {
  it('returns highest-weight incomplete recommendations first', () => {
    const completed = new Set(['secure_shelves']);
    const recommendations = topHomeSafetyRecommendations(ITEMS, completed, 2);

    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].id).toBe('family_plan');
    expect(recommendations[1].id).toBe('gas_shutoff');
  });

  it('maps risk tier and xp tiers correctly', () => {
    expect(toRiskTier(80)).toBe('low');
    expect(toRiskTier(50)).toBe('moderate');
    expect(toRiskTier(20)).toBe('high');

    expect(xpForHomeSafetyScore(95)).toBe(45);
    expect(xpForHomeSafetyScore(80)).toBe(35);
    expect(xpForHomeSafetyScore(65)).toBe(25);
    expect(xpForHomeSafetyScore(30)).toBe(15);
  });

  it('handles empty datasets and recommendation limits defensively', () => {
    const evaluation = evaluateHomeSafety([], new Set());
    expect(evaluation.score).toBe(0);
    expect(evaluation.totalWeight).toBe(0);
    expect(evaluation.riskTier).toBe('high');

    const noRecommendations = topHomeSafetyRecommendations(ITEMS, new Set(), -10);
    expect(noRecommendations).toEqual([]);
  });
});
