import type { Player, Tour } from '@/types';
import playersJson from '@/mocks/players.json';
import { isLive } from './config';
import { apiGet, ApiError, mockDelay } from './apiClient';

const mockPlayers = playersJson as Player[];

/** All players for a tour (or both tours if omitted). */
export async function getPlayers(tour?: Tour): Promise<Player[]> {
  if (isLive()) {
    // TODO(live): map your provider's response to `Player[]`.
    return apiGet<Player[]>('/players', tour ? { tour } : {});
  }
  return mockDelay(tour ? mockPlayers.filter((p) => p.tour === tour) : mockPlayers);
}

export async function getPlayer(id: string): Promise<Player> {
  if (isLive()) {
    return apiGet<Player>(`/players/${encodeURIComponent(id)}`);
  }
  const player = mockPlayers.find((p) => p.id === id);
  if (!player) throw new ApiError(`We couldn't find a player with id "${id}".`, 404);
  return mockDelay(player);
}

/** Several players by id, in the order requested. Unknown ids are skipped. */
export async function getPlayersByIds(ids: string[]): Promise<Player[]> {
  if (ids.length === 0) return [];
  const all = await getPlayers();
  const byId = new Map(all.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Player => Boolean(p));
}
