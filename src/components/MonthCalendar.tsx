import type { Tournament } from '@/types';
import { isInProgress, parseIsoDate, todayIso } from '@/utils/dates';
import { cx } from '@/utils/format';
import { SURFACE_STYLES } from './SurfaceBadge';

interface Props {
  year: number;
  /** 0-based month */
  month: number;
  tournaments: Tournament[];
  onSelect: (t: Tournament) => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const toIso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Monday-start month grid. Tournaments are drawn as bars spanning their days within each week. */
export function MonthCalendar({ year, month, tournaments, onSelect }: Props) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // days since Monday
  const gridStart = new Date(year, month, 1 - offset);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const today = todayIso();

  return (
    <div className="card overflow-hidden" role="group" aria-label={first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}>
      <div className="grid grid-cols-7 border-b border-navy-700 bg-navy-800 text-center text-[11px] font-bold uppercase tracking-wide text-slate-300" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">
            <span className="sm:hidden">{d[0]}</span>
            <span className="hidden sm:inline">{d}</span>
          </div>
        ))}
      </div>
      {Array.from({ length: weeks }).map((_, w) => {
        const days = Array.from({ length: 7 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7 + i));
        const weekStart = toIso(days[0]);
        const weekEnd = toIso(days[6]);
        const events = tournaments.filter((t) => t.startDate <= weekEnd && t.endDate >= weekStart);
        return (
          <div key={w} className="relative grid grid-cols-7 border-b border-navy-700/70 last:border-0" style={{ gridAutoRows: 'minmax(0, auto)' }}>
            {/* Reserve the first row for day numbers so bars start below them */}
            <div aria-hidden="true" className="h-8" style={{ gridColumn: '1 / -1', gridRow: 1 }} />
            {/* Day numbers + cell backgrounds */}
            {days.map((d, i) => {
              const iso = toIso(d);
              const inMonth = d.getMonth() === month;
              const isToday = iso === today;
              return (
                <div
                  key={iso}
                  className={cx('min-h-[4.5rem] border-r border-navy-700/50 px-1 pt-1 text-right text-xs last:border-r-0 sm:px-2', !inMonth && 'bg-navy-950/60 text-slate-500', inMonth && 'text-slate-300')}
                  style={{ gridColumn: i + 1, gridRow: `1 / span ${events.length + 2}` }}
                >
                  <span className={cx('inline-flex h-6 w-6 items-center justify-center rounded-full', isToday && 'bg-ball font-bold text-navy-950')}>
                    <span className="sr-only">{d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}{isToday ? ' (today)' : ''}</span>
                    <span aria-hidden="true">{d.getDate()}</span>
                  </span>
                </div>
              );
            })}
            {/* Tournament bars */}
            {events.map((t, row) => {
              const s = t.startDate < weekStart ? 0 : (parseIsoDate(t.startDate).getDay() + 6) % 7;
              const e = t.endDate > weekEnd ? 6 : (parseIsoDate(t.endDate).getDay() + 6) % 7;
              const continuesBefore = t.startDate < weekStart;
              const continuesAfter = t.endDate > weekEnd;
              const live = isInProgress(t.startDate, t.endDate, today);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelect(t)}
                  style={{ gridColumn: `${s + 1} / ${e + 2}`, gridRow: row + 2 }}
                  className={cx(
                    'relative z-10 mx-0.5 mb-1 flex min-w-0 items-center gap-1 truncate px-1.5 py-1 text-left text-[10px] font-semibold leading-tight sm:text-xs',
                    SURFACE_STYLES[t.surface].bg,
                    continuesBefore ? 'rounded-l-none' : 'rounded-l-md',
                    continuesAfter ? 'rounded-r-none' : 'rounded-r-md',
                    (t.tier === 'Grand Slam' || t.tier === 'Finals') && 'ring-1 ring-inset ring-ball/70',
                    live && 'outline outline-2 outline-ball',
                  )}
                  aria-label={`${t.name}, ${t.tier === 'Grand Slam' || t.tier === 'Finals' ? t.tier : `${t.tier} level`}, ${t.surface}${live ? ', in progress' : ''}`}
                >
                  {live && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-ball" />}
                  <span className="truncate">{t.name}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
