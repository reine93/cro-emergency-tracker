import type { Request, Response } from 'express';
import { getRecentEarthquakes } from '../services/earthquakes.service';

function parsePositiveNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) return Number.NaN;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return Number.NaN;
  return parsed;
}

function parseNonNegativeNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0) return Number.NaN;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return Number.NaN;
  return parsed;
}

export async function getRecentEarthquakesHandler(req: Request, res: Response) {
  const hours = parsePositiveNumber(req.query.hours);
  if (Number.isNaN(hours)) {
    return res.status(400).json({ message: '"hours" must be a positive number' });
  }

  const minMag = parseNonNegativeNumber(req.query.minMag);
  if (Number.isNaN(minMag)) {
    return res.status(400).json({ message: '"minMag" must be a non-negative number' });
  }

  try {
    const items = await getRecentEarthquakes({ hours, minMag });
    return res.status(200).json({ items });
  } catch {
    return res.status(502).json({ message: 'Failed to fetch earthquake data' });
  }
}
