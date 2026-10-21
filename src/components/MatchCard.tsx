import { Link } from 'react-router-dom';
import type { Match, MatchPlayer } from '@/types';
import { formatTime, parseIsoDate, todayIso } from '@/utils/dates';
import { cx, flagEmoji } from '@/utils/format';
import { LiveBadge } from './TournamentCard';
import { SURFACE_STYLES } from './SurfaceBadge';

function when(iso: string | null): string {
  if (!iso) return 'Time TBC';
  const d = new Date(iso);
  const day = todayIso(d);
  const today = todayIso();
  const tomorrow = todayIso(new Date(Date.now() + 86400000));
  const label = day === today ? 'Today' : day === tomorrow ? 'Tomorrow' : parseIsoDate(day).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${label}, ${formatTime(iso)}`;
}

function PlayerLine({ player, sets, games, point, serving, won, linkable }: {
  player: MatchPlayer;
  sets?: number;
  games?: number[];
  point?: string | null;
  serving: boolean;
  won: boolean;
  linkable: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span role="img" aria-label={player.countryName} className="w-5 shrink-0 text-center leading-none" title={player.countryName}>
        {player.countryCode ? flagEmoji(player.countryCode) : ''}
      </span>
      <span className={cx('min-w-0 flex-1 truncate text-sm', won ? 'font-bold text-white' : 'font-medium text-slate-200')}>
        {linkable ? (
          <Link to={`/players/${player.id}`} className="hover:text-ball hover:underline">{player.name}</Link>
        ) : (
          player.name
        )}
        {player.ranking && <span className="ml-1.5 text-xs font-normal text-slate-400">({player.ranking})</span>}
      </span>
      <span aria-hidden="true" className={cx('h-1.5 w-1.5 shrink-0 rounded-full', serving ? 'bg-ball' : 'bg-transparent')} />
      {serving && <span className="sr-only">serving</span>}
      {games && (
        <span className="flex gap-1 tabular-nums">
          {games.map((g, i) => (
            <span key={i} className={cx('w-5 text-center text-sm', i === games.length - 1 ? 'font-bold text-white' : 'text-slate-300')}>{g}</span>
          ))}
        </span>
      )}
      {point !== undefined && (
        <span className="w-8 rounded bg-navy-700 text-center text-xs font-bold tabular-nums text-ball">{point ?? ''}</span>
      )}
      {sets !== undefined && <span className="sr-only">{sets} sets</span>}
    </div>
  );
}

/** One live or scheduled match, with a compact scoreboard when live. */
export function MatchCard({ match: m, linkPlayers = true }: { match: Match; linkPlayers?: boolean }) {
  const live = m.status === 'live' && m.score;
  const s = m.score;
  const leader = s ? (s.sets[0] > s.sets[1] ? 1 : s.sets[1] > s.sets[0] ? 2 : 0) : 0;
  const label = `${m.p1.name} vs ${m.p2.name}`;

  return (
    <article aria-label={label} className={cx('card border-l-4 p-3', m.surface ? SURFACE_STYLES[m.surface].border : 'border-l-navy-600', live && 'ring-1 ring-ball/50')}>
      <header className="mb-1 flex items-center justify-between gap-2 text-xs">
        <p className="min-w-0 truncate text-slate-300">
          <span className="font-semibold text-slate-100">{m.tour !== 'Other' ? `${m.tour} · ` : ''}{m.tournament}</span>
          {m.round && <span> · {m.round}</span>}
        </p>
        {live ? <LiveBadge /> : <time dateTime={m.scheduledTime ?? undefined} className="shrink-0 font-semibold text-slate-300">{when(m.scheduledTime)}</time>}
      </header>
      <PlayerLine player={m.p1} sets={s?.sets[0]} games={s?.games[0]} point={live ? s!.points[0] : undefined} serving={s?.server === 1} won={leader === 1} linkable={linkPlayers} />
      <PlayerLine player={m.p2} sets={s?.sets[1]} games={s?.games[1]} point={live ? s!.points[1] : undefined} serving={s?.server === 2} won={leader === 2} linkable={linkPlayers} />
      {live && s && (
        <p className="sr-only">
          Score: sets {s.sets[0]}–{s.sets[1]}, {s.games[0].map((g, i) => `${g}–${s.games[1][i] ?? 0}`).join(', ')}
          {s.points[0] !== null ? `, points ${s.points[0]}–${s.points[1]}` : ''}
          {s.isTiebreak ? ', tiebreak' : ''}
        </p>
      )}
    </article>
  );
}
