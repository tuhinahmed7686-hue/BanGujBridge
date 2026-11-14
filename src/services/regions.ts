import type { EarthquakeEvent } from '../types/events';

// IMPORTANT: these are rough rectangles used only to choose the map view and
// filter events. They are NOT official administrative boundaries.
export type RegionId = 'global' | 'bangladesh' | 'gujarat';

export interface Region {
  id: RegionId;
  label: string;
  // [south, west, north, east] in degrees; null = whole world
  bounds: [number, number, number, number] | null;
}

export const REGIONS: Region[] = [
  { id: 'global', label: 'Global view', bounds: null },
  { id: 'bangladesh', label: 'Bangladesh view', bounds: [20.5, 88.0, 26.7, 92.8] },
  { id: 'gujarat', label: 'Gujarat, India view', bounds: [20.0, 68.0, 24.8, 74.6] },
];

export const getRegion = (id: RegionId): Region => REGIONS.find((r) => r.id === id) ?? REGIONS[0];

export function filterEventsByRegion(events: EarthquakeEvent[], id: RegionId): EarthquakeEvent[] {
  const { bounds } = getRegion(id);
  if (!bounds) return events;
  const [south, west, north, east] = bounds;
  return events.filter(
    (e) => e.latitude >= south && e.latitude <= north && e.longitude >= west && e.longitude <= east,
  );
}
