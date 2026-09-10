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
| Primary   | `#9016a6` | `--primary`           | `bg-primary` / `text-primary`                 | Violet. CTAs, primary buttons, brand accents. Uses white text (`--primary-foreground` is light cream). Note: there is no Tailwind default equivalent, so always go through the token rather than a `bg-purple-*` class.            |
| Secondary | `#095aa5` | `--secondary-brand`   | `bg-secondary-brand`                          | Cobalt blue. Brand counterpart to primary for cool / analytical surfaces. Note: `--secondary` / `bg-secondary` is the warm-beige UI surface token and is a different thing.                                                        |
| Tertiary  | `#0f3f75` | `--tertiary`          | `bg-tertiary`                                 | Navy. Used for the top-nav page-title icon tile, canvas card header tiles and the "unsure" verdict tone. Page titles and section navs no longer use it (see "Page titles and section navs" below). Also reachable as `bg-blue-900`. |
| Quaternary| `#1F5F6B` | `--quaternary`        | `bg-quaternary` / `text-quaternary`           | Deep teal. The 4th brand color, drives the app sidebar background (`--sidebar-background` is aliased to this token) and is available for any surface that wants the same teal accent.                                              |
| App bg    | `#F6F2EA` | `--background`        | `bg-background`                               | Warm cream. The page background behind cards. Card surfaces use a slightly lighter cream (`--card`, `hsl(45 40% 98%)`).                                                              |
| Success   | `#1F6E48` | `--success`           | `bg-success`                                  | Forest green. Also reachable as `bg-green-800` (valid verdicts, "Decide on commitment", "Social & Environmental Impact", positive achievement tiles).                                |
| Danger    | `#ab0d0d` | `--destructive`       | `bg-destructive` / `bg-red-800` for tiles     | Pure red. Invalid verdicts, cancel buttons, "Cost of skipping" foundations, "Personal Interests" self-discovery, destructive actions.                                                |

Each brand token also has a matching `-foreground` variable for text/icon contrast (e.g. `--tertiary-foreground`, `bg-tertiary text-tertiary-foreground`). Dark mode uses slightly brighter shades for `--secondary-brand`, `--tertiary`, `--success`, `--destructive` so they stay readable on the dark background. `--quaternary` instead goes slightly darker in dark mode so the sidebar surface stays recessed.

### Tile palette derived from these tokens

Sectioned tile colors (Self-Discovery categories, dashboard achievements, jobs-to-be-done groups) draw from this saturated dark set so colored surfaces feel like one family:

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
| `settings` | `navigate-settings` | Full-view toggle, journal panel open state, sidebar mode (`expanded` / `icon` / `collapsed`), identify-canvas builder state. |
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
| `tour` | `navigate-tour` | Guided tour lifecycle as one explicit `phase` (`armed` / `running` / `paused` / `off`) plus the `stepIndex`, persisted so a refresh resumes mid-tour. `armed` is the first-visit state. See "Guided tour" below. |

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

### Layout & Navigation Patterns

* `src/app/layout.tsx`: Root layout (HTML shell only). The `/login` route renders here directly.
* `src/app/(app)/layout.tsx`: Wraps all main app pages with `RootLayoutClient`.
* `src/app/root-layout-client.tsx`: Client layout containing:
  * `AppStoreProvider` and `NavigationGuardProvider` at the top
  * Top header bar spanning the full width. Left side: Navigate logo, sidebar trigger, page section title. Right side: admin panel link, team avatars, journal/guidance panel toggles (flat borderless icon buttons, transparent at rest, white with `text-quaternary` while their panel is open), account menu.
  * A left sidebar (`src/components/app-sidebar.tsx`, built on the shadcn `sidebar` primitive in `src/components/ui/sidebar.tsx`) sits **below** the header. It lists the top-level sections from `navigationItems.sidebar` (Home, Why It Matters, Self Discovery, Problems, Solutions, Next Steps, Portfolios). It has three modes cycled by the header trigger (or Ctrl/Cmd+B): `expanded` (full labels), `icon` (icons only, labels as tooltips), `collapsed` (hidden off-canvas). The mode is persisted as `settings.sidebarMode`. On mobile it renders as a Sheet. It is hidden in full view and focus flows, along with the header. Focus flows are listed in `isFocusFlowPath` in `root-layout-client.tsx` (Self Discovery, the two Identify hubs and everything under `/problems/identify` including the Canvas Builder, Reflect and Research, the problem canvas `/problems/<id>`, its `/edit` page and its Explore and Validation flows, the solution canvas `/solutions/<id>`, its `/edit` page and its validation flow, and Solution Discovery); each supplies its own Back button, top-bar toggle and section title. Flows without a stepper rail (the hubs, the Canvas Builder) render that row with `FocusFlowHeader` (`src/components/focus-flow-header.tsx`). Focus pages about one problem or solution (both canvases and both edit pages) place that header and the journey rail in a left column beside their content with `FocusPageShell` (`src/components/focus-page-shell.tsx`); the edit pages' Back returns to the matching canvas. Because the sidebar panel is fixed-positioned, `app-sidebar.tsx` offsets it below the `h-16` header with `!top-16 h-[calc(100svh-4rem)]`; recompute if the header height changes.
  * `navigationItems.sidebar` in `src/config/navigation.ts` drives the left sidebar. The former `topMenu` icon row in the header was removed when the sidebar came back.
  * Problems and Solutions are reachable from both the dashboard (`/`) and the left sidebar.
  * Full-view toggle, journal panel, guidance panel, sonner `Toaster`.
  * A `ResizablePanelGroup` that splits content + side panel (`GuidancePanel` or `JournalPanel`) on desktop. On mobile they render as `Sheet`s instead.
  * `getSection(pathname)` derives the page title + icon shown in the header from the route segments. **When adding a new top-level route, update `getSection` here as well as `src/config/navigation.ts`.**
* Section title + icon come from `getSection`; deeper breadcrumbs are not auto-generated by this layout.
* The left sidebar was reinstated in July 2026 after an earlier removal. The shadcn primitive was restored from git history and already carries a custom tri-state `SidebarMode` API (`SidebarProvider` accepts `sidebarMode` / `onSidebarModeChange`; `toggleSidebar` cycles expanded → icon → collapsed).

#### Page height & internal scrolling

The app fits each page within the viewport on wide containers (no full-page scroll) and lets pages scroll naturally on narrow. Internal lists (tables, achievement lists, Identify Problems columns) get their own scrollbar inside a card.

**The layout chain:** outer shell (`SidebarProvider` with `h-svh flex-col overflow-hidden` in `root-layout-client.tsx`) → header, then a row (`flex w-full min-h-0 flex-1`) holding the sidebar and the content frame (`relative flex w-full min-w-0 min-h-0 flex-1 flex-col bg-background`) → scroll container (`flex-1 min-h-0 overflow-y-auto`) → inner wrapper (`min-h-full flex-col` + padding) → `ContentArea` → page/layout.

**Two load-bearing pieces, do not change without thinking:**

1. **`ContentArea` must stay `flex flex-1 flex-col w-full min-h-0`.** `flex-col` is what lets child layouts using `h-full` resolve against a definite parent height (so cards fill the visible area instead of collapsing to content). `min-h-0` is what lets `flex-1` children shrink so the chain can constrain. Removing either reintroduces the dashboard / self-discovery regression.

2. **Inner wrapper uses `min-h-full`, not `h-full`.** Long-content pages need the wrapper to grow with content so the bottom padding is preserved at the end of the scroll (commit `1b65547`). Switching to `h-full` would clip padding on long pages.

**Wide-only viewport cap.** Because the inner wrapper grows with intrinsic content size, a page whose natural content is taller than the viewport will push the wrapper past `min-h-full` and the whole page scrolls. To fit a page within the viewport on wide, cap its root with:

```
max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]
```

`7rem` = header `h-16` (64px) + default inner `py-6` (24+24); `8rem` = header + `lg:py-8` (32+32). Recompute these if the header height or inner padding changes. Apply only when `useContainerSize() === "wide"` so narrow viewports retain natural page scrolling.

**Narrow card heights.** When the page scrolls, give long cards `min-h-[320px] max-h-[640px]` (or similar) with internal `overflow-y-auto` on their content area, so a single card doesn't dominate the page or stay cramped.

#### Catalogue picker trees

Collapsible catalogue pickers all share one markup, taken from `src/components/reflect/identify-dimension-picker.tsx` (the reference implementation). The other Reflect pickers (`life-experiences-picker.tsx`, `work-context-picker.tsx`, `own-problems-picker.tsx`, `audience-picker.tsx`) and the self-discovery suggestion tree (`SuggestionTreeItem` in `src/app/(app)/self-discovery/discover/[categoryId]/[questionId]/page.tsx`) follow it. Copy it rather than building a new tree.

* **Group row**: `flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors hover:bg-accent/50`, chevron `h-3.5 w-3.5 shrink-0 text-muted-foreground` (`ChevronDown` open / `ChevronRight` closed), a `h-4 w-4` category icon from `getGroupIcon(label)` in `src/lib/group-icons.ts`, label `text-sm font-semibold tracking-wide select-none flex-1 text-left text-foreground` (not uppercase), and a right-aligned `text-sm text-secondary-brand font-medium` "N selected" counter.
* **Children**: `<ul role="group" aria-label={group.label} className="ml-7 flex flex-col gap-1 pb-1">` with one `<li>` per child.
* **Leaf row**: a `<button type="button" role="checkbox" aria-checked>` (not the shadcn `Checkbox` inside a `<label>`), `w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`; selected `bg-primary/10 border border-primary`, unselected `border border-transparent hover:bg-accent/40`. The tick box is a `<span>`: `grid place-content-center h-4 w-4 shrink-0 rounded-sm border`, selected `border-primary bg-primary text-primary-foreground` holding `<Check className="h-3 w-3" />`, unselected `border-input`. Single-select variants use `rounded-full` in place of `rounded-sm`. Label `flex-1 text-sm leading-snug`.
* The tree sits on a white `rounded-lg bg-card p-2` panel (or a `ScrollArea` carrying the same classes) so it reads as a panel against a `bg-secondary-brand` container.
* **Group icons** come from `getGroupIcon(label)`, an ordered keyword-to-icon regex list keyed off the group's own label (no icon is stored in the data). Special groups keep their own icon instead: "From your self-discovery" uses `Compass`, and a "Your customers / contexts / problems" custom group uses the matching `DIMENSION_ICONS` entry, both tinted `text-quaternary`. When a new category label falls through to the `Folder` fallback, add a rule to `src/lib/group-icons.ts` rather than hard-coding an icon at the call site.
* The same icons appear on the Canvas Builder's category rows even though its leaf rows use `EditableLeafItem` rather than the markup above: the canvas tree (`DimensionCheckItem`), the Builder mode's "Pick a category" cards, and the shared `src/components/dimension-picker.tsx` (used by the canvas, `edit-problem-dialog` and `core-problem-strategy`) all call `getGroupIcon`. The one exception is the canvas You column, whose groups are self-discovery categories: those are keyed by an `sd-group-<categoryUrl>` id and use `getSelfDiscoveryCategoryIcon` so the icon matches the sidebar exactly.

**The `text-sm` here is deliberate.** These trees show long catalogues in a narrow column and trade the app's usual `text-base` floor for density. Do not bump them, and do not let the smaller size leak outward: descriptions, inputs, selection chips and empty states around the tree stay `text-base`.

### Guided tour

An overlay layer that walks a new user through the application. It is rendered once by `root-layout-client.tsx` (`<TourOverlay />`) and driven by the `tour` Rematch model.

* **State machine** (`src/store/tour-model.ts`): one `phase` field. `armed` (switched on, welcome opens on next load; the first-visit state), `running` (overlay visible at `stepIndex`), `paused` (closed part-way; the same step reopens on next load), `off` (finished, skipped, or disabled). Reducers are the transitions: `hydrate`, `start`, `resume`, `goTo`, `stop` (running to paused, or back to armed on the welcome step), `finish` (to off), `setEnabled` (the Settings switch: off to armed, or anything to off), plus `setJourney` for the ids below. `isTourEnabled(phase)` is the on/off view of it. Persistence is `{ phase, stepIndex, journey }` in localStorage for now (`parseStoredTour` also reads the earlier `{ enabled }` shape); it is expected to move to the database later.
* **Two kinds of step.** *Explain* steps (the default) block the page, describe the spotlighted element and move on with Next. *Act* steps (`mode: "act"`) are hands-on: the page stays usable, the card says what to do, and `done(ctx, entry)` decides when it has happened (`entry` is the context when the step was entered, for "something new appeared" checks). `capture(ctx)` records ids into the persisted `journey` (`problemId`, `solutionId`) so later steps route to the same problem and solution; `advance: "auto"` moves on as soon as `done` is true, otherwise Next enables. Act steps also offer "Skip step". The hands-on run is: identify a problem, define it, describe it and open Explore, work through Explore to validation, record a verdict, identify a solution, run discovery and capture a candidate, validate it.
* **Content** lives in `src/lib/tour-steps.ts` as the ordered `TOUR_STEPS` array. Each step has a title, body paragraphs, an optional `route` to open on entry (a string, or a resolver over `TourContext` that may return null), an optional `target` and `placement`, an optional `when(ctx)` gate that skips the step entirely, and `needsSidebar` for steps anchored to the left menu (the overlay expands a collapsed sidebar for them). `variant: "welcome" | "finish"` marks the large centred cards that open and close the tour. `TourContext` is a light pure snapshot (`pathname`, `journey`, problem and solution summaries); the helpers beside it (`resolveTourStep`, `isStepApplicable`, `isStepDone`, `findStepIndex`, `stepProgress`, `journeyProblem`, `journeySolution`, `latest`, `hasVerdict`) are what the steps and the overlay use and are unit tested, including each act step's `done` and `capture`. Extend `TourContext` when a step needs to depend on more of the app's state.
* **Anchors** are plain `data-tour="<id>"` attributes on existing elements; the ids come from the `TOUR_TARGETS` constant in the same file. Add an id there before anchoring a new step, and never hard-code the string at the call site. Current anchors: the sidebar links, the header (sidebar trigger, breadcrumb, admin link, team avatars, journal, guidance, account button), the dashboard "Identify new problems" button, the identify-methods card list and the Use this tool button on its Define a Problem Statement card, the problem library intro card, the canvas Explore / Validate buttons, the "Identify solutions" button, the solution methods board and its Solution Discovery button (via `MethodPickerItem.tourTarget`), and on the discovery Select a Problem step each problem card (`discoverProblem(id)`) and the Next button.
* **Click chains.** When one click reveals or enables the next (a tab that mounts its panel, a card that enables Next), give the act step an ordered list as its `target`. The spotlight sits on the last id in the chain that is rendered, visible and enabled, and moves along as the user clicks, so the page stays masked throughout. A `target` may also be a resolver over the context, for example the card for the tour's own problem. Prefer this to a docked card whenever the step is "click this specific thing"; keep docked cards for open-ended work such as filling in a form or working through a flow.
* **Overlay files** (`src/components/tour/`): `tour-overlay.tsx` is the orchestrator (navigation, sidebar, keyboard, completion and capture, and the `TourView` of the current step: `waiting`, `spotlight`, `centred` or `docked`); `use-target-rect.ts` finds and tracks the anchor; `geometry.ts` holds the pure placement, arrow and mask maths (tested in `geometry.test.ts`); `tour-cards.tsx` renders the welcome/finish card and the step popover. On an act step the overlay container is `pointer-events-none`: an anchored act step masks everything except the spotlighted element with four clickable panels (`maskPanels`), and an unanchored one docks the card top-right (below the header, clear of the Next / Previous buttons flows keep at the bottom) with no mask at all; a docked card can be minimised to a pill so it never hides what the user is working on. Keyboard shortcuts are only bound on explain steps so they never swallow typing.
* **Navigation**: the overlay pushes a step's route once, on entry, and only when the user is not already where the step wants them: on the route, inside the step's flow (`within(ctx)`, for example anywhere under `/problems/<id>/explore`), or already `done`. That matters on resume: reloading part-way through Explore must not drag the user back to its introduction. After that the step counts as arrived and later navigation by the user (browser back, working through a flow) is left alone.
* **Fallback**: a step whose resolver returns null (the journey has no problem yet) drops its target and shows unanchored straight away. A step whose anchor never appears within a short timeout (mobile, a hidden `hidden md:block` wrapper) also falls back, so the tour never gets stuck.
* **Control**: finishing, pressing "Skip tour", or closing the welcome dialog with "Don't show this again" ticked calls `finish()`. The close cross on any step, Escape, and the welcome dialog's Close without the tick call `stop()`. `/settings/guided-tour` exposes the switch, a "Start the tour" button and, while paused, a "Resume the tour" button; the account menu in the header has a "Guided tour" item that restarts it.
* Keyboard: Escape closes for now, the arrow keys step back and forward. The overlay sits at `z-[100]`, above the header (`z-50`) and Radix dialogs.

### Page titles and section navs

One treatment covers every page heading and every section nav, so new pages get it for free rather than restating classes.

* **`CardTitle`** (`src/components/ui/card.tsx`) always renders primary text with the optional `icon` drawn in `text-primary-foreground` on a solid `bg-primary` tile at stroke width 2.5. It takes only `icon`, `size` and `as`; there is no tile-colour prop. Pass nothing extra for a page title.
* **Section navs and steppers** take their classes from `src/lib/nav-item-styles.ts` rather than inlining them:
  * `NAV_ITEM_HOVER_CLASS` on every row (faint grey `bg-muted`), `NAV_ITEM_ACTIVE_CLASS` on the active row (same grey plus primary text), and `NAV_ITEM_ACTIVE_FOCUS_CLASS` on active dropdown-menu items, which highlight on focus rather than hover.
  * `navIconTileClass(isActive)` / `navIconClass(isActive)` for icon rows and `navStepBadgeClass(state)` for numbered steppers. Only the active tile is solid primary with a light glyph; inactive tiles are grey with the default foreground so nothing reads as selected until it is.
  * `SECTION_TITLE_TILE_CLASS` / `SECTION_TITLE_ICON_CLASS` for the compact `h1` tile used by focus flows (Self Discovery, Solution Discovery, Reflect, Research, and the Identify hubs via `src/components/identify-hub-shell.tsx`).
* Consumers: the Why It Matters, Next Steps, Self Discovery, Settings, problem explore / validation and solution validate layouts, plus the Solution Discovery, Reflect, Research and Canvas Builder steppers. Copy one of those when adding a nav; do not hand-roll tile colours.
* **Methods** (Reflect lenses, Research methods, the identify hubs, discovery and refinement tool pickers) are the one exception: they use the cobalt secondary brand instead of primary so a method reads as a choice rather than a page. `MethodTile` (`src/components/method-tile.tsx`) renders a light glyph on a solid `bg-secondary-brand` tile, and method titles next to it use `text-secondary-brand`. Lens and method data carry no tile colour of their own.
* **In-page tiles** that are not the page title (the "Browse the sections" cards on Why It Matters, the "Where to go from here" cards on Next Steps, the question cards on a Self Discovery category, the numbered intro steps, the introduction-page step timelines, the empty-state icon) also use the solid `bg-secondary-brand` tile with `text-secondary-brand-foreground`, and the title beside each tile is `text-secondary-brand`, so primary is reserved for the page heading and the active nav row.

### Journey progress rail

`JourneyProgress` (`src/components/journey-progress.tsx`) shows where the user is in the whole innovation journey: Self Discovery, Identify problems, Explore problems, Validate problems, Identify solutions, Validate solutions. Each milestone is a circle joined by a connector line, and status is **positional**: the steps before the page's own step are done (muted primary, `bg-primary/65`, never green), that step is solid primary with a halo, and the steps after it are grey discs because nothing there has been touched yet. There are no tick badges and no store lookups. Every label links to the matching page.

* **Rules live in `src/lib/journey-steps.ts`**, not in the component. `JOURNEY_STEPS` is the ordered list (id, label, href, icon), `computeJourneySteps(activeId)` is the pure function that assigns each step's status from position, and `problemJourneyStep(summary)` picks the step for one problem (explore, then validate once it has jobs or existing solutions, then identify solutions once it has a verdict). All three are unit tested.
* **Drop it on a page** with `<JourneyProgressCard activeId="identify-problems" />` (the rail in its own card with the standard padding; `JourneyProgress` is the bare rail), naming the step the page belongs to (or `null` to show every step as upcoming). `orientation="vertical"` (default) is a rail with labels beside the circles for a left column on wide containers; `orientation="horizontal"` is a compact row for the top of a narrow page. The component reads the store itself, so pages pass nothing else. It renders no visible heading (`heading` is only the nav's accessible name), and its circles (`h-7`) and labels (`text-sm`) are deliberately compact: like the picker trees, this is a wayfinding aid beside the content, so do not bump it to the `text-base` floor.
* The two Identify hubs get it through `IdentifyHubShell`'s `journeyStep` prop. On wide containers the shell builds a `w-72` left column holding the focus-flow header (Back, top-bar toggle, title, and the About icon) stacked above the rail card, with the content card beside it; on narrow ones the header stays on top and the rail becomes a horizontal row above the card. The Reflect and Research layouts place the same card directly under their stepper (vertical in the wide side column, horizontal below the collapsed stepper on narrow), still on the "Identify problems" step. Reuse those arrangements rather than inventing another placement.

### About dialogs

Page intro paragraphs (Home, the Problem and Solution libraries, Self Discovery, Portfolios, the two Identify hubs) live in a dialog rather than on the page, so the layout underneath never shifts. Each page places `AboutDialog` (`src/components/about-toggle.tsx`) beside its title and passes the intro paragraphs as children; the component renders the square info-icon trigger (`AboutToggle`, icon only, with "About <subject>" as its tooltip and accessible name) and a centred dialog headed "About <subject>" (override with `title`). Body copy inside is `text-base` on the default foreground. Reuse it for any new page intro rather than building another collapsible or dialog.

### Card header spacing

`CardHeader` defaults to `space-y-1.5` (6px), which is too tight when the header contains a `CardTitle` plus a description paragraph: `CardTitle` uses `leading-none`, so 6px reads as cramped. Whenever a `CardHeader` contains both a title and a description (`<p>` or `CardDescription`), override the spacing to `space-y-6` (24px) so the gap matches the `pt-6` rhythm `CardContent` uses below the title on validation pages. `cn` is `tw-merge`-aware, so passing `space-y-6` in the className cleanly replaces the default. The login page is an exception: its compact centered card intentionally keeps the tight default.

### Content article pages (Why It Matters sections, Next Steps topics)

Static reading pages that pair a photo with prose share one layout, taken from `src/app/(app)/foundations/[sectionUrl]/page.tsx` (the reference) and mirrored by `src/app/(app)/next-steps/[topicUrl]/page.tsx`. Copy it rather than inventing a new arrangement:

* **Tagline first.** The italic `Sparkles` tagline sits at the top of `CardContent`, full width, above the image row. It is not part of the two-column row.
* **Prose and key points beside the image.** A `@container` row (`flex flex-col gap-6 @[800px]:flex-row @[800px]:items-start`) holds a `flex-1 min-w-0` column with the intro paragraph *and* the "Key points" list (gap-8 between them), and the photo on the right. Key points go alongside the image, not underneath the row.
* **Photo.** `w-80 aspect-[4/3] object-cover shrink-0 rounded-lg` plus a per-image `object-*` position, rendered only when `useContainerSize() !== "narrow"`. Images live in `public/images/*.jpg` and are looked up from a `Record<string, { src, alt, position }>` keyed by the page url, declared at the top of the page file rather than in the data module.
* Sections that follow (videos, case studies, "Ways to do this", pitfalls) stack full width below the row.

### Innovation Flows

The app's core flows live under `src/app/(app)/`. Each owns its own per-route context that mirrors the relevant Rematch model and exports a `NAV_ITEMS` array consumed by its stepper.

For a single problem there are now **two separate per-problem flows**: an **Explore** deep dive (`/problems/[problemRef]/explore/<step>`) that refines the problem and gathers jobs-to-be-done, followed by **Validation** (`/problems/[problemRef]/validation/<step>`) that runs the market-sizing / verdict arc. Explore feeds Validation. Each lives in its own folder with its own `layout.tsx`, `context.tsx`, and `NAV_ITEMS`. Both are focus flows rendered through `ProblemFlowShell` (`src/components/problem-flow-shell.tsx`), which mirrors the Reflect shell: Back (to the problem canvas), the top-bar toggle and the section title, then the step nav card (steps, problem reminder, View Problem) and the journey progress rail ("Explore problems" or "Validate problems") in a scrolling left column on wide, or a dropdown nav and horizontal rail above the content on narrow. The layouts only supply the title, icons, `NAV_ITEMS` and journey step. `ProblemFlowShell` is a thin wrapper over the generic `FlowShell` (`src/components/flow-shell.tsx`), which takes the Back href, the step list, a `context` node for the reminder cards and View buttons under the steps, and `menuActions` to mirror those buttons in the narrow dropdown; the caller renders any dialogs those actions open. Solution validation uses `FlowShell` directly.

#### Problem exploration (deep dive): `/problems/[problemRef]/explore/<step>`

`problemRef` is the numeric problem id as a string. `layout.tsx` wraps children in the explore provider (`explore/context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → customer → choose-refinement → refine → existing-solutions → jobs-to-be-done → review
```

* `jobs-to-be-done`: three lists (functional / emotional / social) of `Job = { id, text, intensity }`, stored as `Problem.jobsToBeDone` (directly on the Problem, since the jobs are explore-owned rather than validation-owned). Emotional and social jobs carry a `mild | strong | unbearable` intensity. The jobs feed the price anchor in the Validation flow's `worth` step (replacing the dropped `emotional-impact` step), but the anchor is no longer auto-forced to emotional/social: see `worth` below.
* The provider calls `dispatch.solutionWorkspaces.ensureForProblem(problemId)` so refinement work (analysis tool choice, root causes, 5-Whys, affected groups, root-cause notes) is captured on the per-problem `SolutionWorkspace` and surfaces later in solution discovery.

#### Problem validation: `/problems/[problemRef]/validation/<step>`

`layout.tsx` wraps children in `ProblemProvider` (defined in the sibling `context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → worth → market → competition → verdict → review
```

The pricing / market-sizing arc is built around the jobs-to-be-done captured during Explore, feeding TAM / SAM / SOM. **In the UI those acronyms are not used.** Surface them as: TAM is "total market", SAM is "reachable market", SOM is "realistic share of the market". The guidance side-panel is the one place where TAM/SAM/SOM may appear as educational reference.

* `worth`: a single price the customer would happily pay each time the problem occurs, anchored on one job. Per jobs-to-be-done theory the customer hires a solution for one primary job, so the price is anchored on a single job rather than summed across all of them. The user picks that job on this step; it can be functional, emotional, or social. The pick is stored as `validationAssessment.anchorJob` (`{ kind, id } | null`); when unset or stale, `resolveAnchorJob` falls back to the highest-intensity job (`defaultAnchorJob`). The price itself is `validationAssessment.worthToThem`.
* `market`: produces TAM (`customers × frequency × price`) and SAM (`TAM × reachableShare%`). The reachable share is the field `validationAssessment.reachableShare`, distinct from `obtainableShare`.
* `competition`: the three competitive signals (cost of switching, existing solution effectiveness, competitor size) plus the `obtainableShare` slider (relabelled as "realistic capture") which multiplies SAM down to SOM. This is the only step that produces SOM.

The provider reads/writes the matching `Problem` via `dispatch.problems.update`.

`/problems/[problemRef]/page.tsx` is the per-problem canvas (the natural landing page when navigating to a specific problem). It is a focus page laid out like the Identify hubs: a `w-72` left column with `FocusFlowHeader` (Back to the library) and the journey rail, the canvas beside it. The rail's active step comes from `problemJourneyStep` in `src/lib/journey-steps.ts` (explore, then validate, then identify solutions once there is a verdict). The canvas's Full View toggle is hidden there (`showFullView={false}`) because the chrome is already gone. The hub/edit view (full title + description + dimensions + linked solutions + next-steps actions) lives at `/problems/[problemRef]/edit/page.tsx`. The list page `/problems/page.tsx` shows all problems and is the entry point. `/problems/identify/page.tsx` is the picker hub: it explains the ways to identify a problem (Canvas Builder, Reflect, Research, Define a Problem Statement) and routes to each. The dashboard "Identify problems" button and the problems-list "Identify problems" button both navigate to this hub instead of opening a dialog. The hub is a focus flow (no header or sidebar) built on `IdentifyHubShell` (`src/components/identify-hub-shell.tsx`), which renders the Back button (to the library), the top-bar toggle, the section title, an About button beside it that opens the intro copy in a dialog, a one-line `description` at the top of the viewport-fitted card, and the journey progress rail; `/solutions/identify/page.tsx` uses the same shell.

* **Canvas Builder** (`/problems/identify/canvas-builder/`): Customer Segments / Contexts / Problem Types columns. Creates problems directly via `dispatch.problems.create({ ..., source: "identify" })`. It is a focus page with a `FocusFlowHeader` (Back returns to the hub); it no longer has its own Full View toggle, and `settings.fullView` is now used only by the problem and solution canvases.
* **Reflect** (`/problems/identify/reflect/`): a lens-driven prompt flow. State lives in the `reflectSessions` model; drafts land in `problemCandidates` before being promoted to real problems. Every step is its own route so the browser back button walks through the flow: `/problems/identify/reflect` (pick a method), `/problems/identify/reflect/[lensId]/prompts/[n]` (prompt `n`, 1-based) and `/problems/identify/reflect/[lensId]/review`. The href builders and URL parser live in `reflect/routes.ts`; the client `reflect/layout.tsx` stays mounted across the steps and owns the shell (back button, title, stepper), the one-off resume redirect when entering the root with an interrupted session, the normalising redirect for non-canonical URLs, and the `setLastPosition` sync. Step pages render the panels from `reflect-panels.tsx` and navigate with `router.push` rather than local step state.
* **Research** (`/problems/identify/research/`): a research-tool prompt flow. State lives in the `researchSessions` model; drafts also land in `problemCandidates`. It mirrors the Reflect routing: `/problems/identify/research` (pick a method), `/problems/identify/research/[methodId]/tool`, `/problems/identify/research/[methodId]/capture/[n]` (1-based) and `/problems/identify/research/[methodId]/review`, with `research/routes.ts`, a client `research/layout.tsx` shell and `research-panels.tsx` playing the same roles as their Reflect counterparts. Capture and Review stay disabled in the stepper until a tool is chosen, but the URLs themselves are not gated.

The shared dimension type aliases stay at `src/app/(app)/problems/identify/data.ts` so existing imports under `@/app/(app)/problems/identify/data` continue to resolve. The same canvas / edit split applies to solutions: `/solutions/[solutionId]/page.tsx` is the canvas, `/solutions/[solutionId]/edit/page.tsx` is the hub/edit view.

#### Solution discovery: `/solutions/discover`

Single multi-step flow scoped to one active problem. The layout wraps children in `DiscoveryProvider` (`solutions/discover/context.tsx`). Steps from `NAV_ITEMS`:

```
select-problem → choose-discovery → discover → review
```

The provider persists the active problem id in `localStorage["navigate-active-discovery-problem"]` (so refreshes keep their context) and otherwise reads/writes the per-problem `SolutionWorkspace`. Solution candidates accumulated in this flow are written via `dispatch.solutions.create({ problemId, workspaceId, ... })`. The drawer `solutions-drawer.tsx` lists candidates for the current workspace.

#### Solution validation: `/solutions/[solutionId]/validate`

`solutionId` is numeric. Wraps children in `SolutionProvider`. Steps:

```
introduction → feasibility → impact → cost → time-to-implement → verdict → review
```

The provider only sets fields on the `Solution` (1-5 metric scores, validation notes/status/reason); the linked `Problem` is read-only here. It is a focus flow rendered through `FlowShell`: Back returns to the solution canvas, the step nav card carries reminders of the solution and its linked problem with View Solution and View Problem buttons, and the journey rail sits on "Validate solutions".

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
