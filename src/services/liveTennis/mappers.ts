import type { Match, MatchPlayer, MatchTour, Player, RankingEntry, Surface, Tour } from '@/types';
import { countryFromIoc } from '@/utils/countries';
import { slugify } from '@/utils/format';
import type { LtMatch, LtPlayer } from './types';
import mockPlayersJson from '@/mocks/players.json';

const mockPlayers = mockPlayersJson as Player[];

/**
 * Curated injury list. The free API plan has no injury data, so injury status is
 * looked up by player name from the sample list in src/mocks/players.json.
 */
const injuriesBySlug = new Map(
  mockPlayers.filter((p) => p.status !== 'Active').map((p) => [p.id, { status: p.status, injury: p.injury }]),
);
/** Known tour per player name — used to place players the API lists without a tour. */
const knownTourBySlug = new Map(mockPlayers.map((p) => [p.id, p.tour]));

/** Map the API's granular tour strings onto ATP/WTA. */
export function tourOf(raw: LtPlayer): Tour | null {
  const t = raw.tour?.toLowerCase() ?? '';
  if (t === 'atp' || t.endsWith('_men') || t === 'juniors_boys') return 'ATP';
  if (t === 'wta' || t.endsWith('_women') || t === 'juniors_girls') return 'WTA';
  const known = knownTourBySlug.get(slugify(raw.name));
  if (known) return known;
  const system = raw.itf_ranking?.system ?? '';
  if (system.endsWith('wt')) return 'WTA';
  if (system.endsWith('mt')) return 'ATP';
  return null;
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') || parts[0] || '' };
}

export function toPlayer(raw: LtPlayer, tour: Tour): Player {
  const country = countryFromIoc(raw.country);
  const meta = raw.stats?.ratings?.meta ?? null;
  const seasons = (raw.stats?.season ?? []).filter((s) => s.type === 'singles' && /^\d{4}$/.test(s.season));
  // The API's cached stats can lag a season behind, so use the latest season it has.
  const thisSeason = [...seasons].sort((a, b) => Number(b.season) - Number(a.season))[0];
  const num = (v: string | undefined) => (v === undefined || v === '' ? null : Number(v));
  const careerTitles = seasons.length ? seasons.reduce((sum, s) => sum + (num(s.titles) ?? 0), 0) : null;
  const backhand = raw.backhand ?? meta?.backhand ?? null;
  const overlay = injuriesBySlug.get(slugify(raw.name));

  return {
    id: String(raw.id),
    tour,
    name: raw.name,
    ...splitName(raw.name),
    ioc: country.ioc,
    countryCode: country.countryCode,
    countryName: country.countryName,
    birthDate: raw.birthday,
    heightCm: meta?.height_cm ?? null,
    plays: raw.hand === 'L' ? 'Left' : raw.hand === 'R' ? 'Right' : null,
    backhand: backhand === 1 ? 'One-handed' : backhand === 2 ? 'Two-handed' : null,
    turnedPro: null,
    careerHighRank: meta?.peak_rank ?? null,
    careerHighDate: null,
    titlesThisSeason: thisSeason ? num(thisSeason.titles) ?? 0 : null,
    statsSeason: thisSeason ? Number(thisSeason.season) : null,
    careerTitles,
    status: overlay?.status ?? 'Active',
    injury: overlay?.injury ?? null,
    ranking: raw.ranking ? { rank: raw.ranking, points: raw.ranking_points, movement: raw.ranking_movement } : null,
    seasonRecord: thisSeason ? { won: num(thisSeason.matches_won) ?? 0, lost: num(thisSeason.matches_lost) ?? 0 } : null,
    elo: raw.stats?.ratings?.elo?.overall ?? null,
  };
}

export interface RosterResult {
  players: Record<Tour, Player[]>;
  rankings: Record<Tour, RankingEntry[]>;
  rankingDate: string;
}

/**
 * Build top-100 rankings per tour from the API's player list (which is returned
 * ranked-first). Players with no tour are placed into whichever tour is missing
 * their rank; if both are, the curated tour hints break the tie.
 */
export function buildRoster(raw: LtPlayer[], size = 100): RosterResult {
  const singles = raw.filter((p) => !p.is_doubles_team && p.ranking && p.ranking > 0 && p.ranking_status !== 'unranked');
  const byTour: Record<Tour, Map<number, LtPlayer>> = { ATP: new Map(), WTA: new Map() };
  const unplaced: LtPlayer[] = [];

  for (const p of singles) {
    const t = (p.tour ? tourOf(p) : null) ?? null;
    if (t && !byTour[t].has(p.ranking!)) byTour[t].set(p.ranking!, p);
    else if (!t) unplaced.push(p);
  }
  // Place players we have a hint for first, so the rest can fill the remaining gaps.
  unplaced.sort((a, b) => Number(tourOf(b) !== null) - Number(tourOf(a) !== null));
  for (const p of unplaced) {
    const rank = p.ranking!;
    const openIn = (['ATP', 'WTA'] as const).filter((t) => !byTour[t].has(rank));
    const hint = tourOf(p);
    const target = openIn.length === 1 ? openIn[0] : hint && openIn.includes(hint) ? hint : null;
    if (target) byTour[target].set(rank, p);
  }

  const players = { ATP: [] as Player[], WTA: [] as Player[] };
  const rankings = { ATP: [] as RankingEntry[], WTA: [] as RankingEntry[] };
  let latest = '';
  for (const tour of ['ATP', 'WTA'] as const) {
    const sorted = [...byTour[tour].entries()].sort((a, b) => a[0] - b[0]).slice(0, size);
    for (const [rank, p] of sorted) {
      players[tour].push(toPlayer(p, tour));
      rankings[tour].push({ rank, previousRank: null, movement: p.ranking_movement, playerId: String(p.id), points: p.ranking_points ?? 0 });
      if (p.ranking_checked_at && p.ranking_checked_at > latest) latest = p.ranking_checked_at;
    }
  }
  return { players, rankings, rankingDate: (latest || new Date().toISOString()).slice(0, 10) };
}

const SURFACES: Record<string, Surface> = { hard: 'Hard', clay: 'Clay', grass: 'Grass', carpet: 'Hard' };
const MATCH_TOURS: Record<string, MatchTour> = { atp: 'ATP', wta: 'WTA', challenger: 'Challenger', itf: 'ITF', juniors: 'Juniors' };

function toMatchPlayer(p: LtPlayer): MatchPlayer {
  const c = countryFromIoc(p.country);
  return { id: String(p.id), name: p.name, ioc: c.ioc, countryCode: c.countryCode, countryName: c.countryName, ranking: p.ranking };
}

/** Strip the repeated "ATP Almaty - " prefix the feed puts on some round names. */
function cleanRound(round: string | null) {
  if (!round) return null;
  const i = round.lastIndexOf(' - ');
  return i > -1 ? round.slice(i + 3) : round;
}

export function toMatch(m: LtMatch): Match {
  return {
    id: String(m.id),
    tour: MATCH_TOURS[m.tour ?? ''] ?? 'Other',
    tournament: (m.tournament ?? 'Unknown event').trim(),
    tournamentId: m.tournament_id,
    round: cleanRound(m.round),
    surface: SURFACES[m.surface?.toLowerCase() ?? ''] ?? null,
    indoor: Boolean(m.indoor),
    status: m.status === 'live' ? 'live' : 'upcoming',
    scheduledTime: m.scheduled_time,
    p1: toMatchPlayer(m.players.p1),
    p2: toMatchPlayer(m.players.p2),
    score: m.score
      ? { sets: m.score.sets, games: m.score.games, points: m.score.points, server: m.score.server, isTiebreak: m.score.is_tiebreak }
      : null,
  };
}
