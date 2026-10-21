import { API_BASE_URL, API_KEY, DAILY_CALL_BUDGET } from './config';
import { readJson, writeJson } from '@/lib/storage';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Simulates network latency for mock data so loading states are visible. */
export function mockDelay<T>(data: T, ms = 250 + Math.random() * 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));
}

// ---------------------------------------------------------------------------
// Live Tennis API client
//
// The free plan allows 100 requests a day and 30 a minute, so every response is
// cached in localStorage with a per-endpoint lifetime (TTL). When the cache is
// fresh no request is made. When the daily budget is used up, or the API says
// we're rate limited, the last cached copy is served instead (marked `stale`).
// ---------------------------------------------------------------------------

const CACHE_PREFIX = 'deuces:lt:cache:';
const COUNTER_KEY = 'deuces:lt:calls';

interface CacheEntry<T> {
  savedAt: number;
  data: T;
}

export interface LiveResult<T> {
  data: T;
  /** When this data was fetched from the API (ms since epoch) */
  fetchedAt: number;
  /** True when served from an expired cache because a fresh fetch wasn't possible */
  stale: boolean;
}

const inflight = new Map<string, Promise<LiveResult<unknown>>>();

const utcDay = () => new Date().toISOString().slice(0, 10);

/** API calls made today from this browser. */
export function callsToday(): number {
  const c = readJson<{ day: string; count: number }>(COUNTER_KEY, { day: '', count: 0 });
  return c.day === utcDay() ? c.count : 0;
}

function recordCall(forceTo?: number) {
  writeJson(COUNTER_KEY, { day: utcDay(), count: forceTo ?? callsToday() + 1 });
}

function buildUrl(path: string, params: Record<string, string | number | string[] | undefined>) {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL + '/';
  const url = new URL(path.replace(/^\//, ''), base);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) v.forEach((x) => url.searchParams.append(k, x));
    else url.searchParams.set(k, String(v));
  }
  return url;
}

/** Marks cached entries whose key contains `match` as expired, so the next read refetches. */
export function expireLiveCache(match: string, minAgeMs = 60_000) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(CACHE_PREFIX) || !key.includes(match)) continue;
      const entry = readJson<CacheEntry<unknown> | null>(key, null);
      // Never expire very recent data — protects the budget from repeat clicks.
      if (entry && Date.now() - entry.savedAt > minAgeMs) writeJson(key, { ...entry, savedAt: 0 });
    }
  } catch {
    /* storage unavailable */
  }
}

/** GET a Live Tennis API path, with caching, de-duplication and budget protection. */
export async function liveGet<T>(
  path: string,
  params: Record<string, string | number | string[] | undefined>,
  ttlMs: number,
): Promise<LiveResult<T>> {
  if (!API_KEY) {
    throw new ApiError('Live data is on, but VITE_LIVETENNIS_API_KEY is missing from your .env file.', undefined, 'no_key');
  }
  const url = buildUrl(path, params);
  const cacheKey = CACHE_PREFIX + url.pathname + url.search;
  const cached = readJson<CacheEntry<T> | null>(cacheKey, null);

  if (cached && Date.now() - cached.savedAt < ttlMs) {
    return { data: cached.data, fetchedAt: cached.savedAt, stale: false };
  }

  const staleOr = (err: ApiError): LiveResult<T> => {
    if (cached) return { data: cached.data, fetchedAt: cached.savedAt, stale: true };
    throw err;
  };

  if (callsToday() >= DAILY_CALL_BUDGET) {
    return staleOr(new ApiError(`Today's API budget (${DAILY_CALL_BUDGET} calls) is used up. Fresh data will load after midnight UTC.`, 429, 'budget'));
  }

  const existing = inflight.get(cacheKey);
  if (existing) return existing as Promise<LiveResult<T>>;

  const request = (async (): Promise<LiveResult<T>> => {
    let res: Response;
    try {
      recordCall();
      res = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${API_KEY}` } });
    } catch {
      return staleOr(new ApiError("Couldn't reach Live Tennis API. Check your connection."));
    }

    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      if (body?.scope === 'day') recordCall(DAILY_CALL_BUDGET);
      const msg = body?.scope === 'day' ? "The API's daily limit has been reached. Fresh data will load after it resets." : 'Too many requests — please wait a minute.';
      return staleOr(new ApiError(msg, 429, body?.error));
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg =
        res.status === 401 ? 'The API key was rejected. Check VITE_LIVETENNIS_API_KEY in .env.'
        : res.status === 403 ? 'This data needs a paid Live Tennis API plan.'
        : res.status === 404 ? 'Not found.'
        : `Live Tennis API error (${res.status}).`;
      // Don't fall back to cache for "not found" — that answer is definitive.
      if (res.status === 404 || res.status === 410) throw new ApiError(msg, res.status, body?.error);
      return staleOr(new ApiError(msg, res.status, body?.error));
    }

    const data = (await res.json()) as T;
    const entry: CacheEntry<T> = { savedAt: Date.now(), data };
    writeJson(cacheKey, entry);
    return { data, fetchedAt: entry.savedAt, stale: false };
  })();

  inflight.set(cacheKey, request);
  try {
    return await request;
  } finally {
    inflight.delete(cacheKey);
  }
}
