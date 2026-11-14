import type { EarthquakeEvent } from '../types/events';

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', second: '2-digit',
  timeZoneName: 'short', // so nobody has to guess which time zone a time is in
};
export const formatDateTime = (ms: number | null): string =>
  ms === null ? 'Not provided' : new Date(ms).toLocaleString(undefined, DATE_TIME_OPTIONS);

export const formatMagnitude = (m: number | null): string => (m === null ? 'n/a' : `M ${m.toFixed(1)}`);
export const formatDepth = (d: number | null): string => (d === null ? 'Not provided' : `${d.toFixed(1)} km`);
export const placeLabel = (e: EarthquakeEvent): string => e.place ?? 'Location description not provided';

// Colour bands are only a visual aid for magnitude, not a risk level.
export function magnitudeColor(m: number | null): string {
  if (m === null) return '#8FA1BC';
  if (m >= 6) return '#E5484D';
  if (m >= 5) return '#F28C38';
  if (m >= 4) return '#F2C14E';
  return '#5BB5E6';
}
export const markerRadius = (m: number | null): number => (m === null ? 4 : Math.max(4, Math.min(30, m * m * 0.9)));
