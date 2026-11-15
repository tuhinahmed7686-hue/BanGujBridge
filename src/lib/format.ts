import { localeFor } from '../i18n/translations';
import type { Language } from '../i18n/translations';
import type { EarthquakeEvent } from '../types/events';

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: 'short', day: 'numeric',
  hour: 'numeric', minute: '2-digit', second: '2-digit',
  timeZoneName: 'short', // so nobody has to guess which time zone a time is in
};

// Dates and numbers follow each language's own conventions (Bengali uses Bengali digits, for example).
// These only change how a value is DISPLAYED. The underlying data is untouched.
export const formatDateTime = (ms: number | null, language: Language = 'en', missing = 'Not provided'): string =>
  ms === null ? missing : new Date(ms).toLocaleString(localeFor(language), DATE_TIME_OPTIONS);

const fixed = (n: number, digits: number, language: Language): string =>
  new Intl.NumberFormat(localeFor(language), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

export const formatCount = (n: number, language: Language = 'en'): string =>
  new Intl.NumberFormat(localeFor(language)).format(n);
export const formatCoordinate = (n: number, language: Language = 'en'): string => fixed(n, 3, language);

export const formatMagnitude = (m: number | null, language: Language = 'en', missing = 'n/a'): string =>
  m === null ? missing : `M ${fixed(m, 1, language)}`;

export const formatDepth = (d: number | null, language: Language = 'en', missing = 'Not provided'): string =>
  d === null
    ? missing
    : new Intl.NumberFormat(localeFor(language), {
        style: 'unit', unit: 'kilometer', unitDisplay: 'short', minimumFractionDigits: 1, maximumFractionDigits: 1,
      }).format(d);

// The place text is raw USGS data and is never translated. Only the "missing" wording is.
export const placeLabel = (e: EarthquakeEvent, missing = 'Location description not provided'): string =>
  e.place ?? missing;

// Colour bands are only a visual aid for magnitude, not a risk level.
export function magnitudeColor(m: number | null): string {
  if (m === null) return '#8FA1BC';
  if (m >= 6) return '#E5484D';
  if (m >= 5) return '#F28C38';
  if (m >= 4) return '#F2C14E';
  return '#5BB5E6';
}
export const markerRadius = (m: number | null): number => (m === null ? 4 : Math.max(4, Math.min(30, m * m * 0.9)));
