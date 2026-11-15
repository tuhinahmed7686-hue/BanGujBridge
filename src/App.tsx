import { useMemo, useState } from 'react';
import { DataHealth, STATUS_KEY } from './components/DataHealth';
import { EventDetails } from './components/EventDetails';
import { EventFeed } from './components/EventFeed';
import { MapView } from './components/MapView';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { REGION_NAME_KEY, RegionControls } from './components/RegionControls';
import { useEarthquakeFeed } from './hooks/useEarthquakeFeed';
import { useLanguage } from './i18n/LanguageContext';
import type { TranslationKey } from './i18n/translations';
import { describeFeedError } from './lib/errors';
import { useFormat } from './lib/useFormat';
import { plannedSources } from './services/providers';
import { filterEventsByRegion } from './services/regions';
import type { RegionId } from './services/regions';

type Page = 'map' | 'feed' | 'verify' | 'sources';
const PAGES: { id: Page; labelKey: TranslationKey }[] = [
  { id: 'map', labelKey: 'nav.liveMap' },
  { id: 'feed', labelKey: 'nav.eventFeed' },
  { id: 'verify', labelKey: 'nav.verify' },
  { id: 'sources', labelKey: 'nav.sources' },
];
const PLANNED_KEY: Record<(typeof plannedSources)[number]['id'], TranslationKey> = {
  gdacs: 'planned.gdacs', ffwc: 'planned.ffwc', imd: 'planned.imd', 'open-meteo': 'planned.openMeteo', gdelt: 'planned.gdelt',
};

export default function App() {
  const [page, setPage] = useState<Page>('map');
  const [region, setRegion] = useState<RegionId>('global');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLanguage();
  const fmt = useFormat();
  const feed = useEarthquakeFeed();
  const { snapshot, status } = feed;

  const events = useMemo(() => filterEventsByRegion(snapshot?.events ?? [], region), [snapshot, region]);
  const selected = events.find((e) => e.id === selectedId) ?? null;

  const changeRegion = (id: RegionId) => {
    setRegion(id);
    setSelectedId(null);
  };

  let emptyMessage = t('feed.empty');
  if (!snapshot) emptyMessage = status === 'loading' ? t('feed.loading') : t('feed.unavailable');
  else if (events.length === 0 && region !== 'global')
    emptyMessage = t('region.emptyNotice', { region: t(REGION_NAME_KEY[region]) });
  const intervalSeconds = feed.intervalMs / 1000;
  const errorReason = describeFeedError(t, feed.errorKind ?? 'unknown', feed.errorStatus);

  const health = (
    <DataHealth
      status={status} snapshot={snapshot} errorKind={feed.errorKind} errorStatus={feed.errorStatus} failures={feed.failures}
      isFetching={feed.isFetching} shownCount={events.length}
      intervalSeconds={intervalSeconds} onRefresh={() => void feed.refresh()}
    />
  );
  const showNotice = snapshot && events.length === 0 && region !== 'global';

  return (
    <div className="app">     
<header className="command-header">
  <div className="brand-block">
    <div className="brand-mark">B</div>
    <div>
      <h1>BANGUJ <span>BRIDGE</span></h1>
      <p>DISASTER INTELLIGENCE NETWORK</p>
    </div>
  </div>

  <div className="command-tools">
    <div className="system-indicator">
      <span className={`dot ${status}`} />
      <span>{t(STATUS_KEY[status])}</span>
    </div>
    <LanguageSwitcher />
  </div>
</header>
      <nav className="tabs" aria-label={t('nav.sections')}>
        {PAGES.map((p) => (
          <button key={p.id} className="tab" aria-current={p.id === page ? 'page' : undefined} onClick={() => setPage(p.id)}>
            {t(p.labelKey)}
          </button>
        ))}
      </nav>

      {status === 'stale' && snapshot && (
        <div className="banner warn" role="status">{t('banner.stale', { time: fmt.dateTime(snapshot.fetchedAt) })}</div>
      )}
      {status === 'unavailable' && (
        <div className="banner error" role="alert">{t('banner.unavailable', { reason: errorReason, seconds: fmt.count(intervalSeconds) })}</div>
      )}

      <main>

{(page === 'map' || page === 'feed') && (
  <div className="layout">
    <div className="main-col">
      {page === 'map' && (
        <section className="dashboard-intro">
          <div>
            <p className="eyebrow">OPERATIONS / SITUATIONAL AWARENESS</p>
            <h2>Disaster Intelligence Overview</h2>
            <p className="muted">
              Monitoring seismic activity across Bangladesh, Gujarat and the world.
            </p>
          </div>
          <div className="event-counter">
            <span className="counter-value">{fmt.count(events.length)}</span>
            <span className="counter-label">EVENTS IN CURRENT VIEW</span>
          </div>
        </section>
      )}

      <RegionControls region={region} onChange={changeRegion} />

      {page === 'map' ? (
        <>
          {showNotice && <p className="banner info" role="status">{emptyMessage}</p>}
          <section className="panel map-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">GEOSPATIAL MONITORING</p>
                <h2>Live Seismic Map</h2>
              </div>
              <span className="live-label">
                <span className={`dot ${status}`} />
                {t(STATUS_KEY[status])}
              </span>
            </div>
            <MapView events={events} region={region} selected={selected} onSelect={setSelectedId} />
          </section>
        </>
      ) : (
        <section className="panel page-feed">
          <h2>{t('feed.titleCount', { count: fmt.count(events.length) })}</h2>
          <EventFeed events={events} selectedId={selectedId} onSelect={setSelectedId} limit={100} emptyMessage={emptyMessage} />
        </section>
      )}
    </div>

    <aside className="side-col">
      <section className="panel">
        <h2>{t('details.title')}</h2>
        <EventDetails event={selected} />
      </section>

      {page === 'map' && (
        <section className="panel">
          <h2>{t('feed.title')}</h2>
          <EventFeed events={events} selectedId={selectedId} onSelect={setSelectedId} limit={8} emptyMessage={emptyMessage} />
        </section>
      )}

      <section className="panel">
        <h2>{t('health.title')}</h2>
        {health}
      </section>
    </aside>
  </div>
)}
        {page === 'verify' && (
          <section className="panel narrow">
            <h2>{t('nav.verify')}</h2>
            <p className="badge">{t('verify.badge')}</p>
            <p>{t('verify.body')}</p>
          </section>
        )}

        {page === 'sources' && (
          <div className="stack">
            <section className="panel"><h2>{t('health.title')}</h2>{health}</section>
            <section className="panel">
              <h2>{t('sources.activeTitle')}</h2>
              <p><strong>{t('sources.name')}</strong><br />{t('sources.activeDesc')}</p>
              <p><a href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php" target="_blank" rel="noopener noreferrer">{t('sources.feedLink')}</a></p>
              <p>{t('sources.tilesLabel')}: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors.</p>
            </section>
            <section className="panel">
              <h2>{t('sources.plannedTitle')}</h2>
              <ul className="plain">
                {plannedSources.map((s) => (
                  <li key={s.id}><strong>{s.name}</strong> &mdash; {t(PLANNED_KEY[s.id])} <span className="badge">{t('sources.plannedBadge')}</span></li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </main>

      <footer className="footer">{t('footer.text')}</footer>
    </div>
  );
}
