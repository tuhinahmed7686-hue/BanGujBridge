import { describe, expect, it } from 'vitest';
import { filterEventsByRegion, getRegion } from '../src/services/regions';
import { parseUsgsGeoJson } from '../src/services/providers/usgs';
import { collection, feature } from './fixtures';

// Built through the real parser so coordinate order is exercised end to end.
const events = parseUsgsGeoJson(
  collection([
    feature({ id: 'bd', coordinates: [90.4, 23.8, 10] }), // inside the Bangladesh search area
    feature({ id: 'gj', coordinates: [72.5, 23.0, 10] }), // inside the Gujarat search area
    feature({ id: 'jp', coordinates: [142.0, 38.0, 30] }), // far from both
    feature({ id: 'swapped', coordinates: [23.8, 90.0, 10] }), // lon/lat swapped by mistake: must not match
  ]),
).events;

describe('filterEventsByRegion', () => {
  it('global returns every event', () => {
    expect(filterEventsByRegion(events, 'global')).toHaveLength(4);
  });
  it('bangladesh returns only events inside its search area', () => {
    expect(filterEventsByRegion(events, 'bangladesh').map((e) => e.id)).toEqual(['bd']);
  });
  it('gujarat returns only events inside its search area', () => {
    expect(filterEventsByRegion(events, 'gujarat').map((e) => e.id)).toEqual(['gj']);
  });
  it('returns an empty list when nothing is inside the area', () => {
    expect(filterEventsByRegion(events.filter((e) => e.id === 'jp'), 'bangladesh')).toEqual([]);
  });
  it('includes events exactly on the edge of the area', () => {
    const [s, w] = getRegion('bangladesh').bounds!;
    const edge = parseUsgsGeoJson(collection([feature({ coordinates: [w, s, 5] })])).events;
    expect(filterEventsByRegion(edge, 'bangladesh')).toHaveLength(1);
  });
});
