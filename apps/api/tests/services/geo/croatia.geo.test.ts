import { describe, expect, it } from 'vitest';
import { distanceToCroatiaKm, isInsideCroatia } from '../../../src/services/geo/croatia.geo';

describe('isInsideCroatia', () => {
  it('returns true for a known Croatia inland coordinate (Zagreb)', () => {
    expect(isInsideCroatia(45.815, 15.982)).toBe(true);
  });

  it('returns false for a known outside coordinate west of Croatia (Venice)', () => {
    expect(isInsideCroatia(45.44, 12.33)).toBe(false);
  });

  it('returns false for a known outside coordinate east of Croatia (Belgrade)', () => {
    expect(isInsideCroatia(44.7866, 20.4489)).toBe(false);
  });

  it('returns false for a Slovenia-border coordinate that should not be in Croatia', () => {
    expect(isInsideCroatia(45.9, 15.09)).toBe(false);
  });
});

describe('distanceToCroatiaKm', () => {
  it('returns zero for inside-Croatia points', () => {
    expect(distanceToCroatiaKm(45.815, 15.982)).toBe(0);
  });

  it('returns a positive distance for nearby outside points', () => {
    const distance = distanceToCroatiaKm(45.44, 12.33);
    expect(distance).toBeGreaterThan(30);
    expect(distance).toBeLessThan(250);
  });

  it('returns larger distances for farther outside points', () => {
    const veniceDistance = distanceToCroatiaKm(45.44, 12.33);
    const berlinDistance = distanceToCroatiaKm(52.52, 13.405);
    expect(berlinDistance).toBeGreaterThan(veniceDistance);
  });
});
