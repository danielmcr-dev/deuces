import { ArrowDownIcon, ArrowUpIcon } from './Icons';

/** Ranking movement since last week. Positive = moved up the ranking. */
export function MovementIndicator({ rank, previousRank }: { rank: number; previousRank: number }) {
  const change = previousRank - rank;
  if (change === 0) {
    return (
      <span className="inline-flex w-10 items-center justify-center text-slate-500">
        <span aria-hidden="true">–</span>
        <span className="sr-only">No change</span>
      </span>
    );
  }
  const up = change > 0;
  return (
    <span className={`inline-flex w-10 items-center justify-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <ArrowUpIcon width={14} height={14} /> : <ArrowDownIcon width={14} height={14} />}
      <span aria-hidden="true">{Math.abs(change)}</span>
      <span className="sr-only">{up ? `Up ${change}` : `Down ${-change}`} since last week</span>
    </span>
  );
}
