import type { InjuryStatus } from '@/types';
import { cx } from '@/utils/format';
import { FEATURES } from '@/config/features';

const STYLES: Record<InjuryStatus, string> = {
  Active: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  Injured: 'border-red-400/50 bg-red-500/15 text-red-300',
  Returning: 'border-amber-300/50 bg-amber-400/15 text-amber-200',
};
const ICON: Record<InjuryStatus, string> = { Active: '●', Injured: '✚', Returning: '↺' };

interface Props {
  status: InjuryStatus;
  /** By default Active players get no badge (keeps tables clean). */
  showActive?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, showActive = false, size = 'sm', className }: Props) {
  if (!FEATURES.injuries) return null;
  if (status === 'Active' && !showActive) return null;
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold uppercase tracking-wide',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        STYLES[status],
        className,
      )}
    >
      <span aria-hidden="true">{ICON[status]}</span>
      {status}
    </span>
  );
}
