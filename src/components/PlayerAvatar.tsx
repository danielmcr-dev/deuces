import type { Tour } from '@/types';
import { cx, initials } from '@/utils/format';

const SIZES = { sm: 'h-9 w-9 text-xs', md: 'h-14 w-14 text-base', lg: 'h-28 w-28 text-3xl sm:h-36 sm:w-36 sm:text-4xl' };

/** Photo placeholder: initials on a tour-tinted gradient. Swap for <img> when you have photos. */
export function PlayerAvatar({ name, tour, size = 'sm' }: { name: string; tour: Tour; size?: keyof typeof SIZES }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold ring-2',
        tour === 'ATP' ? 'bg-gradient-to-br from-sky-700 to-navy-700 ring-sky-400/30' : 'bg-gradient-to-br from-fuchsia-800 to-navy-700 ring-fuchsia-400/30',
        SIZES[size],
      )}
    >
      {initials(name)}
    </span>
  );
}
