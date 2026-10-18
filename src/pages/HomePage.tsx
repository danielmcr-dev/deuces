import { Link } from 'react-router-dom';
import type { Tour } from '@/types';
import { useInjuredPlayers, useRankings, useTournaments } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { NewsFeed } from '@/components/NewsFeed';
import { TournamentCard } from '@/components/TournamentCard';
import { MovementIndicator } from '@/components/MovementIndicator';
import { CountryFlag } from '@/components/CountryFlag';
import { StatusBadge } from '@/components/StatusBadge';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingRegion, Skeleton } from '@/components/Skeleton';
import { isInProgress, todayIso } from '@/utils/dates';
import { formatNumber } from '@/utils/format';

function TopFive({ tour }: { tour: Tour }) {
  const { data, isLoading, isError, refetch, error } = useRankings(tour);
  return (
    <section aria-labelledby={`top5-${tour}`} className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 id={`top5-${tour}`} className="heading-display text-xl text-slate-50">{tour} top 5</h3>
        <Link to={tour === 'ATP' ? '/rankings' : '/rankings?tour=WTA'} className="text-xs font-semibold text-ball hover:underline">
          Full rankings<span className="sr-only"> for {tour}</span> →
        </Link>
      </div>
      {isLoading ? (
        <LoadingRegion label={`Loading ${tour} rankings…`} className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </LoadingRegion>
      ) : isError ? (
        <ErrorMessage title="Rankings unavailable" error={error} onRetry={() => refetch()} />
      ) : (
        <ol className="space-y-1">
          {data!.entries.slice(0, 5).map((e) => (
            <li key={e.playerId} className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-navy-800">
              <span className="w-5 text-right font-display text-lg font-bold text-slate-300">{e.rank}</span>
              <MovementIndicator rank={e.rank} previousRank={e.previousRank} />
              <CountryFlag countryCode={e.player.countryCode} countryName={e.player.countryName} showCode={false} />
              <Link to={`/players/${e.player.id}`} className="min-w-0 flex-1 truncate font-medium text-slate-100 hover:text-ball">
                {e.player.name}
              </Link>
              <span className="tabular-nums text-slate-300">{formatNumber(e.points)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function OnCourtNow() {
  const { data, isLoading, isError, refetch, error } = useTournaments();
  const today = todayIso();
  const live = data?.filter((t) => isInProgress(t.startDate, t.endDate, today)) ?? [];
  const next = data?.filter((t) => t.startDate > today).slice(0, 3) ?? [];
  const list = live.length ? live : next;
  return (
    <section aria-labelledby="on-court" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id="on-court" className="heading-display text-xl text-slate-50">{live.length ? 'On court now' : 'Coming up'}</h3>
        <Link to="/calendar" className="text-xs font-semibold text-ball hover:underline">Calendar →</Link>
      </div>
      {isLoading ? (
        <LoadingRegion label="Loading tournaments…" className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </LoadingRegion>
      ) : isError ? (
        <ErrorMessage title="Calendar unavailable" error={error} onRetry={() => refetch()} />
      ) : (
        <ul className="space-y-3">
          {list.map((t) => (
            <li key={t.id}>
              <Link to={`/calendar?view=list&t=${t.id}`} className="block rounded-2xl" aria-label={`${t.name} — view in calendar`}>
                <TournamentCard tournament={t} compact />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function InjurySnapshot() {
  const { data, isLoading, isError, refetch, error } = useInjuredPlayers();
  return (
    <section aria-labelledby="injury-snapshot" className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 id="injury-snapshot" className="heading-display text-xl text-slate-50">Injury report</h3>
        <Link to="/injuries" className="text-xs font-semibold text-ball hover:underline">All injuries →</Link>
      </div>
      {isLoading ? (
        <LoadingRegion label="Loading injuries…" className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </LoadingRegion>
      ) : isError ? (
        <ErrorMessage title="Injury report unavailable" error={error} onRetry={() => refetch()} />
      ) : (
        <ul className="space-y-2">
          {data!.slice(0, 5).map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <StatusBadge status={p.status} />
              <Link to={`/players/${p.id}`} className="truncate font-medium text-slate-100 hover:text-ball">{p.name}</Link>
              <span className="ml-auto truncate text-xs text-slate-400">{p.injury?.description}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function HomePage() {
  useDocumentTitle('');
  return (
    <>
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-navy-700 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 px-6 py-10 sm:px-10 sm:py-14">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-ball/20 blur-3xl" />
        <div aria-hidden="true" className="absolute bottom-0 right-8 hidden h-40 w-72 rounded-t-xl border-4 border-b-0 border-white/10 sm:block">
          <div className="absolute inset-x-0 top-1/2 border-t-4 border-white/10" />
          <div className="absolute inset-y-0 left-1/2 top-1/2 border-l-4 border-white/10" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ball">Game, set, follow</p>
        <h1 className="heading-display mt-2 max-w-2xl text-5xl leading-[0.95] text-white sm:text-6xl">
          Every ranking, injury and headline — all in one place.
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/rankings" className="btn-primary">View rankings</Link>
          <Link to="/my-players" className="btn-ghost">My players</Link>
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="sr-only">Tennis news</h2>
          <NewsFeed limit={6} headingLevel={3} />
          <div className="mt-6 text-center">
            <Link to="/news" className="btn-ghost">More news</Link>
          </div>
        </div>
        <aside className="space-y-6" aria-label="At a glance">
          <h2 className="sr-only">At a glance</h2>
          <OnCourtNow />
          <TopFive tour="ATP" />
          <TopFive tour="WTA" />
          <InjurySnapshot />
        </aside>
      </div>
    </>
  );
}
