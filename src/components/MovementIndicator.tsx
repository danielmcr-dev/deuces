import type { Movement } from '@/types';
import { ArrowDownIcon, ArrowUpIcon } from './Icons';

interface Props {
  rank: number;
  /** Last week's rank, when known */
  previousRank: number | null;
  /** Direction only, used when previousRank is unknown (live data) */
  movement?: Movement;
}

/** Ranking movement since last week. Shows the number of places when known, else just the arrow. */
export function MovementIndicator({ rank, previousRank, movement }: Props) {
  const change = previousRank !== null ? previousRank - rank : null;
  const direction: Movement = change !== null ? (change > 0 ? 'up' : change < 0 ? 'down' : 'same') : movement ?? null;

  if (direction === null || direction === 'same') {
    return (
      <span className="inline-flex w-10 items-center justify-center text-slate-500">
        <span aria-hidden="true">–</span>
        <span className="sr-only">{direction === 'same' ? 'No change' : 'Movement unknown'}</span>
      </span>
    );
  }
  const up = direction === 'up';
  const places = change !== null ? Math.abs(change) : null;
  return (
    <span className={`inline-flex w-10 items-center justify-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
      {up ? <ArrowUpIcon width={14} height={14} /> : <ArrowDownIcon width={14} height={14} />}
      {places !== null && <span aria-hidden="true">{places}</span>}
      <span className="sr-only">
        {up ? 'Up' : 'Down'}
        {places !== null ? ` ${places}` : ''} since last week
      </span>
    </span>
  );
}
