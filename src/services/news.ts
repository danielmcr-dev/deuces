import type { NewsItem, Tour } from '@/types';
import newsJson from '@/mocks/news.json';
import { isLive } from './config';
import { apiGet, mockDelay } from './apiClient';

const mockNews = newsJson as NewsItem[];

export interface NewsQuery {
  tour?: Tour;
  playerIds?: string[];
  limit?: number;
}

/** Latest news, newest first. Items tagged "Both" match either tour. */
export async function getNews(query: NewsQuery = {}): Promise<NewsItem[]> {
  let items: NewsItem[];
  if (isLive()) {
    // TODO(live): map your news provider's response to `NewsItem[]`.
    items = await apiGet<NewsItem[]>('/news', query.tour ? { tour: query.tour } : {});
  } else {
    items = await mockDelay(mockNews);
  }
  const { tour, playerIds, limit } = query;
  let result = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (tour) result = result.filter((n) => n.tour === tour || n.tour === 'Both');
  if (playerIds) {
    const wanted = new Set(playerIds);
    result = result.filter((n) => n.playerIds.some((id) => wanted.has(id)));
  }
  return limit ? result.slice(0, limit) : result;
}
