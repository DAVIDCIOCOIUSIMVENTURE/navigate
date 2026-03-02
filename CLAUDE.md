# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server on port 4000
npm run build            # Build for production
npm run lint             # Run ESLint
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once (used in CI)
npx tsc --noEmit         # Type check without emitting files
```

## Architecture

**Navigate** is a Next.js 15 (App Router) application guiding users through an innovation process: Self-Discovery → Problem Triggers → Problem Discovery → Solution Ideation/Validation.

### Stack
- **Framework**: Next.js 15 with App Router, React 19
- **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
- **State**: Rematch (Redux wrapper) — `@rematch/core` + `react-redux`; React Context for lighter feature workflows
- **Drag & Drop**: `@dnd-kit` for sortable bucket organization
- **Tables**: `@tanstack/react-table`
- **Notifications**: `sonner`
- **NLP/Parsing**: `compromise` + `js-yaml` (added for future problem parsing features)
- **Testing**: Vitest + React Testing Library + happy-dom; test files co-located as `*.test.ts(x)`
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) — runs lint, type check, and tests on every push

### Database Status

**The database is currently disabled.** All data is stored in `localStorage`. Prisma and `@prisma/client` remain in `package.json` but are not imported or used anywhere in the active application code. `src/lib/prisma.ts` exists but is unused.

At build time (e.g. on Vercel), Prisma may attempt to validate `DATABASE_URL` from `prisma/schema.prisma`. If the build fails with a Prisma-related error, set this environment variable to satisfy the schema check without needing a real DB:

```
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
```

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Project Structure

- `src/app/(app)/` — All main app pages, wrapped by the sidebar layout (`(app)/layout.tsx`)
- `src/app/login/` — Password-protected login page (outside the sidebar layout)
- `src/app/api/auth/` — Login (`POST`) and logout (`POST`) API routes for cookie-based auth
- `src/middleware.ts` — Checks for `site-auth` cookie; redirects to `/login` if missing
- `src/lib/` — Core utilities: `prisma.ts` (unused singleton), `config.ts` (app-wide constants)
- `src/config/navigation.ts` — Centralized top-level nav items (title, url, icon) used by sidebar, dashboard, and breadcrumbs
- `src/components/ui/` — Shared Radix UI-based primitives
- `src/store/` — Global Rematch store (models: `settings`, `journal`, `problemTriggers`) — all localStorage-backed
- `src/data/` — Static data files (e.g. `selfDiscoveryData.ts`)
- `src/context/` — React Context providers (ideas, innovation)
- `prisma/schema.prisma` — Database schema (kept for reference; not actively used)
- `locales/` — i18n translations (en, es, fr) via `next-i18next`; infrastructure exists but not heavily used

### Password Protection

The app is protected by a simple middleware-based password gate:
- `src/middleware.ts` intercepts all requests and checks for an `httpOnly` cookie `site-auth=1`
- If missing, redirects to `/login?from=<original-path>`
- `/api/auth/login` validates the submitted password against the `SITE_PASSWORD` environment variable and sets the cookie (30-day expiry)
- `/api/auth/logout` clears the cookie

**Required environment variable:**
```
SITE_PASSWORD=your-password-here
```

Set this in `.env` locally and in Vercel's Environment Variables for production.

### State Management

All state is client-side only (no database). Two patterns coexist — choose based on complexity:

**Rematch (Redux)** — use for complex state with side effects or localStorage persistence:
- **Global store** (`src/store/`): `settings` (sidebar collapsed/expanded), `journal` (title + text, persisted to localStorage), `problemTriggers` (persisted to localStorage)
- Access: `useSelector((state: RootState) => state.modelName.field)` and `useDispatch<AppDispatch>()`

**React Context** — use for lighter, page-scoped state without side effects:
- `src/context/ideas-context.tsx` — manages ideas list
- `src/context/innovation-context.tsx` — manages innovation process state
- Provider wraps the route tree in `root-layout-client.tsx`

### Layout & Navigation Patterns

- `src/app/layout.tsx` — Root layout: HTML shell only (no sidebar). The `/login` route renders here directly.
- `src/app/(app)/layout.tsx` — Wraps all main app pages with `RootLayoutClient` (sidebar + providers)
- `src/app/root-layout-client.tsx` — Client layout with global sidebar (`app-sidebar.tsx`), breadcrumbs (auto-generated from pathname), and the guidance dialog
- Breadcrumbs are auto-generated: kebab-case path segments become Title Case; intermediate segments are non-clickable

### Vercel Deployment

Required environment variables in Vercel:
| Variable | Value |
|---|---|
| `SITE_PASSWORD` | your chosen password |
| `DATABASE_URL` | `postgresql://dummy:dummy@localhost:5432/dummy` (only if build fails due to Prisma schema validation) |

### Testing

- **Runner**: Vitest 4 with `happy-dom` environment (ESM-native; replaces jsdom)
- **Config**: `vitest.config.ts` at root; setup file `vitest.setup.ts` imports `@testing-library/jest-dom`
- **Globals**: `vitest/globals` and `@testing-library/jest-dom` types declared in `tsconfig.json` — no need to import `describe`/`it`/`expect` in test files
- **Patterns by test type**:
  - Pure data / utilities → plain `.test.ts`, call functions directly
  - Rematch reducers → import the model, call `model.reducers.fn(state, payload)` directly (they're pure functions, no store setup needed)
  - React Context hooks → `renderHook(() => useHook(), { wrapper: ProviderComponent })`; each state-dependent `act()` call must be in its own block (stale closure behaviour)
- **Module system**: `"type": "module"` is set in `package.json` (required by Vite 7 / Vitest 4); `prisma/seed.cjs` uses `.cjs` extension to stay CommonJS

### CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and on PRs to `main`:
1. `npm ci` — clean install
2. `npm run lint` — ESLint
3. `npx tsc --noEmit` — type check
4. `npm run test:run` — Vitest

Uses Node 22 (Vite 7 requires `>=20.19.0`). The `SITE_PASSWORD` env var is set to a placeholder in CI so middleware doesn't error during the build step.

To enforce CI as a merge gate: GitHub → Settings → Branches → main → **Require status checks to pass**.

### Known Inconsistencies / Work In Progress

- **Prisma leftovers**: `@prisma/client`, `prisma`, and related scripts remain in `package.json` but the database is not used. They can be removed once there's confidence no DB will be re-introduced soon.
- **i18n**: Translation infrastructure is wired but pages mostly use static strings.
- **No multi-user auth**: The password gate is a single shared password for all users. No per-user sessions or roles.
