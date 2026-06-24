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

### UK English, not US English

Navigate is a British product. **All user-facing copy and prose use UK English**, never US English. This applies to UI strings, descriptions, tooltips, placeholders, guidance copy, case studies, code comments, documentation (including this file), commit messages, and Claude's own chat replies.

* **Spelling.** Prefer `-ise`/`-isation` over `-ize`/`-ization` (organise, customise, recognise, prioritise, optimise, specialise, categorise, summarise, standardise, anonymise, realise, emphasise). Always `analyse`/`analysing`/`analysis`, never `analyze`. Use `-our` (colour, behaviour, favour, labour, honour, neighbour), `-tre` in prose (centre, theatre, metre, litre), `licence` (noun) / `license` (verb), `practice` (noun) / `practise` (verb), `defence`, `offence`, doubled-l (travelled, labelled, modelling, cancelled, marvellous), `fulfil`/`fulfilment`, `enrolment`, `programme` (not `program`, except a computer program), `grey`, `aluminium`, `maths`.
* **Vocabulary / concepts.** Prefer the British term: holiday (not vacation), public transport (not public transit/transportation), flat (not apartment), lift (not elevator), pavement (not sidewalk), petrol (not gas), rubbish (not trash/garbage), postcode (not zip code), mobile (not cell phone), football (not soccer), university (not college/grad school), shop (not store, in the retail sense).
* **Currency.** Default to GBP and the `£` symbol. Currency-figure examples (including those in case studies) are denominated in pounds; the currency picker lists `GBP` first; price/cost icons use lucide's `PoundSterling`, not `DollarSign`.

**Do NOT "correct" code.** These rules apply to prose only. Never touch CSS/Tailwind class names (`text-center`, `transition-colors`, `bg-gray-*`), identifiers, variable/function/type names, imports, object keys, ids, slugs, routes, localStorage keys, or external proper nouns and brand/book titles (e.g. "The Mom Test"). When a stable id reads as US English (`context-planning-vacation`), leave the id and change only its human-readable label.

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
npm run dev              # Start the Vite dev server on port 4000
npm run build            # Type-check (tsc --noEmit) then production build to dist/
npm run preview          # Serve the production build locally
npm run lint             # Run ESLint (flat config)
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test:ui          # Run tests with browser UI
npx tsc --noEmit         # Type check without emitting files
npx vitest run src/store/notes-model.test.ts   # Run a single test file
```

Before committing, run the same checks the original project enforced:

```Shell
npm run lint && npx tsc --noEmit && npm run test:run
```

There are no git hooks (Husky) and no CI workflow in this folder; run the checks above manually.

## Architecture

**Navigate** is a React 19 + Vite single-page application guiding users through an innovation process: Foundations (Why It Matters) → Self-Discovery → Problems → Solutions → Next Steps.

This frontend was extracted from a Next.js 15 (App Router) app. Next.js, server-side auth, and Prisma were removed; routing moved to React Router. The feature code, Tailwind theme, Rematch store, and tests are otherwise unchanged. See `README.md` for the full before/after and ASP.NET Core integration notes.

### Stack

* **Framework**: React 19, built and served by Vite 7
* **Routing**: React Router v7, declared in `src/routes.tsx` (see "Routing" below)
* **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
* **State**: Rematch (Redux wrapper): `@rematch/core` + `react-redux`. React Context is used for lighter feature workflows.
* **Drag & Drop**: `@dnd-kit` for sortable bucket organization
* **Tables**: `@tanstack/react-table`
* **Notifications**: `sonner`
* **NLP/Parsing**: `compromise` + `js-yaml` (used by problem identify parsing)
* **Testing**: Vitest 4 + React Testing Library + happy-dom; test files co-located as `*.test.ts(x)`

### Data & backend

**There is no database and no backend in this project.** All state is client-side in `localStorage` (see "State Management"). Prisma was removed during the extraction. This SPA is meant to be served by an ASP.NET Core Web API that will own persistence and auth; talk to it via a Vite dev proxy or `import.meta.env.VITE_API_BASE` (only `VITE_`-prefixed env vars are exposed to the client). See `README.md`.

### Path Alias

`@/*` maps to `src/*`, configured in `tsconfig.json` and resolved at build time by `vite-tsconfig-paths`.

### Project Structure

* `index.html`: Vite entry HTML (root `<div>`, Nunito Google-Fonts link, loads `src/main.tsx`)
* `src/main.tsx`: App entry. Mounts `<BrowserRouter>` + the route tree and imports `globals.css`
* `src/routes.tsx`: The entire route tree (replaces Next's file-based routing; see "Routing")
* `src/app/(app)/`: All main app pages, kept in their original folder layout so relative imports resolve. `page.tsx` / `layout.tsx` files are referenced by `src/routes.tsx`
* `src/app/root-layout-client.tsx`: The app shell (header, breadcrumbs, panels, store providers). Wrapped around every route by `src/routes.tsx`
* `src/lib/`: Core utilities. `router.ts` (the React Router shim: `useRouter`/`usePathname`/`useParams`/`useSearchParams`/`notFound`), `config.ts` (app-wide constants), `utils.ts` (`cn` helper), `dimension-labels.ts` (`resolveDimensionLabel` / `useDimensionLabel` / `resolveOrCreate` for id ↔ label translation across built-in, `customDimensionItems`, and `selfDiscoveryItems` catalogs), `dimension-visuals.ts`, `discoveryMethods.ts`
* `src/components/link.tsx`: `next/link` replacement (maps `href` to React Router's `to`)
* `src/components/route-error-boundary.tsx`: catches `notFound()` and render errors, shows the not-found / error page
* `src/config/navigation.ts`: Centralized top-level nav items + icon resolvers for foundations, self-discovery categories, and next-steps topics
* `src/components/ui/`: Shared Radix UI-based primitives
* `src/store/`: Global Rematch store (see "State Management" below)
* `src/types/`: Cross-feature TypeScript types. `validation.ts` holds validation primitives (`ValidationStatus`, `ValidationAssessment`, `ExistingSolutionItem`, `ValidationMetric`, `Job`, `JobsToBeDone`, `DEFAULT_VALIDATION_ASSESSMENT`); `solution.ts` holds `Solution`, `SolutionWorkspace`, and discovery tool types.
* `src/data/`: Static content modules (`selfDiscoveryData.ts`, `foundationsData.ts`, `dimensionData.ts`, `nextStepsData.ts`)
* `src/context/`: App-wide React Context providers (`guidance-context.tsx`, `container-size-context.tsx`, `navigation-guard-context.tsx`)
* `locales/`: i18n translations (en, es, fr), copied from the original. Not wired up; pages use static strings.

### Authentication

There is **no authentication** in this project. The original login page, `middleware.ts` gate, and `/api/auth/*` routes were removed during the extraction. The ASP.NET Core backend will own auth (e.g. ASP.NET Core Identity + OIDC); add the login UI / route guard against your API when you wire it up. State persists to `localStorage`, so there is currently no gate at all.

### State Management

All state is client-side only (no database). Two patterns coexist; choose based on complexity.

**Rematch (Redux)** for complex state with side effects or localStorage persistence. Models live in `src/store/` and are wired in `src/store/index.ts`:

| Model | localStorage key | Purpose |
| ----- | ---------------- | ------- |
| `settings` | `navigate-settings` | Full-view toggle, journal panel open state, identify-canvas builder state. |
| `notes` | `navigate-notes` | Journal notes (id/title/text/createdAt/editedAt) |
| `selfDiscoveryItems` | `navigate-self-discovery-items` | Self-discovery answers (id `you-user-<8-char>`, title, `questionUrl`, optional `suggestionId`). Drives the "You" column in Identify Problems. Renamed from the legacy `problemTriggers` model. |
| `customDimensionItems` | `navigate-custom-dimension-items` | Per-user catalog of dimension items (`customers` / `contexts` / `problems`) added from the Canvas Builder canvas/builder modes, keyed by ids like `customer-user-<8-char>`. Built-in items live in `src/data/dimensionData.ts` with stable slugs (`customer-teenagers`, etc.). |
| `problems` | `navigate-problems` | Global Problem list. `customers` / `contexts` / `problems` / `you` arrays now store **ids** (built-in slugs or `*-user-*` for custom/self-discovery items), resolved to labels via `src/lib/dimension-labels.ts`. Also holds full validation state (`existingSolutions`, `jobsToBeDone`, `validationAssessment`, `validationStatus`, `contextWhen`, `segmentSize`, `customerDescription`). `jobsToBeDone` (three job lists) lives directly on the Problem since it is explore-owned, not validation-owned. `validationAssessment` carries the `anchorJob` pick, the market metrics, and a `reachableShare` slider for SAM. |
| `solutions` | `navigate-solutions` | Solution candidates linked to a `problemId`; tracks inspiration source, scoring fields (`feasibility`/`impact`/`cost`/`timeToImplement`), validation, and discovery-tool artefacts (analogy / SCAMPER / improve / reverse) |
| `solutionWorkspaces` | `navigate-solution-workspaces` | One workspace per `problemId`, scratch space shared by problem refinement and solution discovery (analysis tool, root causes, 5-Whys chains, affected groups, reverse ideation, etc.). Use `dispatch.solutionWorkspaces.ensureForProblem(problemId)` to lazily create one |
| `accountSettings` | `navigate-account-settings` | Display name, email, theme, compact mode, notification preferences |
| `problemCandidates` | `navigate-problem-candidates` | Draft problems captured by the Reflect / Research identify methods before they are promoted into the `problems` list. Each `ProblemCandidate` keeps `lensId` / `promptId` / `sessionId` provenance and a `promotedToProblemId` once turned into a real Problem. |
| `reflectSessions` | `navigate-reflect-sessions` | Per-session state for the Reflect identify method (answers keyed by prompt, last-picked lens, last step / prompt index for resume). |
| `researchSessions` | `navigate-research-sessions` | Per-session state for the Research identify method (answers keyed by prompt, picked research tool, last step / prompt index for resume). |

Access patterns:

* Read: `useSelector((state: RootState) => state.modelName.field)`
* Write: `useDispatch<AppDispatch>()` then `dispatch.modelName.create/update/delete(...)`
* Hydration: every model exposes an `init()` effect that reads its localStorage key. `src/app/root-layout-client.tsx` calls all of them in a `useEffect` on mount.
* Effects (`create`, `update`, `delete`) handle persistence themselves; never write directly to localStorage from components.

**React Context** for lighter, page-scoped state without persistence side effects:

* `src/context/guidance-context.tsx`: `openGuidance(topic?)` / `useGuidance()` for the guidance side-panel
* `src/context/container-size-context.tsx`: `useContainerSize()` returns `"narrow" | "medium" | "wide"` based on `ResizeObserver` on the content area; used to switch responsive layouts (mobile vs. desktop step navigators, etc.)
* `src/context/navigation-guard-context.tsx`: registers "are you sure?" prompts for in-progress flows
* `src/context/focus-chrome-context.tsx`: `useFocusChrome()` exposes `revealTopNav()` so a focused/full-view flow can pull the hidden top nav back into view
* Per-route contexts (described below) wrap a Rematch model and expose a typed setter API plus `NAV_ITEMS` for the sidebar/stepper.

### Routing

Routing is **declared explicitly** in `src/routes.tsx` using React Router v7, replacing Next's file-based App Router. The `src/app/(app)/...` folders are unchanged on disk; `routes.tsx` is the single place that maps URLs to those `page.tsx` modules.

* Each former dynamic segment `[param]` is a React Router `:param` (`:problemRef`, `:solutionId`, `:sectionUrl`, `:topicUrl`, `:categoryId`, `:questionId`, `:userId`).
* Each `layout.tsx` is a layout route rendering `<TheLayout><Outlet/></TheLayout>`; the layout components still take `children`, so they were left almost untouched.
* `src/app/root-layout-client.tsx` (the app shell) wraps the whole tree once, around an `<Outlet/>`.
* **Navigation API**: components import from the shims, not Next. `src/lib/router.ts` provides `useRouter()` (`push`/`replace`/`back`/`forward`/`refresh`/`prefetch`), `usePathname()`, `useParams()`, `useSearchParams()`, and `notFound()`; `src/components/link.tsx` provides `<Link href=...>`. Call sites are unchanged from the Next version.
* **Not-found / errors**: `notFound()` throws, caught by `src/components/route-error-boundary.tsx`, which renders `src/app/(app)/not-found.tsx`. A catch-all `*` route renders the same page for unknown URLs.
* The `"use client"` directives left at the top of many files are inert no-ops under Vite.

**When adding a route**, add it to `src/routes.tsx` (there is no file-based convention) and, if it is a new top-level section, update the breadcrumb logic in `src/app/root-layout-client.tsx` and `src/config/navigation.ts`.

### Layout & Navigation Patterns

* `index.html` + `src/main.tsx`: the HTML shell and React entry (replacing the old `src/app/layout.tsx`).
* `src/routes.tsx`: wraps every route in `RootLayoutClient` (replacing the old `(app)/layout.tsx`).
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

The app's core flows live under `src/app/(app)/`. Each owns its own per-route context that mirrors the relevant Rematch model and exports a `NAV_ITEMS` array consumed by its stepper.

For a single problem there are now **two separate per-problem flows**: an **Explore** deep dive (`/problems/[problemRef]/explore/<step>`) that refines the problem and gathers jobs-to-be-done, followed by **Validation** (`/problems/[problemRef]/validation/<step>`) that runs the market-sizing / verdict arc. Explore feeds Validation. Each lives in its own folder with its own `layout.tsx`, `context.tsx`, and `NAV_ITEMS`.

#### Problem exploration (deep dive): `/problems/[problemRef]/explore/<step>`

`problemRef` is the numeric problem id as a string. `layout.tsx` wraps children in the explore provider (`explore/context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → customer → choose-refinement → refine → existing-solutions → jobs-to-be-done → summary
```

* `jobs-to-be-done`: three lists (functional / emotional / social) of `Job = { id, text, intensity }`, stored as `Problem.jobsToBeDone` (directly on the Problem, since the jobs are explore-owned rather than validation-owned). Emotional and social jobs carry a `mild | strong | unbearable` intensity. The jobs feed the price anchor in the Validation flow's `worth` step (replacing the dropped `emotional-impact` step), but the anchor is no longer auto-forced to emotional/social: see `worth` below.
* The provider calls `dispatch.solutionWorkspaces.ensureForProblem(problemId)` so refinement work (analysis tool choice, root causes, 5-Whys, affected groups, root-cause notes) is captured on the per-problem `SolutionWorkspace` and surfaces later in solution discovery.

#### Problem validation: `/problems/[problemRef]/validation/<step>`

`layout.tsx` wraps children in `ProblemProvider` (defined in the sibling `context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → worth → market → competition → verdict → summary
```

The pricing / market-sizing arc is built around the jobs-to-be-done captured during Explore, feeding TAM / SAM / SOM. **In the UI those acronyms are not used.** Surface them as: TAM is "total market", SAM is "reachable market", SOM is "realistic share of the market". The guidance side-panel is the one place where TAM/SAM/SOM may appear as educational reference.

* `worth`: a single price the customer would happily pay each time the problem occurs, anchored on one job. Per jobs-to-be-done theory the customer hires a solution for one primary job, so the price is anchored on a single job rather than summed across all of them. The user picks that job on this step; it can be functional, emotional, or social. The pick is stored as `validationAssessment.anchorJob` (`{ kind, id } | null`); when unset or stale, `resolveAnchorJob` falls back to the highest-intensity job (`defaultAnchorJob`). The price itself is `validationAssessment.worthToThem`.
* `market`: produces TAM (`customers × frequency × price`) and SAM (`TAM × reachableShare%`). The reachable share is the field `validationAssessment.reachableShare`, distinct from `obtainableShare`.
* `competition`: the three competitive signals (cost of switching, existing solution effectiveness, competitor size) plus the `obtainableShare` slider (relabelled as "realistic capture") which multiplies SAM down to SOM. This is the only step that produces SOM.

The provider reads/writes the matching `Problem` via `dispatch.problems.update`.

`/problems/[problemRef]/page.tsx` is the per-problem canvas (the natural landing page when navigating to a specific problem). The hub/edit view (full title + description + dimensions + linked solutions + next-steps actions) lives at `/problems/[problemRef]/edit/page.tsx`. The list page `/problems/page.tsx` shows all problems and is the entry point. `/problems/identify/page.tsx` is the picker hub: it explains the ways to identify a problem (Canvas Builder, Reflect, Research, Define a Problem Statement) and routes to each. The dashboard "Identify problems" button and the problems-list "Identify problems" button both navigate to this hub instead of opening a dialog.

* **Canvas Builder** (`/problems/identify/canvas-builder/`): Customer Segments / Contexts / Problem Types columns. Creates problems directly via `dispatch.problems.create({ ..., source: "identify" })`.
* **Reflect** (`/problems/identify/reflect/`): a lens-driven prompt flow. State lives in the `reflectSessions` model; drafts land in `problemCandidates` before being promoted to real problems.
* **Research** (`/problems/identify/research/`): a research-tool prompt flow. State lives in the `researchSessions` model; drafts also land in `problemCandidates`.

The shared dimension type aliases stay at `src/app/(app)/problems/identify/data.ts` so existing imports under `@/app/(app)/problems/identify/data` continue to resolve. The same canvas / edit split applies to solutions: `/solutions/[solutionId]/page.tsx` is the canvas, `/solutions/[solutionId]/edit/page.tsx` is the hub/edit view.

#### Solution discovery: `/solutions/discover`

Single multi-step flow scoped to one active problem. The layout wraps children in `DiscoveryProvider` (`solutions/discover/context.tsx`). Steps from `NAV_ITEMS`:

```
select-problem → choose-discovery → discover → summary
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

### Deployment

`npm run build` type-checks and emits a static bundle to `dist/`. Serve `dist/` from the ASP.NET Core host (static files + a SPA fallback to `index.html`, so client-side routes resolve on refresh). Vite requires Node `>=20.19` (or `>=22.12`) to build. See `README.md` for the integration steps.

### Testing

* **Runner**: Vitest 4 with `happy-dom` environment (ESM-native; replaces jsdom)
* **Config**: the `test` block in `vite.config.ts`; setup file `vitest.setup.ts` imports `@testing-library/jest-dom`
* **Globals**: `vitest/globals` and `@testing-library/jest-dom` types declared in `tsconfig.json`, so test files do not need to import `describe`/`it`/`expect`.
* **Patterns by test type**:
  * Pure data / utilities: plain `.test.ts`, call functions directly
  * Rematch reducers: import the model, call `model.reducers.fn(state, payload)` directly (they're pure functions, no store setup needed). Effects need a real store; see `src/store/notes-model.test.ts` for the existing example.
  * React Context hooks: `renderHook(() => useHook(), { wrapper: ProviderComponent })`. Each state-dependent `act()` call must be in its own block (stale closure behaviour).
* **Module system**: `"type": "module"` is set in `package.json` (required by Vite 7 / Vitest 4).

### Known Inconsistencies / Work In Progress

* **No auth**: authentication was removed during the extraction; the app currently has no gate. The C# backend will own it (see "Authentication").
* **No backend / persistence**: all state is `localStorage`; wiring to the ASP.NET Core API is still to do (`VITE_API_BASE` / dev proxy).
* **i18n**: `locales/` is copied but not wired up; pages use static strings.
* **`"use client"` directives**: left throughout from the Next version; inert under Vite and safe to remove at leisure.
* **Bundle size**: the build is a single large chunk; consider route-level `React.lazy` code-splitting if startup size matters.
