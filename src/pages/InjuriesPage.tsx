import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { InjuryStatus, Tour } from '@/types';
import { useInjuredPlayers, useRankLookup } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/PageHeader';
import { TourTabs } from '@/components/TourTabs';
import { FilterChips } from '@/components/FilterChips';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { StatusBadge } from '@/components/StatusBadge';
import { FollowButton } from '@/components/FollowButton';
import { CountryFlag } from '@/components/CountryFlag';
import { InjuryDetails } from '@/components/InjuryDetails';
import { CardListSkeleton } from '@/components/Skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { isLive } from '@/services';

type Filter = 'All' | Tour;
const STATUSES = ['Injured', 'Returning'] as const;

export default function InjuriesPage() {
  useDocumentTitle('Injury Report');
  const [tour, setTour] = useState<Filter>('All');
  const [statuses, setStatuses] = useState<InjuryStatus[]>([]);
  const { data, isLoading, isError, error, refetch } = useInjuredPlayers(tour === 'All' ? undefined : tour);
  const ranks = useRankLookup();

  const list = (data ?? []).filter((p) => statuses.length === 0 || statuses.includes(p.status));
  const injuredCount = data?.filter((p) => p.status === 'Injured').length ?? 0;
  const returningCount = data?.filter((p) => p.status === 'Returning').length ?? 0;

  return (
    <>
      <PageHeader
        title="Injury report"
        subtitle={
          <>
            {data ? `${injuredCount} injured · ${returningCount} returning from injury` : 'Who’s sidelined and who’s coming back.'}
            {isLive() && <span className="block text-xs text-amber-200">Injury details are sample data — Live Tennis API's free plan has no injury feed.</span>}
          </>
        }
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TourTabs label="Tour" idPrefix="injuries" value={tour} options={['All', 'ATP', 'WTA'] as const} onChange={setTour} labels={{ All: 'Both tours' }} />
        <FilterChips
          legend="Status"
          options={STATUSES}
          selected={statuses}
          onToggle={(s) => setStatuses((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))}
        />
      </div>

      <div id="injuries-panel" role="tabpanel" aria-labelledby={`injuries-tab-${tour}`}>
        {isLoading ? (
          <CardListSkeleton count={5} label="Loading injury report…" />
        ) : isError ? (
          <ErrorMessage title="We couldn't load the injury report" error={error} onRetry={() => refetch()} />
        ) : list.length === 0 ? (
          <EmptyState title="Clean bill of health">No players match these filters right now.</EmptyState>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {list.map((p) => {
              const rank = ranks.map.get(p.id)?.rank;
              return (
                <li key={p.id} className="card p-4 sm:p-5">
                  <div className="flex items-start gap-4">
                    <PlayerAvatar name={p.name} tour={p.tour} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-50">
                          <Link to={`/players/${p.id}`} className="hover:text-ball hover:underline">{p.name}</Link>
                        </h2>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-300">
                        <CountryFlag countryCode={p.countryCode} countryName={p.countryName} ioc={p.ioc} />
                        <span aria-hidden="true">·</span>
                        <span>{p.tour}{rank ? ` No. ${rank}` : ''}</span>
                      </p>
                    </div>
                    <FollowButton playerId={p.id} playerName={p.name} />
                  </div>
                  {p.injury && (
                    <div className="mt-4 rounded-xl border border-navy-700 bg-navy-800/60 p-3">
                      <InjuryDetails injury={p.injury} status={p.status} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
