import { useNews } from '@/hooks/queries';
import { NewsCard } from './NewsCard';
import { LoadingRegion, Skeleton } from './Skeleton';

export function RelatedNews({ playerNames, limit = 3, emptyText = 'No recent news.' }: { playerNames: string[]; limit?: number; emptyText?: string }) {
  const { data, isLoading, isError } = useNews({ playerNames, limit }, playerNames.length > 0);
  if (isLoading) {
    return (
      <LoadingRegion label="Loading news…" className="space-y-2">
        <Skeleton className="h-20 w-full rounded-2xl" />
      </LoadingRegion>
    );
  }
  if (isError) return <p className="text-sm text-slate-300">News unavailable right now.</p>;
  if (!data || data.length === 0) return <p className="text-sm text-slate-300">{emptyText}</p>;
  return (
    <ul className="space-y-3">
      {data.map((item) => (
        <li key={item.id}>
          <NewsCard item={item} variant="compact" />
        </li>
      ))}
    </ul>
  );
}
