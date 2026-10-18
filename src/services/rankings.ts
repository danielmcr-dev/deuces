import type { RankedPlayer, Rankings, Tour } from '@/types';
import atpJson from '@/mocks/rankings-atp.json';
import wtaJson from '@/mocks/rankings-wta.json';
import { isLive } from './config';
import { apiGet, mockDelay } from './apiClient';
import { getPlayers } from './players';

const mockRankings: Record<Tour, Rankings> = {
  ATP: atpJson as Rankings,
  WTA: wtaJson as Rankings,
};

/** Raw singles ranking list for a tour. */
export async function getRankings(tour: Tour): Promise<Rankings> {
  if (isLive()) {
    // TODO(live): map your provider's ranking endpoint to `Rankings`.
    return apiGet<Rankings>(`/rankings/${tour.toLowerCase()}/singles`);
  }
  return mockDelay(mockRankings[tour]);
}

export interface RankingsWithPlayers {
  tour: Tour;
  rankingDate: string;
  entries: RankedPlayer[];
  /** When this response was fetched (ISO timestamp) */
  fetchedAt: string;
}

/** Ranking list joined with player bios — what the UI uses. */
export async function getRankingsWithPlayers(tour: Tour): Promise<RankingsWithPlayers> {
  const [rankings, players] = await Promise.all([getRankings(tour), getPlayers(tour)]);
  const byId = new Map(players.map((p) => [p.id, p]));
  const entries = rankings.entries
    .map((e) => {
      const player = byId.get(e.playerId);
      return player ? { ...e, player } : null;
    })
    .filter((e): e is RankedPlayer => e !== null)
    .sort((a, b) => a.rank - b.rank);
  return { tour, rankingDate: rankings.rankingDate, entries, fetchedAt: new Date().toISOString() };
}
