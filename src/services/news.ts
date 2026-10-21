import type { NewsItem, Tour } from '@/types';
import newsJson from '@/mocks/news.json';
import { mockDelay } from './apiClient';
import { slugify } from '@/utils/format';

const mockNews = newsJson as NewsItem[];

export interface NewsQuery {
  tour?: Tour;
  /** Match stories tagged with any of these player names */
  playerNames?: string[];
  limit?: number;
}

/** Latest news, newest first. Items tagged "Both" match either tour. */
export async function getNews(query: NewsQuery = {}): Promise<NewsItem[]> {
  // Live Tennis API has no news feed, so news is always sample data for now.
  // To add a real source (RSS, NewsData.io, The Guardian API), fetch and map it to NewsItem[] here.
  const items = await mockDelay(mockNews);
  const { tour, playerNames, limit } = query;
  let result = [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  if (tour) result = result.filter((n) => n.tour === tour || n.tour === 'Both');
  if (playerNames) {
    // Stories are tagged with name slugs, so the same tags work for mock and live player ids.
    const wanted = new Set(playerNames.map(slugify));
    result = result.filter((n) => n.playerIds.some((id) => wanted.has(id)));
  }
  return limit ? result.slice(0, limit) : result;
}
