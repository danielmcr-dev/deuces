import { useFollowedPlayers } from '@/hooks/useFollowedPlayers';
import { cx } from '@/utils/format';
import { StarIcon } from './Icons';

interface Props {
  playerId: string;
  playerName: string;
  /** "icon" for table rows, "full" for profiles */
  variant?: 'icon' | 'full';
  className?: string;
}

export function FollowButton({ playerId, playerName, variant = 'icon', className }: Props) {
  const { isFollowing, toggle } = useFollowedPlayers();
  const following = isFollowing(playerId);
  const label = following ? `Unfollow ${playerName}` : `Follow ${playerName}`;

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => toggle(playerId)}
        aria-pressed={following}
        className={cx(following ? 'btn-primary' : 'btn-ghost', className)}
      >
        <StarIcon filled={following} width={18} height={18} />
        {following ? 'Following' : 'Follow'}
        <span className="sr-only"> {playerName}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle(playerId);
      }}
      aria-pressed={following}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        following ? 'text-ball hover:bg-ball/10' : 'text-slate-400 hover:bg-navy-700 hover:text-ball',
        className,
      )}
    >
      <StarIcon filled={following} />
    </button>
  );
}
