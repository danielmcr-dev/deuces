import { API_BASE_URL, API_KEY } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Minimal fetch wrapper for a real sports data API.
 * Adjust the auth header to whatever your provider expects
 * (e.g. `x-rapidapi-key`, `Authorization: Bearer ...`, or a `?api_key=` query param).
 */
export async function apiGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!API_BASE_URL || !API_KEY) {
    throw new ApiError('Live data is enabled but VITE_SPORTS_API_BASE_URL or VITE_SPORTS_API_KEY is missing.');
  }
  const url = new URL(path.replace(/^\//, ''), API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL + '/');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  if (!res.ok) {
    throw new ApiError(`Request to ${url.pathname} failed (${res.status})`, res.status);
  }
  return (await res.json()) as T;
}

/** Simulates network latency for mock data so loading states are visible. */
export function mockDelay<T>(data: T, ms = 250 + Math.random() * 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));
}
