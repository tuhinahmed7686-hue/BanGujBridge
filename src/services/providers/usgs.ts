import { ProviderError } from '../../types/events';
import type { EarthquakeEvent, EventProvider, FeedSnapshot } from '../../types/events';

// All USGS-specific knowledge lives in this file and nowhere else.
export const USGS_FEED_URL =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson';

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const numOrNull = (v: unknown): number | null => (isNum(v) ? v : null);
const strOrNull = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v : null;

/** Convert one GeoJSON feature to an event, or null if it is unusable. */
function parseFeature(feature: unknown): EarthquakeEvent | null {
  if (typeof feature !== 'object' || feature === null) return null;
  const f = feature as Record<string, any>;
  const props = f.properties;
  const coords = f.geometry?.coordinates;
  if (typeof props !== 'object' || props === null) return null;
  if (typeof f.id !== 'string' || f.id === '') return null;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  // GeoJSON order is [longitude, latitude, depth]. NOT [lat, lon].
  const [longitude, latitude, depth] = coords;
  if (!isNum(longitude) || !isNum(latitude)) return null;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  if (!isNum(props.time)) return null;

  return {
    id: f.id,
    source: 'USGS',
    magnitude: numOrNull(props.mag),
    place: strOrNull(props.place),
    occurredAt: props.time,
    updatedAt: numOrNull(props.updated),
    longitude,
    latitude,
    depthKm: numOrNull(depth),
    url: strOrNull(props.url),
  };
}

/** Parse a USGS FeatureCollection. Throws ProviderError if the shape is wrong. */
export function parseUsgsGeoJson(
  json: unknown,
  fetchedAt: number = Date.now(),
): FeedSnapshot {
  const root = json as Record<string, any> | null;
  if (!root || typeof root !== 'object' || root.type !== 'FeatureCollection' || !Array.isArray(root.features)) {
    throw new ProviderError('invalid-format', 'Response is not a GeoJSON FeatureCollection.');
  }
  const events: EarthquakeEvent[] = [];
  let skippedCount = 0;
  for (const feature of root.features) {
    const event = parseFeature(feature);
    if (event) events.push(event);
    else skippedCount += 1;
  }
  events.sort((a, b) => b.occurredAt - a.occurredAt); // newest first
  return {
    events,
    sourceName: 'USGS Earthquake Hazards Program',
    sourceGeneratedAt: numOrNull(root.metadata?.generated),
    fetchedAt,
    sourceReportedCount: numOrNull(root.metadata?.count),
    skippedCount,
  };
}

export const usgsProvider: EventProvider = {
  id: 'usgs',
  name: 'USGS Earthquake Hazards Program',
  async fetchSnapshot({ signal, fetchFn = fetch } = {}) {
    let response: Response;
    try {
      response = await fetchFn(USGS_FEED_URL, { signal });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ProviderError('network', 'Could not reach the USGS feed.');
    }
    if (!response.ok) {
      throw new ProviderError('http', `USGS feed returned HTTP ${response.status}.`);
    }
    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new ProviderError('invalid-json', 'USGS feed returned invalid JSON.');
    }
    return parseUsgsGeoJson(json);
  },
};
