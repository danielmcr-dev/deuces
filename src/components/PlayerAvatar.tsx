import { useState } from 'react';
import type { Tour } from '@/types';
import { usePlayerPhoto } from '@/hooks/usePlayerPhoto';
import { photoFallbackUrl, photoPage, photoUrl } from '@/services/photos';
import { cx, initials } from '@/utils/format';

const SIZES = {
  xs: 'h-8 w-8 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-14 w-14 text-base',
  lg: 'h-28 w-28 text-3xl sm:h-36 sm:w-36 sm:text-4xl',
};
// Wikimedia serves these standard thumbnail widths fastest.
const WIDTHS = { xs: 120, sm: 120, md: 120, lg: 500 };

interface Props {
  name: string;
  tour: Tour;
  size?: keyof typeof SIZES;
  /** Describe the photo for screen readers (profile page). Elsewhere the name sits next to it. */
  describe?: boolean;
}

/** Player photo from Wikimedia Commons, falling back to initials on a tour-tinted circle. */
export function PlayerAvatar({ name, tour, size = 'sm', describe = false }: Props) {
  const { data: photo } = usePlayerPhoto(name);
  // 0 = direct CDN link, 1 = Commons redirect, 2 = give up and show initials.
  const [attempt, setAttempt] = useState(0);
  const showPhoto = photo && attempt < 2;

  return (
    <span
      aria-hidden={describe ? undefined : true}
      className={cx(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-bold ring-2',
        tour === 'ATP' ? 'bg-gradient-to-br from-sky-700 to-navy-700 ring-sky-400/30' : 'bg-gradient-to-br from-fuchsia-800 to-navy-700 ring-fuchsia-400/30',
        SIZES[size],
      )}
      title={showPhoto ? `Photo: Wikimedia Commons — ${photoPage(photo.file)}` : undefined}
    >
      {showPhoto ? (
        <img
          src={attempt === 0 ? photoUrl(photo.file, WIDTHS[size]) : photoFallbackUrl(photo.file, WIDTHS[size])}
          alt={describe ? `Photo of ${name}` : ''}
          loading="lazy"
          decoding="async"
          onError={() => setAttempt((a) => a + 1)}
          className="h-full w-full object-cover object-[center_20%]"
        />
      ) : (
        initials(name)
      )}
    </span>
  );
}
