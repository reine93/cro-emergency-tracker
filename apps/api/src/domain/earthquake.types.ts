export type EarthquakeSource = 'EMSC';

export type EarthquakeEvent = {
  id: string;
  source: EarthquakeSource;

  time: string; // ISO
  updatedAt?: string; // lastupdate

  magnitude: number;
  magnitudeType?: string; // magtype (ml, m, mw...)

  depthKm?: number; // depth (EMSC sometimes has weird negatives)
  latitude: number;
  longitude: number;

  place: string; // flynn_region
  authority?: string; // auth (optional, nice for debugging)
};
