import { liveGet } from '../apiClient';
import { buildRoster, type RosterResult } from './mappers';
import type { LtList, LtPlayer } from './types';

const THREE_HOURS = 3 * 60 * 60 * 1000;

/**
 * Top players for both tours: 2 API calls (400 players, ranked first),
 * cached for 3 hours. Official rankings only change weekly.
 */
export async function getRoster(): Promise<RosterResult & { fetchedAt: number; stale: boolean }> {
  const pages = await Promise.all(
    [0, 200].map((offset) => liveGet<LtList<LtPlayer>>('/players', { limit: 200, offset }, THREE_HOURS)),
  );
  const roster = buildRoster(pages.flatMap((p) => p.data.data));
  return {
    ...roster,
    fetchedAt: Math.min(...pages.map((p) => p.fetchedAt)),
    stale: pages.some((p) => p.stale),
  };
}
