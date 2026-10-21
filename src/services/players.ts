import type { Player, Tour } from '@/types';
import playersJson from '@/mocks/players.json';
import { isLive } from './config';
import { ApiError, liveGet, mockDelay } from './apiClient';
import { getRoster } from './liveTennis/roster';
import { toPlayer, tourOf } from './liveTennis/mappers';
import type { LtPlayer } from './liveTennis/types';

const mockPlayers = playersJson as Player[];
const ONE_DAY = 24 * 60 * 60 * 1000;

/** Top-100 players for a tour (or both tours if omitted). */
export async function getPlayers(tour?: Tour): Promise<Player[]> {
  if (isLive()) {
    const roster = await getRoster();
    return tour ? roster.players[tour] : [...roster.players.ATP, ...roster.players.WTA];
  }
  return mockDelay(tour ? mockPlayers.filter((p) => p.tour === tour) : mockPlayers);
}

/** One player's full profile. Live: 1 API call, cached for a day. */
export async function getPlayer(id: string): Promise<Player> {
  if (isLive()) {
    if (!/^\d+$/.test(id)) {
      throw new ApiError('This player link is from the demo data and does not exist in live data.', 404);
    }
    const { data } = await liveGet<LtPlayer>(`/players/${id}`, {}, ONE_DAY);
    // Prefer the tour we already placed them in on the rankings page.
    const roster = await getRoster().catch(() => null);
    const placed = roster && (['ATP', 'WTA'] as const).find((t) => roster.players[t].some((p) => p.id === id));
    return toPlayer(data, placed || tourOf(data) || 'ATP');
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
  if (isLive()) {
    // Followed players outside the top 100 need their own (cached) profile call.
    const missing = ids.filter((id) => !byId.has(id) && /^\d+$/.test(id));
    const extra = await Promise.all(missing.map((id) => getPlayer(id).catch(() => null)));
    extra.forEach((p) => p && byId.set(p.id, p));
  }
  return ids.map((id) => byId.get(id)).filter((p): p is Player => Boolean(p));
}
