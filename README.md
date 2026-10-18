# Deuces 🎾

A tennis fan site for following ATP and WTA rankings, injuries, news, the season calendar and your favourite players.

Built with **React 18 + TypeScript**, **Vite**, **Tailwind CSS**, **React Router** and **TanStack Query**. Followed players are saved in `localStorage`, so there's no login or backend.

> **Demo data:** v1 ships with realistic mock data. Player names are real professionals, but rankings, points, injuries and news are samples. Champion histories are real for Grand Slams, 1000s, the ATP/WTA Finals and Beijing/Wuhan (2016–2025). For 250/500 events they are sample data, and the app labels them that way.

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
| Home | `/` | Top Stories, a latest-headlines feed with ATP/WTA filter, "On court now", top 5 per tour, injury snapshot |
| Rankings | `/rankings` (`?tour=WTA`) | ATP/WTA tabs; rank, flag, age, points and weekly movement; search by name, filter by country or injured; "last updated" time; auto-refreshes every 10 min |
| Calendar | `/calendar` | Month and list views, colour-coded by surface and labelled by tier; filter by tour, surface and tier; live events highlighted; detail panel with 10 years of champions. Filters live in the URL, so views can be shared |
| News | `/news` | Top Stories plus the full feed with ATP/WTA filter. Stories open in a new tab |
| Injuries | `/injuries` | Every Injured or Returning player, with injury, date reported and expected return |
| My Players | `/my-players` | Each followed player's ranking, injury status, upcoming tournaments and related news |
| Player profile | `/players/:id` | Photo placeholder, country, age, height, playing hand, current and career-high rank, titles this season, injury details, follow button |

**Accessibility:** semantic landmarks and tables, a skip link, keyboard-operable tabs (arrow keys), a focus-trapped dialog that closes with Esc, visible focus rings, screen-reader labels for movement arrows and flags, `prefers-reduced-motion` support, and AA-contrast colours on the navy theme.

**Every data fetch** shows a loading skeleton and a friendly error message with a "Try again" button.

---

## Project structure

```
deuces/
├─ .env.example                 # Copy to .env to connect a real API
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
   │  ├─ apiClient.ts           # fetch wrapper (adds the API key) + mock delay
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

## Connecting real data

All data access goes through `src/services/`. Components and hooks only call those typed functions, so switching to a real provider changes nothing outside that folder.

There is no free official ATP/WTA API. Commercial providers that offer tennis data include Sportradar, API-Tennis, SportDevs, Goalserve and the tennis APIs on RapidAPI. Any of them works as long as you map its responses to the types in `src/types/index.ts`.

### 1. Add your key to `.env`

```bash
cp .env.example .env
```

```dotenv
VITE_DATA_SOURCE=live
VITE_SPORTS_API_BASE_URL=https://api.your-provider.com/v1
VITE_SPORTS_API_KEY=your-secret-key
```

`.env` is in `.gitignore`. Restart `npm run dev` after editing it.

> ⚠️ Vite inlines every `VITE_*` variable into the browser bundle, so anyone using the site can read the key. That's fine for local development or a key restricted by domain or referrer. For a public deployment, put a small proxy in front of the API (for example a Cloudflare Worker, Netlify/Vercel function or Express route) that adds the key on the server, and point `VITE_SPORTS_API_BASE_URL` at the proxy.

### 2. Set the auth header

`src/services/apiClient.ts` → `apiGet()` sends `Authorization: Bearer <key>` by default. Change it to whatever your provider expects, for example:

```ts
headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'tennis-api.p.rapidapi.com' }
// or append ?api_key=… with url.searchParams.set('api_key', API_KEY)
```

### 3. Fill in the `live` branch of each service

Each service already has an `if (isLive())` branch marked `TODO(live)`. Replace the placeholder path with your provider's endpoint and map the response to our types:

```ts
// src/services/rankings.ts
export async function getRankings(tour: Tour): Promise<Rankings> {
  if (isLive()) {
    const raw = await apiGet<ProviderRankingResponse>(`/rankings/${tour.toLowerCase()}`);
    return {
      tour,
      rankingDate: raw.updated_at.slice(0, 10),
      entries: raw.rankings.slice(0, 100).map((r) => ({
        rank: r.rank,
        previousRank: r.previous_rank ?? r.rank,
        playerId: String(r.competitor.id),
        points: r.points,
      })),
    };
  }
  return mockDelay(mockRankings[tour]);
}
```

| Service | Function(s) to implement | Maps to |
| --- | --- | --- |
| `players.ts` | `getPlayers`, `getPlayer` | `Player` (bio + `status`/`injury`) |
| `rankings.ts` | `getRankings` | `Rankings` |
| `injuries.ts` | `getInjuredPlayers` | `Player[]` with `status` ≠ `Active` |
| `news.ts` | `getNews` | `NewsItem[]` (tag `playerIds` so My Players can match stories) |
| `tournaments.ts` | `getTournaments` | `Tournament[]` incl. `champions` |

Tips:

- **Player IDs** must match across rankings, players and news. Use the provider's competitor ID everywhere.
- **Injuries:** few providers expose injuries directly. You can derive them from withdrawal/retirement feeds or keep a small curated JSON file.
- **News** can come from a separate source, such as an RSS-to-JSON service or a news API filtered on "tennis". Just map it to `NewsItem`.
- **Upcoming tournaments** for a player use a heuristic in `upcomingForPlayer()`. If your provider has entry lists, replace the heuristic with real data.
- **Caching and refresh:** rankings refetch every 10 minutes (`refetchInterval` in `src/hooks/queries.ts`). Raise this if your plan has tight rate limits.

Leave `VITE_DATA_SOURCE` unset, or set it to `mock`, to switch back to the bundled data at any time.

---

## Customising

- **Colours** live in `tailwind.config.js` (`navy`, `ball`, `surface`). Shared component classes are in `src/index.css`.
- **Player photos:** `PlayerAvatar` renders initials. Add a `photoUrl` to `Player` and render an `<img>` there.
- **Followed players** are stored under the localStorage key `deuces:followed-players`.
