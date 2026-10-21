import { useLiveMatches, useUpcomingMatches } from '@/hooks/queries';
import type { Match } from '@/types';
import { MatchCard } from './MatchCard';
import { LoadingRegion, Skeleton } from './Skeleton';

/**
 * A player's live or next scheduled matches, picked out of the cached live and
 * ATP/WTA upcoming lists, so it costs no extra API calls.
 */
export function NextMatches({ playerId, limit = 2 }: { playerId: string; limit?: number }) {
  const live = useLiveMatches();
  const atp = useUpcomingMatches('ATP');
  const wta = useUpcomingMatches('WTA');

  if (live.isLoading || atp.isLoading || wta.isLoading) {
    return (
      <LoadingRegion label="Loading matches…">
        <Skeleton className="h-20 w-full rounded-2xl" />
      </LoadingRegion>
    );
  }
  const involves = (m: Match) => m.p1.id === playerId || m.p2.id === playerId;
  const matches = [
    ...(live.data?.matches ?? []).filter(involves),
    ...[...(atp.data?.matches ?? []), ...(wta.data?.matches ?? [])].filter(involves),
  ].slice(0, limit);

  if (matches.length === 0) {
    const failed = live.isError && atp.isError && wta.isError;
    return <p className="text-sm text-slate-300">{failed ? 'Match schedule unavailable right now.' : 'No matches on the order of play yet.'}</p>;
  }
  return (
    <ul className="space-y-2">
      {matches.map((m) => (
        <li key={m.id}>
          <MatchCard match={m} />
        </li>
      ))}
    </ul>
  );
}
