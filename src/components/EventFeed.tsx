import type { EarthquakeEvent } from '../types/events';
import { formatDateTime, formatDepth, formatMagnitude, magnitudeColor, placeLabel } from '../lib/format';

interface Props {
  events: EarthquakeEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  limit: number;
  emptyMessage: string;
}

export function EventFeed({ events, selectedId, onSelect, limit, emptyMessage }: Props) {
  if (events.length === 0) return <p className="empty">{emptyMessage}</p>;
  return (
    <ul className="feed">
      {events.slice(0, limit).map((e) => (
        <li key={e.id} className={e.id === selectedId ? 'feed-row selected' : 'feed-row'}>
          <button className="feed-item" onClick={() => onSelect(e.id)} aria-pressed={e.id === selectedId}>
            <span className="mag" style={{ background: magnitudeColor(e.magnitude) }}>{formatMagnitude(e.magnitude)}</span>
            <span className="feed-text">
              <span className="place">{placeLabel(e)}</span>
              <span className="meta">{formatDateTime(e.occurredAt)} &middot; Depth {formatDepth(e.depthKm)}</span>
            </span>
          </button>
          {e.url && (
            <a className="ext" href={e.url} target="_blank" rel="noopener noreferrer">USGS event page</a>
          )}
        </li>
      ))}
    </ul>
  );
}
