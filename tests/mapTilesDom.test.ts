// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MapView } from '../src/components/MapView';
import { TILE_REFERRER_POLICY } from '../src/lib/tiles';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no layout, so give every element a size. Leaflet only creates tiles for a map that has a size.
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 800 });
Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 600 });

let unmount: (() => void) | null = null;
afterEach(() => { unmount?.(); unmount = null; });

describe('MapView in a DOM', () => {
  it('puts the referrer policy on every tile image it creates', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    unmount = () => act(() => root.unmount());
    await act(async () => root.render(createElement(MapView, { events: [], region: 'global', selected: null, onSelect: () => {} })));
    const tiles = Array.from(host.querySelectorAll<HTMLImageElement>('img.leaflet-tile'));
    expect(tiles.length).toBeGreaterThan(0);
    for (const tile of tiles) expect(tile.referrerPolicy).toBe(TILE_REFERRER_POLICY);
    expect(tiles[0].src).toContain('https://tile.openstreetmap.org/');
  });

  it('shows the OpenStreetMap attribution and the help text, and no failure notice before any tile has failed', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    unmount = () => act(() => root.unmount());
    await act(async () => root.render(createElement(MapView, { events: [], region: 'global', selected: null, onSelect: () => {} })));
    expect(host.querySelector('.leaflet-control-attribution')?.textContent).toContain('OpenStreetMap');
    expect(host.querySelector('details.help summary')?.textContent).toContain('Map background not loading');
    expect(host.querySelector('.map-wrap')?.getAttribute('data-tiles')).toBe('loading');
    expect(host.textContent).not.toContain('map background could not be loaded');
  });
});
