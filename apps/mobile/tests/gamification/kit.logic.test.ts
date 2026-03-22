import { describe, expect, it } from 'vitest';
import {
  evaluateKitSelection,
  xpForKitScore,
  type KitItemDefinition,
} from '../../src/gamification/kit.logic';

const ITEMS: KitItemDefinition[] = [
  { id: 'water', category: 'essential' },
  { id: 'first_aid', category: 'essential' },
  { id: 'radio', category: 'useful' },
  { id: 'umbrella', category: 'unnecessary' },
  { id: 'candle', category: 'unsafe' },
];

describe('evaluateKitSelection', () => {
  it('returns high score for correct choices', () => {
    const result = evaluateKitSelection(ITEMS, new Set(['water', 'first_aid', 'radio']));
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.stars).toBe(5);
    expect(result.missedEssentialCount).toBe(0);
  });

  it('penalizes unsafe and missed essentials', () => {
    const result = evaluateKitSelection(ITEMS, new Set(['candle']));
    expect(result.score).toBeLessThan(50);
    expect(result.missedEssentialCount).toBe(2);
    expect(result.selectedEssentialCount).toBe(0);
  });

  it('ignores unknown selected ids and returns zeroed metrics for empty definitions', () => {
    const withUnknown = evaluateKitSelection(ITEMS, new Set(['water', 'unknown_item']));
    expect(withUnknown.selectedEssentialCount).toBe(1);
    expect(withUnknown.maxPoints).toBeGreaterThan(0);

    const empty = evaluateKitSelection([], new Set(['anything']));
    expect(empty.score).toBe(0);
    expect(empty.points).toBe(0);
    expect(empty.maxPoints).toBe(0);
    expect(empty.stars).toBe(1);
  });
});

describe('xpForKitScore', () => {
  it('maps score tiers to xp rewards', () => {
    expect(xpForKitScore(95)).toBe(40);
    expect(xpForKitScore(80)).toBe(30);
    expect(xpForKitScore(65)).toBe(20);
    expect(xpForKitScore(20)).toBe(10);
  });
});
