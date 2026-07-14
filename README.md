# WC 2026 Dashboard

![CI](https://github.com/yurakravtsiv/worldcup-2026-dashboard/actions/workflows/ci.yml/badge.svg)

Interactive dashboard for the 2026 World Cup group stage and tournament statistics.  
Built with React + TypeScript, a mock REST API via MSW, and computed analytics on top of fixture data.

## Getting started

Requires **Node.js 20+** (LTS recommended).

```bash
# install dependencies
npm install

# dev server (MSW enabled in development only)
npm run dev

# production build
npm run build

# preview production build
npm run preview

# run tests
npm run test

# run tests in watch mode
npm run test:watch
```

Additional scripts:

```bash
npm run lint          # ESLint
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier
npm run format:check  # check formatting
```

After `npm run dev`, open the URL printed in the terminal (usually `http://localhost:5173`).

## Technical decisions

### Vite

Fast dev server and builds with minimal configuration. For a TypeScript SPA with `@/*` path aliases and Tailwind v4 via `@tailwindcss/vite`, it keeps the toolchain simple and predictable.

### TanStack Query instead of `useEffect` for server state

Groups, matches, and rankings are **server state**: they need caching, reuse across tabs, and proper loading/error handling.

React Query provides:

- cache and `staleTime` (5 minutes — data is static within a session);
- deduplication of identical requests;
- `refetch` for retries without manual state wiring.

Using `useEffect` + `fetch` would duplicate this logic in every hook.

### No global state library

UI state in this app turned out simple enough that it didn't need Zustand or Context: the selected stage and search query live in the URL (`useSearchParams`), sort order is local `useState` scoped to `TeamTableSection`, and theme preference is `localStorage`. Zustand was evaluated early on but adding it would have been unjustified complexity for state that's this localized — it's a reasonable fit to reach for if a future feature needs state shared across unrelated parts of the tree.

### MSW as a mock backend

In development, MSW intercepts REST requests to `/api/*` and returns JSON from `src/mocks/fixtures/`. This allows:

- building the UI as if a real API exists (`apiClient`, React Query hooks);
- simulating latency (300–600 ms) for realistic loading states;
- avoiding a separate backend in a demo project.

MSW is not enabled in production — requests hit the real URL (no backend deployed yet).

### Typed API layer

Response shapes are typed manually in `src/types/` and fetched through the generic `apiClient<T>` helper in `src/lib/api-client.ts`. OpenAPI/NSwag-generated types were intentionally skipped here — with a mocked backend, writing a spec just to generate types from it would mean documenting a contract I invented myself, adding process overhead without real benefit for a project this size.

### Data source: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)

Fixtures in `src/mocks/fixtures/` (groups, matches) follow the format and structure of **openfootball/worldcup.json** — open tournament data. It is a practical source for a prototype:

- realistic groups, rounds, scores, and goals;
- a stable snapshot for demos without a paid API;
- fixtures can be refreshed from the upstream repo via a script (see below).

`fifa-rankings.json` is a **separate demo file**, not from openfootball (see limitations below).

### Refreshing mock data from the live source

Fixtures in `src/mocks/fixtures/matches.json` are a point-in-time snapshot. To pull a fresher copy from the same upstream source (openfootball/worldcup.json):

```bash
npm run refresh-fixtures
```

This overwrites `matches.json` only (groups/rankings/team-codes are stable and don't need refreshing). Review the diff and commit if the data looks right — this is a manual step, not run automatically in CI or at build time, to keep the demo deterministic.

### Statistics in `lib/`, separate from data fetching

Functions like `computeStandings`, `computeUpsetIndex`, and `computeGroupDifficulty` are **pure functions** with no React and no `fetch`:

- easy to unit-test (Vitest);
- reusable in the UI, CLI, or a future backend;
- hooks (`useGroupStandings`, `useTournamentStats`) only **compose** React Query data with `useMemo` — they do not mix computation with networking.

Separation of concerns: **fetch/cache** (Query) → **transform** (`lib/`) → **view** (components).

A top-level ErrorBoundary catches unexpected render errors app-wide, with additional narrower boundaries around the two dashboard sections so a failure in one (e.g. Insights) doesn't take down the other.

### Stack overview

| Layer | Tooling |
| --- | --- |
| UI | shadcn/ui + Tailwind CSS v4 |
| Routing | react-router-dom |
| Charts | recharts |
| Tests | Vitest + Testing Library |

## Cup Win Probability & Tournament Stage Snapshots

### What "Cup Win Probability" actually means

It's an **independent heuristic strength score per team (0-100%)**, not a normalized probability distribution. Multiple teams can have high scores simultaneously (e.g. Argentina 85% and France 84% at the same time) — the numbers don't sum to 100 across teams. It's computed as a weighted composite of:

- **FIFA ranking (30%)** — pre-tournament team strength
- **Current form (30%)** — points per game so far in the tournament
- **Attack output (15%)** — goals scored, relative to other teams still in the tournament
- **Defense output (15%)** — goals conceded, relative to other teams still in the tournament
- **Upset bonus (10%)** — extra credit for beating higher-ranked opponents

Eliminated teams always show 0%.

### Tournament stage snapshots

A "Stage" dropdown lets you see what the ranking looked like at any past point — Group Stage Round 1/2/3, or any completed knockout round. Selecting a stage recalculates every team's score using only the matches known up to that point.

Two design decisions worth calling out:

1. **Group rounds are per-team, not per-calendar-day.** The World Cup's 12 groups don't play synchronized rounds — group matches are spread across many calendar days. "Group Round 2" means each team's first 2 matches (chronologically), not "everything that happened by some fixed date."

2. **Frozen scores for teams without a new match.** If a team hasn't played yet at the selected stage (e.g. their Round of 16 match hasn't kicked off), their score is carried over unchanged from the previous stage, instead of being recalculated against a different pool of "still active" teams. Without this, a team's % could shift just because other teams played matches — even though nothing changed for that team itself.

3. **No elimination during group stage.** Before the knockout bracket exists, no team is marked as eliminated — elimination only starts applying from Round of 32 onward, based on actual results.

### Known limitations

This is a deliberately simple, explainable heuristic — not a statistical model (no Elo, no Monte Carlo simulation, no historical base rates). The weights (30/30/15/15/10) are a reasonable starting point I could tune with real data, not derived from any formal fitting process.

## What I would improve with more time

- **WebSocket / SSE** — live score updates during matches instead of a static snapshot.
- **i18n** — full Ukrainian/English UI; some labels are mixed today (UA tabs, EN copy elsewhere).
- **Storybook** — isolated development of tables, insight cards, and loading/error states.
- **E2E (Playwright)** — flows such as group selection → standings, tab switching, and error retry.
- **Virtualization** (`@tanstack/react-virtual`) — long match lists and timelines without jank on low-end devices.
- **Code splitting** — lazy routes to shrink the initial bundle (recharts + dashboard).

## Known limitations

- **FIFA rankings** in `fifa-rankings.json` are approximate demo values for the upset index, not official live FIFA rankings.
- **No real backend** — MSW in dev only; the production build does not serve `/api/*` without deploying an API.
- **Static snapshot** — matches without `score` are treated as upcoming; there is no automatic sync from an external source.
- **Upset index** — depends on ranking quality; only includes matches where the lower-ranked team (higher FIFA number) beat a higher-ranked opponent. `rankingGap` is the positive difference in ranking positions (demo data only).
- **Group detail page** (`/groups/:groupName`) is a minimal placeholder; main functionality lives on the Dashboard.
- **Penalties / extra time** — group standings use `ft` only; knockout logic is partially reflected in stats (penalties for determining the winner).
