import type { EmscFeature } from '../data/emsc/emsc.types';
import type { EarthquakeEvent } from '../domain/earthquake';

export function mapEmscToEarthquake(feature: EmscFeature): EarthquakeEvent {
  const props = feature.properties;

  const id = props.unid || feature.id;

  const latitude = typeof props.lat === 'number' ? props.lat : feature.geometry.coordinates[1];

  const longitude = typeof props.lon === 'number' ? props.lon : feature.geometry.coordinates[0];

  const depthCandidate =
    typeof props.depth === 'number' ? props.depth : feature.geometry.coordinates[2];

  const depthKm =
    typeof depthCandidate === 'number' && depthCandidate >= 0 ? depthCandidate : undefined;

  return {
    id,
    source: 'EMSC',
    time: props.time,
    updatedAt: props.lastupdate,
    magnitude: props.mag,
    magnitudeType: props.magtype,
    depthKm,
    latitude,
    longitude,
    place: props.flynn_region,
    authority: props.auth,
  };
}
