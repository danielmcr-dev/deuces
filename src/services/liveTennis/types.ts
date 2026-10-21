/** Raw response shapes from Live Tennis API (only the fields Deuces uses). */

export interface LtList<T> {
  data: T[];
  meta: { count: number; has_more: boolean; limit: number; offset: number; total: number | null };
}

export interface LtPlayer {
  id: number;
  name: string;
  /** The record's own tour: "atp", "wta", "challenger_men", ... or null */
  tour: string | null;
  /** IOC-style code, usually lowercase */
  country: string | null;
  ranking: number | null;
  ranking_points: number | null;
  ranking_movement: 'up' | 'down' | 'same' | null;
  ranking_status: string | null;
  ranking_checked_at: string | null;
  hand: 'R' | 'L' | null;
  backhand: 1 | 2 | null;
  birthday: string | null;
  is_doubles_team: boolean;
  itf_ranking?: { system?: string | null } | null;
  /** Only on GET /players/{id} */
  stats?: LtPlayerStats;
}

export interface LtPlayerStats {
  ratings?: {
    elo?: { overall?: number | null } | null;
    meta?: { height_cm?: number | null; peak_rank?: number | null; backhand?: number | null } | null;
  } | null;
  season?: Array<{
    season: string;
    type: string;
    titles?: string;
    matches_won?: string;
    matches_lost?: string;
  }> | null;
}

export interface LtScore {
  sets: [number, number];
  games: [number[], number[]];
  points: [string | null, string | null];
  server: 1 | 2 | null;
  is_tiebreak: boolean;
}

export interface LtMatch {
  id: number;
  tour: string | null;
  gender: 'men' | 'women' | null;
  tournament: string | null;
  tournament_id: string | null;
  round: string | null;
  surface: string | null;
  indoor: boolean | null;
  status: string;
  scheduled_time: string | null;
  players: { p1: LtPlayer; p2: LtPlayer };
  score: LtScore | null;
}
