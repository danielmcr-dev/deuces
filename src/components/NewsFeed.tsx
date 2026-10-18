import { useState } from 'react';
import type { Tour } from '@/types';
import { useNews } from '@/hooks/queries';
import { NewsCard } from './NewsCard';
import { NewsCardSkeleton, NewsGridSkeleton, LoadingRegion } from './Skeleton';
import { ErrorMessage } from './ErrorMessage';
import { EmptyState } from './EmptyState';
import { TourTabs } from './TourTabs';

type Filter = 'All' | Tour;
const FILTERS = ['All', 'ATP', 'WTA'] as const;

/** Top Stories block + filterable headline feed. Used on Home (limited) and News (full). */
export function NewsFeed({ limit, headingLevel = 2 }: { limit?: number; headingLevel?: 2 | 3 }) {
  const [filter, setFilter] = useState<Filter>('All');
  const tour = filter === 'All' ? undefined : filter;
  const { data, isLoading, isError, error, refetch } = useNews({ tour });
  const H = `h${headingLevel}` as const;

  const top = data?.filter((n) => n.topStory) ?? [];
  const [lead, ...secondary] = top;
  const rest = (data ?? []).filter((n) => !n.topStory).slice(0, limit);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TourTabs label="Filter news by tour" idPrefix="news" value={filter} options={FILTERS} onChange={setFilter} labels={{ All: 'All news' }} />
      </div>

      <div id="news-panel" role="tabpanel" aria-labelledby={`news-tab-${filter}`} className="space-y-10">
        {isError ? (
          <ErrorMessage title="We couldn't load the news" error={error} onRetry={() => refetch()} />
        ) : (
          <>
            <section aria-labelledby="top-stories-heading">
              <H id="top-stories-heading" className="heading-display mb-4 flex items-center gap-2 text-2xl text-slate-50 sm:text-3xl">
                <span aria-hidden="true" className="h-6 w-1.5 rounded-full bg-ball" /> Top stories
              </H>
              {isLoading ? (
                <LoadingRegion label="Loading top stories…" className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2"><NewsCardSkeleton featured /></div>
                  <div className="grid gap-4"><NewsCardSkeleton /></div>
                </LoadingRegion>
              ) : top.length === 0 ? (
                <EmptyState title="No top stories right now" />
              ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <NewsCard item={lead} variant="featured" />
                  </div>
                  <div className="grid content-start gap-4">
                    {secondary.map((item) => (
                      <NewsCard key={item.id} item={item} variant="compact" />
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section aria-labelledby="latest-heading">
              <H id="latest-heading" className="heading-display mb-4 text-2xl text-slate-50 sm:text-3xl">
                Latest headlines
              </H>
              {isLoading ? (
                <NewsGridSkeleton count={limit ?? 6} />
              ) : rest.length === 0 ? (
                <EmptyState title="No headlines yet">Check back soon for the latest from the tour.</EmptyState>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((item) => (
                    <li key={item.id} className="flex">
                      <NewsCard item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
