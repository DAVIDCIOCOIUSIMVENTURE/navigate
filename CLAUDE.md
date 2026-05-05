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
npx vitest run src/store/notes-model.test.ts   # Run a single test file
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

**Navigate** is a Next.js 15 (App Router) application guiding users through an innovation process: Foundations (Why It Matters) → Self-Discovery → Problem Triggers → Problems → Solutions → Next Steps.

### Stack

* **Framework**: Next.js 15 with App Router, React 19
* **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
* **State**: Rematch (Redux wrapper) — `@rematch/core` + `react-redux`; React Context for lighter feature workflows
* **Drag & Drop**: `@dnd-kit` for sortable bucket organization
* **Tables**: `@tanstack/react-table`
* **Notifications**: `sonner`
* **NLP/Parsing**: `compromise` + `js-yaml` (used by problem brainstorm parsing)
* **Testing**: Vitest 4 + React Testing Library + happy-dom; test files co-located as `*.test.ts(x)`
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
* `src/lib/` — Core utilities: `prisma.ts` (unused singleton), `config.ts` (app-wide constants), `utils.ts` (`cn` helper)
* `src/config/navigation.ts` — Centralized top-level nav items + icon resolvers for foundations, self-discovery categories, and next-steps topics
* `src/components/ui/` — Shared Radix UI-based primitives
* `src/store/` — Global Rematch store (see "State Management" below)
* `src/types/` — Cross-feature TypeScript types: `idea.ts` (validation primitives: `ValidationStatus`, `ValidationAssessment`, `ExistingSolutionItem`), `solution.ts` (`Solution`, `SolutionWorkspace`, discovery tool types)
* `src/data/` — Static content modules: `selfDiscoveryData.ts`, `foundationsData.ts`, `brainstormData.ts`, `nextStepsData.ts`
* `src/context/` — App-wide React Context providers: `guidance-context.tsx`, `container-size-context.tsx`, `navigation-guard-context.tsx`
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

All state is client-side only (no database). Two patterns coexist; choose based on complexity.

**Rematch (Redux)** for complex state with side effects or localStorage persistence. Models live in `src/store/` and are wired in `src/store/index.ts`:

| Model | localStorage key | Purpose |
| ----- | ---------------- | ------- |
| `settings` | `navigate-settings` | Sidebar mode, full-view toggle, journal panel open state |
| `notes` | `navigate-notes` | Journal notes (id/title/text/createdAt/editedAt) |
| `problemTriggers` | `navigate-problem-triggers` | Self-discovery prompts that surface candidate problems |
| `problems` | `navigate-problems` | Global Problem list, including customer / context / problem fragments and full validation state (`existingSolutions`, `validationAssessment`, `validationStatus`, `contextWhen`, `segmentSize`, `customerDescription`, `emotionalImpact`) |
| `solutions` | `navigate-solutions` | Solution candidates linked to a `problemId`; tracks inspiration source, scoring fields (`feasibility`/`impact`/`cost`/`timeToImplement`), validation, and discovery-tool artefacts (analogy / SCAMPER / improve / reverse) |
| `solutionWorkspaces` | `navigate-solution-workspaces` | One workspace per `problemId`, scratch space shared by problem refinement and solution discovery (analysis tool, root causes, 5-Whys chains, affected groups, reverse brainstorm, etc.). Use `dispatch.solutionWorkspaces.ensureForProblem(problemId)` to lazily create one |
| `accountSettings` | `navigate-account-settings` | Display name, email, theme, compact mode, notification preferences |

Access patterns:

* Read: `useSelector((state: RootState) => state.modelName.field)`
* Write: `useDispatch<AppDispatch>()` then `dispatch.modelName.create/update/delete(...)`
* Hydration: every model exposes an `init()` effect that reads its localStorage key. `src/app/root-layout-client.tsx` calls all of them in a `useEffect` on mount.
* Effects (`create`, `update`, `delete`) handle persistence themselves; never write directly to localStorage from components.

**React Context** for lighter, page-scoped state without persistence side effects:

* `src/context/guidance-context.tsx` — `openGuidance(topic?)` / `useGuidance()` for the guidance side-panel
* `src/context/container-size-context.tsx` — `useContainerSize()` returns `"narrow" | "wide"` based on `ResizeObserver` on the content area; used to switch responsive layouts (mobile vs. desktop step navigators, etc.)
* `src/context/navigation-guard-context.tsx` — registers "are you sure?" prompts for in-progress flows
* Per-route contexts (described below) wrap a Rematch model and expose a typed setter API plus `NAV_ITEMS` for the sidebar/stepper.

### Layout & Navigation Patterns

* `src/app/layout.tsx` — Root layout: HTML shell only (no sidebar). The `/login` route renders here directly.
* `src/app/(app)/layout.tsx` — Wraps all main app pages with `RootLayoutClient`.
* `src/app/root-layout-client.tsx` — Client layout containing:
  * `AppStoreProvider` and `NavigationGuardProvider` at the top
  * Global sidebar (`AppSidebar`), full-view toggle, journal panel, guidance panel, sonner `Toaster`
  * A `ResizablePanelGroup` that splits content + side panel (`GuidancePanel` or `JournalPanel`) on desktop; on mobile they render as `Sheet`s instead
  * `getSection(pathname)` derives the page title + icon shown in the header from the route segments. **When adding a new top-level route, update `getSection` here as well as `src/config/navigation.ts`.**
* Section title + icon come from `getSection`; deeper breadcrumbs are not auto-generated by this layout.

### Innovation Flows

The app's three core flows live under `src/app/(app)/`. Each owns its own per-route context that mirrors the relevant Rematch model and exports a `NAV_ITEMS` array consumed by its sidebar/stepper.

#### Problem refinement & validation: `/problems/[problemRef]`

`problemRef` is the numeric problem id as a string. The route layout (`problems/[problemRef]/layout.tsx`) wraps children in `ProblemProvider` (defined in the sibling `context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → customer → choose-refinement → refine → existing-solutions → validate → summary
```

The provider:

* Reads/writes the matching `Problem` via `dispatch.problems.update`.
* Calls `dispatch.solutionWorkspaces.ensureForProblem(problemId)` so refinement work (analysis tool choice, root causes, 5-Whys, affected groups, root-cause notes) is captured on the per-problem `SolutionWorkspace` and surfaces later in solution discovery.
* Standalone files `alternatives/page.tsx` and `shortcomings/page.tsx` exist alongside the named steps but are not in the stepper; they are linked from within the validate flow.

The list page `/problems/page.tsx` shows all problems and is the entry point. `/problems/brainstorm/page.tsx` is a separate canvas (Customer Segments / Contexts / Problem Types columns) that creates problems via `dispatch.problems.create({ ..., source: "brainstorm" })`.

#### Solution discovery: `/solutions/discover`

Single multi-step flow scoped to one active problem. The layout wraps children in `DiscoveryProvider` (`solutions/discover/context.tsx`). Steps:

```
introduction → choose-discovery → select-problem → discover → summary
```

The provider persists the active problem id in `localStorage["navigate-active-discovery-problem"]` (so refreshes keep their context) and otherwise reads/writes the per-problem `SolutionWorkspace`. Solution candidates accumulated in this flow are written via `dispatch.solutions.create({ problemId, workspaceId, ... })`. The drawer `solutions-drawer.tsx` lists candidates for the current workspace.

#### Solution validation: `/solutions/[solutionId]/validate`

`solutionId` is numeric. Wraps children in `SolutionProvider`. Steps:

```
introduction → feasibility → impact → cost → time-to-implement → verdict → summary
```

The provider only sets fields on the `Solution` (1-5 metric scores, validation notes/status/reason); the linked `Problem` is read-only here.

### Other Routes

* `/` — Dashboard (achievements, problem/solution lists, quick search dialogs)
* `/foundations` and `/foundations/[sectionUrl]` — Static "Why It Matters" content driven by `src/data/foundationsData.ts`
* `/self-discovery`, `/self-discovery/[categoryId]`, `/self-discovery/[categoryId]/[questionId]` — Questionnaire driven by `src/data/selfDiscoveryData.ts`
* `/next-steps` and `/next-steps/[topicUrl]` — Per-topic guidance pages (`src/data/nextStepsData.ts`)
* `/settings`, `/settings/{account,appearance,notifications,data-privacy}` — User-facing settings backed by the `accountSettings` Rematch model

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
  * Rematch reducers → import the model, call `model.reducers.fn(state, payload)` directly (they're pure functions, no store setup needed). Effects need a real store; see `src/store/notes-model.test.ts` for the existing example.
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
* **`src/types/idea.ts`**: Despite the name, this file holds shared validation primitives (`ValidationStatus`, `ValidationAssessment`, `ExistingSolutionItem`, etc.) used by the problem and solution flows; there is no longer an "Idea" feature.
* **i18n**: Translation infrastructure is wired but pages mostly use static strings.
* **No multi-user auth**: The password gate is a single shared password for all users. No per-user sessions or roles.
