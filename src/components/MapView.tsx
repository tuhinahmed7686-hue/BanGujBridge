import { useEffect, useMemo, useRef } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { EarthquakeEvent } from '../types/events';
import { getRegion } from '../services/regions';
import type { RegionId } from '../services/regions';
import { formatDateTime, formatDepth, formatMagnitude, magnitudeColor, markerRadius, placeLabel } from '../lib/format';

function MapController({ region, selected }: { region: RegionId; selected: EarthquakeEvent | null }) {
  const map = useMap();
  // Every data refresh creates NEW event objects. If the effect below depended on the
  // object itself, the map would jump back to the selected event every 60 seconds, even
  // after the user panned away. So it depends on the event id only.
  const selectedId = selected?.id ?? null;
  const latest = useRef(selected);
  latest.current = selected;
  useEffect(() => {
    const { bounds } = getRegion(region);
    if (bounds) map.fitBounds([[bounds[0], bounds[1]], [bounds[2], bounds[3]]]);
    // On a phone-width map, zoom 2 shows under half the world and hides South Asia, so zoom out one level.
    else map.setView([20, 10], map.getSize().x < 700 ? 1 : 2);
  }, [map, region]);
  useEffect(() => {
    const event = latest.current;
    if (selectedId !== null && event) map.flyTo([event.latitude, event.longitude], Math.max(map.getZoom(), 5), { duration: 0.6 });
  }, [map, selectedId]);
  return null;
}

interface Props {
  events: EarthquakeEvent[];
  region: RegionId;
  selected: EarthquakeEvent | null;
  onSelect: (id: string) => void;
}

export function MapView({ events, region, selected, onSelect }: Props) {
  // Draw big quakes first so small ones stay clickable on top.
  const ordered = useMemo(() => [...events].sort((a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0)), [events]);
  return (
    <div className="map-wrap">
      <MapContainer center={[20, 10]} zoom={2} minZoom={1} worldCopyJump className="map" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController region={region} selected={selected} />
        {ordered.map((e) => (
          <CircleMarker
            key={e.id}
            center={[e.latitude, e.longitude]}
            radius={markerRadius(e.magnitude)}
            pathOptions={{
              color: e.id === selected?.id ? '#FFFFFF' : '#0B1526',
              weight: e.id === selected?.id ? 3 : 1,
              fillColor: magnitudeColor(e.magnitude),
              fillOpacity: 0.8,
            }}
            eventHandlers={{ click: () => onSelect(e.id) }}
          >
            <Popup>
              <div className="popup">
                <strong>{formatMagnitude(e.magnitude)}</strong> &middot; {placeLabel(e)}
                <br />
                {formatDateTime(e.occurredAt)}
                <br />
                Depth: {formatDepth(e.depthKm)}
                {e.url && (
                  <>
                    <br />
                    <a href={e.url} target="_blank" rel="noopener noreferrer">USGS event page</a>
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <p className="legend">
        Marker size and colour show reported magnitude: blue under 4, amber 4 to 4.9, orange 5 to 5.9, red 6 and above.
        Colours are a visual aid only, not a risk level.
      </p>
    </div>
  );
}
