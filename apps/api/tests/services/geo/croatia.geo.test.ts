import { describe, expect, it } from 'vitest';
import { isInsideCroatia } from '../../../src/services/geo/croatia.geo';

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
});
