import { useMemo, useState } from 'react';
import { DataHealth, STATUS_LABEL } from './components/DataHealth';
import { EventDetails } from './components/EventDetails';
import { EventFeed } from './components/EventFeed';
import { MapView } from './components/MapView';
import { RegionControls } from './components/RegionControls';
import { useEarthquakeFeed } from './hooks/useEarthquakeFeed';
import { formatDateTime } from './lib/format';
import { plannedSources } from './services/providers';
import { filterEventsByRegion, getRegion } from './services/regions';
import type { RegionId } from './services/regions';

type Page = 'map' | 'feed' | 'verify' | 'sources';
const PAGES: { id: Page; label: string }[] = [
  { id: 'map', label: 'Live Map' },
  { id: 'feed', label: 'Event Feed' },
  { id: 'verify', label: 'Bilingual Alert Verification' },
  { id: 'sources', label: 'Sources and Data Health' },
];

export default function App() {
  const [page, setPage] = useState<Page>('map');
  const [region, setRegion] = useState<RegionId>('global');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const feed = useEarthquakeFeed();
  const { snapshot, status } = feed;

  const events = useMemo(() => filterEventsByRegion(snapshot?.events ?? [], region), [snapshot, region]);
  const selected = events.find((e) => e.id === selectedId) ?? null;

  const changeRegion = (id: RegionId) => {
    setRegion(id);
    setSelectedId(null);
  };

  let emptyMessage = 'No events to show.';
  if (!snapshot) emptyMessage = status === 'loading' ? 'Loading earthquake reports from USGS...' : 'No data to show because the USGS feed is unavailable.';
  else if (events.length === 0 && region !== 'global')
    emptyMessage = `No earthquakes of magnitude 2.5 or higher in the USGS past-7-days feed fall inside the approximate ${getRegion(region).label.replace(' view', '')} search area.`;

  const health = (
    <DataHealth
      status={status} snapshot={snapshot} error={feed.error} failures={feed.failures}
      isFetching={feed.isFetching} shownCount={events.length}
      intervalSeconds={feed.intervalMs / 1000} onRefresh={() => void feed.refresh()}
    />
  );
  const showNotice = snapshot && events.length === 0 && region !== 'global';

  return (
    <div className="app">
      <header className="topbar">
        <h1>BANGUJ Bridge</h1>
        <div className="topbar-status">
          <span className={`pill ${status}`}><span className={`dot ${status}`} aria-hidden="true" /> {STATUS_LABEL[status]}</span>
          <span className="muted">Last successful refresh: {snapshot ? formatDateTime(snapshot.fetchedAt) : 'none yet'}</span>
        </div>
      </header>
      <nav className="tabs" aria-label="Sections">
        {PAGES.map((p) => (
          <button key={p.id} className="tab" aria-current={p.id === page ? 'page' : undefined} onClick={() => setPage(p.id)}>
            {p.label}
          </button>
        ))}
      </nav>

      {status === 'stale' && snapshot && (
        <div className="banner warn" role="status">
          Showing stale data. The last successful fetch was {formatDateTime(snapshot.fetchedAt)}, and recent refreshes have failed. These events may be out of date.
        </div>
      )}
      {status === 'unavailable' && (
        <div className="banner error" role="alert">
          Earthquake data is unavailable. BANGUJ Bridge could not load the USGS feed ({feed.error}). No events are shown. It will retry every {feed.intervalMs / 1000} seconds.
        </div>
      )}

      <main>
        {(page === 'map' || page === 'feed') && (
          <div className="layout">
            <div className="main-col">
              <RegionControls region={region} onChange={changeRegion} />
              {page === 'map' ? (
                <>
                  {showNotice && <p className="banner info" role="status">{emptyMessage}</p>}
                  <MapView events={events} region={region} selected={selected} onSelect={setSelectedId} />
                </>
              ) : (
                <section className="panel page-feed">
                  <h2>Latest earthquakes ({events.length})</h2>
                  <EventFeed events={events} selectedId={selectedId} onSelect={setSelectedId} limit={100} emptyMessage={emptyMessage} />
                </section>
              )}
            </div>
            <aside className="side-col">
              <section className="panel"><h2>Event details</h2><EventDetails event={selected} /></section>
              {page === 'map' && (
                <section className="panel">
                  <h2>Latest earthquakes</h2>
                  <EventFeed events={events} selectedId={selectedId} onSelect={setSelectedId} limit={8} emptyMessage={emptyMessage} />
                </section>
              )}
              <section className="panel"><h2>Data health</h2>{health}</section>
            </aside>
          </div>
        )}

        {page === 'verify' && (
          <section className="panel narrow">
            <h2>Bilingual Alert Verification</h2>
            <p className="badge">Planned, not implemented</p>
            <p>
              A future milestone will compare Bengali and Gujarati versions of important public notices and check
              whether meaning, dates, times, locations, instructions and negation agree. No verification feature or AI
              model exists in this version.
            </p>
          </section>
        )}

        {page === 'sources' && (
          <div className="stack">
            <section className="panel"><h2>Data health</h2>{health}</section>
            <section className="panel">
              <h2>Active source</h2>
              <p>
                <strong>USGS Earthquake Hazards Program</strong>: magnitude 2.5+ earthquakes worldwide over the past seven days, read
                directly from the public{' '}
                <a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noopener noreferrer">GeoJSON summary feed</a>.
                USGS data is public information from the U.S. Geological Survey.
              </p>
              <p>Map tiles: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors.</p>
            </section>
            <section className="panel">
              <h2>Planned sources (not connected)</h2>
              <ul className="plain">
                {plannedSources.map((s) => (<li key={s.id}><strong>{s.name}</strong>: {s.note}. <span className="badge">Planned</span></li>))}
              </ul>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">
        Source: USGS Earthquake Hazards Program. BANGUJ Bridge shows observed earthquake reports only. It does not predict
        earthquakes and does not issue official warnings or evacuation instructions. For official guidance, follow your
        national and local authorities.
      </footer>
    </div>
  );
}
