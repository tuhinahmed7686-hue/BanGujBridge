import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDepth, formatMagnitude, magnitudeColor, markerRadius } from '../src/lib/format';

describe('format helpers', () => {
  it('says so when a value is missing instead of inventing one', () => {
    expect(formatDateTime(null)).toBe('Not provided');
    expect(formatDepth(null)).toBe('Not provided');
    expect(formatMagnitude(null)).toBe('n/a');
  });
  it('always includes the time zone in a formatted time', () => {
    expect(formatDateTime(0)).toMatch(/1970.*(UTC|GMT|[A-Z]{2,5})$/);
  });
  it('formats magnitude and depth', () => {
    expect(formatMagnitude(4.25)).toBe('M 4.3');
    expect(formatDepth(10.04)).toBe('10.0 km');
  });
  it('picks magnitude colour bands and keeps marker sizes bounded', () => {
    expect(magnitudeColor(null)).not.toBe(magnitudeColor(3));
    expect(new Set([3, 4, 5, 6].map(magnitudeColor)).size).toBe(4);
    expect(markerRadius(9.5)).toBeLessThanOrEqual(30);
    expect(markerRadius(0.5)).toBeGreaterThanOrEqual(4);
    expect(markerRadius(null)).toBe(4);
  });
});
