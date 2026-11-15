// Runs in the plain Node environment on purpose: there is no window here, which is what server-side rendering looks like.
import { describe, expect, it } from 'vitest';
import { LANGUAGE_STORAGE_KEY, readStoredLanguage, storeLanguage } from '../src/i18n/LanguageContext';

const fakeStorage = (initial: Record<string, string> = {}) => {
  const data = { ...initial };
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } };
};

describe('saved language', () => {
  it('runs without a window (server-side rendering) and defaults to English', () => {
    expect(typeof window).toBe('undefined');
    expect(readStoredLanguage()).toBe('en');
    expect(storeLanguage('bn')).toBe(false);
  });
  it('defaults to English when nothing is saved', () => {
    expect(readStoredLanguage(fakeStorage())).toBe('en');
  });
  it('restores each saved language', () => {
    for (const code of ['en', 'bn', 'gu'] as const) {
      expect(readStoredLanguage(fakeStorage({ [LANGUAGE_STORAGE_KEY]: code }))).toBe(code);
    }
  });
  it('ignores invalid saved values', () => {
    for (const bad of ['fr', '', 'BN', 'null', '{"a":1}', ' bn', 'bn ']) {
      expect(readStoredLanguage(fakeStorage({ [LANGUAGE_STORAGE_KEY]: bad })), JSON.stringify(bad)).toBe('en');
    }
  });
  it('survives storage that throws or is missing', () => {
    expect(readStoredLanguage({ getItem: () => { throw new Error('blocked'); } })).toBe('en');
    expect(readStoredLanguage(null)).toBe('en');
    expect(storeLanguage('gu', null)).toBe(false);
    expect(storeLanguage('gu', { setItem: () => { throw new Error('quota'); } })).toBe(false);
  });
  it('saves under the documented key', () => {
    const s = fakeStorage();
    expect(storeLanguage('gu', s)).toBe(true);
    expect(s.data[LANGUAGE_STORAGE_KEY]).toBe('gu');
    expect(LANGUAGE_STORAGE_KEY).toBe('banguj.language');
  });
});
