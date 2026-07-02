# WC 2026 Dashboard

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

### Zustand instead of Context for UI state

Dashboard filters (`selectedGroupName`, `sortBy`, `sortDirection`) are **client UI state**, not server data.

Zustand was chosen because:

- no unnecessary re-renders of the whole tree via a Provider;
- simple API with little boilerplate;
- easy selective subscriptions (`useDashboardFilters(s => s.sortBy)`).

Context fits rarely changing global values (e.g. theme), but adds overhead for frequently updated filters.

### MSW as a mock backend

In development, MSW intercepts REST requests to `/api/*` and returns JSON from `src/mocks/fixtures/`. This allows:

- building the UI as if a real API exists (`apiClient`, React Query hooks);
- simulating latency (300–600 ms) for realistic loading states;
- avoiding a separate backend in a demo project.

MSW is not enabled in production — requests hit the real URL (no backend deployed yet).

### Data source: [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)

Fixtures in `src/mocks/fixtures/` (groups, matches) follow the format and structure of **openfootball/worldcup.json** — open tournament data. It is a practical source for a prototype:

- realistic groups, rounds, scores, and goals;
- a stable snapshot for demos without a paid API;
- fixtures can be refreshed from the upstream repo via a script.

`fifa-rankings.json` is a **separate demo file**, not from openfootball (see limitations below).

### Statistics in `lib/`, separate from data fetching

Functions like `computeStandings`, `computeUpsetIndex`, and `computeGroupDifficulty` are **pure functions** with no React and no `fetch`:

- easy to unit-test (Vitest);
- reusable in the UI, CLI, or a future backend;
- hooks (`useGroupStandings`, `useTournamentStats`) only **compose** React Query data with `useMemo` — they do not mix computation with networking.

Separation of concerns: **fetch/cache** (Query) → **transform** (`lib/`) → **view** (components).

### Stack overview

| Layer | Tooling |
| --- | --- |
| UI | shadcn/ui + Tailwind CSS v4 |
| Routing | react-router-dom |
| Charts | recharts |
| Tests | Vitest + Testing Library |

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
