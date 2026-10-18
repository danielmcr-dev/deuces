/**
 * Central data-source configuration.
 *
 * By default every service returns bundled mock data. To use a real sports data
 * API, create a `.env` file (see `.env.example`) with:
 *
 *   VITE_DATA_SOURCE=live
 *   VITE_SPORTS_API_BASE_URL=https://your-provider.example.com/v1
 *   VITE_SPORTS_API_KEY=your-key
 *
 * then implement the `live` branch in each service module (see README).
 */
export const DATA_SOURCE: 'mock' | 'live' =
  import.meta.env.VITE_DATA_SOURCE === 'live' ? 'live' : 'mock';

export const API_BASE_URL: string = import.meta.env.VITE_SPORTS_API_BASE_URL ?? '';
export const API_KEY: string = import.meta.env.VITE_SPORTS_API_KEY ?? '';

export const isLive = () => DATA_SOURCE === 'live';
