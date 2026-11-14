import { describe, expect, it, vi } from 'vitest';
import { USGS_FEED_URL, parseUsgsGeoJson, usgsProvider } from '../src/services/providers/usgs';
import { ProviderError } from '../src/types/events';
import { collection, feature } from './fixtures';

describe('parseUsgsGeoJson', () => {
  it('parses a valid FeatureCollection into internal events', () => {
    const json = collection([
      feature({ id: 'old1', props: { time: 1000 } }),
      feature({ id: 'new1', props: { time: 5000, mag: 5.2 } }),
    ]);
    const snap = parseUsgsGeoJson(json, 42);
    expect(snap.events.map((e) => e.id)).toEqual(['new1', 'old1']); // newest first
    const e = snap.events[0];
    expect(e).toMatchObject({
      source: 'USGS', magnitude: 5.2, place: '10 km N of Testville, Nowhere',
      occurredAt: 5000, updatedAt: 1700000500000, depthKm: 10.5,
      url: 'https://earthquake.usgs.gov/earthquakes/eventpage/test0001',
    });
    expect(snap.sourceGeneratedAt).toBe(1700000600000);
    expect(snap.sourceReportedCount).toBe(2);
    expect(snap.fetchedAt).toBe(42);
    expect(snap.skippedCount).toBe(0);
  });

  it('handles an empty FeatureCollection', () => {
    const snap = parseUsgsGeoJson(collection([]));
    expect(snap.events).toEqual([]);
    expect(snap.sourceReportedCount).toBe(0);
  });

  it('uses GeoJSON order: coordinates are [longitude, latitude, depth]', () => {
    const snap = parseUsgsGeoJson(collection([feature({ coordinates: [72.5, 23.0, 7] })]));
    expect(snap.events[0].longitude).toBe(72.5);
    expect(snap.events[0].latitude).toBe(23.0);
    expect(snap.events[0].depthKm).toBe(7);
  });

  it('skips features with missing or invalid coordinates', () => {
    const bad = [
      feature({ id: 'a', coordinates: null }),
      feature({ id: 'b', coordinates: [] }),
      feature({ id: 'c', coordinates: [90.4] }),
      feature({ id: 'd', coordinates: ['90.4', '23.8', 5] }),
      feature({ id: 'e', coordinates: [200, 10, 5] }), // longitude out of range
      feature({ id: 'f', coordinates: [10, 95, 5] }), // latitude out of range
      feature({ id: 'g', coordinates: [null, null, null] }),
    ];
    const snap = parseUsgsGeoJson(collection([...bad, feature({ id: 'good' })]));
    expect(snap.events.map((e) => e.id)).toEqual(['good']);
    expect(snap.skippedCount).toBe(7);
  });

  it('skips junk records that are not features', () => {
    const snap = parseUsgsGeoJson(collection([null, 'x', 5, {}, feature()]));
    expect(snap.events).toHaveLength(1);
    expect(snap.skippedCount).toBe(4);
  });

  it('keeps events that are missing optional fields', () => {
    const f = feature({
      id: 'sparse',
      props: { mag: null, place: null, updated: undefined, url: undefined },
      coordinates: [90.4, 23.8],
    });
    const [e] = parseUsgsGeoJson(collection([f])).events;
    expect(e).toMatchObject({ magnitude: null, place: null, updatedAt: null, url: null, depthKm: null });
  });

  it('rejects a response that is not a FeatureCollection', () => {
    for (const bad of [null, 'text', 5, {}, { type: 'FeatureCollection' }, { type: 'Feature', features: [] }]) {
      expect(() => parseUsgsGeoJson(bad)).toThrowError(ProviderError);
    }
  });
});

describe('usgsProvider.fetchSnapshot', () => {
  it('requests the official USGS feed and parses the response', async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(collection([feature()]))));
    const snap = await usgsProvider.fetchSnapshot({ fetchFn: fetchFn as unknown as typeof fetch });
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect((fetchFn.mock.calls[0] as unknown[])[0]).toBe(USGS_FEED_URL);
    expect(snap.events).toHaveLength(1);
  });

  it('reports a network failure', async () => {
    const fetchFn = vi.fn(async () => { throw new TypeError('Failed to fetch'); });
    await expect(usgsProvider.fetchSnapshot({ fetchFn: fetchFn as unknown as typeof fetch })).rejects.toMatchObject({ kind: 'network' });
  });

  it('reports an HTTP error status', async () => {
    const fetchFn = vi.fn(async () => new Response('nope', { status: 503 }));
    await expect(usgsProvider.fetchSnapshot({ fetchFn: fetchFn as unknown as typeof fetch })).rejects.toMatchObject({ kind: 'http' });
  });

  it('reports invalid JSON', async () => {
    const fetchFn = vi.fn(async () => new Response('{ this is not json', { status: 200 }));
    await expect(usgsProvider.fetchSnapshot({ fetchFn: fetchFn as unknown as typeof fetch })).rejects.toMatchObject({ kind: 'invalid-json' });
  });

  it('passes through aborted requests instead of calling them a network error', async () => {
    const fetchFn = vi.fn(async () => { throw new DOMException('Aborted', 'AbortError'); });
    await expect(usgsProvider.fetchSnapshot({ fetchFn: fetchFn as unknown as typeof fetch })).rejects.toMatchObject({ name: 'AbortError' });
  });
});
