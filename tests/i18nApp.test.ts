// @vitest-environment jsdom
// The whole app, in all three languages. The USGS feed is replaced by a mocked fetch that returns synthetic TEST
// events (see fixtures.ts). Nothing here ever reaches the real network.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import App from '../src/App';
import { LanguageProvider, LANGUAGE_STORAGE_KEY } from '../src/i18n/LanguageContext';
import { translate, translations } from '../src/i18n/translations';
import type { Language } from '../src/i18n/translations';
import { collection, feature } from './fixtures';
import { byText, click, giveElementsASize, mount, settle, unmountAll } from './domHelpers';

giveElementsASize();

const PLACE_BD = 'TEST EVENT BD (synthetic)';
const PLACE_JP = 'TEST EVENT JP (synthetic)';
const URL_BD = 'https://earthquake.usgs.gov/earthquakes/eventpage/tst-bd';
const feed = collection([
  feature({ id: 'tst-bd', props: { mag: 4.6, place: PLACE_BD, time: 1700000000000, url: URL_BD }, coordinates: [90.4, 23.8, 12.34] }),
  feature({ id: 'tst-jp', props: { mag: 5.4, place: PLACE_JP, time: 1699990000000 }, coordinates: [142.0, 38.0, 30] }),
  feature({ id: 'tst-none', props: { mag: null, place: null, time: 1699980000000, url: null }, coordinates: [-120.5, 36.2] }),
]);
const RAW = [PLACE_BD, PLACE_JP, 'tst-bd', 'tst-jp', 'tst-none', URL_BD];

const stubFeed = (impl: () => Promise<Response>) => vi.stubGlobal('fetch', vi.fn(impl));
const okFeed = () => stubFeed(async () => new Response(JSON.stringify(feed)));
const render = async () => {
  const m = await mount(createElement(LanguageProvider, null, createElement(App)));
  await settle();
  return m;
};
const choose = (host: HTMLElement, native: string) => click(byText(host, '.lang-btn', native));
const tabLabels = (host: HTMLElement) => [...host.querySelectorAll('.tab')].map((e) => e.textContent);
const tabKeys = ['nav.liveMap', 'nav.eventFeed', 'nav.verify', 'nav.sources'] as const;

// International names that may stay in Latin letters. 'English' is the language switcher's own native label.
const ALLOWED = ['English', 'USGS Earthquake Hazards Program', 'USGS', 'BANGUJ Bridge', 'OpenStreetMap', 'contributors', 'Leaflet', 'GeoJSON', 'JSON', 'HTTP', 'UTC', 'GMT', 'Access blocked', 'GDACS', 'Bangladesh FFWC', 'India Meteorological Department', 'Open-Meteo', 'GDELT'];
function englishLeaks(host: HTMLElement): string[] {
  const attrs = [...host.querySelectorAll('[aria-label],[title],[alt]')].map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''} ${e.getAttribute('alt') ?? ''}`);
  let rest = `${host.textContent} ${attrs.join(' ')}`;
  for (const s of [...RAW, ...ALLOWED].sort((a, b) => b.length - a.length)) rest = rest.split(s).join(' ');
  return rest.match(/[A-Za-z]{3,}/g) ?? [];
}

beforeEach(() => { localStorage.clear(); document.documentElement.lang = ''; });
afterEach(() => { unmountAll(); vi.unstubAllGlobals(); });

describe('App interface language', () => {
  it('starts in English and translates the header, navigation and footer immediately when switched', async () => {
    okFeed();
    const { host } = await render();
    expect(tabLabels(host)).toEqual(tabKeys.map((k) => translate('en', k)));
    await choose(host, 'বাংলা');
    expect(tabLabels(host)).toEqual(tabKeys.map((k) => translations.bn[k]));
    expect(host.querySelector('footer')!.textContent).toBe(translations.bn['footer.text']);
    expect(host.querySelector('h1')!.textContent).toBe('BANGUJ Bridge'); // proper noun is kept
    expect(document.documentElement.lang).toBe('bn');
    await choose(host, 'ગુજરાતી');
    expect(tabLabels(host)).toEqual(tabKeys.map((k) => translations.gu[k]));
    await choose(host, 'English');
    expect(tabLabels(host)).toEqual(tabKeys.map((k) => translations.en[k]));
  });

  it('restores the saved language when the app is opened again', async () => {
    okFeed();
    const first = await render();
    await choose(first.host, 'ગુજરાતી');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('gu');
    first.unmount();
    const second = await render();
    expect(tabLabels(second.host)).toEqual(tabKeys.map((k) => translations.gu[k]));
  });

  it.each(['bn', 'gu'] as Language[])('never translates raw USGS data (%s)', async (lang) => {
    okFeed();
    const { host } = await render();
    await choose(host, lang === 'bn' ? 'বাংলা' : 'ગુજરાતી');
    const feedText = host.querySelector('.feed')!.textContent!;
    expect(feedText).toContain(PLACE_BD);
    expect(feedText).toContain(PLACE_JP);
    await click(host.querySelectorAll('.feed-item')[0]); // newest event: tst-bd
    expect(host.querySelector('.detail-title')!.textContent).toContain(PLACE_BD);
    expect(host.querySelector('.details')!.textContent).toContain('tst-bd'); // event ID untouched
    expect(host.querySelector<HTMLAnchorElement>('.ext')!.getAttribute('href')).toBe(URL_BD);
    expect(host.textContent).toContain(translations[lang]['event.placeMissing']); // the missing-place wording IS translated
  });

  it('shows numbers in the language\'s own digits (Bengali) while leaving the data values unchanged', async () => {
    okFeed();
    const { host } = await render();
    await choose(host, 'বাংলা');
    await click(host.querySelectorAll('.feed-item')[0]);
    const details = host.querySelector('.details')!.textContent!;
    expect(details).toContain('১২.৩'); // depth 12.34 km
    expect(details).not.toContain('12.3');
    expect(details).toContain('৯০.৪০০'); // longitude 90.4
  });

  it('keeps the feed, selection and counts working in every language', async () => {
    okFeed();
    const { host } = await render();
    for (const native of ['English', 'বাংলা', 'ગુજરાતી']) {
      await choose(host, native);
      expect(host.querySelectorAll('.feed-item').length).toBe(3);
      await click(host.querySelectorAll('.feed-item')[1]);
      expect(host.querySelectorAll('.feed-row.selected').length).toBe(1);
    }
  });

  it('translates the region buttons and keeps region filtering working', async () => {
    okFeed();
    const { host } = await render();
    await choose(host, 'বাংলা');
    await click(byText(host, '.chip', translations.bn['region.bangladesh.button']));
    expect([...host.querySelectorAll('.feed-item')].length).toBe(1);
    expect(host.querySelector('.feed')!.textContent).toContain(PLACE_BD);
    expect(host.querySelector('.feed')!.textContent).not.toContain(PLACE_JP);
    await click(byText(host, '.chip', translations.bn['region.gujarat.button']));
    expect(host.querySelectorAll('.feed-item').length).toBe(0);
    expect(host.querySelector('.banner.info')!.textContent).toBe(
      translate('bn', 'region.emptyNotice', { region: translations.bn['region.gujarat.name'] }),
    );
  });

  it('translates the map controls, and updates them when the language changes', async () => {
    okFeed();
    const { host } = await render();
    const zoomIn = () => host.querySelector('.leaflet-control-zoom-in')!.getAttribute('title');
    expect(zoomIn()).toBe(translations.en['map.zoomIn']);
    await choose(host, 'ગુજરાતી');
    expect(zoomIn()).toBe(translations.gu['map.zoomIn']);
    expect(host.querySelector('.leaflet-control-attribution')!.textContent).toContain('OpenStreetMap');
  });

  it.each(['bn', 'gu'] as Language[])('leaves no untranslated English text on any page (%s)', async (lang) => {
    okFeed();
    const { host } = await render();
    await choose(host, lang === 'bn' ? 'বাংলা' : 'ગુજરાતી');
    for (const [i, key] of tabKeys.entries()) {
      await click(byText(host, '.tab', translations[lang][key]));
      if (i < 2) await click(host.querySelectorAll('.feed-item')[0]); // also show the event details panel
      expect(englishLeaks(host), `${lang} / ${key}`).toEqual([]);
    }
  });
});

describe('App messages when the feed is unavailable', () => {
  it('translates the unavailable banner and the failure reason', async () => {
    stubFeed(async () => { throw new TypeError('Failed to fetch'); });
    const { host } = await render();
    const banner = () => host.querySelector('.banner.error')!.textContent;
    expect(banner()).toContain(translations.en['error.network']);
    await choose(host, 'বাংলা');
    expect(banner()).toContain(translations.bn['error.network']);
    expect(banner()).toContain('৬০'); // retry interval shown in Bengali digits
    expect([...host.querySelectorAll('.empty')].map((e) => e.textContent)).toContain(translations.bn['feed.unavailable']);
    expect(host.querySelector('.error[role="alert"]')!.textContent).toContain(translations.bn['error.network']);
  });

  it('includes the HTTP status in the translated reason', async () => {
    stubFeed(async () => new Response('down', { status: 503 }));
    const { host } = await render();
    await choose(host, 'ગુજરાતી');
    expect(host.querySelector('.banner.error')!.textContent).toContain(translate('gu', 'error.http', { status: 503 }));
  });

  it.each(['bn', 'gu'] as Language[])('leaves no untranslated English text in the error state (%s)', async (lang) => {
    stubFeed(async () => new Response('down', { status: 503 }));
    const { host } = await render();
    await choose(host, lang === 'bn' ? 'বাংলা' : 'ગુજરાતી');
    expect(englishLeaks(host)).toEqual([]);
  });
});
