// TEST FIXTURES ONLY. These use the real USGS GeoJSON field layout, but the events
// are synthetic and must never be shown as live data in the application.
export function feature(overrides: { id?: string; props?: Record<string, unknown>; coordinates?: unknown } = {}) {
  return {
    type: 'Feature',
    properties: {
      mag: 4.6,
      place: '10 km N of Testville, Nowhere',
      time: 1700000000000,
      updated: 1700000500000,
      tz: null,
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test0001',
      detail: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/test0001.geojson',
      felt: null, cdi: null, mmi: null, alert: null,
      status: 'reviewed', tsunami: 0, sig: 326, net: 'us', code: 'test0001',
      ids: ',test0001,', sources: ',us,', types: ',origin,', nst: null,
      dmin: 1.2, rms: 0.7, gap: 87, magType: 'mb', type: 'earthquake',
      title: 'M 4.6 - 10 km N of Testville, Nowhere',
      ...overrides.props,
    },
    geometry: { type: 'Point', coordinates: 'coordinates' in overrides ? overrides.coordinates : [90.4, 23.8, 10.5] },
    id: overrides.id ?? 'test0001',
  };
}

export function collection(features: unknown[], metadata: Record<string, unknown> = {}) {
  return {
    type: 'FeatureCollection',
    metadata: {
      generated: 1700000600000,
      url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson',
      title: 'USGS Magnitude 2.5+ Earthquakes, Past Week',
      status: 200, api: '1.14.1', count: features.length,
      ...metadata,
    },
    features,
    bbox: [-180, -90, 0, 180, 90, 700],
  };
}
