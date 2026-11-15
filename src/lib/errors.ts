import type { TFunction } from '../i18n/translations';

export type FeedErrorKind = 'network' | 'http' | 'invalid-json' | 'invalid-format' | 'unknown';

/** A translated, human-readable reason for a failed feed refresh. */
export function describeFeedError(t: TFunction, kind: FeedErrorKind, status?: number | null): string {
  switch (kind) {
    case 'network': return t('error.network');
    case 'http': return t('error.http', { status: status ?? '?' });
    case 'invalid-json': return t('error.invalidJson');
    case 'invalid-format': return t('error.invalidFormat');
    default: return t('error.unknown');
  }
}
