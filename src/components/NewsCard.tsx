import type { NewsItem } from '@/types';
import { formatDate, timeAgo } from '@/utils/dates';
import { cx } from '@/utils/format';
import { ExternalIcon } from './Icons';

interface Props {
  item: NewsItem;
  variant?: 'default' | 'featured' | 'compact';
}

/** A news story. The whole card is a link that opens the full article in a new tab. */
export function NewsCard({ item, variant = 'default' }: Props) {
  const featured = variant === 'featured';
  const compact = variant === 'compact';
  return (
    <article className={cx('card group relative flex overflow-hidden transition-colors focus-within:border-ball hover:border-navy-500', compact ? 'flex-row' : 'flex-col')}>
      <div className={cx('relative shrink-0 overflow-hidden bg-navy-800', compact ? 'w-28 sm:w-36' : 'aspect-[16/9] w-full')}>
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.tour !== 'Both' && !compact && (
          <span className="absolute left-3 top-3 rounded-md bg-navy-950/85 px-2 py-0.5 text-[11px] font-bold tracking-wide text-ball">{item.tour}</span>
        )}
      </div>
      <div className={cx('flex flex-1 flex-col gap-2', compact ? 'p-3' : 'p-4')}>
        <p className="text-xs font-medium text-slate-300">
          <span className="font-semibold text-ball">{item.source}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={item.publishedAt} title={formatDate(item.publishedAt)}>
            {timeAgo(item.publishedAt)}
          </time>
        </p>
        <h3 className={cx('font-semibold leading-snug text-slate-50', featured ? 'text-xl sm:text-2xl' : compact ? 'text-sm' : 'text-base')}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="after:absolute after:inset-0 after:content-[''] focus:outline-none group-hover:text-ball"
          >
            {item.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h3>
        {!compact && <p className={cx('text-sm text-slate-300', featured ? 'line-clamp-4' : 'line-clamp-3')}>{item.summary}</p>}
        {!compact && (
          <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-semibold text-slate-400 group-hover:text-ball">
            Read full story <ExternalIcon width={12} height={12} />
          </span>
        )}
      </div>
    </article>
  );
}
