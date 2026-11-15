// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { LANGUAGE_STORAGE_KEY, LanguageProvider, useLanguage } from '../src/i18n/LanguageContext';
import type { LanguageContextValue } from '../src/i18n/LanguageContext';
import { LanguageSwitcher } from '../src/components/LanguageSwitcher';
import { translations } from '../src/i18n/translations';
import { byText, click, mount, unmountAll } from './domHelpers';

function probe() {
  const out: { current: LanguageContextValue | null } = { current: null };
  const Probe = () => { out.current = useLanguage(); return null; };
  return { out, Probe };
}
beforeEach(() => { localStorage.clear(); document.documentElement.lang = ''; });
afterEach(() => { unmountAll(); vi.restoreAllMocks(); });

describe('LanguageProvider and useLanguage', () => {
  it('defaults to English when nothing is saved', async () => {
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, null, createElement(Probe)));
    expect(out.current!.language).toBe('en');
    expect(out.current!.t('nav.liveMap')).toBe('Live Map');
    expect(document.documentElement.lang).toBe('en');
  });

  it('restores the saved language on load', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'bn');
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, null, createElement(Probe)));
    expect(out.current!.language).toBe('bn');
    expect(out.current!.t('nav.liveMap')).toBe(translations.bn['nav.liveMap']);
    expect(document.documentElement.lang).toBe('bn');
  });

  it('falls back to English for an invalid saved value', async () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'klingon');
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, null, createElement(Probe)));
    expect(out.current!.language).toBe('en');
  });

  it('switches immediately, saves the choice and updates the page language', async () => {
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, null, createElement(Probe)));
    await act(async () => out.current!.setLanguage('gu'));
    expect(out.current!.language).toBe('gu');
    expect(out.current!.t('nav.liveMap')).toBe(translations.gu['nav.liveMap']);
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('gu');
    expect(document.documentElement.lang).toBe('gu');
  });

  it('ignores an unsupported language', async () => {
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, null, createElement(Probe)));
    await act(async () => out.current!.setLanguage('fr' as never));
    expect(out.current!.language).toBe('en');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  it('remembers the language after the page is "reloaded" (unmount and mount again)', async () => {
    const first = probe();
    const { unmount } = await mount(createElement(LanguageProvider, null, createElement(first.Probe)));
    await act(async () => first.out.current!.setLanguage('bn'));
    unmount();
    const second = probe();
    await mount(createElement(LanguageProvider, null, createElement(second.Probe)));
    expect(second.out.current!.language).toBe('bn');
  });

  it('still works when the browser blocks localStorage reads and writes', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, null, createElement(Probe)));
    expect(out.current!.language).toBe('en');
    await act(async () => out.current!.setLanguage('bn'));
    expect(out.current!.language).toBe('bn'); // the choice still works for this visit
  });

  it('still works when merely touching window.localStorage throws', async () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('denied', 'SecurityError'); } });
    try {
      const { out, Probe } = probe();
      await mount(createElement(LanguageProvider, null, createElement(Probe)));
      expect(out.current!.language).toBe('en');
      await act(async () => out.current!.setLanguage('gu'));
      expect(out.current!.language).toBe('gu');
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });

  it('uses an injected storage when given one', async () => {
    const data: Record<string, string> = { [LANGUAGE_STORAGE_KEY]: 'gu' };
    const storage = { getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => { data[k] = v; } };
    const { out, Probe } = probe();
    await mount(createElement(LanguageProvider, { storage }, createElement(Probe)));
    expect(out.current!.language).toBe('gu');
    await act(async () => out.current!.setLanguage('bn'));
    expect(data[LANGUAGE_STORAGE_KEY]).toBe('bn');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull();
  });

  it('works in English without any provider', async () => {
    const { out, Probe } = probe();
    await mount(createElement(Probe));
    expect(out.current!.language).toBe('en');
    expect(out.current!.t('nav.liveMap')).toBe('Live Map');
    expect(() => out.current!.setLanguage('bn')).not.toThrow();
  });
});

describe('LanguageSwitcher', () => {
  const renderSwitcher = () => mount(createElement(LanguageProvider, null, createElement(LanguageSwitcher)));

  it('shows the three native language names as real buttons', async () => {
    const { host } = await renderSwitcher();
    const buttons = [...host.querySelectorAll('button')];
    expect(buttons.map((b) => b.textContent)).toEqual(['English', 'বাংলা', 'ગુજરાતી']);
    expect(buttons.map((b) => b.getAttribute('lang'))).toEqual(['en', 'bn', 'gu']);
    for (const b of buttons) { expect(b.type).toBe('button'); expect(b.disabled).toBe(false); expect(b.tabIndex).toBeGreaterThanOrEqual(0); }
  });

  it('marks exactly the active language and updates immediately on click', async () => {
    const { host } = await renderSwitcher();
    const pressed = () => [...host.querySelectorAll('button')].map((b) => b.getAttribute('aria-pressed'));
    expect(pressed()).toEqual(['true', 'false', 'false']);
    await click(byText(host, 'button', 'বাংলা'));
    expect(pressed()).toEqual(['false', 'true', 'false']);
    await click(byText(host, 'button', 'ગુજરાતી'));
    expect(pressed()).toEqual(['false', 'false', 'true']);
    expect(document.documentElement.lang).toBe('gu');
  });

  it('has an accessible group label that follows the language', async () => {
    const { host } = await renderSwitcher();
    const group = () => host.querySelector('[role="group"]')!.getAttribute('aria-label');
    expect(group()).toBe('Language');
    await click(byText(host, 'button', 'বাংলা'));
    expect(group()).toBe(translations.bn['language.label']);
  });

  it('can receive keyboard focus', async () => {
    const { host } = await renderSwitcher();
    const second = byText<HTMLButtonElement>(host, 'button', 'বাংলা');
    second.focus();
    expect(document.activeElement).toBe(second);
  });
});
