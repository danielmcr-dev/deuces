import type { Tournament } from '@/types';
import { formatDateRange, isInProgress, isPast } from '@/utils/dates';
import { cx, flagEmoji } from '@/utils/format';
import { SURFACE_STYLES, SurfaceBadge, TierBadge } from './SurfaceBadge';

interface Props {
  tournament: Tournament;
  onSelect?: (t: Tournament) => void;
  compact?: boolean;
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
      <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      Live
    </span>
  );
}

/** A tournament summary. Clickable when `onSelect` is given (opens the detail panel). */
export function TournamentCard({ tournament: t, onSelect, compact = false }: Props) {
  const live = isInProgress(t.startDate, t.endDate);
  const past = isPast(t.endDate);
  const tiers = t.tours.map((tour) => ({ tour, tier: t.tiersByTour[tour] ?? t.tier }));
  const sameTier = tiers.every((x) => x.tier === tiers[0].tier);

  const titleText = (
    <>
      {t.name}
      {live && <span className="sr-only"> (in progress)</span>}
    </>
  );

  return (
    <div
      className={cx(
        'card relative w-full border-l-4 p-4 text-left transition-colors focus-within:ring-2 focus-within:ring-ball',
        SURFACE_STYLES[t.surface].border,
        live && 'ring-2 ring-ball/70',
        past && 'opacity-75',
        onSelect && 'hover:bg-navy-800',
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {sameTier ? <TierBadge tier={tiers[0].tier} tour={t.tours.length > 1 ? 'ATP/WTA' : t.tours[0]} /> : tiers.map((x) => <TierBadge key={x.tour} tier={x.tier} tour={x.tour} />)}
        {live && <LiveBadge />}
      </div>
      <h3 className={cx('mt-2 font-semibold leading-snug text-slate-50', compact ? 'text-sm' : 'text-base')}>
        {onSelect ? (
          // Stretched button: the whole card is clickable, but the heading stays a heading.
          <button type="button" onClick={() => onSelect(t)} className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none hover:text-ball">
            {titleText}
          </button>
        ) : (
          titleText
        )}
      </h3>
      <p className="mt-1 text-sm text-slate-300">
        <span aria-hidden="true">{flagEmoji(t.countryCode)} </span>
        {t.city}, {t.countryName}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <time dateTime={t.startDate}>{formatDateRange(t.startDate, t.endDate)}</time>
        <SurfaceBadge surface={t.surface} indoor={t.indoor} />
      </div>
    </div>
  );
}
