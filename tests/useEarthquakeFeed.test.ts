// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { REFRESH_INTERVAL_MS, STALE_AFTER_FAILURES, useEarthquakeFeed } from '../src/hooks/useEarthquakeFeed';
import { parseUsgsGeoJson } from '../src/services/providers/usgs';
import { ProviderError } from '../src/types/events';
import type { EventProvider, FeedSnapshot } from '../src/types/events';
import { collection, feature } from './fixtures';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Feed = ReturnType<typeof useEarthquakeFeed>;
const snapshot = (): FeedSnapshot => parseUsgsGeoJson(collection([feature()]), Date.now());
const hangsUntilAborted = (signal?: AbortSignal) =>
  new Promise<FeedSnapshot>((_, reject) => signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));

function makeProvider(impl: (signal?: AbortSignal) => Promise<FeedSnapshot>) {
  const fetchSnapshot = vi.fn(async (options?: { signal?: AbortSignal }) => impl(options?.signal));
  return { provider: { id: 'test', name: 'test', fetchSnapshot } as EventProvider, fetchSnapshot };
}

const unmounts: Array<() => void> = [];
async function mount(provider: EventProvider, strict = false) {
  const out: { current: Feed | null } = { current: null };
  function Probe() {
    out.current = useEarthquakeFeed(provider);
    return null;
  }
  const root = createRoot(document.createElement('div'));
  const element = createElement(Probe);
  await act(async () => root.render(strict ? createElement(StrictMode, null, element) : element));
  const unmount = () => act(() => root.unmount());
  unmounts.push(unmount);
  return { out, unmount };
}
const advance = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });

beforeEach(() => vi.useFakeTimers());
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  vi.useRealTimers();
});

describe('useEarthquakeFeed', () => {
  it('fetches on mount and then every 60 seconds', async () => {
    const { provider, fetchSnapshot } = makeProvider(async () => snapshot());
    const { out } = await mount(provider);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
    expect(out.current!.status).toBe('live');
    await advance(REFRESH_INTERVAL_MS - 1000);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
    await advance(1000);
    expect(fetchSnapshot).toHaveBeenCalledTimes(2);
    await advance(REFRESH_INTERVAL_MS);
    expect(fetchSnapshot).toHaveBeenCalledTimes(3);
  });

  it('never runs two requests at the same time', async () => {
    const { provider, fetchSnapshot } = makeProvider((signal) => hangsUntilAborted(signal));
    const { out } = await mount(provider);
    await advance(REFRESH_INTERVAL_MS * 3);
    await act(async () => { void out.current!.refresh(); void out.current!.refresh(); });
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
    expect(out.current!.status).toBe('loading');
  });

  it('reports unavailable (and no events) when the very first fetch fails', async () => {
    const { provider } = makeProvider(async () => { throw new ProviderError('network', 'boom'); });
    const { out } = await mount(provider);
    expect(out.current!.status).toBe('unavailable');
    expect(out.current!.snapshot).toBeNull();
    expect(out.current!.error).toBe('boom');
  });

  it(`becomes stale only after ${STALE_AFTER_FAILURES} failed refreshes in a row, keeps the last good data, and recovers`, async () => {
    let failing = false;
    const { provider } = makeProvider(async () => {
      if (failing) throw new ProviderError('network', 'boom');
      return snapshot();
    });
    const { out } = await mount(provider);
    expect(out.current!.status).toBe('live');
    const lastGood = out.current!.snapshot;

    failing = true;
    await advance(REFRESH_INTERVAL_MS);
    expect(out.current!.failures).toBe(1);
    expect(out.current!.status).toBe('live'); // one failure is not yet "stale"
    expect(out.current!.error).toBe('boom');

    await advance(REFRESH_INTERVAL_MS);
    expect(out.current!.failures).toBe(2);
    expect(out.current!.status).toBe('stale');
    expect(out.current!.snapshot).toBe(lastGood); // last good data is kept, not replaced or invented

    failing = false;
    await act(async () => { await out.current!.refresh(); });
    expect(out.current!.status).toBe('live');
    expect(out.current!.failures).toBe(0);
    expect(out.current!.error).toBeNull();
  });

  it('on unmount: stops the timer and aborts a request that is still running', async () => {
    let seen: AbortSignal | undefined;
    const { provider, fetchSnapshot } = makeProvider((signal) => { seen = signal; return hangsUntilAborted(signal); });
    const { unmount } = await mount(provider);
    expect(seen!.aborted).toBe(false);
    await unmount();
    expect(seen!.aborted).toBe(true);
    await advance(REFRESH_INTERVAL_MS * 3);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
  });

  it('still loads data under React StrictMode (which mounts twice in development)', async () => {
    const { provider } = makeProvider(async () => snapshot());
    const { out } = await mount(provider, true);
    expect(out.current!.status).toBe('live');
    expect(out.current!.snapshot).not.toBeNull();
  });
});
