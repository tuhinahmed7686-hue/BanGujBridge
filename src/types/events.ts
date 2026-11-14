// The ONE event shape the whole UI uses. The UI never sees raw USGS JSON.
// When a Cloudflare Worker replaces direct fetching, it should return this same shape.

export interface EarthquakeEvent {
  id: string;
  source: 'USGS';
  magnitude: number | null; // null if the source did not report one
  place: string | null;
  occurredAt: number; // epoch milliseconds (event time)
  updatedAt: number | null; // epoch milliseconds (last updated by source)
  longitude: number;
  latitude: number;
  depthKm: number | null;
  url: string | null; // official event page
}

export interface FeedSnapshot {
  events: EarthquakeEvent[];
  sourceName: string;
  sourceGeneratedAt: number | null; // when the SOURCE says the feed was generated
  fetchedAt: number; // when THIS app fetched it
  sourceReportedCount: number | null;
  skippedCount: number; // records dropped because they were unusable
}

// Every provider (USGS now; GDACS, FFWC, IMD, Open-Meteo, GDELT later) implements this.
export interface EventProvider {
  id: string;
  name: string;
  fetchSnapshot(options?: { signal?: AbortSignal; fetchFn?: typeof fetch }): Promise<FeedSnapshot>;
}

export class ProviderError extends Error {
  readonly kind: 'network' | 'http' | 'invalid-json' | 'invalid-format';
  constructor(kind: ProviderError['kind'], message: string) {
    super(message);
    this.name = 'ProviderError';
    this.kind = kind;
  }
}
