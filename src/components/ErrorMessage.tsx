import { AlertIcon, RefreshIcon } from './Icons';

interface Props {
  title?: string;
  error?: unknown;
  onRetry?: () => void;
}

/** Friendly error card with an optional retry button. */
export function ErrorMessage({ title = 'Something went wrong', error, onRetry }: Props) {
  const detail = error instanceof Error ? error.message : null;
  return (
    <div role="alert" className="card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <AlertIcon width={32} height={32} className="text-red-300" />
      <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      <p className="max-w-md text-sm text-slate-300">
        That was out. We couldn't load this data — check your connection and try again.
      </p>
      {detail && <p className="max-w-md text-xs text-slate-400">Details: {detail}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-primary mt-2">
          <RefreshIcon width={16} height={16} /> Try again
        </button>
      )}
    </div>
  );
}
