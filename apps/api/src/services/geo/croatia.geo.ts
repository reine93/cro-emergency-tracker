import croatiaBoundary from './croatia.boundary.json';

type Position = [number, number];

function asPositionArray(input: unknown): Position[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (value): value is Position =>
      Array.isArray(value) &&
      value.length >= 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number',
  );
}

function extractBoundaryRings(): Position[][] {
  const feature = croatiaBoundary.features[0];
  if (!feature || !feature.geometry) {
    throw new Error('Invalid Croatia boundary GeoJSON: missing feature geometry');
  }

  if (feature.geometry.type === 'Polygon') {
    const outerRing = asPositionArray(feature.geometry.coordinates[0]);
    if (outerRing.length < 4) {
      throw new Error('Invalid Croatia boundary GeoJSON: polygon ring is missing or too short');
    }
    return [outerRing];
  }

  if (feature.geometry.type === 'MultiPolygon') {
    const rings = feature.geometry.coordinates
      .map((polygon) => asPositionArray(polygon[0]))
      .filter((ring) => ring.length >= 4);

    if (rings.length === 0) {
      throw new Error('Invalid Croatia boundary GeoJSON: multipolygon has no valid rings');
    }

    return rings;
  }

  throw new Error('Invalid Croatia boundary GeoJSON: expected Polygon or MultiPolygon');
}

const CROATIA_BOUNDARY_RINGS = extractBoundaryRings();

function isPointInPolygon(latitude: number, longitude: number, polygon: Position[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersects =
      yi > latitude !== yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function isInsideCroatia(latitude: number, longitude: number): boolean {
  return CROATIA_BOUNDARY_RINGS.some((ring) => isPointInPolygon(latitude, longitude, ring));
}

function toProjectedKm(latitude: number, longitude: number, referenceLatitude: number) {
  const latScale = 110.574; // km per degree latitude
  const lonScale = 111.32 * Math.cos((referenceLatitude * Math.PI) / 180); // km per degree longitude
  return {
    x: longitude * lonScale,
    y: latitude * latScale,
  };
}

function pointToSegmentDistanceKm(
  latitude: number,
  longitude: number,
  start: [number, number],
  end: Position,
) {
  const referenceLatitude = (latitude + start[1] + end[1]) / 3;
  const point = toProjectedKm(latitude, longitude, referenceLatitude);
  const a = toProjectedKm(start[1], start[0], referenceLatitude);
  const b = toProjectedKm(end[1], end[0], referenceLatitude);

  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = point.x - a.x;
  const apy = point.y - a.y;

  const abSquared = abx * abx + aby * aby;
  if (abSquared === 0) {
    return Math.hypot(apx, apy);
  }

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abSquared));
  const closestX = a.x + t * abx;
  const closestY = a.y + t * aby;

  return Math.hypot(point.x - closestX, point.y - closestY);
}

export function distanceToCroatiaKm(latitude: number, longitude: number): number {
  if (isInsideCroatia(latitude, longitude)) {
    return 0;
  }

  let minDistanceKm = Number.POSITIVE_INFINITY;

  for (const ring of CROATIA_BOUNDARY_RINGS) {
    for (let i = 0; i < ring.length - 1; i += 1) {
      const start = ring[i];
      const end = ring[i + 1];
      const segmentDistanceKm = pointToSegmentDistanceKm(latitude, longitude, start, end);
      minDistanceKm = Math.min(minDistanceKm, segmentDistanceKm);
    }
  }

  return minDistanceKm;
}
