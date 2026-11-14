// Basemap settings, and the small piece of logic that decides whether the basemap is working.

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// OpenStreetMap's tile servers refuse requests that arrive without a Referer header
// (the tile then shows "Access blocked. Referer is required"). Some hosts, embedded preview
// panes and privacy tools strip it. Setting the policy on the tile <img> elements themselves
// overrides a stricter page-level policy such as "no-referrer".
export const TILE_REFERRER_POLICY = 'strict-origin-when-cross-origin' as const;

export interface TileHealth { loaded: number; failed: number }
export type TileStatus = 'loading' | 'ok' | 'unavailable';
export const FAILED_TILES_BEFORE_UNAVAILABLE = 3;

export function tileStatus(h: TileHealth): TileStatus {
  if (h.loaded > 0) return 'ok';
  return h.failed >= FAILED_TILES_BEFORE_UNAVAILABLE ? 'unavailable' : 'loading';
}
// Reducers for useState. They return the SAME object once the map is known to work,
// so React does not re-render for every one of the dozens of tiles that load.
export const onTileLoaded = (h: TileHealth): TileHealth => (h.loaded > 0 ? h : { ...h, loaded: 1 });
export const onTileFailed = (h: TileHealth): TileHealth => (h.loaded > 0 ? h : { ...h, failed: h.failed + 1 });
