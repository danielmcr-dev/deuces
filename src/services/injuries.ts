import type { Player, Tour } from '@/types';
import { getPlayers } from './players';
import { FEATURES } from '@/config/features';

/**
 * Players who are currently Injured or Returning.
 *
 * Injury data isn't on Live Tennis API's free plan, so status comes from the
 * curated list in src/mocks/players.json in both modes. In live mode that list
 * is matched to real players by name (see liveTennis/mappers.ts).
 */
export async function getInjuredPlayers(tour?: Tour): Promise<Player[]> {
  if (!FEATURES.injuries) return [];
  const players = await getPlayers(tour);
  return players
    .filter((p) => p.status !== 'Active')
    .sort((a, b) => (b.injury?.dateReported ?? '').localeCompare(a.injury?.dateReported ?? ''));
}
