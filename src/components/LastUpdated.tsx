import { RefreshIcon } from './Icons';
import { formatTime } from '@/utils/dates';
import { cx } from '@/utils/format';

interface Props {
  updatedAt: number | undefined;
  isFetching: boolean;
  onRefresh: () => void;
  intervalLabel?: string;
}

export function LastUpdated({ updatedAt, isFetching, onRefresh, intervalLabel = 'auto-refreshes every 10 min' }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span aria-live="polite">
        {isFetching ? 'Updating…' : updatedAt ? <>Last updated <time dateTime={new Date(updatedAt).toISOString()}>{formatTime(new Date(updatedAt).toISOString())}</time></> : null}
      </span>
      <span className="hidden text-slate-400 sm:inline">· {intervalLabel}</span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isFetching}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-navy-600 text-slate-300 hover:border-ball hover:text-ball disabled:opacity-50"
        aria-label="Refresh now"
        title="Refresh now"
      >
        <RefreshIcon width={14} height={14} className={cx(isFetching && 'animate-spin')} />
      </button>
    </div>
  );
}
