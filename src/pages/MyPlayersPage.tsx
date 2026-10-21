import { Link } from 'react-router-dom';
import { usePlayersByIds, useRankLookup } from '@/hooks/queries';
import { useFollowedPlayers } from '@/hooks/useFollowedPlayers';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { PageHeader } from '@/components/PageHeader';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { StatusBadge } from '@/components/StatusBadge';
import { FollowButton } from '@/components/FollowButton';
import { CountryFlag } from '@/components/CountryFlag';
import { MovementIndicator } from '@/components/MovementIndicator';
import { UpcomingTournaments } from '@/components/UpcomingTournaments';
import { RelatedNews } from '@/components/RelatedNews';
import { NextMatches } from '@/components/NextMatches';
import { CardListSkeleton } from '@/components/Skeleton';
import { ErrorMessage } from '@/components/ErrorMessage';
import { EmptyState } from '@/components/EmptyState';
import { StarIcon } from '@/components/Icons';
import { formatDate } from '@/utils/dates';
import { formatNumber } from '@/utils/format';
import { FEATURES } from '@/config/features';

export default function MyPlayersPage() {
  useDocumentTitle('My Players');
  const { ids, unfollow } = useFollowedPlayers();
  const { data, isLoading, isError, error, refetch } = usePlayersByIds(ids);
  const ranks = useRankLookup();

  // Sort followed players by tour, then rank.
  const players = (data ?? []).filter((p) => ids.includes(p.id)).sort((a, b) =>
    a.tour !== b.tour ? a.tour.localeCompare(b.tour) : (ranks.map.get(a.id)?.rank ?? 999) - (ranks.map.get(b.id)?.rank ?? 999),
  );

  return (
    <>
      <PageHeader
        title="My players"
        subtitle={`Rankings, ${FEATURES.injuries ? 'fitness, ' : ''}schedules and news for the players you follow. Saved on this device.`}
      />

      {ids.length === 0 ? (
        <EmptyState title="You're not following anyone yet">
          <p>
            Tap the <StarIcon width={14} height={14} className="inline align-[-2px] text-ball" /> next to any player in the rankings or on their profile to add them here.
          </p>
          <Link to="/rankings" className="btn-primary mt-4">Browse rankings</Link>
        </EmptyState>
      ) : isLoading ? (
        <CardListSkeleton count={Math.min(ids.length, 4)} label="Loading your players…" />
      ) : isError ? (
        <ErrorMessage title="We couldn't load your players" error={error} onRetry={() => refetch()} />
      ) : (
        <>
        {data && players.length < ids.length && (
          <p role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-100">
            {ids.length - players.length} followed player{ids.length - players.length === 1 ? '' : 's'} couldn't be found — probably saved while using demo data.
            <button type="button" className="font-semibold underline hover:text-white" onClick={() => ids.filter((id) => !players.some((p) => p.id === id)).forEach(unfollow)}>
              Remove them
            </button>
          </p>
        )}
        <ul className="grid gap-6">
          {players.map((p) => {
            const r = ranks.map.get(p.id);
            return (
              <li key={p.id} className="card p-4 sm:p-6">
                <article aria-labelledby={`mp-${p.id}`}>
                  <div className="flex items-start gap-4">
                    <PlayerAvatar name={p.name} tour={p.tour} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 id={`mp-${p.id}`} className="text-xl font-semibold text-slate-50">
                          <Link to={`/players/${p.id}`} className="hover:text-ball hover:underline">{p.name}</Link>
                        </h2>
                        <StatusBadge status={p.status} showActive />
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300">
                        <CountryFlag countryCode={p.countryCode} countryName={p.countryName} ioc={p.ioc} />
                        {r ? (
                          <span className="inline-flex items-center">
                            <span className="font-semibold text-slate-100">{p.tour} No. {r.rank}</span>
                            <MovementIndicator rank={r.rank} previousRank={r.previousRank} movement={r.movement} />
                            <span>{formatNumber(r.points)} pts</span>
                          </span>
                        ) : p.ranking ? (
                          <span className="font-semibold text-slate-100">{p.tour} No. {p.ranking.rank}</span>
                        ) : (
                          <span>{p.tour}</span>
                        )}
                      </p>
                      {p.injury && p.status !== 'Active' && (
                        <p className="mt-2 text-sm text-slate-200">
                          <span className="font-semibold">{p.injury.description}</span>
                          {' — '}
                          {p.injury.expectedReturn ? `expected back ${formatDate(p.injury.expectedReturn)}` : 'return date unknown'}
                        </p>
                      )}
                    </div>
                    <FollowButton playerId={p.id} playerName={p.name} />
                  </div>
                  <div className="mt-5 grid gap-6 lg:grid-cols-2">
                    <section aria-label={`Upcoming tournaments for ${p.name}`}>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Next matches</h3>
                      <NextMatches playerId={p.id} />
                      <h3 className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">Upcoming tournaments</h3>
                      <UpcomingTournaments player={p} rank={r?.rank ?? p.ranking?.rank} />
                    </section>
                    <section aria-label={`News about ${p.name}`}>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Related news</h3>
                      <RelatedNews playerNames={[p.name]} limit={2} />
                    </section>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        </>
      )}
    </>
  );
}
