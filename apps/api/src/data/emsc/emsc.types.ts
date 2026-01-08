export type EmscFeatureCollection = {
  type: 'FeatureCollection';
  metadata: { count: number };
  features: EmscFeature[];
};

export type EmscFeature = {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lon, lat, depth?]
  };
  properties: {
    source_id: string;
    source_catalog: string;
    lastupdate: string; // ISO
    time: string; // ISO
    flynn_region: string;
    lat: number;
    lon: number;
    depth: number;
    evtype: string;
    auth: string;
    mag: number;
    magtype: string;
    unid: string;
  };
};
