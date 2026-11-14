import type { EventProvider } from '../../types/events';
import { usgsProvider } from './usgs';

// The UI asks this file for data. To switch to a Cloudflare Worker later, add
// a provider that calls the Worker URL and returns the same FeedSnapshot shape.
export const activeProvider: EventProvider = usgsProvider;

// Planned sources. NOT implemented, and NOT shown as live anywhere in the UI.
export const plannedSources = [
  { id: 'gdacs', name: 'GDACS', note: 'Global disaster alerts' },
  { id: 'ffwc', name: 'Bangladesh FFWC', note: 'Flood forecasting and warning' },
  { id: 'imd', name: 'India Meteorological Department', note: 'Weather and cyclone bulletins' },
  { id: 'open-meteo', name: 'Open-Meteo', note: 'Weather data' },
  { id: 'gdelt', name: 'GDELT', note: 'News and media monitoring' },
] as const;
