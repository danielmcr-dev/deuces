import type { Surface, Tier } from '@/types';
import { cx } from '@/utils/format';

export const SURFACE_STYLES: Record<Surface, { dot: string; badge: string; border: string; bg: string }> = {
  Hard: { dot: 'bg-surface-hard', badge: 'border-blue-400/50 bg-blue-500/15 text-blue-200', border: 'border-l-surface-hard', bg: 'bg-blue-600/60 hover:bg-blue-500/70 text-white' },
  Clay: { dot: 'bg-surface-clay', badge: 'border-orange-400/50 bg-orange-500/15 text-orange-200', border: 'border-l-surface-clay', bg: 'bg-orange-600/60 hover:bg-orange-500/70 text-white' },
  Grass: { dot: 'bg-surface-grass', badge: 'border-green-400/50 bg-green-500/15 text-green-200', border: 'border-l-surface-grass', bg: 'bg-green-600/60 hover:bg-green-500/70 text-white' },
};

export function SurfaceBadge({ surface, indoor }: { surface: Surface; indoor?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold', SURFACE_STYLES[surface].badge)}>
      <span aria-hidden="true" className={cx('h-2 w-2 rounded-full', SURFACE_STYLES[surface].dot)} />
      {surface}
      {indoor ? ' · Indoor' : ''}
    </span>
  );
}

const TIER_STYLES: Record<Tier, string> = {
  'Grand Slam': 'bg-ball text-navy-950 border-ball',
  Finals: 'bg-violet-400 text-navy-950 border-violet-400',
  '1000': 'bg-slate-100 text-navy-950 border-slate-100',
  '500': 'border-slate-300 text-slate-100',
  '250': 'border-slate-500 text-slate-300',
};

export function TierBadge({ tier, tour }: { tier: Tier; tour?: string }) {
  return (
    <span className={cx('inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', TIER_STYLES[tier])}>
      {tour ? `${tour} ` : ''}
      {tier}
    </span>
  );
}
