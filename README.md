# TwinSignal Live

A bilingual (Bengali and Gujarati) public-safety information monitoring platform, built for the Veritas AI International High School Hackathon 2026 (AI + Languages track).

> **Status: Milestone 1.** Only the live earthquake map is implemented. Everything marked **Planned** below does not exist yet.

## Purpose

Public-safety notices often reach people in more than one language, and the versions can disagree. TwinSignal Live aims to (1) monitor official public hazard data and (2) later, check that Bengali and Gujarati versions of the same notice say the same thing.

TwinSignal Live shows **observed earthquake reports** only. It does **not** predict earthquakes and does **not** issue official warnings or evacuation instructions.

## Current implementation (Milestone 1)

- Live map of USGS magnitude 2.5+ earthquakes from the past seven days (Leaflet + OpenStreetMap tiles)
- Region buttons: Global, Bangladesh, Gujarat (India), which move the map and filter events
- Event feed, event details panel and a link to each official USGS event page
- Data health: connection state, last successful fetch, the feed's own generated time, event counts, manual refresh
- Automatic refresh every 60 seconds, with no overlapping requests and timer cleanup
- Clear **loading**, **connected**, **stale** (2+ failed refreshes in a row, last good data kept and labelled) and **unavailable** (nothing shown) states
- Page structure for Live Map, Event Feed, Bilingual Alert Verification (placeholder), Sources and Data Health

No fake or sample events are ever shown in the app. Test fixtures exist only in `tests/`.

## Technology

React 19, TypeScript, Vite, Leaflet and React Leaflet, plain CSS, Vitest. No API keys, no paid services.

## Data source and attribution

- **Earthquakes:** [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php), `2.5_week.geojson` feed (public U.S. government data).
- **Map tiles:** &copy; [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

## How the map works

1. `src/services/providers/usgs.ts` downloads the GeoJSON and converts each feature to an `EarthquakeEvent` (`src/types/events.ts`).
2. USGS stores coordinates as `[longitude, latitude, depth]`. The parser reads them in that order (this is tested).
3. Records with missing or out-of-range coordinates, or no event time, are skipped and counted, never guessed.
4. The UI only knows about `EarthquakeEvent`, never the raw USGS format.
5. Circle markers are sized and coloured by magnitude. The colours are a visual aid, not a risk level.
6. Regional views use **rough rectangles** (`src/services/regions.ts`) to centre the map and filter events. They are **not official boundaries** and no boundary lines are drawn.

## Run the project

```bash
npm install
npm run dev        # development server
npm test           # unit tests
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

Requires Node.js 20 or newer and a normal internet connection (the browser fetches the USGS feed and map tiles).

## Project structure

```
src/types/events.ts              Internal event type, provider interface, error type
src/services/providers/usgs.ts   ALL USGS-specific code (fetch + parsing)
src/services/providers/index.ts  Which provider is active; list of planned sources
src/services/regions.ts          Approximate regions and filtering
src/hooks/useEarthquakeFeed.ts   60-second refresh, status, stale detection
src/components/                  Map, feed, details, region buttons, data health
src/App.tsx                      Page layout and navigation
tests/                           Vitest tests and test-only fixtures
```

## Current limitations

- The USGS feed is read directly from the browser. If USGS or your network blocks it, the app shows "unavailable" and no events.
- The feed contains only magnitude 2.5+ events, so small regional quakes will not appear, and quiet regions may show none.
- The 60-second refresh, duplicate-request guard and timer cleanup are implemented but **not covered by automated tests** yet (no browser test setup).
- The interface has not been tested across many browsers or with a screen reader.
- OpenStreetMap's public tile server is meant for light use. A production deployment needs a proper tile plan.
- Earthquakes only. No floods, cyclones or weather yet.

## Planned: Cloudflare architecture (not started)

```
Frontend  ->  Cloudflare Worker  ->  Public data sources + D1 database
```

The Worker will fetch and cache public data, store history in D1, and run on Cron Triggers. The frontend will then call the Worker and receive the same `EarthquakeEvent` shape, so no UI rewrite should be needed: add a provider next to `usgs.ts` that calls the Worker and switch `activeProvider`.

Planned data providers (none implemented or verified): GDACS, Bangladesh FFWC, India Meteorological Department, Open-Meteo, GDELT.

## Planned: Bengali-Gujarati alert verification (not started)

A future AI feature will compare Bengali and Gujarati versions of important public notices and check meaning, dates, times, locations, instructions and negation. **None of this exists in Milestone 1.** The "Bilingual Alert Verification" page is a labelled placeholder.

## Checking the live feed after deployment

1. Open the app and confirm the status reads "Connected to USGS".
2. Compare "Feed generated by USGS" with the timestamp at the top of the raw feed: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson` (`metadata.generated`).
3. Compare "Events received" with `metadata.count` in the same file.
4. Turn off your network and wait about two minutes: the app should switch to "Stale" and keep the last good data labelled.
