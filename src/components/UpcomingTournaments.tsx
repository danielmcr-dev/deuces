import { Link } from 'react-router-dom';
import type { Player } from '@/types';
import { useTournaments } from '@/hooks/queries';
import { upcomingForPlayer } from '@/services';
import { formatDateRange, isInProgress } from '@/utils/dates';
import { SurfaceBadge, TierBadge } from './SurfaceBadge';
import { LoadingRegion, Skeleton } from './Skeleton';

/** Next few events a player is expected to enter. */
export function UpcomingTournaments({ player, rank, limit = 3 }: { player: Player; rank?: number; limit?: number }) {
  const { data, isLoading, isError } = useTournaments(player.tour);

  if (isLoading) {
    return (
      <LoadingRegion label="Loading schedule…" className="space-y-2">
        {Array.from({ length: limit }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </LoadingRegion>
    );
  }
  if (isError || !data) return <p className="text-sm text-slate-300">Schedule unavailable right now.</p>;

  const upcoming = upcomingForPlayer(player, rank, data, limit);
  const sidelined = player.status === 'Injured';

  if (upcoming.length === 0) {
    return (
      <p className="text-sm text-slate-300">
        {sidelined && !player.injury?.expectedReturn ? 'Sidelined through injury — no confirmed entries until a return date is known.' : 'No more events scheduled this season.'}
      </p>
    );
  }

  return (
    <>
      {sidelined && (
        <p className="mb-2 text-xs text-amber-200">
          Entries shown are after the expected return date and depend on recovery.
        </p>
      )}
      <ul className="space-y-2">
        {upcoming.map((t) => {
          const live = isInProgress(t.startDate, t.endDate);
          return (
            <li key={t.id}>
              <Link
                to={`/calendar?view=list&t=${t.id}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-navy-700 px-3 py-2 text-sm hover:border-ball"
              >
                <TierBadge tier={t.tiersByTour[player.tour] ?? t.tier} />
                <span className="font-medium text-slate-100">{t.name}</span>
                {live && <span className="text-[11px] font-bold uppercase text-red-300">Live</span>}
                <span className="ml-auto flex items-center gap-2 text-xs text-slate-300">
                  {formatDateRange(t.startDate, t.endDate)}
                  <SurfaceBadge surface={t.surface} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
