import type { Player, Tour } from '@/types';
import { isLive } from './config';
import { apiGet } from './apiClient';
import { getPlayers } from './players';

/**
 * Players who are currently Injured or Returning.
 * In mock mode this is derived from the player list; a real provider
 * usually exposes a dedicated injuries endpoint.
 */
export async function getInjuredPlayers(tour?: Tour): Promise<Player[]> {
  if (isLive()) {
    // TODO(live): map your provider's injury feed to `Player[]` (with `status` and `injury` set).
    return apiGet<Player[]>('/injuries', tour ? { tour } : {});
  }
  const players = await getPlayers(tour);
  return players
    .filter((p) => p.status !== 'Active')
    .sort((a, b) => (b.injury?.dateReported ?? '').localeCompare(a.injury?.dateReported ?? ''));
}
