import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Tour } from '@/types';
import { useRankings } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/PageHeader';
import { TourTabs } from '@/components/TourTabs';
import { PlayerRow } from '@/components/PlayerRow';
import { RankingTableSkeleton } from '@/components/Skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { LastUpdated } from '@/components/LastUpdated';
import { SearchIcon } from '@/components/Icons';
import { formatDate } from '@/utils/dates';

const TOURS = ['ATP', 'WTA'] as const;

export default function RankingsPage() {
  const [params, setParams] = useSearchParams();
  const tour: Tour = params.get('tour') === 'WTA' ? 'WTA' : 'ATP';
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [injuredOnly, setInjuredOnly] = useState(false);
  useDocumentTitle(`${tour} Rankings`);

  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useRankings(tour);

  const countries = useMemo(() => {
    const m = new Map<string, string>();
    data?.entries.forEach((e) => m.set(e.player.ioc, e.player.countryName));
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return data.entries.filter((e) => {
      if (country && e.player.ioc !== country) return false;
      if (injuredOnly && e.player.status === 'Active') return false;
      if (q && !e.player.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)) return false;
      return true;
    });
  }, [data, query, country, injuredOnly]);

  const switchTour = (t: Tour) => {
    setParams(t === 'ATP' ? {} : { tour: t }, { replace: true });
    setCountry('');
  };

  return (
    <>
      <PageHeader
        title="Live rankings"
        subtitle={data ? <>Singles top 100 · rankings as of {formatDate(data.rankingDate)}</> : 'Singles top 100'}
        actions={<LastUpdated updatedAt={dataUpdatedAt || undefined} isFetching={isFetching} onRefresh={() => refetch()} />}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TourTabs label="Tour" idPrefix="rankings" value={tour} options={TOURS} onChange={switchTour} />
        <form role="search" className="grid gap-2 sm:grid-cols-[1fr_12rem_auto] sm:items-center" onSubmit={(e) => e.preventDefault()}>
          <label className="relative block">
            <span className="sr-only">Search players by name</span>
            <SearchIcon width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search players…" className="input pl-9 sm:w-64" />
          </label>
          <label className="block">
            <span className="sr-only">Filter by country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="input" disabled={!data}>
              <option value="">All countries</option>
              {countries.map(([ioc, name]) => (
                <option key={ioc} value={ioc}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={injuredOnly} onChange={(e) => setInjuredOnly(e.target.checked)} className="h-4 w-4 accent-[#d4f53c]" />
            Injured / returning only
          </label>
        </form>
      </div>

      <div id="rankings-panel" role="tabpanel" aria-labelledby={`rankings-tab-${tour}`}>
        {isLoading ? (
          <RankingTableSkeleton />
        ) : isError ? (
          <ErrorMessage title="We couldn't load the rankings" error={error} onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No players match">Try a different name or clear the filters.</EmptyState>
        ) : (
          <>
            <p className="mb-2 text-xs text-slate-400" aria-live="polite">
              Showing {filtered.length} of {data!.entries.length} players
            </p>
            <div className="card overflow-hidden">
              <table className="w-full table-fixed">
                <caption className="sr-only">{tour} singles rankings</caption>
                <colgroup>
                  <col className="w-12 sm:w-14" />
                  <col className="w-12" />
                  <col />
                  <col className="hidden w-16 md:table-column" />
                  <col className="hidden w-14 sm:table-column" />
                  <col className="w-20 sm:w-24" />
                  <col className="w-12 sm:w-14" />
                </colgroup>
                <thead className="border-b border-navy-700 bg-navy-800 text-xs uppercase tracking-wide text-slate-300">
                  <tr>
                    <th scope="col" className="py-3 pl-3 pr-1 text-right sm:pl-4">Rank</th>
                    <th scope="col" className="px-1 py-3 text-center"><span aria-hidden="true">+/-</span><span className="sr-only">Movement</span></th>
                    <th scope="col" className="py-3 pl-1 pr-2 text-left">Player</th>
                    <th scope="col" className="hidden px-2 py-3 text-left md:table-cell">Country</th>
                    <th scope="col" className="hidden px-2 py-3 text-right sm:table-cell">Age</th>
                    <th scope="col" className="px-2 py-3 text-right">Points</th>
                    <th scope="col" className="py-3 pl-1 pr-2 sm:pr-3"><span className="sr-only">Follow</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <PlayerRow key={entry.playerId} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
