import { useIsFetching } from '@tanstack/react-query';
import { callsToday, DAILY_CALL_BUDGET, DATA_SOURCE } from '@/services';
import { FEATURES } from '@/config/features';

export function Footer() {
  // Re-render when fetches finish so the call counter stays current.
  useIsFetching();
  return (
    <footer className="mt-16 border-t border-navy-700 bg-navy-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="heading-display text-lg text-slate-200">Deuces</span> — made for tennis fans. Not affiliated with the ATP or WTA.
        </p>
        <p>
          {DATA_SOURCE === 'mock' ? (
            <>
              Showing <strong className="text-slate-200">demo data</strong>: rankings{FEATURES.injuries ? ', injuries' : ''} and news are samples.
              {FEATURES.playerPhotos && ' Player photos from Wikimedia Commons.'}
            </>
          ) : (
            <>
              Rankings, players and scores from <a href="https://livetennisapi.com" className="text-slate-200 underline hover:text-ball" target="_blank" rel="noopener noreferrer">Live Tennis API</a>
              {' '}({callsToday()}/{DAILY_CALL_BUDGET} calls today). News and calendar are sample data{FEATURES.injuries ? ', as are injuries' : ''}.
              {FEATURES.playerPhotos && ' Player photos from Wikimedia Commons.'}
            </>
          )}
        </p>
      </div>
    </footer>
  );
}
