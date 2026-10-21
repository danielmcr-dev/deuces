# Deuces 🎾

A tennis fan site for following ATP and WTA rankings, injuries, news, the season calendar and your favourite players.

Built with **React 18 + TypeScript**, **Vite**, **Tailwind CSS**, **React Router** and **TanStack Query**. Followed players are saved in `localStorage`, so there's no login or backend.

> **Data:** out of the box, Deuces runs on bundled sample data. Add a free [Live Tennis API](https://livetennisapi.com) key to get real **rankings, player profiles and live scores** (see [Real data](#real-data-live-tennis-api)). News, the season calendar and injuries stay as sample data, because the free plan doesn't include them. Champion histories are real for Grand Slams, 1000s, the ATP/WTA Finals and Beijing/Wuhan (2016–2025); other events show labelled sample champions.

---

## Getting started

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | TypeScript only |
| `npm run generate:mocks` | Rebuild the mock JSON in `src/mocks/` (and news artwork in `public/images/news/`) from `scripts/generate-mock-data.mjs` |

---

## Features

| Page | Route | Highlights |
| --- | --- | --- |
| Home | `/` | Top Stories, a latest-headlines feed with ATP/WTA filter, live matches, this week's events, top 5 per tour, injury snapshot |
| Live scores | `/live` | Live and upcoming singles matches by tour (ATP, WTA, Challenger, ITF), refreshed every 5 min |
| Rankings | `/rankings` (`?tour=WTA`) | ATP/WTA tabs; rank, flag, age, points and weekly movement; search by name, filter by country or injured; "last updated" time; auto-refreshes every 10 min |
| Calendar | `/calendar` | Month and list views, colour-coded by surface and labelled by tier; filter by tour, surface and tier; live events highlighted; detail panel with 10 years of champions. Filters live in the URL, so views can be shared |
| News | `/news` | Top Stories plus the full feed with ATP/WTA filter. Stories open in a new tab |
| Injuries | `/injuries` | Every Injured or Returning player, with injury, date reported and expected return |
| My Players | `/my-players` | Each followed player's ranking, injury status, upcoming tournaments and related news |
| Player profile | `/players/:id` | Photo placeholder, country, age, height, playing hand, current and career-high rank, titles this season, next matches, injury details, follow button. Live data adds season record and Elo |

**Accessibility:** semantic landmarks and tables, a skip link, keyboard-operable tabs (arrow keys), a focus-trapped dialog that closes with Esc, visible focus rings, screen-reader labels for movement arrows and flags, `prefers-reduced-motion` support, and AA-contrast colours on the navy theme.

**Every data fetch** shows a loading skeleton and a friendly error message with a "Try again" button.

---

## Project structure

```
deuces/
├─ .env.example                 # Copy to .env to use Live Tennis API
├─ scripts/
│  └─ generate-mock-data.mjs    # Builds the mock JSON (seeded, deterministic)
├─ public/images/news/          # Generated news artwork (SVG)
└─ src/
   ├─ main.tsx                  # QueryClient + Router providers
   ├─ App.tsx                   # Routes
   ├─ index.css                 # Tailwind + component classes (.card, .btn, …)
   ├─ types/index.ts            # Player, Rankings, NewsItem, Tournament, …
   ├─ mocks/                    # Mock JSON (players, rankings-atp/wta, news, tournaments)
   ├─ services/                 # ⬅ The data layer: swap mock for live here
   │  ├─ config.ts              # Reads VITE_* env vars, mock vs live switch
   │  ├─ apiClient.ts           # Live Tennis API client (cache + daily budget) + mock delay
   │  ├─ liveTennis/            # API types, mappers, rankings roster
   │  ├─ matches.ts             # getLiveMatches, getUpcomingMatches
   │  ├─ players.ts             # getPlayers, getPlayer, getPlayersByIds
   │  ├─ rankings.ts            # getRankings, getRankingsWithPlayers
   │  ├─ injuries.ts            # getInjuredPlayers
   │  ├─ news.ts                # getNews({ tour, playerIds, limit })
   │  ├─ tournaments.ts         # getTournaments, getTournament, upcomingForPlayer
   │  └─ index.ts
   ├─ hooks/
   │  ├─ queries.ts             # TanStack Query hooks (useRankings, useNews, …)
   │  ├─ useFollowedPlayers.ts  # localStorage-backed follow list (syncs across tabs)
   │  └─ useDocumentTitle.ts
   ├─ components/               # Reusable UI
   │  ├─ PlayerRow, StatusBadge, FollowButton, CountryFlag, MovementIndicator, PlayerAvatar
   │  ├─ TournamentCard, TournamentDetailPanel, MonthCalendar, SurfaceBadge (+ TierBadge)
   │  ├─ NewsCard, NewsFeed, RelatedNews, UpcomingTournaments, InjuryDetails
   │  ├─ TourTabs, FilterChips, LastUpdated, PageHeader
   │  ├─ Skeleton, ErrorMessage, EmptyState, Icons
   │  └─ layout/ (Layout, Header, Footer)
   ├─ pages/                    # One file per route
   ├─ lib/storage.ts            # Safe localStorage helpers
   └─ utils/                    # Dates, formatting, flags
```

---

## Real data: Live Tennis API

Deuces is wired to [Live Tennis API](https://livetennisapi.com)'s **free plan**: no card, no trial, 100 requests a day and 30 a minute ([API reference](https://docs.livetennisapi.com/reference.html)).

### Turn it on

1. Get a free key at [livetennisapi.com](https://livetennisapi.com).
2. Create `.env` in the project root:

   ```dotenv
   VITE_DATA_SOURCE=live
   VITE_LIVETENNIS_API_KEY=twjp_your_key_here
   ```

3. Restart `npm run dev`.

`.env` is gitignored, so never commit your key. Vite puts `VITE_*` values into the browser bundle, so the key is visible to anyone using the site. Live Tennis API says that's acceptable for a **free** key, since it's rate-capped and revocable. A paid key should sit behind a server-side proxy instead.

### What comes from where

| Feature | Live mode source | API calls |
| --- | --- | --- |
| Rankings (top 100 ATP & WTA) | `GET /players?limit=200` × 2 (returned ranked-first) | 2, cached 3 h |
| Player profile (height, peak rank, season record, Elo) | `GET /players/{id}` | 1 per player, cached 24 h |
| Live scores | `GET /matches?status=live&draw=singles` | 1, cached 4 min |
| Upcoming matches | `GET /matches?status=upcoming&tour=…` | 1 per tour, cached 30 min |
| Next matches on profiles / My Players | picked from the cached match lists | 0 |
| News, season calendar, past champions | sample data (`src/mocks/`) | 0 |
| Injuries | curated sample list, matched to real players by name | 0 |

The free plan has no "previous rank" figure, only up/down/same, so live rankings show movement arrows without the number of places. The API's season stats can lag a season behind, so profiles label titles and the win–loss record with the season they cover. Rankings history, injury reports and completed results need paid plans.

### Staying inside 100 calls a day

`src/services/apiClient.ts` (`liveGet`) protects the quota:

- **Caching:** every response is stored in `localStorage` with a per-endpoint lifetime, and repeat visits and reloads reuse it. A typical browse of every page uses about 6 calls.
- **Budget:** the client stops making new calls at 90 a day (`VITE_LIVETENNIS_DAILY_BUDGET`) and serves the last saved data instead, with a "Showing saved data" notice.
- **Rate limits:** if the API returns 429, the client shows cached data and a friendly message rather than retrying.
- **Visibility:** the footer shows calls used today.

Leave `VITE_DATA_SOURCE` unset, or set it to `mock`, to go back to sample data at any time.

### Code map

```
src/services/
├─ config.ts              # VITE_* settings, mock/live switch, daily budget
├─ apiClient.ts           # liveGet(): fetch + cache + budget + error handling
├─ liveTennis/
│  ├─ types.ts            # Raw API response shapes
│  ├─ mappers.ts          # API → app types (Player, RankingEntry, Match)
│  └─ roster.ts           # Top-100 rankings for both tours from /players
├─ players.ts · rankings.ts · matches.ts   # use live data when enabled
└─ news.ts · tournaments.ts · injuries.ts  # sample data (plug other sources in here)
```

To add free news later, fetch an RSS feed or a free news API (NewsData.io, The Guardian) in `news.ts` and map it to `NewsItem`.

## Customising

- **Colours** live in `tailwind.config.js` (`navy`, `ball`, `surface`). Shared component classes are in `src/index.css`.
- **Player photos:** `PlayerAvatar` renders initials. Add a `photoUrl` to `Player` and render an `<img>` there.
- **Followed players** are stored under the localStorage key `deuces:followed-players`.
