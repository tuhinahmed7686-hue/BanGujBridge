import { describe, expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import headersFile from '../public/_headers?raw';
import {
  FAILED_TILES_BEFORE_UNAVAILABLE, TILE_ATTRIBUTION, TILE_REFERRER_POLICY, TILE_URL,
  onTileFailed, onTileLoaded, tileStatus,
} from '../src/lib/tiles';
import type { TileHealth } from '../src/lib/tiles';

// Policies the OpenStreetMap wiki lists as sending a Referer.
const POLICIES_THAT_SEND_A_REFERER = [
  'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'strict-origin', 'strict-origin-when-cross-origin',
];
const run = (events: Array<'load' | 'fail'>): TileHealth =>
  events.reduce((h, e) => (e === 'load' ? onTileLoaded(h) : onTileFailed(h)), { loaded: 0, failed: 0 } as TileHealth);

describe('basemap configuration', () => {
  it('uses OpenStreetMap tiles with visible attribution', () => {
    expect(TILE_URL).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    expect(TILE_ATTRIBUTION).toContain('https://www.openstreetmap.org/copyright');
    expect(TILE_ATTRIBUTION).toContain('OpenStreetMap');
  });
  it('sets a tile referrer policy that sends a Referer (OpenStreetMap requires one)', () => {
    expect(POLICIES_THAT_SEND_A_REFERER).toContain(TILE_REFERRER_POLICY);
  });
  it('also declares the policy for the whole page and for the Cloudflare host', () => {
    expect(indexHtml).toMatch(/<meta name="referrer" content="strict-origin-when-cross-origin"/);
    expect(headersFile).toMatch(/Referrer-Policy:\s*strict-origin-when-cross-origin/);
  });
});

describe('tileStatus (is the basemap working?)', () => {
  it('starts as loading', () => expect(tileStatus(run([]))).toBe('loading'));
  it('is ok as soon as one tile loads', () => expect(tileStatus(run(['load']))).toBe('ok'));
  it(`is unavailable after ${FAILED_TILES_BEFORE_UNAVAILABLE} failures with no successes`, () => {
    expect(tileStatus(run(['fail', 'fail']))).toBe('loading');
    expect(tileStatus(run(['fail', 'fail', 'fail']))).toBe('unavailable');
  });
  it('stays ok if some tiles fail after others loaded', () => {
    expect(tileStatus(run(['load', 'fail', 'fail', 'fail', 'fail']))).toBe('ok');
  });
  it('recovers to ok if a tile loads after failures', () => {
    expect(tileStatus(run(['fail', 'fail', 'fail', 'load']))).toBe('ok');
  });
  it('returns the same object once ok, so React does not re-render per tile', () => {
    const ok = run(['load']);
    expect(onTileLoaded(ok)).toBe(ok);
    expect(onTileFailed(ok)).toBe(ok);
  });
});
