import { useLanguage } from '../i18n/LanguageContext';
import type { TranslationKey } from '../i18n/translations';
import type { FeedStatus } from '../hooks/useEarthquakeFeed';
import { describeFeedError } from '../lib/errors';
import type { FeedErrorKind } from '../lib/errors';
import { useFormat } from '../lib/useFormat';
import type { FeedSnapshot } from '../types/events';

export const STATUS_KEY: Record<FeedStatus, TranslationKey> = {
  loading: 'status.loading',
  live: 'status.live',
  stale: 'status.stale',
  unavailable: 'status.unavailable',
};

interface Props {
  status: FeedStatus;
  snapshot: FeedSnapshot | null;
  errorKind: FeedErrorKind | null;
  errorStatus: number | null;
  failures: number;
  isFetching: boolean;
  shownCount: number;
  intervalSeconds: number;
  onRefresh: () => void;
}

export function DataHealth({ status, snapshot, errorKind, errorStatus, failures, isFetching, shownCount, intervalSeconds, onRefresh }: Props) {
  const { t } = useLanguage();
  const fmt = useFormat();
  const na = t('common.notAvailable');
  return (
    <div>
      <dl className="details">
        <dt>{t('health.connection')}</dt>
        <dd><span className={`dot ${status}`} aria-hidden="true" /> {t(STATUS_KEY[status])}</dd>
        <dt>{t('health.lastFetch')}</dt><dd>{snapshot ? fmt.dateTime(snapshot.fetchedAt) : t('health.noFetchYet')}</dd>
        <dt>{t('health.generated')}</dt><dd>{snapshot ? fmt.dateTime(snapshot.sourceGeneratedAt) : na}</dd>
        <dt>{t('health.received')}</dt><dd>{snapshot ? fmt.count(snapshot.events.length) : na}</dd>
        <dt>{t('health.inView')}</dt><dd>{snapshot ? fmt.count(shownCount) : na}</dd>
        {snapshot && snapshot.skippedCount > 0 && (
          <><dt>{t('health.skipped')}</dt><dd>{t('health.skippedValue', { count: fmt.count(snapshot.skippedCount) })}</dd></>
        )}
        <dt>{t('health.autoRefresh')}</dt><dd>{t('health.autoRefreshValue', { seconds: fmt.count(intervalSeconds) })}</dd>
      </dl>
      {errorKind && (
        <p className="error" role="alert">
          {t('health.refreshFailed', { reason: describeFeedError(t, errorKind, errorStatus), count: fmt.count(failures) })}
        </p>
      )}
      <button className="primary" onClick={onRefresh} disabled={isFetching}>
        {isFetching ? t('health.refreshing') : t('health.refreshNow')}
      </button>
    </div>
  );
}
