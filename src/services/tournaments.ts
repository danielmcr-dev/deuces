import type { Player, Tournament, Tour } from '@/types';
import tournamentsJson from '@/mocks/tournaments.json';
import { isLive } from './config';
import { apiGet, ApiError, mockDelay } from './apiClient';
import { todayIso } from '@/utils/dates';

const mockTournaments = tournamentsJson as Tournament[];

/** The full season calendar, ordered by start date. */
export async function getTournaments(tour?: Tour): Promise<Tournament[]> {
  let items: Tournament[];
  if (isLive()) {
    // TODO(live): map your provider's calendar/schedule endpoint to `Tournament[]`.
    items = await apiGet<Tournament[]>('/tournaments', { season: String(new Date().getFullYear()) });
  } else {
    items = await mockDelay(mockTournaments);
  }
  return items
    .filter((t) => !tour || t.tours.includes(tour))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getTournament(id: string): Promise<Tournament> {
  const all = await getTournaments();
  const t = all.find((x) => x.id === id);
  if (!t) throw new ApiError(`We couldn't find a tournament with id "${id}".`, 404);
  return t;
}

/**
 * Upcoming events a player is expected to play.
 * Mock logic: top players enter every big event; others get a deterministic
 * selection of smaller events. A real API would return entry lists instead.
 */
export function upcomingForPlayer(
  player: Player,
  rank: number | undefined,
  tournaments: Tournament[],
  limit = 3,
): Tournament[] {
  const today = todayIso();
  // Injured with no return date: no entries. Otherwise only events after the expected return.
  if (player.status === 'Injured' && !player.injury?.expectedReturn) return [];
  const earliest = player.status !== 'Active' && player.injury?.expectedReturn && player.injury.expectedReturn > today ? player.injury.expectedReturn : today;
  const hash = [...player.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const picked: Tournament[] = [];
  for (const t of tournaments) {
    if (!t.tours.includes(player.tour) || t.startDate < earliest) continue;
    const tier = t.tiersByTour[player.tour] ?? t.tier;
    let plays: boolean;
    if (tier === 'Finals') plays = rank !== undefined && rank <= 8;
    else if (tier === 'Grand Slam' || tier === '1000') plays = true;
    else if (tier === '500') plays = (rank ?? 999) <= 40 || (hash + t.id.length) % 3 === 0;
    else plays = (hash + t.id.length) % 2 === 0;
    // A player can only be in one event at a time.
    if (plays && !picked.some((p) => p.startDate <= t.endDate && t.startDate <= p.endDate)) picked.push(t);
    if (picked.length >= limit) break;
  }
  return picked;
}
