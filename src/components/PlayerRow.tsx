import { Link } from 'react-router-dom';
import type { RankedPlayer } from '@/types';
import { ageFromBirthDate } from '@/utils/dates';
import { formatNumber } from '@/utils/format';
import { CountryFlag } from './CountryFlag';
import { FollowButton } from './FollowButton';
import { MovementIndicator } from './MovementIndicator';
import { StatusBadge } from './StatusBadge';
import { PlayerAvatar } from './PlayerAvatar';

/** One row of a rankings table. Render inside <tbody>. */
export function PlayerRow({ entry }: { entry: RankedPlayer }) {
  const { player, rank, previousRank, movement, points } = entry;
  return (
    <tr className="border-b border-navy-700/70 transition-colors last:border-0 hover:bg-navy-800/60">
      <td className="py-2 pl-3 pr-1 text-right font-display text-lg font-bold tabular-nums text-slate-200 sm:pl-4">{rank}</td>
      <td className="px-1 py-2">
        <MovementIndicator rank={rank} previousRank={previousRank} movement={movement} />
      </td>
      <th scope="row" className="py-2 pl-1 pr-2 text-left font-normal">
        <div className="flex min-w-0 items-center gap-2">
          <PlayerAvatar name={player.name} tour={player.tour} size="xs" />
          <span className="hidden sm:inline-flex">
            <CountryFlag countryCode={player.countryCode} countryName={player.countryName} ioc={player.ioc} showCode={false} />
          </span>
          <div className="flex min-w-0 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            <Link to={`/players/${player.id}`} className="max-w-full truncate font-semibold text-slate-50 hover:text-ball hover:underline">
              {/* Short name on phones ("J. Sinner") so it fits beside the photo. */}
              <span className="sm:hidden" aria-hidden="true">
                {player.firstName ? `${player.firstName[0]}. ${player.lastName}` : player.name}
              </span>
              <span className="sr-only sm:not-sr-only">{player.name}</span>
            </Link>
            <StatusBadge status={player.status} />
          </div>
        </div>
      </th>
      <td className="hidden px-2 py-2 text-sm text-slate-400 md:table-cell">{player.ioc}</td>
      <td className="hidden px-2 py-2 text-right tabular-nums text-slate-300 sm:table-cell">{player.birthDate ? ageFromBirthDate(player.birthDate) : '—'}</td>
      <td className="px-2 py-2 text-right font-semibold tabular-nums text-slate-100">{formatNumber(points)}</td>
      <td className="py-1 pl-1 pr-2 text-right sm:pr-3">
        <FollowButton playerId={player.id} playerName={player.name} />
      </td>
    </tr>
  );
}
