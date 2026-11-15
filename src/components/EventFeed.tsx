import { useLanguage } from '../i18n/LanguageContext';
import { magnitudeColor } from '../lib/format';
import { useFormat } from '../lib/useFormat';
import type { EarthquakeEvent } from '../types/events';

interface Props {
  events: EarthquakeEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  limit: number;
  emptyMessage: string;
}

export function EventFeed({ events, selectedId, onSelect, limit, emptyMessage }: Props) {
  const { t } = useLanguage();
  const fmt = useFormat();
  if (events.length === 0) return <p className="empty">{emptyMessage}</p>;
  return (
    <ul className="feed">
      {events.slice(0, limit).map((e) => (
        <li key={e.id} className={e.id === selectedId ? 'feed-row selected' : 'feed-row'}>
          <button className="feed-item" onClick={() => onSelect(e.id)} aria-pressed={e.id === selectedId}>
            <span className="mag" style={{ background: magnitudeColor(e.magnitude) }}>{fmt.magnitude(e.magnitude)}</span>
            <span className="feed-text">
              {/* The place text comes straight from USGS and is shown exactly as received. */}
              <span className="place">{fmt.place(e)}</span>
              <span className="meta">{fmt.dateTime(e.occurredAt)} &middot; {t('feed.depth', { depth: fmt.depth(e.depthKm) })}</span>
            </span>
          </button>
          {e.url && (
            <a className="ext" href={e.url} target="_blank" rel="noopener noreferrer">{t('feed.usgsLink')}</a>
          )}
        </li>
      ))}
    </ul>
  );
}
