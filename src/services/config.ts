/**
 * Central data-source configuration.
 *
 * By default every service returns bundled mock data. To use real data from
 * Live Tennis API (https://livetennisapi.com — free plan, no card needed),
 * create a `.env` file (see `.env.example`):
 *
 *   VITE_DATA_SOURCE=live
 *   VITE_LIVETENNIS_API_KEY=twjp_...
 *
 * In live mode, rankings, players and live/upcoming matches come from the API.
 * News, the season calendar and injuries stay on sample data, because the free
 * plan doesn't include them (see README).
 */
export const DATA_SOURCE: 'mock' | 'live' =
  import.meta.env.VITE_DATA_SOURCE === 'live' ? 'live' : 'mock';

export const API_BASE_URL: string =
  import.meta.env.VITE_LIVETENNIS_API_BASE_URL || 'https://api.livetennisapi.com/api/public/v1';
export const API_KEY: string = import.meta.env.VITE_LIVETENNIS_API_KEY ?? '';

/**
 * The free plan allows 100 requests a day. The client stops making new calls at
 * this number and serves cached data instead, leaving a little headroom.
 */
export const DAILY_CALL_BUDGET = Number(import.meta.env.VITE_LIVETENNIS_DAILY_BUDGET) || 90;

export const isLive = () => DATA_SOURCE === 'live';
