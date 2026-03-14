const CROATIA_MAINLAND_POLYGON: Array<[number, number]> = [
  [13.48, 45.55],
  [13.63, 45.06],
  [14.25, 44.85],
  [14.8, 44.4],
  [15.35, 44.1],
  [15.8, 43.7],
  [16.45, 43.3],
  [17.3, 42.95],
  [18.3, 42.65],
  [18.95, 42.49],
  [18.85, 43.2],
  [18.2, 43.5],
  [17.7, 43.7],
  [17.4, 44.0],
  [17.5, 44.9],
  [18.4, 45.1],
  [19.0, 45.5],
  [18.9, 45.95],
  [18.3, 46.25],
  [16.7, 46.55],
  [15.2, 46.5],
  [14.2, 46.25],
  [13.48, 45.55],
];

function isPointInPolygon(latitude: number, longitude: number, polygon: Array<[number, number]>) {
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
  return isPointInPolygon(latitude, longitude, CROATIA_MAINLAND_POLYGON);
}
