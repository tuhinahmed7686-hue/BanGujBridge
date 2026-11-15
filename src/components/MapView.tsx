import { useEffect, useMemo, useRef, useState } from 'react';
import { AttributionControl, CircleMarker, MapContainer, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { EarthquakeEvent } from '../types/events';
import { getRegion } from '../services/regions';
import type { RegionId } from '../services/regions';
import { TILE_ATTRIBUTION, TILE_REFERRER_POLICY, TILE_URL, onTileFailed, onTileLoaded, tileStatus } from '../lib/tiles';
import type { TileHealth } from '../lib/tiles';
import { useLanguage } from '../i18n/LanguageContext';
import { magnitudeColor, markerRadius } from '../lib/format';
import { useFormat } from '../lib/useFormat';

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
  const { t, language } = useLanguage();
  const fmt = useFormat();
  const [tiles, setTiles] = useState<TileHealth>({ loaded: 0, failed: 0 });
  const status = tileStatus(tiles);
  const tileHandlers = useMemo(() => ({ tileload: () => setTiles(onTileLoaded), tileerror: () => setTiles(onTileFailed) }), []);
  return (
    <div className="map-wrap" data-tiles={status}>
      {status === 'unavailable' && (
        <p className="banner info" role="status">{t('map.tilesUnavailable')}</p>
      )}
      <MapContainer center={[20, 10]} zoom={2} minZoom={1} worldCopyJump className="map" scrollWheelZoom zoomControl={false} attributionControl={false}>
        {/* Leaflet's built-in zoom buttons and credit text are English-only, so they are replaced with translated ones. */}
        {/* key={language}: the zoom control only reads its titles when created, so it is re-created on a language change. */}
        <ZoomControl key={language} position="topleft" zoomInTitle={t('map.zoomIn')} zoomOutTitle={t('map.zoomOut')} />
        <AttributionControl prefix='<a href="https://leafletjs.com">Leaflet</a>' />
        <TileLayer
          attribution={TILE_ATTRIBUTION}
          url={TILE_URL}
          referrerPolicy={TILE_REFERRER_POLICY}
          eventHandlers={tileHandlers}
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
                <strong>{fmt.magnitude(e.magnitude)}</strong> &middot; {fmt.place(e)}
                <br />
                {fmt.dateTime(e.occurredAt)}
                <br />
                {t('map.popupDepth', { depth: fmt.depth(e.depthKm) })}
                {e.url && (
                  <>
                    <br />
                    <a href={e.url} target="_blank" rel="noopener noreferrer">{t('feed.usgsLink')}</a>
                  </>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <p className="legend">{t('map.legend')}</p>
      <details className="help">
        <summary>{t('map.helpSummary')}</summary>
        <p>{t('map.helpBody')}</p>
      </details>
    </div>
  );
}
