# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Writing Style

**Never use em dashes (`—` or `--`).** This rule applies *everywhere*, including:

* UI copy, descriptions, tooltips, placeholder text
* Code comments
* Documentation, including this file
* Commit messages and PR descriptions
* Claude's own chat replies and explanations

Replace em dashes with the most fitting alternative: a colon, comma, semicolon, full stop, parentheses, or by restructuring the sentence. The only exception is CLI flags (e.g. `--noEmit`, `--no-verify`), where the double hyphen is part of the syntax.

## Theme

The Navigate brand palette. Use these hex values as the source of truth for any new colored surface; do not invent new tones outside this set without a reason.

| Token     | Hex       | CSS variable          | Tailwind class                                | Use                                                                                                                                                                                  |
| --------- | --------- | --------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary   | `#ca8a04` | `--primary`           | `bg-primary` / `text-primary`                 | Mustard gold. CTAs, primary buttons, brand accents. Equivalent to Tailwind's `bg-yellow-600`. Uses white text (`--primary-foreground` is light cream).                                                                             |
| Secondary | `#0a7db2` | `--secondary-brand`   | `bg-secondary-brand`                          | Cerulean teal. Brand counterpart to primary for cool / analytical surfaces. Note: `--secondary` / `bg-secondary` is the warm-beige UI surface token and is a different thing.                                                      |
| Tertiary  | `#0f3f75` | `--tertiary`          | `bg-tertiary`                                 | Navy. Used for title-adjacent icon tiles: the top-nav page-title icon and the default `CardTitle` icon tile (so dialog and card title icons render navy unless overridden). Also reachable as `bg-blue-900`.                       |
| Quaternary| `#1F5F6B` | `--quaternary`        | `bg-quaternary` / `text-quaternary`           | Deep teal. The 4th brand color, drives the app sidebar background (`--sidebar-background` is aliased to this token) and is available for any surface that wants the same teal accent.                                              |
| App bg    | `#F6F2EA` | `--background`        | `bg-background`                               | Warm cream. The page background behind cards. Card surfaces use a slightly lighter cream (`--card`, `hsl(45 40% 98%)`).                                                              |
| Success   | `#1F6E48` | `--success`           | `bg-success`                                  | Forest green. Also reachable as `bg-green-800` (valid verdicts, "Decide on commitment", "Social & Environmental Impact", positive achievement tiles).                                |
| Danger    | `#ab0d0d` | `--destructive`       | `bg-destructive` / `bg-red-800` for tiles     | Pure red. Invalid verdicts, cancel buttons, "Cost of skipping" foundations, "Personal Interests" self-discovery, destructive actions.                                                |

Each brand token also has a matching `-foreground` variable for text/icon contrast (e.g. `--tertiary-foreground`, `bg-tertiary text-tertiary-foreground`). Dark mode uses slightly brighter shades for `--secondary-brand`, `--tertiary`, `--success`, `--destructive` so they stay readable on the dark background. `--quaternary` instead goes slightly darker in dark mode so the sidebar surface stays recessed.

### Tile palette derived from these tokens

Sectioned tile colors (Foundations, Self-Discovery categories, validation step timelines, Next Steps, dashboard achievements) draw from this saturated dark set so colored surfaces feel like one family:

* Mustard tertiary: `bg-yellow-600`
* Navy secondary: `bg-blue-900`
* Forest success: `bg-green-800`
* Crimson danger: `bg-red-800`
* Dark teal: `bg-teal-700`
* Dark emerald: `bg-emerald-800`
* Burnt orange: `bg-orange-700`
* Dark indigo: `bg-indigo-800`
* Dark violet: `bg-violet-800`
* Dark rose: `bg-rose-800`

Icons sitting on these tiles use `text-white` (or `text-primary-foreground` for the terracotta `bg-primary`).

### Out-of-scope (deliberately keep their own visual language)

* Dimension visuals (Customers / Contexts / Problems / You) from `src/lib/dimension-visuals.ts` use a single color family per dimension that matches the dark `iconBg`: green (Customers), blue (Contexts), red (Problems), yellow (You). Pills tint the same dark shade as the iconBg (e.g. `bg-green-800/20`, `bg-blue-900/20`, `bg-red-800/20`, `bg-yellow-600/25`) so the background is a muted version of the dimension color, and text uses the dimension's full primary dark shade (matches the dimension title). Column accents tint the same family at `/10` to `/20`.
* Status pills (`unvalidated`, `in progress`, `valid`, `invalid`, etc.) use soft `bg-X-100 text-X-700` so they fade into rows.
* Competition signal backgrounds use a semantic intensity gradient (`bg-X-500/30`) and must preserve order from low to high.
* SCAMPER letter badges draw from the saturated dark palette (`bg-red-800`, `bg-orange-700`, `bg-yellow-600`, `bg-emerald-800`, `bg-teal-700`, `bg-rose-800`, `bg-violet-800`) so each letter stays visually distinct while matching the brand theme.

## Commands

```Shell
npm run dev              # Start dev server on port 4000 (uses Turbopack)
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

**Navigate** is a Next.js 15 (App Router) application guiding users through an innovation process: Foundations (Why It Matters) → Self-Discovery → Problems → Solutions → Next Steps.

### Stack

* **Framework**: Next.js 15 with App Router, React 19
* **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
* **State**: Rematch (Redux wrapper): `@rematch/core` + `react-redux`. React Context is used for lighter feature workflows.
* **Drag & Drop**: `@dnd-kit` for sortable bucket organization
* **Tables**: `@tanstack/react-table`
* **Notifications**: `sonner`
* **NLP/Parsing**: `compromise` + `js-yaml` (used by problem identify parsing)
* **Testing**: Vitest 4 + React Testing Library + happy-dom; test files co-located as `*.test.ts(x)`
* **CI**: GitHub Actions (`.github/workflows/ci.yml`) runs lint, type check, and tests on every push

### Database Status

**The database is currently disabled.** All data is stored in `localStorage`. Prisma and `@prisma/client` remain in `package.json` but are not imported or used anywhere in the active application code. `src/lib/prisma.ts` exists but is unused.

At build time (e.g. on Vercel), Prisma may attempt to validate `DATABASE_URL` from `prisma/schema.prisma`. If the build fails with a Prisma-related error, set this environment variable to satisfy the schema check without needing a real DB:

```
DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
```

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Project Structure

* `src/app/(app)/`: All main app pages, wrapped by the sidebar layout (`(app)/layout.tsx`)
* `src/app/login/`: Password-protected login page (outside the sidebar layout)
* `src/app/api/auth/`: Login (`POST`) and logout (`POST`) API routes for cookie-based auth
* `src/middleware.ts`: Checks for `site-auth` cookie; redirects to `/login` if missing
* `src/lib/`: Core utilities. `prisma.ts` (unused singleton), `config.ts` (app-wide constants), `utils.ts` (`cn` helper), `dimension-labels.ts` (`resolveDimensionLabel` / `useDimensionLabel` / `resolveOrCreate` for id ↔ label translation across built-in, `customDimensionItems`, and `selfDiscoveryItems` catalogs), `dimension-visuals.ts`, `discoveryMethods.ts`
* `src/config/navigation.ts`: Centralized top-level nav items + icon resolvers for foundations, self-discovery categories, and next-steps topics
* `src/components/ui/`: Shared Radix UI-based primitives
* `src/store/`: Global Rematch store (see "State Management" below)
* `src/types/`: Cross-feature TypeScript types. `validation.ts` holds validation primitives (`ValidationStatus`, `ValidationAssessment`, `ExistingSolutionItem`, `ValidationMetric`, `Job`, `JobsToBeDone`, `DEFAULT_VALIDATION_ASSESSMENT`); `solution.ts` holds `Solution`, `SolutionWorkspace`, and discovery tool types.
* `src/data/`: Static content modules (`selfDiscoveryData.ts`, `foundationsData.ts`, `dimensionData.ts`, `nextStepsData.ts`)
* `src/context/`: App-wide React Context providers (`guidance-context.tsx`, `container-size-context.tsx`, `navigation-guard-context.tsx`)
* `prisma/schema.prisma`: Database schema (kept for reference; not actively used)
* `locales/`: i18n translations (en, es, fr) via `next-i18next`. Infrastructure exists but is not heavily used.

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
| `settings` | `navigate-settings` | Full-view toggle, journal panel open state, identify-canvas builder state. |
| `notes` | `navigate-notes` | Journal notes (id/title/text/createdAt/editedAt) |
| `selfDiscoveryItems` | `navigate-self-discovery-items` | Self-discovery answers (id `you-user-<8-char>`, title, `questionUrl`, optional `suggestionId`). Drives the "You" column in Identify Problems. Renamed from the legacy `problemTriggers` model. |
| `customDimensionItems` | `navigate-custom-dimension-items` | Per-user catalog of dimension items (`customers` / `contexts` / `problems`) added from the Identify Problems canvas/builder, keyed by ids like `customer-user-<8-char>`. Built-in items live in `src/data/dimensionData.ts` with stable slugs (`customer-teenagers`, etc.). |
| `problems` | `navigate-problems` | Global Problem list. `customers` / `contexts` / `problems` / `you` arrays now store **ids** (built-in slugs or `*-user-*` for custom/self-discovery items), resolved to labels via `src/lib/dimension-labels.ts`. Also holds full validation state (`existingSolutions`, `validationAssessment`, `validationStatus`, `contextWhen`, `segmentSize`, `customerDescription`). `validationAssessment` now carries `jobsToBeDone` (three job lists) and a `reachableShare` slider for SAM in addition to the existing metrics. |
| `solutions` | `navigate-solutions` | Solution candidates linked to a `problemId`; tracks inspiration source, scoring fields (`feasibility`/`impact`/`cost`/`timeToImplement`), validation, and discovery-tool artefacts (analogy / SCAMPER / improve / reverse) |
| `solutionWorkspaces` | `navigate-solution-workspaces` | One workspace per `problemId`, scratch space shared by problem refinement and solution discovery (analysis tool, root causes, 5-Whys chains, affected groups, reverse ideation, etc.). Use `dispatch.solutionWorkspaces.ensureForProblem(problemId)` to lazily create one |
| `accountSettings` | `navigate-account-settings` | Display name, email, theme, compact mode, notification preferences |

Access patterns:

* Read: `useSelector((state: RootState) => state.modelName.field)`
* Write: `useDispatch<AppDispatch>()` then `dispatch.modelName.create/update/delete(...)`
* Hydration: every model exposes an `init()` effect that reads its localStorage key. `src/app/root-layout-client.tsx` calls all of them in a `useEffect` on mount.
* Effects (`create`, `update`, `delete`) handle persistence themselves; never write directly to localStorage from components.

**React Context** for lighter, page-scoped state without persistence side effects:

* `src/context/guidance-context.tsx`: `openGuidance(topic?)` / `useGuidance()` for the guidance side-panel
* `src/context/container-size-context.tsx`: `useContainerSize()` returns `"narrow" | "wide"` based on `ResizeObserver` on the content area; used to switch responsive layouts (mobile vs. desktop step navigators, etc.)
* `src/context/navigation-guard-context.tsx`: registers "are you sure?" prompts for in-progress flows
* Per-route contexts (described below) wrap a Rematch model and expose a typed setter API plus `NAV_ITEMS` for the sidebar/stepper.

### Layout & Navigation Patterns

* `src/app/layout.tsx`: Root layout (HTML shell only). The `/login` route renders here directly.
* `src/app/(app)/layout.tsx`: Wraps all main app pages with `RootLayoutClient`.
* `src/app/root-layout-client.tsx`: Client layout containing:
  * `AppStoreProvider` and `NavigationGuardProvider` at the top
  * Top header bar (no left sidebar). Left side: Navigate logo + page section title. Right side: team avatars, top-menu nav buttons (Why It Matters, Next Steps, Dashboard), journal/guidance/settings actions.
  * `navigationItems.topMenu` in `src/config/navigation.ts` drives the right-hand nav. Dashboard is the rightmost item so it acts as the home / hub button.
  * Problems and Solutions are reached from the dashboard (`/`), not from a sidebar.
  * Full-view toggle, journal panel, guidance panel, sonner `Toaster`.
  * A `ResizablePanelGroup` that splits content + side panel (`GuidancePanel` or `JournalPanel`) on desktop. On mobile they render as `Sheet`s instead.
  * `getSection(pathname)` derives the page title + icon shown in the header from the route segments. **When adding a new top-level route, update `getSection` here as well as `src/config/navigation.ts`.**
* Section title + icon come from `getSection`; deeper breadcrumbs are not auto-generated by this layout.
* The left sidebar (and the shadcn `sidebar` UI primitive that powered it) has been removed. Do not reintroduce a left sidebar without explicit direction.

#### Page height & internal scrolling

The app fits each page within the viewport on wide containers (no full-page scroll) and lets pages scroll naturally on narrow. Internal lists (tables, achievement lists, Identify Problems columns) get their own scrollbar inside a card.

**The layout chain:** outer shell (`h-svh w-full flex-col overflow-hidden` in `root-layout-client.tsx`) → content frame (`relative flex w-full min-w-0 flex-1 flex-col bg-background`) → scroll container (`flex-1 min-h-0 overflow-y-auto`) → inner wrapper (`min-h-full flex-col` + padding) → `ContentArea` → page/layout.

**Two load-bearing pieces, do not change without thinking:**

1. **`ContentArea` must stay `flex flex-1 flex-col w-full min-h-0`.** `flex-col` is what lets child layouts using `h-full` resolve against a definite parent height (so cards fill the visible area instead of collapsing to content). `min-h-0` is what lets `flex-1` children shrink so the chain can constrain. Removing either reintroduces the dashboard / self-discovery regression.

2. **Inner wrapper uses `min-h-full`, not `h-full`.** Long-content pages need the wrapper to grow with content so the bottom padding is preserved at the end of the scroll (commit `1b65547`). Switching to `h-full` would clip padding on long pages.

**Wide-only viewport cap.** Because the inner wrapper grows with intrinsic content size, a page whose natural content is taller than the viewport will push the wrapper past `min-h-full` and the whole page scrolls. To fit a page within the viewport on wide, cap its root with:

```
max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]
```

`7rem` = header `h-16` (64px) + default inner `py-6` (24+24); `8rem` = header + `lg:py-8` (32+32). Recompute these if the header height or inner padding changes. Apply only when `useContainerSize() === "wide"` so narrow viewports retain natural page scrolling.

**Narrow card heights.** When the page scrolls, give long cards `min-h-[320px] max-h-[640px]` (or similar) with internal `overflow-y-auto` on their content area, so a single card doesn't dominate the page or stay cramped.

#### Card header spacing

`CardHeader` defaults to `space-y-1.5` (6px), which is too tight when the header contains a `CardTitle` plus a description paragraph: `CardTitle` uses `leading-none`, so 6px reads as cramped. Whenever a `CardHeader` contains both a title and a description (`<p>` or `CardDescription`), override the spacing to `space-y-6` (24px) so the gap matches the `pt-6` rhythm `CardContent` uses below the title on validation pages. `cn` is `tw-merge`-aware, so passing `space-y-6` in the className cleanly replaces the default. The login page is an exception: its compact centered card intentionally keeps the tight default.

### Innovation Flows

The app's three core flows live under `src/app/(app)/`. Each owns its own per-route context that mirrors the relevant Rematch model and exports a `NAV_ITEMS` array consumed by its sidebar/stepper.

#### Problem refinement & validation: `/problems/[problemRef]/validation/<step>`

`problemRef` is the numeric problem id as a string. The flow lives under `problems/[problemRef]/validation/`, whose `layout.tsx` wraps children in `ProblemProvider` (defined in the sibling `context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → customer → choose-refinement → refine → existing-solutions →
jobs-to-be-done → worth → market → competition → verdict → summary
```

The pricing / market-sizing arc is built around jobs-to-be-done feeding TAM / SAM / SOM:

* `jobs-to-be-done`: three lists (functional / emotional / social) of `Job = { id, text, intensity }`. Emotional and social jobs carry a `mild | strong | unbearable` intensity. The strongest emotional or social pull anchors the price on the next step and replaces the dropped `emotional-impact` step.
* `worth`: a single price the customer would happily pay each time the problem hits, anchored on the strongest job. Captured as `validationAssessment.worthToThem`.
* `market`: produces TAM (`customers × frequency × price`) and SAM (`TAM × reachableShare%`). The reachable share is the new field `validationAssessment.reachableShare`, distinct from `obtainableShare`.
* `competition`: the three competitive signals (cost of switching, existing solution effectiveness, competitor size) plus the `obtainableShare` slider (relabelled as "realistic capture") which multiplies SAM down to SOM. This is the only step that produces SOM.

The provider:

* Reads/writes the matching `Problem` via `dispatch.problems.update`.
* Calls `dispatch.solutionWorkspaces.ensureForProblem(problemId)` so refinement work (analysis tool choice, root causes, 5-Whys, affected groups, root-cause notes) is captured on the per-problem `SolutionWorkspace` and surfaces later in solution discovery.

`/problems/[problemRef]/page.tsx` is the per-problem canvas (the natural landing page when navigating to a specific problem). The hub/edit view (full title + description + dimensions + linked solutions + next-steps actions) lives at `/problems/[problemRef]/edit/page.tsx`. The list page `/problems/page.tsx` shows all problems and is the entry point. `/problems/identify/page.tsx` is the picker hub: it explains the four ways to identify a problem (Identify Problems Tool, Reflect, Research, Define a Problem Statement) and routes to each. The dashboard "Identify problems" button and the problems-list "Identify problems" button both navigate to this hub instead of opening a dialog. The Identify Problems Tool canvas (Customer Segments / Contexts / Problem Types columns) lives at `/problems/identify/canvas-builder/page.tsx` and creates problems via `dispatch.problems.create({ ..., source: "identify" })`. The shared dimension type aliases stay at `src/app/(app)/problems/identify/data.ts` so existing imports under `@/app/(app)/problems/identify/data` continue to resolve. The same canvas / edit split applies to solutions: `/solutions/[solutionId]/page.tsx` is the canvas, `/solutions/[solutionId]/edit/page.tsx` is the hub/edit view.

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

* `/`: Dashboard (achievements, problem/solution lists, quick search dialogs)
* `/foundations` and `/foundations/[sectionUrl]`: Static "Why It Matters" content driven by `src/data/foundationsData.ts`
* `/self-discovery`, `/self-discovery/discover`, `/self-discovery/discover/[categoryId]`, `/self-discovery/discover/[categoryId]/[questionId]`, `/self-discovery/discover/other`: Questionnaire driven by `src/data/selfDiscoveryData.ts`
* `/next-steps` and `/next-steps/[topicUrl]`: Per-topic guidance pages (`src/data/nextStepsData.ts`)
* `/settings`, `/settings/{account,appearance,notifications,data-privacy}`: User-facing settings backed by the `accountSettings` Rematch model
* `/admin`, `/admin/users/[userId]`: Admin panel (establishments, classes, users)

### Vercel Deployment

Required environment variables in Vercel:

| Variable        | Value                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| `SITE_PASSWORD` | your chosen password                                                                                  |
| `DATABASE_URL`  | `postgresql://dummy:dummy@localhost:5432/dummy` (only if build fails due to Prisma schema validation) |

### Testing

* **Runner**: Vitest 4 with `happy-dom` environment (ESM-native; replaces jsdom)
* **Config**: `vitest.config.ts` at root; setup file `vitest.setup.ts` imports `@testing-library/jest-dom`
* **Globals**: `vitest/globals` and `@testing-library/jest-dom` types declared in `tsconfig.json`, so test files do not need to import `describe`/`it`/`expect`.
* **Patterns by test type**:
  * Pure data / utilities: plain `.test.ts`, call functions directly
  * Rematch reducers: import the model, call `model.reducers.fn(state, payload)` directly (they're pure functions, no store setup needed). Effects need a real store; see `src/store/notes-model.test.ts` for the existing example.
  * React Context hooks: `renderHook(() => useHook(), { wrapper: ProviderComponent })`. Each state-dependent `act()` call must be in its own block (stale closure behaviour).
* **Module system**: `"type": "module"` is set in `package.json` (required by Vite 7 / Vitest 4); `prisma/seed.cjs` uses `.cjs` extension to stay CommonJS

### CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and on PRs to `main`:

1. `npm ci`: clean install
2. `npm run lint`: ESLint
3. `npx tsc --noEmit`: type check
4. `npm run test:run`: Vitest

Uses Node 22 (Vite 7 requires `>=20.19.0`). The `SITE_PASSWORD` env var is set to a placeholder in CI so middleware doesn't error during the build step.

To enforce CI as a merge gate: GitHub → Settings → Branches → main → **Require status checks to pass**.

### Known Inconsistencies / Work In Progress

* **Prisma leftovers**: `@prisma/client`, `prisma`, and related scripts remain in `package.json` but the database is not used. They can be removed once there's confidence no DB will be re-introduced soon.
* **i18n**: Translation infrastructure is wired but pages mostly use static strings.
* **No multi-user auth**: The password gate is a single shared password for all users. No per-user sessions or roles.
