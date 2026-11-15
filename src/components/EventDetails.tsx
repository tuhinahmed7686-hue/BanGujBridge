import { useLanguage } from '../i18n/LanguageContext';
import { useFormat } from '../lib/useFormat';
import type { EarthquakeEvent } from '../types/events';

export function EventDetails({ event }: { event: EarthquakeEvent | null }) {
  const { t } = useLanguage();
  const fmt = useFormat();
  if (!event) return <p className="empty">{t('details.selectPrompt')}</p>;
  return (
    <div>
      <h3 className="detail-title">{fmt.magnitude(event.magnitude)} &middot; {fmt.place(event)}</h3>
      <dl className="details">
        <dt>{t('details.eventTime')}</dt><dd>{fmt.dateTime(event.occurredAt)}</dd>
        <dt>{t('details.updated')}</dt><dd>{fmt.dateTime(event.updatedAt)}</dd>
        <dt>{t('details.depth')}</dt><dd>{fmt.depth(event.depthKm)}</dd>
        <dt>{t('details.latitude')}</dt><dd>{fmt.coordinate(event.latitude)}</dd>
        <dt>{t('details.longitude')}</dt><dd>{fmt.coordinate(event.longitude)}</dd>
        <dt>{t('details.eventId')}</dt><dd>{event.id}</dd>
      </dl>
      {event.url && <a className="ext" href={event.url} target="_blank" rel="noopener noreferrer">{t('details.openOfficial')}</a>}
      <p className="note">{t('details.disclaimer')}</p>
    </div>
  );
}
