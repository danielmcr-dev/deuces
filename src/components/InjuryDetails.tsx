import type { Injury, InjuryStatus } from '@/types';
import { daysBetween, formatDate, todayIso } from '@/utils/dates';

/** Injury description, date reported and expected return. */
export function InjuryDetails({ injury, status }: { injury: Injury; status: InjuryStatus }) {
  const today = todayIso();
  const daysOut = daysBetween(injury.dateReported, today);
  const untilReturn = injury.expectedReturn ? daysBetween(today, injury.expectedReturn) : null;
  return (
    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">{status === 'Returning' ? 'Recovering from' : 'Injury'}</dt>
        <dd className="font-medium text-slate-100">{injury.description}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">Reported</dt>
        <dd className="font-medium text-slate-100">
          <time dateTime={injury.dateReported}>{formatDate(injury.dateReported)}</time>
          {daysOut >= 0 && <span className="text-slate-400"> · {daysOut} days ago</span>}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-slate-400">Expected return</dt>
        <dd className="font-medium text-slate-100">
          {injury.expectedReturn ? (
            <>
              <time dateTime={injury.expectedReturn}>{formatDate(injury.expectedReturn)}</time>
              {untilReturn !== null && untilReturn > 0 && <span className="text-slate-400"> · in {untilReturn} days</span>}
              {untilReturn !== null && untilReturn <= 0 && <span className="text-slate-400"> · due back now</span>}
            </>
          ) : (
            <span className="text-slate-300">Unknown</span>
          )}
        </dd>
      </div>
    </dl>
  );
}
