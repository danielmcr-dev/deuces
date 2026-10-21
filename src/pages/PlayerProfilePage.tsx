import { Link, useParams } from 'react-router-dom';
import { usePlayer, useRankLookup } from '@/hooks/queries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { PhotoCredit } from '@/components/PhotoCredit';
import { StatusBadge } from '@/components/StatusBadge';
import { FollowButton } from '@/components/FollowButton';
import { CountryFlag } from '@/components/CountryFlag';
import { MovementIndicator } from '@/components/MovementIndicator';
import { InjuryDetails } from '@/components/InjuryDetails';
import { UpcomingTournaments } from '@/components/UpcomingTournaments';
import { RelatedNews } from '@/components/RelatedNews';
import { NextMatches } from '@/components/NextMatches';
import { ErrorMessage } from '@/components/ErrorMessage';
import { LoadingRegion, Skeleton } from '@/components/Skeleton';
import { ChevronLeftIcon } from '@/components/Icons';
import { ApiError } from '@/services/apiClient';
import { ageFromBirthDate, formatDate } from '@/utils/dates';
import { cx, formatNumber } from '@/utils/format';

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-navy-700 bg-navy-800/50 p-3">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-bold leading-none text-slate-50">{value}</dd>
      {sub && <dd className="mt-1 text-xs text-slate-300">{sub}</dd>}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <LoadingRegion label="Loading player…" className="space-y-6">
      <div className="card flex flex-col items-center gap-4 p-6 sm:flex-row">
        <Skeleton className="h-28 w-28 rounded-full sm:h-36 sm:w-36" />
        <div className="w-full space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </LoadingRegion>
  );
}

export default function PlayerProfilePage() {
  const { id = '' } = useParams();
  const { data: player, isLoading, isError, error, refetch } = usePlayer(id);
  const ranks = useRankLookup();
  useDocumentTitle(player?.name ?? 'Player');

  const back = (
    <Link to={player?.tour === 'WTA' ? '/rankings?tour=WTA' : '/rankings'} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-ball">
      <ChevronLeftIcon width={16} height={16} /> Rankings
    </Link>
  );

  if (isLoading) return <>{back}<ProfileSkeleton /></>;
  if (isError || !player) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <>
        {back}
        <h1 className="sr-only">Player not found</h1>
        <ErrorMessage title={notFound ? 'Player not found' : "We couldn't load this player"} error={error} onRetry={notFound ? undefined : () => refetch()} />
      </>
    );
  }

  const r = ranks.map.get(player.id);
  const rank = r?.rank ?? player.ranking?.rank ?? null;
  const points = r?.points ?? player.ranking?.points ?? null;
  const hand = player.plays === 'Left' ? 'Left-handed' : player.plays === 'Right' ? 'Right-handed' : '—';

  return (
    <>
      {back}
      <section
        aria-labelledby="player-name"
        className={cx(
          'card relative overflow-hidden p-6 sm:p-8',
          player.tour === 'ATP' ? 'bg-gradient-to-br from-navy-800 to-navy-900' : 'bg-gradient-to-br from-[#2a1440] to-navy-900',
        )}
      >
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="flex flex-col items-center gap-2">
            <PlayerAvatar name={player.name} tour={player.tour} size="lg" describe />
            <div className="max-w-[12rem] text-center">
              <PhotoCredit name={player.name} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ball">{player.tour}</p>
            <h1 id="player-name" className="heading-display text-4xl leading-none text-white sm:text-6xl">
              <span className="block text-2xl text-slate-300 sm:text-3xl">{player.firstName}</span>
              {player.lastName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <span className="inline-flex items-center gap-2 text-slate-200">
                <CountryFlag countryCode={player.countryCode} countryName={player.countryName} />
                {player.countryName}
              </span>
              <StatusBadge status={player.status} showActive size="md" />
            </div>
          </div>
          <FollowButton playerId={player.id} playerName={player.name} variant="full" />
        </div>
      </section>

      {player.injury && player.status !== 'Active' && (
        <section aria-labelledby="injury-heading" className={cx('mt-6 rounded-2xl border p-5', player.status === 'Injured' ? 'border-red-400/40 bg-red-500/10' : 'border-amber-300/40 bg-amber-400/10')}>
          <h2 id="injury-heading" className="mb-3 flex items-center gap-2 font-semibold text-slate-50">
            {player.status === 'Injured' ? 'Currently injured' : 'Returning from injury'}
          </h2>
          <InjuryDetails injury={player.injury} status={player.status} />
        </section>
      )}

      <section aria-labelledby="stats-heading" className="mt-6">
        <h2 id="stats-heading" className="sr-only">Player stats</h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat
            label="Current rank"
            value={rank ? <>#{rank}</> : '—'}
            sub={
              rank ? (
                <span className="inline-flex items-center">
                  {points !== null && <>{formatNumber(points)} pts</>}
                  <MovementIndicator rank={rank} previousRank={r?.previousRank ?? null} movement={r?.movement ?? player.ranking?.movement} />
                </span>
              ) : ranks.isLoading ? 'Loading…' : 'Unranked'
            }
          />
          <Stat
            label="Career high"
            value={player.careerHighRank ? `#${player.careerHighRank}` : '—'}
            sub={player.careerHighDate ? formatDate(player.careerHighDate, { month: 'short', year: 'numeric' }) : undefined}
          />
          <Stat
            label={`Titles in ${player.statsSeason ?? new Date().getFullYear()}`}
            value={player.titlesThisSeason ?? '—'}
            sub={player.careerTitles !== null ? `${player.careerTitles} career${player.statsSeason ? ' (all levels)' : ''}` : undefined}
          />
          <Stat label="Age" value={player.birthDate ? ageFromBirthDate(player.birthDate) : '—'} sub={player.birthDate ? `Born ${formatDate(player.birthDate)}` : undefined} />
          <Stat
            label="Height"
            value={player.heightCm ? `${player.heightCm} cm` : '—'}
            sub={player.heightCm ? `${Math.floor(player.heightCm / 30.48)}′ ${Math.round((player.heightCm / 2.54) % 12)}″` : undefined}
          />
          <Stat label="Plays" value={hand} sub={player.backhand ? `${player.backhand} backhand` : undefined} />
          {player.seasonRecord && (
            <Stat label={`${player.statsSeason ?? 'Season'} record`} value={`${player.seasonRecord.won}–${player.seasonRecord.lost}`} sub="Singles wins–losses" />
          )}
          {player.elo && <Stat label="Elo rating" value={Math.round(player.elo)} sub="Overall" />}
          {player.turnedPro && <Stat label="Turned pro" value={player.turnedPro} />}
        </dl>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className="heading-display mb-3 text-2xl text-slate-50">Schedule</h2>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Next matches</h3>
          <NextMatches playerId={player.id} />
          <h3 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-slate-400">Likely upcoming events</h3>
          <UpcomingTournaments player={player} rank={rank ?? undefined} limit={4} />
        </section>
        <section aria-labelledby="news-heading">
          <h2 id="news-heading" className="heading-display mb-3 text-2xl text-slate-50">Related news</h2>
          <RelatedNews playerNames={[player.name]} emptyText={`No recent news about ${player.name}.`} />
        </section>
      </div>
    </>
  );
}
