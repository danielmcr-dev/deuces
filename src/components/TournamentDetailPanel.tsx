import { useEffect, useRef } from 'react';
import type { Tournament } from '@/types';
import { formatDate, isInProgress, isPast } from '@/utils/dates';
import { flagEmoji, formatMoney } from '@/utils/format';
import { CalendarIcon, CloseIcon, MapPinIcon, TrophyIcon } from './Icons';
import { SurfaceBadge, TierBadge } from './SurfaceBadge';
import { LiveBadge } from './TournamentCard';

interface Props {
  tournament: Tournament | null;
  onClose: () => void;
}

/** Slide-over dialog with tournament details and the last 10 years of singles champions. */
export function TournamentDetailPanel({ tournament: t, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!t) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      // Keep focus inside the dialog.
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [t, onClose]);

  if (!t) return null;
  const live = isInProgress(t.startDate, t.endDate);
  const done = isPast(t.endDate);
  const titleId = `tournament-${t.id}-title`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-navy-600 bg-navy-900 shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-navy-700 bg-navy-900/95 p-5 backdrop-blur">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              {t.tours.map((tour) => (
                <TierBadge key={tour} tier={t.tiersByTour[tour] ?? t.tier} tour={tour} />
              ))}
              {live && <LiveBadge />}
              {done && <span className="text-xs font-semibold text-slate-400">Completed</span>}
            </div>
            <h2 id={titleId} className="heading-display mt-2 text-3xl leading-none text-slate-50">
              {t.name}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close tournament details"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-navy-600 text-slate-300 hover:border-ball hover:text-ball"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <CalendarIcon className="mt-0.5 text-ball" />
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Dates</dt>
                <dd className="font-medium text-slate-100">
                  {formatDate(t.startDate, { weekday: 'short', day: 'numeric', month: 'short' })} – {formatDate(t.endDate, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </dd>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPinIcon className="mt-0.5 text-ball" />
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Location</dt>
                <dd className="font-medium text-slate-100">
                  <span aria-hidden="true">{flagEmoji(t.countryCode)} </span>
                  {t.city}, {t.countryName}
                </dd>
                <dd className="text-slate-300">{t.venue}</dd>
              </div>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Surface</dt>
              <dd className="mt-1">
                <SurfaceBadge surface={t.surface} indoor={t.indoor} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Draw · Prize money</dt>
              <dd className="font-medium text-slate-100">
                {t.drawSize} players · {formatMoney(t.prizeMoneyUsd)}
              </dd>
            </div>
          </dl>

          <section aria-labelledby={`${titleId}-champs`}>
            <h3 id={`${titleId}-champs`} className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-200">
              <TrophyIcon className="text-ball" width={18} height={18} /> Singles champions, last 10 years
            </h3>
            {t.championsAreSample && (
              <p className="mb-3 rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                Sample champion data for this event — connect a real data source for official results.
              </p>
            )}
            <div className="overflow-hidden rounded-xl border border-navy-700">
              <table className="w-full text-sm">
                <caption className="sr-only">Past singles champions of {t.name}</caption>
                <thead className="bg-navy-800 text-left text-xs uppercase tracking-wide text-slate-300">
                  <tr>
                    <th scope="col" className="px-3 py-2">Year</th>
                    {t.tours.includes('ATP') && <th scope="col" className="px-3 py-2">{t.tours.length > 1 ? "Men's" : 'Champion'}</th>}
                    {t.tours.includes('WTA') && <th scope="col" className="px-3 py-2">{t.tours.length > 1 ? "Women's" : 'Champion'}</th>}
                  </tr>
                </thead>
                <tbody>
                  {t.champions.map((row) => (
                    <tr key={row.year} className="border-t border-navy-700/70">
                      <th scope="row" className="px-3 py-2 text-left font-display text-base font-bold text-slate-300">{row.year}</th>
                      {t.tours.includes('ATP') && <td className="px-3 py-2 text-slate-100">{row.atp ?? <span className="text-slate-400">Not held</span>}</td>}
                      {t.tours.includes('WTA') && <td className="px-3 py-2 text-slate-100">{row.wta ?? <span className="text-slate-400">Not held</span>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
