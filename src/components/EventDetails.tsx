import type { EarthquakeEvent } from '../types/events';
import { formatDateTime, formatDepth, formatMagnitude, placeLabel } from '../lib/format';

export function EventDetails({ event }: { event: EarthquakeEvent | null }) {
  if (!event) return <p className="empty">Select a marker on the map or an event in the feed to see its details.</p>;
  return (
    <div>
      <h3 className="detail-title">{formatMagnitude(event.magnitude)} &middot; {placeLabel(event)}</h3>
      <dl className="details">
        <dt>Event time</dt><dd>{formatDateTime(event.occurredAt)}</dd>
        <dt>Last updated by USGS</dt><dd>{formatDateTime(event.updatedAt)}</dd>
        <dt>Depth</dt><dd>{formatDepth(event.depthKm)}</dd>
        <dt>Latitude</dt><dd>{event.latitude.toFixed(3)}</dd>
        <dt>Longitude</dt><dd>{event.longitude.toFixed(3)}</dd>
        <dt>USGS event ID</dt><dd>{event.id}</dd>
      </dl>
      {event.url && <a className="ext" href={event.url} target="_blank" rel="noopener noreferrer">Open official USGS event page</a>}
      <p className="note">
        This is an observed earthquake report from USGS. It is not a forecast and not an official evacuation instruction.
      </p>
    </div>
  );
}
