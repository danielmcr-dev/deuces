import { ApiError } from '@/services/apiClient';

/** Small banner shown when data is from cache because a fresh fetch wasn't possible. */
export function StaleNotice({ stale, error }: { stale?: boolean; error?: unknown }) {
  if (!stale) return null;
  const why = error instanceof ApiError ? error.message : 'Fresh data could not be loaded.';
  return (
    <p role="status" className="mb-3 rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
      Showing saved data. {why}
    </p>
  );
}
