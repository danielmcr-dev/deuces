import { DATA_SOURCE } from '@/services';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-700 bg-navy-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="heading-display text-lg text-slate-200">Deuces</span> — made for tennis fans. Not affiliated with the ATP or WTA.
        </p>
        <p>
          {DATA_SOURCE === 'mock' ? (
            <>Showing <strong className="text-slate-200">demo data</strong>: rankings, injuries and news are samples.</>
          ) : (
            <>Live data connected.</>
          )}
        </p>
      </div>
    </footer>
  );
}
