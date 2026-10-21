import type { Match, MatchPlayer, MatchTour, Player, Tournament } from '@/types';
import playersJson from '@/mocks/players.json';
import tournamentsJson from '@/mocks/tournaments.json';
import { isLive } from './config';
import { liveGet, mockDelay } from './apiClient';
import { toMatch } from './liveTennis/mappers';
import type { LtList, LtMatch } from './liveTennis/types';
import { isInProgress, todayIso } from '@/utils/dates';

export type ScoresTour = 'ATP' | 'WTA' | 'Challenger' | 'ITF';
const TOUR_ORDER: MatchTour[] = ['ATP', 'WTA', 'Challenger', 'ITF', 'Juniors', 'Other'];

const LIVE_TTL = 4 * 60 * 1000; // live scores: refetch at most every 4 minutes
const UPCOMING_TTL = 30 * 60 * 1000; // order of play changes slowly

export interface MatchesResult {
  matches: Match[];
  fetchedAt: string;
  stale: boolean;
}

const byTourThenTournament = (a: Match, b: Match) =>
  TOUR_ORDER.indexOf(a.tour) - TOUR_ORDER.indexOf(b.tour) || a.tournament.localeCompare(b.tournament);

/** Every singles match in progress right now, all tours. Live: 1 API call per 4 minutes. */
export async function getLiveMatches(): Promise<MatchesResult> {
  if (isLive()) {
    const res = await liveGet<LtList<LtMatch>>('/matches', { status: 'live', draw: 'singles', limit: 200 }, LIVE_TTL);
    return {
      matches: res.data.data.map(toMatch).sort(byTourThenTournament),
      fetchedAt: new Date(res.fetchedAt).toISOString(),
      stale: res.stale,
    };
  }
  return mockDelay({ matches: mockMatches().filter((m) => m.status === 'live'), fetchedAt: new Date().toISOString(), stale: false });
}

/** Scheduled singles matches for one tour, soonest first. Live: 1 API call per tour per 30 minutes. */
export async function getUpcomingMatches(tour: ScoresTour): Promise<MatchesResult> {
  if (isLive()) {
    const res = await liveGet<LtList<LtMatch>>(
      '/matches',
      { status: 'upcoming', draw: 'singles', tour: tour.toLowerCase(), limit: 100 },
      UPCOMING_TTL,
    );
    return {
      matches: res.data.data.map(toMatch).sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? '')),
      fetchedAt: new Date(res.fetchedAt).toISOString(),
      stale: res.stale,
    };
  }
  return mockDelay({
    matches: mockMatches().filter((m) => m.status === 'upcoming' && m.tour === tour),
    fetchedAt: new Date().toISOString(),
    stale: false,
  });
}

/** Loose match between a feed's tournament name ("Basel") and a calendar entry. */
export function matchesTournament(m: Match, t: Tournament): boolean {
  const name = m.tournament.toLowerCase();
  return name.includes(t.city.toLowerCase()) || t.name.toLowerCase().includes(name);
}

// ---------------------------------------------------------------- mock matches
const mockPlayers = playersJson as Player[];
const mockTournaments = tournamentsJson as Tournament[];
let mockCache: { day: string; matches: Match[] } | null = null;

function mp(p: Player, rank: number): MatchPlayer {
  return { id: p.id, name: p.name, ioc: p.ioc, countryCode: p.countryCode, countryName: p.countryName, ranking: rank };
}

/** A believable set of live and upcoming matches at this week's (mock) tournaments. */
function mockMatches(): Match[] {
  const today = todayIso();
  if (mockCache?.day === today) return mockCache.matches;
  const events = mockTournaments.filter((t) => isInProgress(t.startDate, t.endDate, today));
  const matches: Match[] = [];
  const now = Date.now();
  let n = 0;
  for (const tour of ['ATP', 'WTA'] as const) {
    const pool = mockPlayers.filter((p) => p.tour === tour && p.status === 'Active');
    const tourEvents = events.filter((t) => t.tours.includes(tour));
    const evs = tourEvents.length ? tourEvents : [{ name: `${tour} Exhibition`, city: 'Exhibition', surface: 'Hard', indoor: true, id: 'exhibition' } as Tournament];
    for (let i = 0; i < 10; i++) {
      const ev = evs[i % evs.length];
      const a = pool[(i * 7 + 3) % pool.length];
      const b = pool[(i * 11 + 20) % pool.length];
      if (a.id === b.id) continue;
      const live = i < 3;
      const setsDone = i % 3;
      matches.push({
        id: `mock-${++n}`,
        tour,
        tournament: ev.city,
        tournamentId: ev.id,
        round: ['Round of 32', 'Round of 16', 'Quarter-final'][i % 3],
        surface: ev.surface,
        indoor: ev.indoor,
        status: live ? 'live' : 'upcoming',
        scheduledTime: new Date(now + (live ? -3600_000 : (i - 2) * 5400_000)).toISOString(),
        p1: mp(a, mockPlayers.filter((p) => p.tour === tour).indexOf(a) + 1),
        p2: mp(b, mockPlayers.filter((p) => p.tour === tour).indexOf(b) + 1),
        score: live
          ? {
              sets: [setsDone >= 1 ? 1 : 0, setsDone >= 2 ? 1 : 0],
              games: [[6, 3, 2].slice(0, setsDone + 1), [4, 6, 1].slice(0, setsDone + 1)],
              points: [['15', '40', 'AD'][i % 3], ['30', '40', '40'][i % 3]],
              server: i % 2 === 0 ? 1 : 2,
              isTiebreak: false,
            }
          : null,
      });
    }
  }
  mockCache = { day: today, matches };
  return matches;
}
