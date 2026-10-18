import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Surface, Tier, Tour, Tournament } from '@/types';
import { useTournaments } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/PageHeader';
import { TourTabs } from '@/components/TourTabs';
import { FilterChips } from '@/components/FilterChips';
import { TournamentCard } from '@/components/TournamentCard';
import { TournamentDetailPanel } from '@/components/TournamentDetailPanel';
import { MonthCalendar } from '@/components/MonthCalendar';
import { SURFACE_STYLES } from '@/components/SurfaceBadge';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { LoadingRegion, Skeleton } from '@/components/Skeleton';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, ListIcon } from '@/components/Icons';
import { isInProgress, parseIsoDate, todayIso } from '@/utils/dates';
import { cx } from '@/utils/format';

type View = 'month' | 'list';
type TourFilter = 'All' | Tour;
const SURFACES = ['Hard', 'Clay', 'Grass'] as const;
const TIERS = ['Grand Slam', '1000', '500', '250', 'Finals'] as const;

const listParam = <T extends string>(v: string | null, allowed: readonly T[]): T[] =>
  (v ?? '').split(',').filter((x): x is T => (allowed as readonly string[]).includes(x));

export default function CalendarPage() {
  useDocumentTitle('Calendar');
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useTournaments();

  // All filter/view state lives in the URL so it's shareable and survives refresh.
  const view: View = params.get('view') === 'list' ? 'list' : 'month';
  const tour: TourFilter = params.get('tour') === 'ATP' ? 'ATP' : params.get('tour') === 'WTA' ? 'WTA' : 'All';
  const surfaces = listParam(params.get('surface'), SURFACES);
  const tiers = listParam(params.get('tier'), TIERS);
  const selectedId = params.get('t');

  const season = data?.length ? parseIsoDate(data[0].startDate).getFullYear() : new Date().getFullYear();
  const now = new Date();
  const defaultMonth = now.getFullYear() === season ? now.getMonth() : 0;
  const monthParam = Number(params.get('month'));
  const month = Number.isInteger(monthParam) && params.has('month') && monthParam >= 0 && monthParam <= 11 ? monthParam : defaultMonth;

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(changes)) {
            if (v === null || v === '') next.delete(k);
            else next.set(k, v);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const toggleIn = <T extends string>(key: string, current: T[], value: T) => {
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    update({ [key]: next.join(',') || null });
  };

  const filtered = useMemo(() => {
    return (data ?? []).filter((t) => {
      if (tour !== 'All' && !t.tours.includes(tour)) return false;
      if (surfaces.length && !surfaces.includes(t.surface)) return false;
      if (tiers.length) {
        const eventTiers = (tour === 'All' ? t.tours : [tour]).map((x) => t.tiersByTour[x] ?? t.tier);
        if (!eventTiers.some((x) => tiers.includes(x))) return false;
      }
      return true;
    });
  }, [data, tour, surfaces, tiers]);

  const selected = data?.find((t) => t.id === selectedId) ?? null;
  const select = (t: Tournament) => update({ t: t.id });
  const closePanel = useCallback(() => update({ t: null }), [update]);

  const today = todayIso();
  const live = filtered.filter((t) => isInProgress(t.startDate, t.endDate, today));
  const monthEvents = filtered.filter((t) => {
    const s = parseIsoDate(t.startDate);
    const e = parseIsoDate(t.endDate);
    const mStart = new Date(season, month, 1);
    const mEnd = new Date(season, month + 1, 0);
    return s <= mEnd && e >= mStart;
  });
  const byMonth = useMemo(() => {
    const groups = new Map<number, Tournament[]>();
    filtered.forEach((t) => {
      const m = parseIsoDate(t.startDate).getMonth();
      groups.set(m, [...(groups.get(m) ?? []), t]);
    });
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const monthName = (m: number) => new Date(season, m, 1).toLocaleDateString(undefined, { month: 'long' });
  const hasFilters = tour !== 'All' || surfaces.length > 0 || tiers.length > 0;

  return (
    <>
      <PageHeader
        title={`${season} calendar`}
        subtitle="Every ATP and WTA tour event of the season. Select a tournament for details and past champions."
        actions={
          <div role="group" aria-label="Calendar view" className="inline-flex rounded-full border border-navy-600 bg-navy-900 p-1">
            {(['month', 'list'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => update({ view: v === 'month' ? null : v })}
                className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold', view === v ? 'bg-ball text-navy-950' : 'text-slate-300 hover:text-white')}
              >
                {v === 'month' ? <CalendarIcon width={16} height={16} /> : <ListIcon width={16} height={16} />}
                {v === 'month' ? 'Month' : 'List'}
              </button>
            ))}
          </div>
        }
      />

      <div className="card mb-6 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400" aria-hidden="true">Tour</span>
          <TourTabs label="Tour" idPrefix="calendar" value={tour} options={['All', 'ATP', 'WTA'] as const} onChange={(t) => update({ tour: t === 'All' ? null : t })} labels={{ All: 'Both' }} />
        </div>
        <FilterChips
          legend="Surface"
          options={SURFACES}
          selected={surfaces}
          onToggle={(s) => toggleIn('surface', surfaces, s)}
          renderLabel={(s: Surface) => (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={cx('h-2 w-2 rounded-full', SURFACE_STYLES[s].dot)} />
              {s}
            </span>
          )}
        />
        <FilterChips legend="Tier" options={TIERS} selected={tiers} onToggle={(t: Tier) => toggleIn('tier', tiers, t)} />
        {hasFilters && (
          <button type="button" className="text-xs font-semibold text-ball hover:underline" onClick={() => update({ tour: null, surface: null, tier: null })}>
            Clear all filters
          </button>
        )}
      </div>

      <div id="calendar-panel" role="tabpanel" aria-labelledby={`calendar-tab-${tour}`}>
        {isLoading ? (
          <LoadingRegion label="Loading calendar…" className="space-y-3">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-[28rem] w-full rounded-2xl" />
          </LoadingRegion>
        ) : isError ? (
          <ErrorMessage title="We couldn't load the calendar" error={error} onRetry={() => refetch()} />
        ) : (
          <>
            {live.length > 0 && (
              <section aria-labelledby="live-heading" className="mb-6 rounded-2xl border border-ball/40 bg-ball/5 p-4">
                <h2 id="live-heading" className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ball">
                  <span aria-hidden="true" className="h-2 w-2 animate-pulse rounded-full bg-ball" /> In progress now
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {live.map((t) => (
                    <li key={t.id} className="flex"><TournamentCard tournament={t} onSelect={select} compact /></li>
                  ))}
                </ul>
              </section>
            )}

            {filtered.length === 0 ? (
              <EmptyState title="No tournaments match">Try removing a filter.</EmptyState>
            ) : view === 'month' ? (
              <section aria-labelledby="month-heading">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button type="button" className="btn-ghost px-3" onClick={() => update({ month: String(Math.max(0, month - 1)) })} disabled={month === 0} aria-label="Previous month">
                    <ChevronLeftIcon width={18} height={18} />
                  </button>
                  <h2 id="month-heading" className="heading-display text-2xl text-slate-50 sm:text-3xl" aria-live="polite">
                    {monthName(month)} {season}
                  </h2>
                  <button type="button" className="btn-ghost px-3" onClick={() => update({ month: String(Math.min(11, month + 1)) })} disabled={month === 11} aria-label="Next month">
                    <ChevronRightIcon width={18} height={18} />
                  </button>
                </div>
                <SurfaceLegend />
                <MonthCalendar year={season} month={month} tournaments={filtered} onSelect={select} />
                {month !== defaultMonth && now.getFullYear() === season && (
                  <div className="mt-3 text-center">
                    <button type="button" className="text-sm font-semibold text-ball hover:underline" onClick={() => update({ month: null })}>Back to this month</button>
                  </div>
                )}
                <h3 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-slate-300">
                  {monthEvents.length} tournament{monthEvents.length === 1 ? '' : 's'} in {monthName(month)}
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {monthEvents.map((t) => (
                    <li key={t.id} className="flex"><TournamentCard tournament={t} onSelect={select} /></li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <SurfaceLegend />
                  {now.getFullYear() === season && byMonth.some(([m]) => m === now.getMonth()) && (
                    <a href={`#month-${now.getMonth()}`} className="text-sm font-semibold text-ball hover:underline">Jump to {monthName(now.getMonth())} ↓</a>
                  )}
                </div>
                {byMonth.map(([m, events]) => (
                  <section key={m} aria-labelledby={`month-${m}`}>
                    <h2 id={`month-${m}`} className="heading-display mb-3 scroll-mt-24 text-2xl text-slate-50">
                      {monthName(m)} <span className="text-base text-slate-400">· {events.length}</span>
                    </h2>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {events.map((t) => (
                        <li key={t.id} className="flex"><TournamentCard tournament={t} onSelect={select} /></li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <TournamentDetailPanel tournament={selected} onClose={closePanel} />
    </>
  );
}

function SurfaceLegend() {
  return (
    <ul className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-300" aria-label="Surface colours">
      {SURFACES.map((s) => (
        <li key={s} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className={cx('h-3 w-3 rounded-sm', SURFACE_STYLES[s].dot)} /> {s}
        </li>
      ))}
      <li className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-3 rounded-sm ring-2 ring-ball" /> In progress
      </li>
    </ul>
  );
}
