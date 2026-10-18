import { cx } from '@/utils/format';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx('skeleton', className)} />;
}

/** Wraps skeleton content so screen readers announce a single "Loading" message. */
export function LoadingRegion({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function RankingTableSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <LoadingRegion label="Loading rankings…" className="card divide-y divide-navy-700/70 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-5 w-6" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 flex-1 max-w-[12rem]" />
          <Skeleton className="ml-auto h-4 w-14" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </LoadingRegion>
  );
}

export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <Skeleton className={cx('w-full rounded-none', featured ? 'aspect-[16/9]' : 'aspect-[16/9]')} />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <LoadingRegion label="Loading news…" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </LoadingRegion>
  );
}

export function CardListSkeleton({ count = 4, label = 'Loading…' }: { count?: number; label?: string }) {
  return (
    <LoadingRegion label={label} className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-4 p-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </LoadingRegion>
  );
}
