import { useCallback, useEffect, useRef, useState } from 'react';
import { activeProvider } from '../services/providers';
import type { EventProvider, FeedSnapshot } from '../types/events';

export const REFRESH_INTERVAL_MS = 60_000;
export const STALE_AFTER_FAILURES = 2; // consecutive failed refreshes before data is called stale

export type FeedStatus = 'loading' | 'live' | 'stale' | 'unavailable';

export function useEarthquakeFeed(provider: EventProvider = activeProvider, intervalMs = REFRESH_INTERVAL_MS) {
  const [snapshot, setSnapshot] = useState<FeedSnapshot | null>(null); // last GOOD data only
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState(0);
  const [isFetching, setIsFetching] = useState(true);
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (inFlight.current) return; // never run two requests at once
    const controller = new AbortController();
    inFlight.current = controller;
    setIsFetching(true);
    try {
      const next = await provider.fetchSnapshot({ signal: controller.signal });
      if (controller.signal.aborted) return;
      setSnapshot(next);
      setError(null);
      setFailures(0);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : 'Unknown error while loading data.');
      setFailures((n) => n + 1);
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
      if (!controller.signal.aborted) setIsFetching(false);
    }
  }, [provider]);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), intervalMs);
    return () => {
      clearInterval(timer); // clean up when the component unmounts
      inFlight.current?.abort();
      inFlight.current = null;
    };
  }, [load, intervalMs]);

  let status: FeedStatus;
  if (!snapshot) status = error ? 'unavailable' : 'loading';
  else status = failures >= STALE_AFTER_FAILURES ? 'stale' : 'live';

  return { snapshot, status, error, failures, isFetching, refresh: load, intervalMs };
}
