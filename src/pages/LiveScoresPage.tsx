import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Match } from '@/types';
import { useLiveMatches, useUpcomingMatches } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { expireLiveCache, isLive, type ScoresTour } from '@/services';
import { PageHeader } from '@/components/PageHeader';
import { TourTabs } from '@/components/TourTabs';
import { MatchCard } from '@/components/MatchCard';
import { LastUpdated } from '@/components/LastUpdated';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { StaleNotice } from '@/components/DataNotice';
import { LoadingRegion, Skeleton } from '@/components/Skeleton';

const TOURS = ['ATP', 'WTA', 'Challenger', 'ITF'] as const;

function groupByTournament(matches: Match[]) {
  const groups = new Map<string, Match[]>();
  matches.forEach((m) => groups.set(m.tournament, [...(groups.get(m.tournament) ?? []), m]));
  return [...groups.entries()];
}

function MatchGrid({ matches }: { matches: Match[] }) {
  return (
    <div className="space-y-6">
      {groupByTournament(matches).map(([name, list]) => (
        <section key={name} aria-label={name}>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-300">
            {name} <span className="font-normal text-slate-400">· {list.length}</span>
          </h3>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((m) => (
              <li key={m.id}>
                <MatchCard match={m} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const gridSkeleton = (label: string) => (
  <LoadingRegion label={label} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
  </LoadingRegion>
);

export default function LiveScoresPage() {
  useDocumentTitle('Live scores');
  const [params, setParams] = useSearchParams();
  const tourParam = params.get('tour');
  const tour: ScoresTour = (TOURS as readonly string[]).includes(tourParam ?? '') ? (tourParam as ScoresTour) : 'ATP';

  const live = useLiveMatches();
  const upcoming = useUpcomingMatches(tour);

  const liveForTour = useMemo(() => (live.data?.matches ?? []).filter((m) => m.tour === tour), [live.data, tour]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (live.data?.matches ?? []).forEach((m) => (c[m.tour] = (c[m.tour] ?? 0) + 1));
    return c;
  }, [live.data]);

  const refresh = () => {
    expireLiveCache('status=live');
    live.refetch();
  };

  return (
    <>
      <PageHeader
        title="Live scores"
        subtitle={isLive() ? 'Singles matches in progress and on the order of play, from Live Tennis API.' : 'Sample matches — connect Live Tennis API for real scores (see README).'}
        actions={<LastUpdated updatedAt={live.data ? Date.parse(live.data.fetchedAt) : undefined} isFetching={live.isFetching} onRefresh={refresh} intervalLabel="refreshes every 5 min" />}
      />

      <div className="mb-6">
        <TourTabs
          label="Tour"
          idPrefix="scores"
          value={tour}
          options={TOURS}
          onChange={(t) => setParams(t === 'ATP' ? {} : { tour: t }, { replace: true })}
          labels={Object.fromEntries(TOURS.map((t) => [t, counts[t] ? `${t} · ${counts[t]}` : t]))}
        />
      </div>

      <div id="scores-panel" role="tabpanel" aria-labelledby={`scores-tab-${tour}`} className="space-y-10">
        <section aria-labelledby="live-now">
          <h2 id="live-now" className="heading-display mb-3 flex items-center gap-2 text-2xl text-slate-50">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" /> Live now
          </h2>
          <StaleNotice stale={live.data?.stale} />
          {live.isLoading ? (
            gridSkeleton('Loading live scores…')
          ) : live.isError ? (
            <ErrorMessage title="We couldn't load live scores" error={live.error} onRetry={() => live.refetch()} />
          ) : liveForTour.length === 0 ? (
            <EmptyState title={`No ${tour} matches live right now`}>Check the schedule below, or try another tour.</EmptyState>
          ) : (
            <MatchGrid matches={liveForTour} />
          )}
        </section>

        <section aria-labelledby="coming-up">
          <h2 id="coming-up" className="heading-display mb-3 text-2xl text-slate-50">Coming up</h2>
          <StaleNotice stale={upcoming.data?.stale} />
          {upcoming.isLoading ? (
            gridSkeleton('Loading schedule…')
          ) : upcoming.isError ? (
            <ErrorMessage title="We couldn't load the schedule" error={upcoming.error} onRetry={() => upcoming.refetch()} />
          ) : upcoming.data!.matches.length === 0 ? (
            <EmptyState title={`No ${tour} matches scheduled yet`} />
          ) : (
            <MatchGrid matches={upcoming.data!.matches} />
          )}
        </section>
      </div>
    </>
  );
}
