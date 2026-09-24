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

### Never say "validate" in the product

**User-facing copy never uses "validate", "validation" or "validated".** Say **test** (the flows are "Test the problem" and "Test the solution", the journey rail reads "Test problem" / "Test solutions", the breadcrumb reads "Test", buttons read "Test", "Open the test", "Revisit the test"), **check** or **prove** where the sentence wants a different verb, and **tested** / **not tested** for the adjective (status labels read "Not tested", never "Unvalidated"). The verdict words "Valid", "Invalid" and "Unsure" stay. This is a copy rule only: identifiers, types, routes (`/problem/validation`, `/solutions/<id>/validate`), storage fields (`validationStatus`, `validationAssessment`), file names and asset paths keep the `validation` name, and this file keeps describing the code by those names.

**Do NOT "correct" code.** These rules apply to prose only. Never touch CSS/Tailwind class names (`text-center`, `transition-colors`, `bg-gray-*`), identifiers, variable/function/type names, imports, object keys, ids, slugs, routes, localStorage keys, or external proper nouns and brand/book titles (e.g. "The Mom Test"). When a stable id reads as US English (`context-planning-vacation`), leave the id and change only its human-readable label.

## Theme

The Navigate brand palette. Use these hex values as the source of truth for any new colored surface; do not invent new tones outside this set without a reason.

| Token     | Hex       | CSS variable          | Tailwind class                                | Use                                                                                                                                                                                  |
| --------- | --------- | --------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Primary   | `#9016a6` | `--primary`           | `bg-primary` / `text-primary`                 | Violet. CTAs, primary buttons, brand accents. Uses white text (`--primary-foreground` is light cream). Note: there is no Tailwind default equivalent, so always go through the token rather than a `bg-purple-*` class.            |
| Secondary | `#095aa5` | `--secondary-brand`   | `bg-secondary-brand`                          | Cobalt blue. Brand counterpart to primary for cool / analytical surfaces. Note: `--secondary` / `bg-secondary` is the warm-beige UI surface token and is a different thing.                                                        |
| Tertiary  | `#0f3f75` | `--tertiary`          | `bg-tertiary`                                 | Navy. Used for the top-nav page-title icon tile and the "unsure" verdict tone (canvas card headers now draw a bare cobalt icon instead of a tile, see "Canvas card headers" below). Page titles and section navs no longer use it (see "Page titles and section navs" below). Also reachable as `bg-blue-900`. |
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
npm run examples         # Regenerate the example projects in examples/
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

The unit of work is a **project**: one problem and the solutions found for it. The home page lists projects, the header carries a projects dropdown with "New project" at the top, and everything about a project lives under its route: `/projects/<id>` is the project page, `/projects/<id>/identify/...` the ways to identify its problem, `/projects/<id>/problem/...` the problem's edit page and Explore and Validation flows, and `/projects/<id>/solutions/...` the Identify Solutions and Compare flows and each solution's canvas, edit page and validation. There are no standalone Problems or Solutions library pages, and no route names a problem or solution without its project. Build hrefs with `projectRoutes` in `src/lib/projects.ts`, never by hand. See "Projects" under "State Management" and "Layout & Navigation Patterns" below.

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
* `src/lib/`: Core utilities. `prisma.ts` (unused singleton), `config.ts` (app-wide constants), `utils.ts` (`cn` helper), `dimension-labels.ts` (`resolveDimensionLabel` / `useDimensionLabel` / `resolveOrCreate` for id ↔ label translation across built-in, `customDimensionItems`, and `selfDiscoveryItems` catalogs), `dimension-visuals.ts`, `projects.ts` (pure project helpers: `projectRoutes`, the one place every project-scoped href is built, including `previewHref`; `projectIdFromPathname`, `projectForProblem`, `problemOfProject`, `projectHrefForProblem`, `projectDisplayName`, `projectLabel`), `project-preview.ts` (the prose the public preview page is written from), `research-capture.ts` (the per-problem localStorage record the Research tool saves and later pre-fills from)
* `src/hooks/`: `use-mobile.tsx` and `use-projects.ts` (`useProjectScope` reads the `[projectId]` route segment and returns the project, its problem and the `hydrated` flag: every layout and page under `/projects/[projectId]` gets its scope from it; `useProjectIdForProblem` / `useProjectIdForSolution` / `useProjectForProblem` / `useProjectHrefForProblem` resolve a project from an id for shared components such as the canvases, tables and hub dialogs)
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
* `PUBLIC_PATHS` lists what skips the gate: `/login`, `/api/auth/login`, and `/preview` (the public project preview, which is meant for people with no account at all). Anything added there is readable by the whole internet, so add to it deliberately.

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
| `settings` | `navigate-settings` | App-wide preferences and UI state only: full-view toggle, journal panel open state, sidebar mode (`expanded` / `icon` / `collapsed`), Canvas Builder view preferences (hidden columns, canvas or builder mode), avatar. Nothing here belongs to one project. |
| `canvasDrafts` | `navigate-canvas-drafts` | The Canvas Builder's in-progress work, keyed by project: ticked dimension ids, the title being typed and the Builder mode's position. Thrown away once the problem is saved or on Reset. |
| `notes` | `navigate-notes` | Journal notes (id/title/text/projectId/createdAt/editedAt). The journal is one list across the app, so every note is always visible; `projectId` optionally links a note to a project (and so to its problem). The panel offers "All notes" / "This project" filters while inside a project, a new note written there is linked to it, and the editor's "Linked to" picker moves a note between projects or makes it general. `projects.delete` calls `notes.unlinkProject`, which keeps the notes and only clears the link. Storage is validated on read (`parseStoredNotes`), so a note saved before links existed comes back unlinked. |
| `selfDiscoveryItems` | `navigate-self-discovery-items` | Self-discovery answers (id `you-user-<8-char>`, title, `questionUrl`, optional `suggestionId`). Drives the "You" column in Identify Problems. Renamed from the legacy `problemTriggers` model. |
| `customDimensionItems` | `navigate-custom-dimension-items` | Per-user catalog of dimension items (`customers` / `contexts` / `problems`) added from the Canvas Builder canvas/builder modes, keyed by ids like `customer-user-<8-char>`. Built-in items live in `src/data/dimensionData.ts` with stable slugs (`customer-teenagers`, etc.). |
| `problems` | `navigate-problems` | Global Problem list. `customers` / `contexts` / `problems` / `you` arrays now store **ids** (built-in slugs or `*-user-*` for custom/self-discovery items), resolved to labels via `src/lib/dimension-labels.ts`. Also holds full validation state (`existingSolutions`, `jobsToBeDone`, `validationAssessment`, `validationStatus`, `contextWhen`, `segmentSize`, `customerDescription`). `jobsToBeDone` (three job lists) lives directly on the Problem since it is explore-owned, not validation-owned. `validationAssessment` carries the `anchorJob` pick, the market metrics, and a `reachableShare` slider for SAM. |
| `solutions` | `navigate-solutions` | Solution candidates linked to a `problemId`; tracks inspiration source, scoring fields (`feasibility`/`impact`/`cost`/`timeToImplement`), validation, the `trafficLight` (`green` / `amber` / `red` / null) given on the Compare solutions page, and discovery-tool artefacts (analogy / SCAMPER / improve / reverse) |
| `solutionComparison` | `navigate-solution-comparison` | How important each solution metric is (0 to 3 per metric) when ranking a project's solutions in Compare solutions, keyed by project (`selectComparisonWeights(state, projectId)`). The pure ranking rules live in `src/lib/solution-comparison.ts`. |
| `solutionWorkspaces` | `navigate-solution-workspaces` | One workspace per `problemId`, scratch space shared by problem refinement and the Identify Solutions flow (analysis tool, root causes, 5-Whys chains, affected groups, reverse ideation, etc.). Use `dispatch.solutionWorkspaces.ensureForProblem(problemId)` to lazily create one |
| `accountSettings` | `navigate-account-settings` | Display name, email, theme, compact mode, notification preferences |
| `reflectSessions` | `navigate-reflect-sessions` | The guided prompt tools' drafts, keyed by project (`selectReflectProject(state, projectId)`): a session per lens (answers keyed by prompt) plus the last-opened lens and step / prompt index for resume. The model, its key and its `Reflect*` types keep the old name because they carry saved data; the user-facing "Reflect" section is gone (see "Guided prompt tools" below). |
| `researchSessions` | `navigate-research-sessions` | The Research tool's drafts, keyed by project (`selectResearchProject(state, projectId)`): a session per method (answers keyed by prompt, picked research tool) plus the last-picked method and step / prompt index for resume. |
| `tour` | `navigate-tour` | Guided tour lifecycle as one explicit `phase` (`armed` / `running` / `paused` / `off`) plus the `stepIndex`, persisted so a refresh resumes mid-tour. `armed` is the first-visit state. See "Guided tour" below. |
| `projects` | `navigate-projects` | The user's projects (`id`, `name`, `problemId | null`, `members`, timestamps) and a `hydrated` flag. See "Projects" below. |

**State keyed by project.** Anything a user does inside one project must never show in another, so every draft or preference that belongs to a project is stored under its id rather than globally: the guided prompt and Research drafts, the Canvas Builder draft and the Compare weights. All four keep the same shape (`PerProjectState<T>`: a `byProject` map plus a `hydrated` flag) and build their core reducers from `perProjectReducers(empty, save)` in `src/store/per-project.ts`, which applies a change to one project's slice, clears it (`clearProject` in every model) or restores a whole slice under a project id (`restoreProject`, which is how an imported bundle's drafts land), and persists the result, skipping the write when nothing changed. Each also exposes a `select<Feature>(state, projectId)` selector that returns the project's slice or an exported empty one, so callers never handle `undefined`, and validates every field when reading storage so a corrupt entry is dropped rather than trusted. Their reducers take `projectId` in the payload, and `projects.delete` clears every one of them for the project. `solutionWorkspaces` and the per-problem research capture are keyed by problem id, which is the same thing because a project holds one problem. When adding per-project state, follow this pattern rather than adding fields to `settings`. Tests: `src/store/per-project.test.ts`.

**Projects.** A `Project` holds one problem (`problemId`, null until one is identified); its solutions are the `Solution`s whose `problemId` matches, so nothing is stored twice. The invariants and where they are enforced:

* Every problem belongs to exactly one project. `problems.create` takes an optional `projectId` (the identify tools pass the project they run in) and ends by calling `projects.adoptProblem`: that project takes the problem if it has none yet; otherwise (no project given, as for imports and duplicates, or the project is already full) a new project named after the problem title (`defaultProjectName`) is created. `projects.ensureForProblems` runs after hydration in `root-layout-client.tsx` to give problems saved before projects existed a project each. There is no "active project": every page knows its project from the URL.
* Deleting a problem (`problems.delete`) takes its solutions, its `SolutionWorkspace` and its research capture with it, then calls `projects.detachProblem`, so the project stays and shows "No problem yet"; cancelling an empty "Define a Problem Statement" draft therefore leaves the project as it was. Deleting a project (`projects.delete`) deletes its problem (which cascades as above) and clears its drafts and weights in the per-project models.
* Identifying is over once a problem is saved. Every identify tool ends with `ProblemSavedDialog` (`src/components/problem-saved-dialog.tsx`), which says the project's problem is found and next comes exploring it, with a single "Explore the Problem" button; there is no "keep identifying" option and the Canvas Builder no longer lists saved problems. Once a project has its problem, the same tools **revisit** it rather than creating another (for example after the browser's back button returns from Explore to the Canvas Builder): the hub is titled "Revisit the Problem" and its cards read "Revisit with this tool"; Define opens `EditProblemDialog` on the existing problem; the Canvas Builder seeds its selections and title from the problem and its Save buttons become "Update Problem" (`problems.update`, then back to the project page); the guided prompt tools and Research seed a fresh session from the problem's `reflection` / research capture for the same lens or method (`ensureSession` takes `seedAnswers`) and their Save buttons become "Update problem". The journey rail's "Identify problem" milestone leads into whichever of those tools the problem came from, on its review step (see "Journey progress rail").
* **Team membership is mocked.** There are no user accounts yet, so a `ProjectMember` is only the name and email typed into `ProjectSettingsDialog` (`src/components/project-settings-dialog.tsx`), kept in the project's own `members` array. That dialog is the one place a project is renamed, its team changed, its portfolio shared or opened, or the project exported and imported; it is opened by the Settings button on the project page and by the settings button at the end of each row of the header's projects menu and of the home table (whose whole row otherwise opens the project), and it saves the name, the team and the visibility in a single `projects.update` so Cancel discards everything. Its Sharing section carries "Open portfolio", which opens the public page in a new tab whether or not the project is shared yet, and it carries "Delete project" at the bottom left of its footer (nothing outside the dialog deletes a project): that acts as soon as it is confirmed rather than waiting for Save, then closes the dialog and calls the optional `onDeleted`, which the project page uses to return Home. The pure helpers (initials, the stable avatar colour, the email checks) live in `src/lib/project-team.ts` and the avatars in `src/components/member-avatar.tsx` (`MemberAvatar`, `MemberAvatarStack`). Storage is validated on read, so a corrupt member entry is dropped rather than trusted.
* **A project is private until it is shared.** `Project.visibility` is `"private"` or `"public"` and only decides who may read the project's preview page (see "Public project preview" below); the project itself is never editable from there. Storage is validated on read, so a project saved before sharing existed, or with a value we do not recognise, comes back private rather than public.
* `hydrated` is false until `init` has read localStorage; pages that redirect or show "not found" based on the projects list must wait for it, because a page's own effects run before the layout's `init` calls. The two gates in `src/components/project-gates.tsx` do this: `ProjectProblemGate` for pages about the problem (edit, Explore, Validation), where nothing renders until hydrated, a missing project goes home, a project without a problem goes to its page, and otherwise the children render with the problem; and `ProjectGate`, used by `identify/layout.tsx` for the hub and its tools, which only waits for the project itself so a tool never saves into a project that has not loaded or no longer exists.

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
  * Top header bar spanning the full width. Left side: Navigate logo, sidebar trigger, breadcrumb. Right side: the projects menu (`src/components/projects-menu.tsx`: a white dropdown button showing the current project's name, or "Projects"; its list opens with "New project", which raises `NewProjectDialog` from `src/components/project-name-dialog.tsx`, then every project with a tick on the current one and a settings button opening `ProjectSettingsDialog`), admin panel link, team avatars (the current project's members, else placeholder faces), journal/guidance panel toggles (flat borderless icon buttons, transparent at rest, white with `text-quaternary` while their panel is open), account menu. The same projects menu sits in the top sheet that focus flows reveal.
  * A left sidebar (`src/components/app-sidebar.tsx`, built on the shadcn `sidebar` primitive in `src/components/ui/sidebar.tsx`) sits **below** the header. It lists the top-level sections from `navigationItems.sidebar` (Home, Why It Matters, Self Discovery, Next Steps; Problems and Solutions were dropped when projects arrived, Portfolios when the project preview replaced it). It has three modes cycled by the header trigger (or Ctrl/Cmd+B): `expanded` (full labels), `icon` (icons only, labels as tooltips), `collapsed` (hidden off-canvas). The mode is persisted as `settings.sidebarMode`. On mobile it renders as a Sheet. It is hidden in full view and focus flows, along with the header. Focus flows are listed in `isFocusFlowPath` in `root-layout-client.tsx` (tested in `root-layout-client.test.ts`): Self Discovery and every page under a project (the Identify problems hub and its tools, the problem edit page and its Explore and Validation flows, the solution canvas, its edit page and its validation flow, Identify Solutions and Compare solutions); each supplies its own chrome buttons and section title. **The project page itself (`/projects/<id>`) is not a focus flow**: opening a project must always show the top menu, so it keeps the header. It does drop the left sidebar and the header's sidebar trigger (`hidesSidebarPath`, beside `isFocusFlowPath`), because its own left column takes the sidebar's place. **Those two buttons are always `FocusChromeButtons`** (`src/components/focus-chrome-buttons.tsx`): "Home", which leaves for `/` however deeply nested the page is, and "Menu", the `PanelTop` button that calls `revealTopNav` (its accessible name and tooltip are the fuller "Open menu"). There is no per-page destination to pass and no Back button anywhere in the chrome: a flow never walks out one level at a time. In-page step buttons labelled "Back" (the Canvas Builder's Builder mode, the flow steppers) are a different thing and still walk the steps, and the pages that offer a "Back to the project" button in their own content (the solution canvas and edit pages' not-found cards) still do. Flows without a stepper rail (the hubs, the Canvas Builder) render that row with `FocusFlowHeader` (`src/components/focus-flow-header.tsx`). Pages about one project, problem or solution (the project page, the solution canvas and both edit pages) place that header and the journey rail in a left column beside their content with `FocusPageShell` (`src/components/focus-page-shell.tsx`); the project page passes it `chrome="app"` because it keeps the app header, so the shell skips the page padding the layout already gives it and caps the column height under the header, and its `FocusFlowHeader` takes `chromeButtons={false}` so Home and the menu are not drawn twice. Because the sidebar panel is fixed-positioned, `app-sidebar.tsx` offsets it below the `h-16` header with `!top-16 h-[calc(100svh-4rem)]`; recompute if the header height changes.
  * `navigationItems.sidebar` in `src/config/navigation.ts` drives the left sidebar. The former `topMenu` icon row in the header was removed when the sidebar came back.
  * Full-view toggle, journal panel, guidance panel, sonner `Toaster`.
  * A `ResizablePanelGroup` that splits content + side panel (`GuidancePanel` or `JournalPanel`) on desktop. On mobile they render as `Sheet`s instead.
  * `getCrumbs(pathname, lookup)` derives the breadcrumb shown in the header from the route segments; under `/projects/<id>/...` it reads "Home / <project> / Explore" (or Validation, Edit problem, Identify a problem / Canvas Builder, Identify solutions, Compare solutions, Solution / Validation), with `lookup` resolving the project's display name. **When adding a new top-level route, update `getCrumbs` here as well as `src/config/navigation.ts`.**
* **Home (`/`)** lists projects in `ProjectsTable` (`src/components/projects-table.tsx`: name and problem title, the problem's status, solution count, team avatars and a settings button; newest project first by default, the whole row opens the project, and the settings button is the row's only other control, because a project's portfolio, its team and the way to delete it all live in `ProjectSettingsDialog`) with a "New project" button and the bundle import/export menu (`BundleMenuButton`, labelled "Import project" / "Export project"; an imported project appears as a new row and the page stays put, see "Export and import" below). **The project page (`/projects/[projectId]`)** keeps the app header, unlike the flows it leads into: opening a project always shows the top menu. The left sidebar is hidden there (`hidesSidebarPath` in `root-layout-client.tsx`) so the project's own left column is the only one. It is built on `FocusPageShell` in `chrome="app"` mode: the left column carries a `FocusFlowHeader` (without the Home and Open menu buttons, which the header already provides) with the project's name, the team avatars and a single Settings button opening `ProjectSettingsDialog` (where "Open portfolio" and delete both live), stacked above the journey rail on the problem's own step (`problemJourneyStep`). Beside it, scrolling together as one column, sit the `ProblemCanvas` (Explore, Validate, Edit, Full view, Download as text, Export project, all in one actions menu behind a gear button beside the status pill) in a viewport-height box on wide containers, and a `SolutionsTable` of the project's solutions with "Identify solutions" and "Compare solutions" (see "Solutions guards" below: neither is ever disabled). A project without a problem shows a "No problem yet" card whose "Identify a problem" button opens the project's hub (`/projects/<id>/identify`), and the tools there pass the project id into `problems.create` so the problem lands in it. `/problems/<id>` only redirects to the owning project; `/problems` and `/solutions` redirect to `/`.
* The left sidebar was reinstated in July 2026 after an earlier removal. The shadcn primitive was restored from git history and already carries a custom tri-state `SidebarMode` API (`SidebarProvider` accepts `sidebarMode` / `onSidebarModeChange`; `toggleSidebar` cycles expanded → icon → collapsed).

#### Canvas card headers and lists

Every card on the problem and solution canvases is a `Cell` from `canvas-shared.tsx`, and the header treatment is the Cell's own: there is no icon-colour or divider prop to pass. The icon sits on a solid cobalt `h-7 w-7` tile (`CANVAS_ICON_TILE`) with a `text-base font-bold` cobalt title beside it (`CANVAS_TITLE_COLOUR`), matching the method and in-page tiles under "Page titles and section navs". On `tone="brand"` cards, where cobalt on cobalt would disappear, both go white. There is no rule under the header: the mustard divider was dropped along with the mustard tile.

Nothing on the problem canvas collapses. The picked items on the customer, context, problem types and existing solutions cards render as the same cobalt pills the public project preview uses (`PillList` in `problem-canvas-cards.tsx`, `bg-secondary-brand/10 text-secondary-brand`, white-tinted on brand cards). Existing solutions lists only what customers use today; the shortcomings stay in its edit dialog.

#### Canvas card edit dialogs

Every card title on the problem and solution canvases is a button that opens that card's edit dialog. The parts:

* `CellTitle` in `src/components/canvas/canvas-shared.tsx` renders the heading, as plain text or as a button with a pencil on hover when given `onEdit`. `Cell` takes `onEdit` and passes it through; so does the `CollapsibleSection` in `problem-canvas-cards.tsx`, where the title opens the dialog and the rest of the row stays the collapsible trigger.
* `ProblemCanvasCards` and `SolutionCanvasCards` only offer the titles when passed `editable`. The canvas pages (`ProblemCanvas`, `SolutionCanvas`) pass it, and so does `SolutionHubDialog`, the solution's canvas in a dialog, where a card dialog simply opens on top. The read-only views (the View Problem dialog, the two validation review steps) leave it off, so their titles stay plain text.
* The dialogs live in `problem-card-dialog.tsx` (customer, context, problem types, market opportunity, existing solutions) and `solution-card-dialog.tsx` (description, linked problem, method used, metrics), both built on the `CanvasCardDialog` shell in `canvas-card-dialog.tsx`: the card's title, a line on what it holds, the fields, then a button into the section that owns the work (`cardSection` in each file maps a card to its route) and Done. Fields write to the store as they change, so Done only closes.
* The fields reuse the flow editors wherever one exists (`DimensionPicker`, `ExistingSolutionsEditor`, `MarketSection` / `CompetitionSection` / `TamSamSomPanel`, `MetricStrategy`), on the same `bg-secondary-brand` panel they sit on in the flows (`CardDialogPanel`). When a flow editor is bound to the problem or solution context, split the presentational half out and keep the context version as a thin wrapper, as `ExistingSolutionsStrategy` does, rather than copying it.

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

Collapsible catalogue pickers all share one markup, taken from `src/components/reflect/identify-dimension-picker.tsx` (the reference implementation). The other pickers in `src/components/reflect/` (`life-experiences-picker.tsx`, `work-context-picker.tsx`, `own-problems-picker.tsx`, `audience-picker.tsx`, `annoyance-picker.tsx`) and the self-discovery suggestion tree (`SuggestionTreeItem` in `src/app/(app)/self-discovery/discover/[categoryId]/[questionId]/page.tsx`) follow it. Copy it rather than building a new tree.

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
* **Two kinds of step.** *Explain* steps (the default) block the page, describe the spotlighted element and move on with Next. *Act* steps (`mode: "act"`) are hands-on: the page stays usable, the card says what to do, and `done(ctx, entry)` decides when it has happened (`entry` is the context when the step was entered, for "something new appeared" checks). `capture(ctx)` records ids into the persisted `journey` (`projectId`, `problemId`, `solutionId`) so later steps route to the same project, problem and solution; `advance: "auto"` moves on as soon as `done` is true, otherwise Next enables. Act steps also offer "Skip step". The hands-on run is: start a project, identify its problem, define it, describe it and open Explore, work through Explore to validation, record a verdict, identify a solution from the project page, pick a method and capture a candidate, validate it.
* **Content** lives in `src/lib/tour-steps.ts` as the ordered `TOUR_STEPS` array. Each step has a title, body paragraphs, an optional `route` to open on entry (a string, or a resolver over `TourContext` that may return null), an optional `target` and `placement`, an optional `when(ctx)` gate that skips the step entirely, and `needsSidebar` for steps anchored to the left menu (the overlay expands a collapsed sidebar for them). `variant: "welcome" | "finish"` marks the large centred cards that open and close the tour. `TourContext` is a light pure snapshot (`pathname`, `journey`, project, problem and solution summaries); the helpers beside it (`resolveTourStep`, `isStepApplicable`, `isStepDone`, `findStepIndex`, `stepProgress`, `journeyProject`, `journeyProblem`, `journeySolution`, `latest`, `hasVerdict`) are what the steps and the overlay use and are unit tested, including each act step's `done` and `capture`. Extend `TourContext` when a step needs to depend on more of the app's state.
* **Anchors** are plain `data-tour="<id>"` attributes on existing elements; the ids come from the `TOUR_TARGETS` constant in the same file. Add an id there before anchoring a new step, and never hard-code the string at the call site. Current anchors: the sidebar links, the header (sidebar trigger, breadcrumb, projects menu and its New project item, admin link, team avatars, journal, guidance, account button), the home page "New project" button, the project page's "Identify a problem" button (shown while the project has no problem), the identify-methods card list and the Use this tool button on its Define a Problem Statement card, the problem canvas actions menu button and its Explore / Validate items, and the project page's "Identify solutions" button (which opens Identify Solutions for the project's problem).
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
  * `SECTION_TITLE_TILE_CLASS` / `SECTION_TITLE_ICON_CLASS` for the compact `h1` tile used by focus flows (Self Discovery, Identify Solutions, the guided prompt tools, Research, and the Identify problems hub via `src/components/identify-hub-shell.tsx`).
* Consumers: the Why It Matters, Next Steps, Self Discovery, Settings, problem explore / validation and solution validate layouts, plus the Identify Solutions, guided prompt, Research and Canvas Builder steppers. Copy one of those when adding a nav; do not hand-roll tile colours.
* **Methods** (the guided prompt tools, Research methods, the identify hubs, discovery and refinement tool pickers) are the one exception: they use the cobalt secondary brand instead of primary so a method reads as a choice rather than a page. `MethodTile` (`src/components/method-tile.tsx`) renders a light glyph on a solid `bg-secondary-brand` tile, and method titles next to it use `text-secondary-brand`. Lens and method data carry no tile colour of their own.
* **In-page tiles** that are not the page title (the "Browse the sections" cards on Why It Matters, the "Where to go from here" cards on Next Steps, the question cards on a Self Discovery category, the numbered intro steps, the introduction-page step timelines, the empty-state icon) also use the solid `bg-secondary-brand` tile with `text-secondary-brand-foreground`, and the title beside each tile is `text-secondary-brand`, so primary is reserved for the page heading and the active nav row.

### Journey progress rail

`JourneyProgress` (`src/components/journey-progress.tsx`) shows where the user is in the innovation journey: Identify problem, Explore problem, Validate problem, Identify solutions, Validate solutions (the problem steps are singular because a project has one problem and many solutions; Self Discovery is deliberately not a milestone). Each milestone is a circle joined by a connector line. The page's own step is always highlighted (solid primary with a halo). Every other step's status comes from **the problem in view**: it is done (muted primary, `bg-primary/65`, never green) only once the work behind it exists, and a grey disc otherwise, wherever it sits in the sequence. So a problem with no solutions yet shows both solution steps grey even on its validation flow, while a problem with a validated solution lights up the whole rail. On pages with no problem yet (the identify hub, the guided prompt tools, Research, the Select a Problem step) the steps before the page's own count as done and the rest are grey. There are no tick badges. Every label links to the matching page.

* **Rules live in `src/lib/journey-steps.ts`**, not in the component. `JOURNEY_STEPS` is the ordered list (id, label, href, icon); `computeJourneySteps(activeId, completed?)` is the pure function that assigns each step's status (from the `completed` ids when given, from position otherwise); `summariseProblemJourney(problem, solutions)` builds the `ProblemJourneySummary` for a store problem (jobs, existing solutions, linked solutions and how many have a verdict); `completedJourneySteps(summary)` lists the milestones that problem has reached (identified always; explored once it has jobs or existing solutions; validated once it has a verdict; identify solutions once a solution is linked; validate solutions once a linked solution has a verdict); and `problemJourneyStep(summary)` picks the active step for a problem's canvas and edit page (explore, then validate, then identify solutions once there is a verdict, then validate solutions once the problem has any, so the active step is never drawn behind a completed one). All are unit tested.
* **Every label leads into the project's own work**, not to an empty flow. `journeyStepHref(step, projectId, target)` builds them, where `target` is `{ origin, solutionId }`: `origin` is how the project's problem was identified (`identifyOriginOf(problem, researchMethodId)`, null while the project has no problem) and `solutionId` the solution to validate (`journeySolutionId(problemId, solutions)`, the first without a verdict). So "Identify problem" reopens the tool the problem came from, on its review step where it can be changed and saved again: the lens's review (`reflection.lensId`), the Research method's review (the method comes from the capture beside the problem, which the component reads with `loadResearchCapture` and hands to the pure rules), the Canvas Builder, or the hub for a problem typed into the Define dialog, which has no page of its own. A lens or method only counts while the catalogue still has it (`getReflectLens` / `getResearchMethod`, the same check the flows' own parsers make), so a problem restored from a bundle naming something unknown leads to the hub or the method picker rather than to a URL that bounces. "Validate solutions" opens that solution's validation flow, falling back to the project page when the project has no solutions yet. While the project has no problem, "Identify problem" leads to the hub and every other step to the project page.
* **Drop it on a page** with `<JourneyProgressCard activeId="validate-problems" problemId={problem.id} />` (the rail in its own card with the standard padding; `JourneyProgress` is the bare rail), naming the step the page belongs to (or `null` to show every step as upcoming) and the problem the page is about. The component reads that problem and its solutions from the store itself; solution pages pass the solution's `problemId`, and pages with no problem omit it. The shells forward it as `journeyProblemId` (`FlowShell`, `FocusPageShell`; `ProblemFlowShell` derives it from `problemRef`). `orientation="vertical"` (default) is a rail with labels beside the circles for a left column on wide containers; `orientation="horizontal"` is a compact row for the top of a narrow page. It renders no visible heading (`heading` is only the nav's accessible name), and its circles (`h-7`) and labels (`text-xs`) are deliberately compact: like the picker trees, this is a wayfinding aid beside the content, so do not bump it to the `text-base` floor.
* The Identify problems hub gets it through `IdentifyHubShell`'s `journeyStep` prop. On wide containers the shell builds a `w-72` left column holding the focus-flow header (Home, Open menu, title, and the About icon) stacked above the rail card, with the content card beside it; on narrow ones the header stays on top and the rail becomes a horizontal row above the card. The guided prompt and Research layouts place the same card directly under their stepper (vertical in the wide side column, horizontal below the collapsed stepper on narrow), still on the "Identify problem" step. The Identify Solutions layout does the same on the "Identify solutions" step. Reuse those arrangements rather than inventing another placement.

### Solutions guards

**Nothing on the way into a solutions flow is ever disabled.** A user who wants to look for solutions before validating the problem, or to open a flow that has nothing in it yet, is told why the usual order is the safer one and may carry on. All of it lives in `src/components/solutions-guard.tsx`:

* `SolutionsGuardDialog` is the one dialog, with three `reason`s. `unvalidated`: the problem carries no Valid or Unsure verdict, so the footer offers "Validate the problem" (or "Revisit the validation" when the verdict was Invalid, which gets its own wording) beside "Identify solutions anyway". `nothing-to-validate` and `nothing-to-compare`: the project has no solutions yet, so the footer offers "Identify solutions". The reasons share one dialog because they lead into each other: taking "Identify solutions" from an empty project whose problem is unvalidated swaps the dialog's content to the `unvalidated` warning **in place** rather than opening a second one, which is why the footer uses plain `Button`s rather than `AlertDialogAction`. The dialog re-arms to the `reason` it was given each time it opens.
* `IdentifySolutionsButton` is the button plus its guard, and `isReadyForSolutions(status)` is the Valid-or-Unsure rule. Use them wherever a new way into Identify Solutions is added rather than disabling a button.
* Call sites: the project page's "Identify solutions" and "Compare solutions" buttons, the problem edit page's empty-state "Identify solutions" button, and the journey rail, whose "Identify solutions" and "Validate solutions" labels intercept their own click and raise the same dialog (`guardFor` in `journey-progress.tsx`). A rail with no problem in view keeps its plain links, since those lead to the project page anyway.

### Removing things always confirms

Nothing in the app is removed on a single click, however small: a pill on a review step, an answer row, a root cause, a 5-Whys chain, a team member, a note, a solution, a project. Every removal goes through `ConfirmDialog` (`src/components/ui/confirm-dialog.tsx`), whose `removeCopy(noun, description?)` gives the standard "Remove this answer?" wording (`ANSWER_REMOVE_DESCRIPTION` and `SELECTION_REMOVE_DESCRIPTION` are the shared lines for prompt answers and catalogue picks). A pill's text is never the remove control: `RemovablePill` (`src/components/ui/removable-pill.tsx`) renders the entry with a cross that opens the confirmation, and takes `className` / `children` for the chip variants (the amber review pills, the dimension chips in the edit dialogs, the Canvas Builder's selection strip). Trash and cross buttons wrap in `ConfirmDialog` with `trigger`. Do not add a bare `onClick` that removes something.

### About dialogs

Page intro paragraphs (Home, Problems, Solutions, Self Discovery, the Identify problems hub) live in a dialog rather than on the page, so the layout underneath never shifts. Each page places `AboutDialog` (`src/components/about-toggle.tsx`) beside its title and passes the intro paragraphs as children; the component renders the square info-icon trigger (`AboutToggle`, icon only, with "About <subject>" as its tooltip and accessible name) and a centred dialog headed "About <subject>" (override with `title`). Body copy inside is `text-base` on the default foreground. Reuse it for any new page intro rather than building another collapsible or dialog.

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

For a project's problem there are **two separate flows**: an **Explore** deep dive (`/projects/[projectId]/problem/explore/<step>`) that refines the problem and gathers jobs-to-be-done, followed by **Validation** (`/projects/[projectId]/problem/validation/<step>`) that runs the market-sizing / verdict arc. Explore feeds Validation. Each lives in its own folder under `src/app/(app)/projects/[projectId]/problem/` with its own `layout.tsx`, `context.tsx`, and `NAV_ITEMS`; the layouts read the project with `useProjectScope`, guard it with `ProjectProblemGate`, and hand `projectId` plus the problem id to the shared `ProblemProvider` (`problem/problem-context.tsx`), whose `useProblem()` exposes `projectId` for building step links (`getAdjacentSteps(pathname, projectId)`). Both are focus flows rendered through `ProblemFlowShell` (`src/components/problem-flow-shell.tsx`), which mirrors the guided prompt tools' shell: the chrome buttons (Home and Open menu) and the section title, then the step nav card (steps, problem reminder, View Problem) and the journey progress rail ("Explore problem" or "Validate problem") in a scrolling left column on wide, or a dropdown nav and horizontal rail above the content on narrow. The layouts only supply the title, icons, `NAV_ITEMS` and journey step. `ProblemFlowShell` is a thin wrapper over the generic `FlowShell` (`src/components/flow-shell.tsx`), which takes the step list, a `context` node for the reminder cards and View buttons under the steps, and `menuActions` to mirror those buttons in the narrow dropdown; the caller renders any dialogs those actions open. Solution validation uses `FlowShell` directly.

#### Problem exploration (deep dive): `/projects/[projectId]/problem/explore/<step>`

`layout.tsx` wraps children in the explore provider (`explore/context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → customer → choose-refinement → refine → existing-solutions → jobs-to-be-done → review
```

* `jobs-to-be-done`: three lists (functional / emotional / social) of `Job = { id, text, intensity }`, stored as `Problem.jobsToBeDone` (directly on the Problem, since the jobs are explore-owned rather than validation-owned). Emotional and social jobs carry a `mild | strong | unbearable` intensity. The jobs feed the price anchor in the Validation flow's `worth` step (replacing the dropped `emotional-impact` step), but the anchor is no longer auto-forced to emotional/social: see `worth` below.
* The provider calls `dispatch.solutionWorkspaces.ensureForProblem(problemId)` so refinement work (analysis tool choice, root causes, 5-Whys, affected groups, root-cause notes) is captured on the per-problem `SolutionWorkspace` and surfaces later in the Identify Solutions flow.

#### Problem validation: `/projects/[projectId]/problem/validation/<step>`

`layout.tsx` wraps children in `ProblemProvider` (defined in the sibling `context.tsx`). Steps from `NAV_ITEMS`:

```
introduction → worth → market → competition → verdict → review
```

The pricing / market-sizing arc is built around the jobs-to-be-done captured during Explore, feeding TAM / SAM / SOM. **In the UI those acronyms are not used.** Surface them as: TAM is "total market", SAM is "reachable market", SOM is "realistic share of the market". The guidance side-panel is the one place where TAM/SAM/SOM may appear as educational reference.

* `worth`: a single price the customer would happily pay each time the problem occurs, anchored on one job. Per jobs-to-be-done theory the customer hires a solution for one primary job, so the price is anchored on a single job rather than summed across all of them. The user picks that job on this step; it can be functional, emotional, or social. The pick is stored as `validationAssessment.anchorJob` (`{ kind, id } | null`); when unset or stale, `resolveAnchorJob` falls back to the highest-intensity job (`defaultAnchorJob`). The price itself is `validationAssessment.worthToThem`.
* `market`: produces TAM (`customers × frequency × price`) and SAM (`TAM × reachableShare%`). The reachable share is the field `validationAssessment.reachableShare`, distinct from `obtainableShare`.
* `competition`: the three competitive signals (cost of switching, existing solution effectiveness, competitor size) plus the `obtainableShare` slider (relabelled as "realistic capture") which multiplies SAM down to SOM. This is the only step that produces SOM.

The provider reads/writes the matching `Problem` via `dispatch.problems.update`.

The problem is viewed on its project page (`/projects/[projectId]`, see "Layout & Navigation Patterns"), which renders the `ProblemCanvas`; `/problems/[problemRef]/page.tsx` only redirects there. The rail's active step on that page comes from `problemJourneyStep` in `src/lib/journey-steps.ts` (explore, then validate, then identify solutions once there is a verdict, then validate solutions once the problem has any), and `journeyStepHref(step, projectId, target)` in the same file points each milestone into the project (see "Journey progress rail"). The hub/edit view (full title + description + dimensions + linked solutions + next-steps actions) lives at `/projects/[projectId]/problem/edit/page.tsx`. `/projects/[projectId]/identify/page.tsx` is the picker hub: it lists the ways to identify a problem as one flat list (the four guided prompt tools, then Canvas Builder, Research, Define a Problem Statement) and routes to each; once the project has its problem it becomes "Revisit the Problem" (see "Projects" above). The "Identify a problem" button on a project page with no problem navigates to this hub. The hub is a focus flow (no header or sidebar) built on `IdentifyHubShell` (`src/components/identify-hub-shell.tsx`), which renders the chrome buttons (Home and Open menu), the section title, an About button beside it that opens the intro copy in a dialog, a one-line `description` at the top of the viewport-fitted card, and the journey progress rail. There is no matching hub for solutions: Identify Solutions is the only tool, so the project page's "Identify solutions" button and the journey rail's "Identify solutions" milestone go straight to `projectRoutes.identifySolutions(projectId)` (the pick-method step).

* **Canvas Builder** (`/projects/[projectId]/identify/canvas-builder/`): Customer Segments / Contexts / Problem Types columns. Its ticked items, title and Builder-mode position are the project's draft in the `canvasDrafts` model (canvas and builder modes share it; Reset clears it). Creates the project's problem via `dispatch.problems.create({ ..., source: "identify", projectId })`, or updates it once the project has one (an empty draft is first seeded from the problem), and clears the draft afterwards. It is a focus page with a `FocusFlowHeader`; it no longer has its own Full View toggle, and `settings.fullView` is now used only by the problem and solution canvases.
* **Guided prompt tools** (`/projects/[projectId]/identify/[lensId]/`): each lens (Life experiences, Work friction, Problems you've solved yourself, Audience problems, Something that annoys you) is a **tool in its own right on the hub**, a peer of the Canvas Builder and Research. There is no Reflect wrapper, no Reflect route and no "pick a lens" step: the tool is named by the URL, so the flow is just prompts then review. `src/data/reflectLenses.ts` holds the lenses (`REFLECT_LENSES`, in hub order, and `getReflectLens`); every lens in it is offered, and there are no drafted or hidden ones. A lens's `shortDescription` is the hub row and the guidance panel's tool card, `bestFor` the hub's "Best for" copy, and `helperText` the one-line tip beside the tool in the guidance panel, which draws its "Two directions, five tools" cards from the catalogue rather than restating them. Every lens has one `contextOnly` **anchor** prompt (what the run reflects on, rendered by that lens's own single-select picker in `src/components/reflect/` and wired up in `lens-panels.tsx`) and its prompts carry a `role` (`problems`, `customers` or `contexts`, one prompt per role) saying which of the problem's dimension columns their answers are saved into; the rest is kept as the problem's `reflection`. Four lenses anchor on a situation and ask for its problems; **Something that annoys you** is the inverse (`startsFromProblem`), anchoring on a problem type from the Problems catalogue (`AnnoyancePicker`) and working backwards through one real occasion, the job behind it, who else has it (`customers`), when it bites (`contexts`), how people cope and why it is still there. It is the only lens that writes the problem's contexts, so the review step patches `contexts` only when the lens has a prompt with that role and revisiting with another lens leaves them alone. Routes: `.../[lensId]` (lands on the resumed position or the first prompt), `.../[lensId]/prompts/[n]` (1-based) and `.../[lensId]/review`. `[lensId]/routes.ts` holds the href builders (`lensHrefs(projectId, lensId)`), the parser and `lensResumeHref`; `[lensId]/layout.tsx` stays mounted across the steps and owns the shell (back button, the lens's own title and icon, stepper), the resume landing, the normalising redirect for non-canonical URLs, and the `setLastPosition` sync (never before `hydrated`, or it would persist an empty map over every project's drafts). Step pages render the panels from `lens-panels.tsx`. Because `[lensId]` is dynamic and sits beside the `canvas-builder` and `research` folders, Next.js matches those static segments first; the parser sends anything else back to the hub. Build hrefs with `projectRoutes.lens(projectId, lensId)`.
* **Guided discovery** (`/projects/[projectId]/identify/guided/`): a prototype of one guided tool meant to cover the ground of the five lenses. Its first question asks what the user is starting from and each option is a dimension (You, Customer, Problem, Context). After that **every route asks the same questions**: the content in `src/data/guidedDiscovery.ts` is a small set of shared `GUIDED_SLOTS` (what goes wrong, who has it, when it bites, how people cope, wasted spend, why it is still there, plus `occasion` and `wish`), each with default copy and wording `variants` keyed by dimension or voice, and one `GuidedRoute` per dimension. A route differs only in its **anchor** (what the run is about, picked with that dimension's picker; it fills that column, so the matching slot is never listed on that route), its **voice** (one further choice such as "I am one of them" or "It is the first time" that adds no questions but picks the wording of the shared ones: a voice variant wins over a dimension variant over the default), and the order of its `steps` (a step may be limited to some voices, which is how "what do you wish someone had told you" appears only for "something I went through once"). Answers are keyed by slot id (`problems`, `cope`, ...) with `start`, `voice-<dimension>` and `anchor-<dimension>` for the choices and the anchor, so an answer survives a change of voice or route. The path is never stored: `resolveGuidedPath(answers)` in `src/lib/guided-discovery.ts` rebuilds the concrete `GuidedNode`s (choice or prompt) from the route and the voice each time and stops at the first unanswered choice. `you` anchors draw from Self Discovery (`SelfDiscoveryAnchorPicker`, the voice deciding which question a new entry is saved under) and Context and Problem anchors from a generic single-select `DimensionAnchorPicker`, both in `src/components/guided/`. Drafts live in the `reflectSessions` model under the reserved key `GUIDED_TOOL_ID` (`"guided"`), a saved problem carries the run as its `reflection` with that same `lensId` (choices saved as the chosen option's label), and `identifyOriginOf` recognises it as `{ tool: "guided" }`. Routes: `.../guided` (resume or the first question), `.../guided/questions/[n]` (1-based, an index into the resolved path; the layout clamps a number the path does not reach) and `.../guided/review`, built by `guided/routes.ts` and `projectRoutes.guided` / `guidedReview`. The shell reuses `LensStepper` with its `steps` and `progressLabel` props ("Question 3", or "Question 3 of 9" once both choices are made). Tests: `src/lib/guided-discovery.test.ts` runs every route in every voice and checks each has one anchor of its dimension, a problems column, no column asked twice and the expected wording.
* **Research** (`/projects/[projectId]/identify/research/`): a research-tool prompt flow. State lives in the `researchSessions` model. It still has its own pick-a-method step: `.../research` (pick a method), `.../research/[methodId]/tool`, `.../research/[methodId]/capture/[n]` (1-based) and `.../research/[methodId]/review`, with `research/routes.ts` (`researchHrefs(projectId)`), a client `research/layout.tsx` shell and `research-panels.tsx` playing the same roles as their guided-prompt counterparts. Capture and Review stay disabled in the stepper until a tool is chosen, but the URLs themselves are not gated.

The shared dimension type aliases stay at `src/app/(app)/problems/identify/data.ts` so existing imports under `@/app/(app)/problems/identify/data` continue to resolve. The same canvas / edit split applies to solutions: `/projects/[projectId]/solutions/[solutionId]/page.tsx` is the canvas, `.../edit/page.tsx` is the hub/edit view.

#### Identify solutions: `/projects/[projectId]/solutions/identify/<step>`

Single multi-step flow for the project's problem. The layout wraps children in `IdentifySolutionsProvider` (`solutions/identify/context.tsx`), which takes the problem from `useProjectScope`; `useIdentifySolutions()` exposes `projectId` for building step links (`getAdjacentSteps(pathname, projectId)`). Steps from `NAV_ITEMS`:

```
pick-method → discover → review
```

There is no "Select a Problem" step: the problem is the project's own. `/projects/[projectId]/solutions/identify` redirects to the first step. The provider otherwise reads/writes the per-problem `SolutionWorkspace`. Finish returns to the project page. The pick-method step is labelled "Pick a method", matching the Research stepper. Solution candidates accumulated in this flow are written via `dispatch.solutions.create({ problemId, workspaceId, ... })`. The drawer `solutions-drawer.tsx` lists candidates for the current workspace.

#### Solution validation: `/projects/[projectId]/solutions/[solutionId]/validate/<step>`

`solutionId` is numeric. Wraps children in `SolutionProvider` (`projectId` + `solutionId`; `useSolution()` exposes both, and `getAdjacentSteps(pathname, projectId, solutionId)` builds the step links). Steps:

```
introduction → feasibility → impact → cost → time-to-implement → verdict → review
```

The provider only sets fields on the `Solution` (1-5 metric scores, validation notes/status/reason); the linked `Problem` is read-only here. It is a focus flow rendered through `FlowShell`: Finish on the last steps returns to the project page, the step nav card carries reminders of the solution and its linked problem with View Solution and View Problem buttons, and the journey rail sits on "Validate solutions".

#### Compare solutions: `/projects/[projectId]/solutions/compare/<step>`

Reached from the "Compare solutions" button beside "Identify solutions" on a project page (`.../solutions/compare` redirects to the first step). A stepped focus flow rendered through `FlowShell` (`compare/layout.tsx`): because the flow is about every solution in the project rather than one there is no context card under the steps and no journey rail (`FlowShell` renders the rail only when `journeyStep` is passed). Steps from `compare/steps.ts` (`getAdjacentSteps(pathname, projectId)`):

```
introduction → rate → review
```

* `introduction`: what the section is for and how it works.
* `rate`: the hands-on step. A compact slider strip on a `bg-secondary-brand` panel asks how important each of the four validation metrics is (`Ignore` / `Nice to have` / `Important` / `Essential`, stored as 0 to 3 in the `solutionComparison` model); the table underneath, which gets most of the page, ranks the project's solutions by the weighted score those weights produce and re-orders live as they change. Cost and time to implement are inverted before weighting so a higher weighted score is always better. Against each ranked solution the user picks a traffic light (green pursue, amber consider, red park), saved as `Solution.trafficLight`.
* `review`: read-only. The chosen weights, then every solution grouped by light (green, amber, red, not rated yet) with its weighted score.

The project page's solutions table shows the light in a sortable "Score" column (green first, unscored last) and the canvas header shows it as a pill beside the status pill. Rules and tests: `src/lib/solution-comparison.ts`; the light components: `src/components/traffic-light.tsx`.

### Export and import

The unit of export is the **project**, and the unit of import is a **new project**. `src/lib/problem-export.ts` holds it all, with `problem-export.test.ts` covering the round trip.

* **What a bundle is.** `buildProjectBundle(state, projectId)` returns a `ProblemExportBundle` at `BUNDLE_VERSION` 3: the project (name, team, visibility, its guided prompt and Research drafts, its Canvas Builder draft and its comparison weights), the problem, every solution found for it, the `SolutionWorkspace`, the research capture, and the user-created dimension and self-discovery entries the problem refers to. Built-in catalogue slugs are left as they are; only `*-user-*` ids travel. `downloadProjectBundle(state, projectId)` is the one call every "Export project" button makes.
* **Import always creates a new project.** `importProblemBundle` never reuses an id from the file. It mints new catalogue ids first and remaps the problem's columns onto them, creates the project, restores the per-project slices under the new project id (`restoreProject` on each per-project model, built from `perProjectReducers`), then creates the problem into that project, its workspace, its research capture and its solutions. So importing the same file twice gives two independent projects, and importing your own export back gives you a copy rather than a merge. Two things are deliberately not faithful: an imported project is always **private** whatever the original was (sharing is the new owner's call), and a name that clashes with a project you already have is numbered by `uniqueProjectName` ("Rainy commutes (2)"), which is what `projects.create`'s `uniqueName` flag is for.
* **Backwards compatible.** v1 and v2 files (problem-centric, no project) still import: with no project in the file the new one is named after the problem. `parseProblemBundle` rejects anything that is not a Navigate bundle, or a version newer than this build.
* **Example projects.** `examples/*.navigate.json` are ready-made projects to import into an empty Navigate for a demo, a screenshot, a teaching session or a test of the preview page. They are generated by `scripts/make-example-projects.mjs` (`npm run examples`, or `npm run examples -- <dir>` to write elsewhere), which is where to add or edit one: each example is a compact spec and the script fills in the rest of the bundle shape. Keep the set varied in **state** as well as subject (one still being explored with no solutions, one left open as unsure, one correctly ruled out). Every id in a spec has to resolve against the catalogue it came from, because all of them fail quietly: a dimension id must be a real slug from `dimensionData.ts` or a `*-user-*` id the spec also declares, or it renders as "(deleted item)"; a lens and its prompt ids must come from `reflectLenses.ts` and a research method, tool and prompt ids from `researchMethods.ts`, or the journey rail falls back to the hub and revisiting the tool pre-fills blank. An example should also carry only the record the tool that saved it would have written: `problem.reflection` for a guided prompt tool, `researchCapture` for Research, neither for the Canvas Builder or Define, and no draft in `reflect` / `research` unless it is deliberately left mid-flow (saving clears the draft). `src/lib/example-projects.test.ts` imports every file and checks all of that, so a renamed id is caught rather than discovered in a demo.
* **Where it is offered.** `ProjectSettingsDialog` carries "Export this project" and "Import a project" for every project; Home carries the same pair in `BundleMenuButton` plus `ExportPickerDialog` for choosing which project; the problem canvas's actions menu and the problem edit page each export the project they are in. Exporting one **solution** on its own is a separate, narrower thing and keeps its `ExportBundleDialog` with the "include the problem" question.

### Public project preview

`/preview/[projectId]` is the one page in the app that a reader with no account and no licence can open: the project written out for somebody else to review. It replaced Portfolios, which packaged a single solution and was removed in September 2026 (recover it from git history if it is ever wanted back).

**In the UI it is called the portfolio**, never "the preview": the buttons read "Open portfolio", the setting reads "Share a public portfolio" and the page's own chrome says "Project portfolio, read only". The route, `previewHref` / `projectRoutes.preview` and everything else in code keep the `preview` name, so do not rename identifiers to match the label.

* **It is outside everything.** The route sits outside the `(app)` group, so it gets no header, no sidebar and no app chrome; `src/app/preview/layout.tsx` gives it only the store and tooltip providers. `/preview` is in `PUBLIC_PATHS` in `src/middleware.ts`, so the password gate never redirects it. Build the href with `projectRoutes.preview(projectId)` (`previewHref` in `src/lib/projects.ts`), never by hand.
* **It is discursive, not a canvas.** The reader has never used Navigate, so the page is prose with the structure underneath rather than the app's canvases: a heading with the team and how far they have got, a contents rail, then one section each for the problem, who has it, what those people are trying to get done, how they cope today, what solving it could be worth, the competition, what the team brings to it, the verdict, and every solution with how it was found and how it scored. TAM, SAM and SOM are never named: they read as "the total market", "the reachable market" and "a realistic share".
* **The sentences are pure and tested.** Everything that adapts to the data (counts as words, list joining, the market story, the score words, the verdict copy) lives in `src/lib/project-preview.ts` with `project-preview.test.ts` beside it; the page (`src/components/preview/project-preview.tsx`) only lays it out. Add wording there rather than inline, and reuse the app's own labels where they exist (the solution score words come from `metric-content.ts`, so the preview and the validation steps can never drift apart).
* **Sharing is a flag, not a copy.** The page always renders live from the store, so there is no snapshot to keep in step. `Project.visibility` decides who may read it: while it is `private` the page still renders for the team with a banner saying nobody else can open it yet, which is what makes "Open portfolio" useful before the link is given out. **Once projects live in a database, a private project simply must not be served to anyone outside its team**; the banner then becomes the team's own view of that. Until then every project is only in its own browser's storage, so a link opened on another device shows "This portfolio is not available".

### Other Routes

* `/`: Home, the list of projects (see "Layout & Navigation Patterns")
* `/preview/[projectId]`: The public, read-only preview of a project (see above). No login required
* `/projects/[projectId]`: The project page: its problem on the canvas and its solutions. Everything else about the project sits underneath it (see "Innovation Flows")
* `/problems`, `/solutions`, `/problems/[problemRef]`: Redirects only, kept for old links
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
