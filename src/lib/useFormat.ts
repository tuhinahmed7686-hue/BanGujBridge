import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import type { EarthquakeEvent } from '../types/events';
import { formatCoordinate, formatCount, formatDateTime, formatDepth, formatMagnitude, placeLabel } from './format';

/** Formatters that already know the current language and its "missing value" wording. */
export function useFormat() {
  const { language, t } = useLanguage();
  return useMemo(
    () => ({
      dateTime: (ms: number | null) => formatDateTime(ms, language, t('common.notProvided')),
      magnitude: (m: number | null) => formatMagnitude(m, language, t('common.magnitudeMissing')),
      depth: (d: number | null) => formatDepth(d, language, t('common.notProvided')),
      coordinate: (n: number) => formatCoordinate(n, language),
      count: (n: number) => formatCount(n, language),
      place: (e: EarthquakeEvent) => placeLabel(e, t('event.placeMissing')),
    }),
    [language, t],
  );
}
