import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Tour } from '@/types';
import {
  getInjuredPlayers,
  getNews,
  getPlayer,
  getPlayers,
  getPlayersByIds,
  getRankingsWithPlayers,
  getTournaments,
  type NewsQuery,
} from '@/services';

const TEN_MINUTES = 10 * 60 * 1000;

export const queryKeys = {
  rankings: (tour: Tour) => ['rankings', tour] as const,
  players: (tour?: Tour) => ['players', tour ?? 'all'] as const,
  player: (id: string) => ['player', id] as const,
  playersByIds: (ids: string[]) => ['players', 'ids', ...ids] as const,
  injuries: (tour?: Tour) => ['injuries', tour ?? 'all'] as const,
  news: (q: NewsQuery) => ['news', q] as const,
  tournaments: (tour?: Tour) => ['tournaments', tour ?? 'all'] as const,
};

/** Rankings auto-refresh every 10 minutes (and when the tab regains focus). */
export function useRankings(tour: Tour) {
  return useQuery({
    queryKey: queryKeys.rankings(tour),
    queryFn: () => getRankingsWithPlayers(tour),
    refetchInterval: TEN_MINUTES,
    refetchIntervalInBackground: false,
    staleTime: TEN_MINUTES,
  });
}

export function usePlayers(tour?: Tour) {
  return useQuery({ queryKey: queryKeys.players(tour), queryFn: () => getPlayers(tour) });
}

export function usePlayer(id: string) {
  return useQuery({ queryKey: queryKeys.player(id), queryFn: () => getPlayer(id), enabled: Boolean(id) });
}

export function usePlayersByIds(ids: string[]) {
  return useQuery({ queryKey: queryKeys.playersByIds(ids), queryFn: () => getPlayersByIds(ids), placeholderData: keepPreviousData });
}

export function useInjuredPlayers(tour?: Tour) {
  return useQuery({ queryKey: queryKeys.injuries(tour), queryFn: () => getInjuredPlayers(tour) });
}

export function useNews(query: NewsQuery = {}, enabled = true) {
  return useQuery({ queryKey: queryKeys.news(query), queryFn: () => getNews(query), enabled });
}

export function useTournaments(tour?: Tour) {
  return useQuery({ queryKey: queryKeys.tournaments(tour), queryFn: () => getTournaments(tour), staleTime: 60 * 60 * 1000 });
}

/** Map of playerId -> current ranking entry, across both tours. */
export function useRankLookup() {
  const atp = useRankings('ATP');
  const wta = useRankings('WTA');
  const map = new Map<string, { rank: number; previousRank: number; points: number }>();
  for (const e of [...(atp.data?.entries ?? []), ...(wta.data?.entries ?? [])]) {
    map.set(e.playerId, { rank: e.rank, previousRank: e.previousRank, points: e.points });
  }
  return { map, isLoading: atp.isLoading || wta.isLoading };
}
