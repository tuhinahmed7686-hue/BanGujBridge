// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { useEarthquakeFeed } from '../src/hooks/useEarthquakeFeed';
import { describeFeedError } from '../src/lib/errors';
import type { FeedErrorKind } from '../src/lib/errors';
import { translate, translations } from '../src/i18n/translations';
import type { Language } from '../src/i18n/translations';
import { parseUsgsGeoJson } from '../src/services/providers/usgs';
import { ProviderError } from '../src/types/events';
import type { EventProvider } from '../src/types/events';
import { collection, feature } from './fixtures';
import { mount, settle, unmountAll } from './domHelpers';

afterEach(() => unmountAll());

describe('describeFeedError', () => {
  const kinds: FeedErrorKind[] = ['network', 'http', 'invalid-json', 'invalid-format', 'unknown'];
  it.each(['en', 'bn', 'gu'] as Language[])('gives a translated message for every kind in %s', (lang) => {
    const t = (k: Parameters<typeof translate>[1], p?: Record<string, string | number>) => translate(lang, k, p);
    const messages = kinds.map((k) => describeFeedError(t, k, 503));
    expect(new Set(messages).size).toBe(kinds.length);
    expect(messages[0]).toBe(translations[lang]['error.network']);
    expect(messages[1]).toContain('503');
    for (const m of messages) expect(m).not.toContain('{');
  });
});

describe('useEarthquakeFeed error details', () => {
  const run = async (fetchSnapshot: EventProvider['fetchSnapshot']) => {
    const out: { current: ReturnType<typeof useEarthquakeFeed> | null } = { current: null };
    const provider: EventProvider = { id: 't', name: 't', fetchSnapshot };
    const Probe = () => { out.current = useEarthquakeFeed(provider); return null; };
    await mount(createElement(Probe));
    await settle();
    return out.current!;
  };
  it('reports the kind and HTTP status of a provider error, separately from its English message', async () => {
    const feed = await run(vi.fn(async () => { throw new ProviderError('http', 'USGS feed returned HTTP 503.', 503); }));
    expect(feed.errorKind).toBe('http');
    expect(feed.errorStatus).toBe(503);
    expect(feed.error).toBe('USGS feed returned HTTP 503.'); // existing behaviour is unchanged
  });
  it('reports "unknown" for an unexpected error', async () => {
    const feed = await run(vi.fn(async () => { throw new Error('weird'); }));
    expect(feed.errorKind).toBe('unknown');
    expect(feed.errorStatus).toBeNull();
  });
  it('has no error details after a successful fetch', async () => {
    const feed = await run(vi.fn(async () => parseUsgsGeoJson(collection([feature()]))));
    expect(feed.errorKind).toBeNull();
    expect(feed.errorStatus).toBeNull();
  });
});
