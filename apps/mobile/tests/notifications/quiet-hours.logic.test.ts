import { describe, expect, it } from 'vitest';
import { resolveQuietHoursApply } from '../../src/notifications/quiet-hours.logic';

describe('resolveQuietHoursApply', () => {
  it('accepts valid explicit hours', () => {
    const result = resolveQuietHoursApply('22', '7', 0, 0);
    expect(result).toEqual({ ok: true, start: 22, end: 7 });
  });

  it('accepts midnight values', () => {
    const result = resolveQuietHoursApply('0', '00', 22, 7);
    expect(result).toEqual({ ok: true, start: 0, end: 0 });
  });

  it('falls back to current values when fields are blank', () => {
    const result = resolveQuietHoursApply('', '  ', 23, 6);
    expect(result).toEqual({ ok: true, start: 23, end: 6 });
  });

  it('supports mixed explicit + fallback values', () => {
    const result = resolveQuietHoursApply(' 5 ', '', 22, 7);
    expect(result).toEqual({ ok: true, start: 5, end: 7 });
  });

  it('rejects out-of-range values', () => {
    const result = resolveQuietHoursApply('24', '7', 22, 7);
    expect(result).toEqual({ ok: false });
  });

  it('rejects non-integer values', () => {
    const result = resolveQuietHoursApply('12.5', '7', 22, 7);
    expect(result).toEqual({ ok: false });
  });
});
