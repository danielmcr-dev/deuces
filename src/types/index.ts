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
  /** Fields below are null when the data source doesn't provide them. */
  birthDate: string | null;
  heightCm: number | null;
  plays: 'Right' | 'Left' | null;
  backhand: 'One-handed' | 'Two-handed' | null;
  turnedPro: number | null;
  careerHighRank: number | null;
  careerHighDate: string | null;
  titlesThisSeason: number | null;
  /** Season that `titlesThisSeason` / `seasonRecord` describe, when it isn't the current one. */
  statsSeason?: number | null;
  careerTitles: number | null;
  status: InjuryStatus;
  injury: Injury | null;
  /** Current ranking carried on the player record (live data). */
  ranking?: { rank: number; points: number | null; movement: Movement } | null;
  /** Singles win–loss record for `statsSeason` (live data). */
  seasonRecord?: { won: number; lost: number } | null;
  /** Overall Elo rating (live data). */
  elo?: number | null;
}

export type Movement = 'up' | 'down' | 'same' | null;

export interface RankingEntry {
  rank: number;
  /** Last week's rank. null when the source only reports direction (see `movement`). */
  previousRank: number | null;
  /** Direction since last week, used when `previousRank` is unknown. */
  movement?: Movement;
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

export type MatchTour = 'ATP' | 'WTA' | 'Challenger' | 'ITF' | 'Juniors' | 'Other';

export interface MatchPlayer {
  id: string;
  name: string;
  ioc: string;
  countryCode: string;
  countryName: string;
  ranking: number | null;
}

export interface MatchScore {
  /** Sets won: [p1, p2] */
  sets: [number, number];
  /** Games per set, player-major: games[0] is p1's games in each set */
  games: [number[], number[]];
  /** Current game points, e.g. ["30", "15"] or ["AD", "40"] */
  points: [string | null, string | null];
  /** 1 or 2 = who is serving */
  server: 1 | 2 | null;
  isTiebreak: boolean;
}

export interface Match {
  id: string;
  tour: MatchTour;
  tournament: string;
  tournamentId: string | null;
  round: string | null;
  surface: Surface | null;
  indoor: boolean;
  status: 'live' | 'upcoming';
  /** ISO timestamp */
  scheduledTime: string | null;
  p1: MatchPlayer;
  p2: MatchPlayer;
  score: MatchScore | null;
}
