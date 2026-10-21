import type { RankedPlayer, Rankings, Tour } from '@/types';
import atpJson from '@/mocks/rankings-atp.json';
import wtaJson from '@/mocks/rankings-wta.json';
import { isLive } from './config';
import { mockDelay } from './apiClient';
import { getPlayers } from './players';
import { getRoster } from './liveTennis/roster';

const mockRankings: Record<Tour, Rankings> = {
  ATP: atpJson as Rankings,
  WTA: wtaJson as Rankings,
};

/** Raw singles ranking list for a tour. */
export async function getRankings(tour: Tour): Promise<Rankings> {
  if (isLive()) {
    const roster = await getRoster();
    return { tour, rankingDate: roster.rankingDate, entries: roster.rankings[tour] };
  }
  return mockDelay(mockRankings[tour]);
}

export interface RankingsWithPlayers {
  tour: Tour;
  rankingDate: string;
  entries: RankedPlayer[];
  /** When this data was fetched from the source (ISO timestamp) */
  fetchedAt: string;
  /** True when shown from cache because fresh data couldn't be loaded */
  stale: boolean;
}

/** Ranking list joined with player bios — what the UI uses. */
export async function getRankingsWithPlayers(tour: Tour): Promise<RankingsWithPlayers> {
  let fetchedAt = new Date().toISOString();
  let stale = false;
  if (isLive()) {
    const roster = await getRoster();
    fetchedAt = new Date(roster.fetchedAt).toISOString();
    stale = roster.stale;
  }
  const [rankings, players] = await Promise.all([getRankings(tour), getPlayers(tour)]);
  const byId = new Map(players.map((p) => [p.id, p]));
  const entries = rankings.entries
    .map((e) => {
      const player = byId.get(e.playerId);
      return player ? { ...e, player } : null;
    })
    .filter((e): e is RankedPlayer => e !== null)
    .sort((a, b) => a.rank - b.rank);
  return { tour, rankingDate: rankings.rankingDate, entries, fetchedAt, stale };
}
