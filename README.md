# BANGUJ Bridge

A bilingual (Bengali and Gujarati) public-safety information monitoring platform, built for the Veritas AI International High School Hackathon 2026 (AI + Languages track).

> **Status: Milestone 1.** Only the live earthquake map is implemented. Everything marked **Planned** below does not exist yet.

## Purpose

Public-safety notices often reach people in more than one language, and the versions can disagree. BANGUJ Bridge aims to (1) monitor official public hazard data and (2) later, check that Bengali and Gujarati versions of the same notice say the same thing.

BANGUJ Bridge shows **observed earthquake reports** only. It does **not** predict earthquakes and does **not** issue official warnings or evacuation instructions.

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

## Testing

```bash
npm test           # 103 automated tests
npm run typecheck
npm run build
```

Automated tests cover: USGS parsing (valid, empty, bad or missing coordinates, missing optional fields, coordinate order), network, HTTP and invalid-JSON failures, region filtering, formatting, and the refresh hook (60-second timer, no overlapping requests, stale detection after 2 failed refreshes, recovery, cleanup on unmount, React StrictMode).

The tests use **synthetic fixtures in the real USGS format**. They are never shown in the app as live events.

The built app was also driven in a real headless Chromium browser: rendering, the unavailable state, map markers, popups, event selection, region buttons, tabs, manual and automatic refresh, stale detection and a phone-sized screen. In that browser run USGS responses were replaced by synthetic test events, because the test environment could not reach `earthquake.usgs.gov`. **That run does not prove the live USGS connection.** Use the checklist at the end of this file.

## Languages (English, Bengali, Gujarati)

The whole interface can be switched between English, বাংলা and ગુજરાતી with the buttons in the header. The change is
immediate (no reload), the choice is saved in the browser (`localStorage`, key `banguj.language`) and restored on the next
visit, and English is used when nothing valid is saved or the browser blocks storage.

- `src/i18n/translations.ts`: the three dictionaries. The `TranslationKey` type comes from the English dictionary, and
  Bengali and Gujarati are typed so that a missing or extra key stops the build.
- `src/i18n/LanguageContext.tsx`: `LanguageProvider` and `useLanguage()`, which returns `{ language, setLanguage, t }`.
  `t('key')` looks up a string, and `t('key', { name: value })` fills `{name}` placeholders.
- `src/components/LanguageSwitcher.tsx`: the selector (native names, keyboard friendly, active language marked).
- `src/lib/format.ts` and `useFormat.ts`: dates, numbers and units follow the chosen language (Bengali uses Bengali digits).
- `src/lib/errors.ts`: feed errors are translated from their kind (network, HTTP status, bad data), not from English text.

**To add or change text:** add the key to `en` first, then to `bn` and `gu` (TypeScript will not build until all three
match). `npm test` also checks that every translation keeps the same `{placeholders}`, is written in its own script, and
that no English leaks onto any screen.

**Not translated on purpose:** proper nouns (BANGUJ Bridge, USGS, OpenStreetMap, the names of planned data sources) and raw
USGS data such as place names, event IDs and links. Only how a value is displayed (digits, date format, unit) changes.

**Translation status:** the Bengali and Gujarati text is a **draft written by an AI assistant and has not been reviewed
by a native speaker**. Please have it reviewed before public use, especially `footer.text`, `details.disclaimer` and
`verify.body`.

**Known limits:** the "© OpenStreetMap contributors" credit is kept in its standard English form. Bengali and Gujarati use
fonts already installed on the device (no font download), which all current phones and computers include. AM/PM and the
time-zone name are shown the way the browser provides them.

## Troubleshooting: the map shows "Access blocked"

The background map comes from OpenStreetMap, whose tile servers refuse requests that arrive without a `Referer`
header. Some embedded previews (for example a GitHub Codespaces preview pane) and some privacy tools strip it.

- The app now sets a referrer policy on the map tiles themselves, on the page (`index.html`), and for Cloudflare
  hosting (`public/_headers`), so a stricter page-level policy no longer removes the Referer.
- If the map background still fails, a notice appears and earthquakes are drawn on a plain background at their real
  coordinates. A "Map background not loading?" note explains the usual cause.
- Limits: the notice appears when tiles fail to load. If a server returns an "Access blocked" image that loads
  successfully, the app cannot detect it, which is what the help note is for. In that case open the app in a normal
  browser tab.
- To check by hand: open the browser developer tools, Network tab, click a tile request, and look for a `Referer`
  request header.

## Project structure

```
src/types/events.ts              Internal event type, provider interface, error type
src/services/providers/usgs.ts   ALL USGS-specific code (fetch + parsing)
src/services/providers/index.ts  Which provider is active; list of planned sources
src/services/regions.ts          Approximate regions and filtering
src/hooks/useEarthquakeFeed.ts   60-second refresh, status, stale detection
src/i18n/                        Translations (en, bn, gu), language context and saved choice
src/components/                  Map, feed, details, region buttons, data health, language switcher
src/App.tsx                      Page layout and navigation
tests/                           Vitest tests (parser, regions, format, refresh hook) and test-only fixtures
```

## Current limitations

- The USGS feed is read directly from the browser. If USGS or your network blocks it, the app shows "unavailable" and no events.
- The feed contains only magnitude 2.5+ events, so small regional quakes will not appear, and quiet regions may show none.
- The interface has been exercised in one browser engine (headless Chromium) only, not across many browsers, and not with a screen reader.
- On a phone, the Global view cannot show the whole world at a readable zoom; people pan to see other regions.
- Live USGS data has **not** been verified end to end by the developers' tooling yet (see Testing below). Check it on your own machine or after deployment.
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
