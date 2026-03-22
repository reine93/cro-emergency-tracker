export type QuietHoursApplyResult = { ok: true; start: number; end: number } | { ok: false };

function parseInput(value: string, fallback: number): number {
  const trimmed = value.trim();
  if (trimmed === '') return fallback;
  return Number(trimmed);
}

function isValidWholeHour(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 23;
}

export function resolveQuietHoursApply(
  startInput: string,
  endInput: string,
  currentStart: number,
  currentEnd: number,
): QuietHoursApplyResult {
  const start = parseInput(startInput, currentStart);
  const end = parseInput(endInput, currentEnd);

  if (!isValidWholeHour(start) || !isValidWholeHour(end)) {
    return { ok: false };
  }

  return { ok: true, start, end };
}
