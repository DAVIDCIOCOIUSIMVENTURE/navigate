# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Style

**Never use em dashes (`—` or `--`).** When writing any user-facing text (UI copy, descriptions, tooltips, comments, placeholder text, etc.), replace em dashes with the most fitting alternative: a colon, comma, semicolon, full stop, or by restructuring the sentence. This applies to all generated content throughout the codebase.

## Commands

```Shell
npm run dev              # Start dev server on port 4000
npm run build            # Build for production
npm run lint             # Run ESLint
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once (used in CI)
npm run test:ui          # Run tests with browser UI
npx tsc --noEmit         # Type check without emitting files
npx vitest run src/store/ideas-model.test.ts   # Run a single test file
```

Before committing or pushing, run these checks manually (mirrors what Husky enforces):

```Shell
npm run lint && npx tsc --noEmit && npm run test:run
```

To skip tests during push (e.g. when tests are temporarily broken):

```Shell
SKIP_TESTS=1 git push          # runs lint + type-check only
git push --no-verify           # bypasses all Husky hooks entirely
```

### Git Hooks (Husky)

Husky is configured with a `pre-push` hook at `.husky/pre-push`:

* Always runs: `npm run lint` + `npx tsc --noEmit`
* Conditionally runs: `npm run test:run` (skipped when `SKIP_TESTS=1`)

To bypass all hooks (e.g. for WIP pushes): `git push --no-verify`

## Architecture

**Navigate** is a Next.js 15 (App Router) application guiding users through an innovation process: Self-Discovery → Problem Triggers → Problem Discovery → Problem Validation.

### Stack

* **Framework**: Next.js 15 with App Router, React 19
* **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
* **State**: Rematch (Redux wrapper) — `@rematch/core` + `react-redux`; React Context for lighter feature workflows
* **Drag & Drop**: `@dnd-kit` for sortable bucket organization
* **Tables**: `@tanstack/react-table`
* **Notifications**: `sonner`
* **NLP/Parsing**: `compromise` + `js-yaml` (added for future problem parsing features)
* **Testing**: Vitest + React Testing Library + happy-dom; test files co-located as `*.test.ts(x)`
* **CI**: GitHub Actions (`.github/workflows/ci.yml`) — runs lint, type check, and tests on every push

### Database Status

**The database is currently disabled.** All data is stored in `localStorage`. Prisma and `@prisma/client` remain in `package.json` but are not imported or used anywhere in the active application code. `src/lib/prisma.ts` exists but is unused.

At build time (e.g. on Vercel), Prisma may attempt to validate `DATABASE_URL` from `prisma/schema.prisma`. If the build fails with a Prisma-related error, set this environment variable to satisfy the schema check without needing a real DB:

```
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
```

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Project Structure

* `src/app/(app)/` — All main app pages, wrapped by the sidebar layout (`(app)/layout.tsx`)
* `src/app/login/` — Password-protected login page (outside the sidebar layout)
* `src/app/api/auth/` — Login (`POST`) and logout (`POST`) API routes for cookie-based auth
* `src/middleware.ts` — Checks for `site-auth` cookie; redirects to `/login` if missing
* `src/lib/` — Core utilities: `prisma.ts` (unused singleton), `config.ts` (app-wide constants)
* `src/config/navigation.ts` — Centralized top-level nav items (title, url, icon) used by sidebar, dashboard, and breadcrumbs
* `src/components/ui/` — Shared Radix UI-based primitives
* `src/store/` — Global Rematch store (models: `settings`, `journal`, `problemTriggers`, `ideas`) — all localStorage-backed
* `src/data/` — Static data files (e.g. `selfDiscoveryData.ts`)
* `src/app/(app)/self-discovery/` — Self-discovery questionnaire with `[categoryId]` sub-routing
* `src/app/(app)/solutions/` — Solutions listing page
* `src/app/(app)/problems/brainstorm/` — Interactive brainstorm canvas for generating problem ideas across columns (Customer Segments, Contexts, Jobs-to-Be-Done, Problem Types)
* `src/context/` — React Context providers (`innovation-context.tsx`, `guidance-context.tsx`; ideas was migrated to Rematch)
* `prisma/schema.prisma` — Database schema (kept for reference; not actively used)
* `locales/` — i18n translations (en, es, fr) via `next-i18next`; infrastructure exists but not heavily used

### Password Protection

The app is protected by a simple middleware-based password gate:

* `src/middleware.ts` intercepts all requests and checks for an `httpOnly` cookie `site-auth=1`
* If missing, redirects to `/login?from=<original-path>`
* `/api/auth/login` validates the submitted password against the `SITE_PASSWORD` environment variable and sets the cookie (30-day expiry)
* `/api/auth/logout` clears the cookie

**Required environment variable:**

```
SITE_PASSWORD=your-password-here
```

Set this in `.env` locally and in Vercel's Environment Variables for production.

### State Management

All state is client-side only (no database). Two patterns coexist — choose based on complexity:

**Rematch (Redux)** — use for complex state with side effects or localStorage persistence:

* **Global store** (`src/store/`): `settings` (sidebar collapsed/expanded), `journal` (title + text, persisted to localStorage), `problemTriggers` (persisted to localStorage), `ideas` (full CRUD with localStorage persistence — use the `useIdeas()` hook from `src/store/ideas-hooks.ts`), `problems` (global Problem list, persisted to `navigate-problems` in localStorage — CRUD via `dispatch.problems.create/update/delete`), `accountSettings` (display name, email, theme, compact mode, notification preferences)
* Access: `useSelector((state: RootState) => state.modelName.field)` and `useDispatch<AppDispatch>()`
* All models call `dispatch.modelName.init()` in `root-layout-client.tsx` on mount to hydrate from localStorage

**React Context** — use for lighter, page-scoped state without side effects:

* `src/context/innovation-context.tsx` — manages legacy innovation process state
* `src/context/guidance-context.tsx` — provides `openGuidance()` / `useGuidance()` for the guidance dialog
* Per-stage contexts: `src/app/(app)/ideas/[ideaId]/problem-discovery/context.tsx` and `problem-validation/context.tsx` — mirror idea fields locally and persist to Rematch on mutation
* Provider wraps the route tree in `root-layout-client.tsx`

### Ideas Feature & Innovation Stages

The Ideas feature (`src/app/(app)/ideas/`) is the core of the app. Each idea progresses through sequential stages.

**Routing structure:**

```
src/app/(app)/ideas/
├── page.tsx                         # Ideas list
├── new/page.tsx                     # Create new idea
└── [ideaId]/
    ├── layout.tsx                   # Loads idea from Rematch, passes via context
    ├── page.tsx                     # Idea overview
    ├── (quickstart)/                # Condensed parallel route (quickstart mode)
    │   ├── problem-discovery/quickstart/page.tsx
    │   └── problem-validation/quickstart/page.tsx
    ├── problem-discovery/           # Stage 1 (6 steps)
    │   ├── layout.tsx               # Sidebar nav for all steps
    │   ├── context.tsx              # ProblemDiscoveryProvider + useProblemDiscovery()
    │   ├── introduction/page.tsx
    │   ├── customers/page.tsx
    │   ├── customer-sub-segment/page.tsx
    │   ├── jobs-to-be-done/page.tsx
    │   ├── problems/page.tsx
    │   └── summary/page.tsx
    └── problem-validation/          # Stage 2 (9 steps)
        ├── layout.tsx               # Sidebar nav for all steps
        ├── context.tsx              # ProblemValidationProvider + useProblemValidation()
        ├── introduction/page.tsx
        ├── pick-a-problem/page.tsx
        ├── alternatives/page.tsx
        ├── context-step/page.tsx
        ├── shortcomings/page.tsx
        ├── emotional-impact/page.tsx
        ├── quantifiable-impact/page.tsx
        ├── verdict/page.tsx
        └── problem-statement/page.tsx
```

**Two flow modes:** `"guided"` (full step-by-step) and `"quickstart"` (condensed) — stored on the `Idea` type in `mode`.

### Standalone Problem Validation

In addition to the idea-scoped validation above, there is a standalone validation flow at `src/app/(app)/problem-validation/` that operates on the global `problems` Rematch model (not tied to any idea):

```
src/app/(app)/problem-validation/
├── layout.tsx                     # Pass-through layout
├── page.tsx                       # Lists all problems from state.problems; links into [problemRef]
└── [problemRef]/                  # problemRef = problem ID (numeric string)
    ├── layout.tsx                 # Sidebar nav + ProblemValidationProvider
    ├── context.tsx                # ProblemValidationProvider + useProblemValidation(); persists to navigate-standalone-validation in localStorage
    ├── introduction/page.tsx
    ├── alternatives/page.tsx
    ├── shortcomings/page.tsx
    ├── emotional-impact/page.tsx
    ├── quantifiable-impact/page.tsx
    ├── verdict/page.tsx
    └── problem-statement/page.tsx
```

Validation records are stored in localStorage under `navigate-standalone-validation` as a `Record<problemRef, ValidationRecord>`. The context exposes `saveValidation()` which must be called explicitly to persist changes.

### Layout & Navigation Patterns

* `src/app/layout.tsx` — Root layout: HTML shell only (no sidebar). The `/login` route renders here directly.
* `src/app/(app)/layout.tsx` — Wraps all main app pages with `RootLayoutClient` (sidebar + providers)
* `src/app/root-layout-client.tsx` — Client layout with global sidebar (`app-sidebar.tsx`), breadcrumbs (auto-generated from pathname), and the guidance dialog
* Breadcrumbs are auto-generated: kebab-case path segments become Title Case; intermediate segments are non-clickable

### Vercel Deployment

Required environment variables in Vercel:

| Variable        | Value                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `SITE_PASSWORD` | your chosen password                                                                                  |
| `DATABASE_URL`  | `postgresql://dummy:dummy@localhost:5432/dummy` (only if build fails due to Prisma schema validation) |

### Testing

* **Runner**: Vitest 4 with `happy-dom` environment (ESM-native; replaces jsdom)
* **Config**: `vitest.config.ts` at root; setup file `vitest.setup.ts` imports `@testing-library/jest-dom`
* **Globals**: `vitest/globals` and `@testing-library/jest-dom` types declared in `tsconfig.json` — no need to import `describe`/`it`/`expect` in test files
* **Patterns by test type**:
  * Pure data / utilities → plain `.test.ts`, call functions directly
  * Rematch reducers → import the model, call `model.reducers.fn(state, payload)` directly (they're pure functions, no store setup needed)
  * React Context hooks → `renderHook(() => useHook(), { wrapper: ProviderComponent })`; each state-dependent `act()` call must be in its own block (stale closure behaviour)
* **Module system**: `"type": "module"` is set in `package.json` (required by Vite 7 / Vitest 4); `prisma/seed.cjs` uses `.cjs` extension to stay CommonJS

### CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and on PRs to `main`:

1. `npm ci` — clean install
2. `npm run lint` — ESLint
3. `npx tsc --noEmit` — type check
4. `npm run test:run` — Vitest

Uses Node 22 (Vite 7 requires `>=20.19.0`). The `SITE_PASSWORD` env var is set to a placeholder in CI so middleware doesn't error during the build step.

To enforce CI as a merge gate: GitHub → Settings → Branches → main → **Require status checks to pass**.

### Known Inconsistencies / Work In Progress

* **Prisma leftovers**: `@prisma/client`, `prisma`, and related scripts remain in `package.json` but the database is not used. They can be removed once there's confidence no DB will be re-introduced soon.
* **i18n**: Translation infrastructure is wired but pages mostly use static strings.
* **No multi-user auth**: The password gate is a single shared password for all users. No per-user sessions or roles.

