export type Tour = 'ATP' | 'WTA';
export type InjuryStatus = 'Active' | 'Injured' | 'Returning';
export type Surface = 'Hard' | 'Clay' | 'Grass';
export type Tier = 'Grand Slam' | '1000' | '500' | '250' | 'Finals';

export interface Injury {
  description: string;
  /** ISO date (YYYY-MM-DD) */
  dateReported: string;
  /** ISO date, or null when unknown */
  expectedReturn: string | null;
}

export interface Player {
  id: string;
  tour: Tour;
  name: string;
  firstName: string;
  lastName: string;
  /** IOC three-letter code, e.g. "ITA" */
  ioc: string;
  /** ISO 3166-1 alpha-2 code, e.g. "IT" (used for the flag) */
  countryCode: string;
  countryName: string;
  birthDate: string;
  heightCm: number;
  plays: 'Right' | 'Left';
  backhand: 'One-handed' | 'Two-handed';
  turnedPro: number;
  careerHighRank: number;
  careerHighDate: string;
  titlesThisSeason: number;
  careerTitles: number;
  status: InjuryStatus;
  injury: Injury | null;
}

export interface RankingEntry {
  rank: number;
  previousRank: number;
  playerId: string;
  points: number;
}

export interface Rankings {
  tour: Tour;
  /** Date the ranking list was published (YYYY-MM-DD) */
  rankingDate: string;
  entries: RankingEntry[];
}

/** A ranking row joined with its player's bio. */
export interface RankedPlayer extends RankingEntry {
  player: Player;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  /** ISO timestamp */
  publishedAt: string;
  tour: Tour | 'Both';
  topStory: boolean;
  playerIds: string[];
}

export interface ChampionRow {
  year: number;
  /** null when the event was not held that year */
  atp?: string | null;
  wta?: string | null;
}

export interface Tournament {
  id: string;
  name: string;
  city: string;
  countryCode: string;
  countryName: string;
  venue: string;
  tours: Tour[];
  /** Headline tier (for combined events, the ATP tier) */
  tier: Tier;
  tiersByTour: Partial<Record<Tour, Tier>>;
  surface: Surface;
  indoor: boolean;
  startDate: string;
  endDate: string;
  drawSize: number;
  prizeMoneyUsd: number;
  /** Most recent first */
  champions: ChampionRow[];
  /** True when the champion list is placeholder data rather than real history */
  championsAreSample: boolean;
}
