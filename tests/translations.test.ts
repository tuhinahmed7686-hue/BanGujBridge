import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, LANGUAGES, en, isLanguage, translate, translations } from '../src/i18n/translations';
import type { Language, TranslationKey } from '../src/i18n/translations';

const keys = Object.keys(en) as TranslationKey[];
const nonEnglish: Language[] = ['bn', 'gu'];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const SCRIPT: Record<string, RegExp> = { bn: /[\u0980-\u09FF]/, gu: /[\u0A80-\u0AFF]/ };
// Text that is intentionally the same in every language (proper nouns).
const SAME_IN_ALL = new Set<TranslationKey>(['app.name', 'sources.name']);
// International names that may legitimately appear in Latin letters inside Bengali or Gujarati text.
const ALLOWED_LATIN = ['USGS Earthquake Hazards Program', 'USGS', 'BANGUJ Bridge', 'OpenStreetMap', 'GeoJSON', 'JSON', 'HTTP', 'Access blocked'];
const latinLeaks = (text: string) => {
  let rest = text.replace(/\{\w+\}/g, ' ');
  for (const s of ALLOWED_LATIN) rest = rest.split(s).join(' ');
  return rest.match(/[A-Za-z]{3,}/g) ?? [];
};

describe('languages', () => {
  it('offers English, Bengali and Gujarati with native names', () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'bn', 'gu']);
    expect(LANGUAGES.map((l) => l.nativeName)).toEqual(['English', 'বাংলা', 'ગુજરાતી']);
  });
  it('defaults to English and recognises only supported languages', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
    for (const ok of ['en', 'bn', 'gu']) expect(isLanguage(ok)).toBe(true);
    for (const bad of ['fr', 'EN', '', null, undefined, 5, {}]) expect(isLanguage(bad)).toBe(false);
  });
});

describe.each(nonEnglish)('%s dictionary', (lang) => {
  const dict = translations[lang] as Record<string, string>;
  it('has exactly the same keys as English', () => {
    expect(Object.keys(dict).sort()).toEqual([...keys].sort());
  });
  it('has no empty or whitespace-padded values', () => {
    for (const k of keys) {
      expect(dict[k], k).toBeTruthy();
      expect(dict[k], k).toBe(dict[k].trim());
    }
  });
  it('uses the same {placeholders} as English for every key (so no value is silently dropped)', () => {
    for (const k of keys) expect(placeholders(dict[k]), k).toEqual(placeholders(en[k]));
  });
  it('is actually written in its own script, not left in English', () => {
    for (const k of keys) {
      if (SAME_IN_ALL.has(k)) continue;
      expect(dict[k], k).toMatch(SCRIPT[lang]);
    }
  });
  it('contains no stray English words beyond proper nouns', () => {
    for (const k of keys) expect(latinLeaks(dict[k]), `${k}: ${dict[k]}`).toEqual([]);
  });
  it('differs from English except for proper nouns', () => {
    for (const k of keys) if (!SAME_IN_ALL.has(k)) expect(dict[k], k).not.toBe(en[k]);
  });
  it('keeps the proper nouns in the safety disclaimer', () => {
    expect(dict['footer.text']).toContain('USGS');
    expect(dict['footer.text']).toContain('BANGUJ Bridge');
    expect(dict['details.disclaimer']).toContain('USGS');
  });
});

describe('translate()', () => {
  it('returns the text for the chosen language', () => {
    expect(translate('en', 'nav.liveMap')).toBe('Live Map');
    expect(translate('bn', 'nav.liveMap')).toBe(translations.bn['nav.liveMap']);
    expect(translate('gu', 'nav.liveMap')).toBe(translations.gu['nav.liveMap']);
  });
  it('fills in placeholders', () => {
    expect(translate('en', 'health.autoRefreshValue', { seconds: 60 })).toBe('Every 60 seconds while this page is open');
    expect(translate('bn', 'feed.titleCount', { count: '৩' })).toContain('৩');
  });
  it('leaves an unfilled placeholder visible instead of hiding the problem', () => {
    expect(translate('en', 'feed.titleCount', {})).toContain('{count}');
  });
  it('falls back to English for an unknown language', () => {
    expect(translate('fr' as Language, 'nav.liveMap')).toBe('Live Map');
  });
});
