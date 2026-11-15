import { describe, expect, it } from 'vitest';
import { formatCoordinate, formatCount, formatDateTime, formatDepth, formatMagnitude, placeLabel } from '../src/lib/format';
import { parseUsgsGeoJson } from '../src/services/providers/usgs';
import { collection, feature } from './fixtures';

const BN_DIGITS = /[\u09E6-\u09EF]/;

describe('locale-aware formatting', () => {
  it('uses Bengali digits for Bengali and ordinary digits for English and Gujarati', () => {
    expect(formatMagnitude(4.6, 'en')).toBe('M 4.6');
    expect(formatMagnitude(4.6, 'bn')).toBe('M ৪.৬');
    expect(formatMagnitude(4.6, 'gu')).toBe('M 4.6');
    expect(formatCount(330, 'bn')).toBe('৩৩০');
    expect(formatCoordinate(90.4, 'bn')).toBe('৯০.৪০০');
    expect(formatCoordinate(90.4, 'en')).toBe('90.400');
  });
  it('formats depth with the language\'s own kilometre unit', () => {
    expect(formatDepth(12.34, 'en')).toBe('12.3 km');
    expect(formatDepth(12.34, 'bn')).toMatch(BN_DIGITS);
    expect(formatDepth(12.34, 'bn')).not.toContain('km');
    expect(formatDepth(12.34, 'gu')).toContain('12.3');
    expect(formatDepth(12.34, 'gu')).not.toContain('km');
  });
  it('formats the same moment in each language and always includes the time zone', () => {
    const ms = 1700000000000; // a fixed moment, 14 Nov 2023
    expect(formatDateTime(ms, 'en')).toContain('2023');
    expect(formatDateTime(ms, 'bn')).toMatch(BN_DIGITS);
    expect(formatDateTime(ms, 'gu')).toContain('2023');
    for (const l of ['en', 'bn', 'gu'] as const) expect(formatDateTime(ms, l).length).toBeGreaterThan(15);
  });
  it('uses the wording it is given for missing values, and English by default', () => {
    expect(formatDepth(null, 'bn', 'দেওয়া হয়নি')).toBe('দেওয়া হয়নি');
    expect(formatMagnitude(null, 'gu', 'અજ્ઞાત')).toBe('અજ્ઞાત');
    expect(formatDateTime(null, 'bn', 'X')).toBe('X');
    expect(formatDepth(null)).toBe('Not provided');
  });
  it('never alters the place text from USGS', () => {
    const [withPlace, withoutPlace] = parseUsgsGeoJson(collection([
      feature({ id: 'a', props: { place: '5 km NE of Cox\'s Bazar, Bangladesh' } }),
      feature({ id: 'b', props: { place: null, time: 1 } }),
    ])).events;
    expect(placeLabel(withPlace, 'MISSING')).toBe('5 km NE of Cox\'s Bazar, Bangladesh');
    expect(placeLabel(withoutPlace, 'MISSING')).toBe('MISSING');
  });
});
