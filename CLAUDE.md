# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server on port 4000
npm run build            # Build for production
npm run lint             # Run ESLint
npm run seed             # Seed the database (prisma db seed)
npm run db:migrate       # Run database migrations (alias for prisma migrate dev)
npx prisma studio        # Open Prisma Studio UI

# Test database (uses .env.test)
npm run db:migrate:test  # Run migrations on test DB
npm run db:seed:test     # Seed test DB
npm run db:studio:test   # Inspect test DB
```

There is no test suite configured.

## Architecture

**Navigate** is a Next.js 15 (App Router) application guiding users through an innovation process: Self-Discovery → Problem Triggers → Problem Discovery → Solution Ideation/Validation.

### Stack
- **Framework**: Next.js 15 with App Router, React 19
- **Database**: PostgreSQL via Prisma ORM (local on port 5434, database `navigate`)
- **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
- **State**: Rematch (Redux wrapper) — `@rematch/core` + `react-redux`; React Context for lighter feature workflows
- **Drag & Drop**: `@dnd-kit` for sortable bucket organization
- **Tables**: `@tanstack/react-table`
- **Notifications**: `sonner`
- **NLP/Parsing**: `compromise` + `js-yaml` (added for future problem parsing features)

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Project Structure

- `src/app/api/` — CRUD API routes (`.js` files) for domain entities: `problemTriggers`, `problemTriggerBuckets`, `selfDiscoveryQuestionCategories`, `selfDiscoveryQuestions`
- `src/lib/` — Core utilities: `prisma.ts` (singleton client), `config.ts` (app-wide constants including `CURRENT_USER_ID`)
- `src/config/navigation.ts` — Centralized top-level nav items (title, url, icon) used by sidebar, dashboard, and breadcrumbs
- `src/lib/discoveryMethods.ts` — Three problem discovery methods with hrefs and metadata (only "Finding My Customers" is implemented; others are `href: null`)
- `src/components/ui/` — Shared Radix UI-based primitives
- `src/store/` — Global Rematch store (models: `settings`, `journal`)
- `prisma/schema.prisma` — Database schema (User, ProblemTrigger, ProblemTriggersBucket, SelfDiscoveryQuestion/Category)
- `locales/` — i18n translations (en, es, fr) via `next-i18next`; infrastructure exists but not heavily used

### Problem Discovery Routes

```
/problem-discovery                          # Problem Statement Canvas (client-state only)
/problem-discovery/find-new-problems        # Discovery method selector
/problem-discovery/find-new-problems/finding-my-customers  # 4-step Rematch workflow
/problem-discovery/guided-workflow          # 11-step Context workflow
/problem-discovery/bucket/[id]              # Bucket detail view
```

### State Management

Two patterns coexist — choose based on complexity:

**Rematch (Redux)** — use for complex state with side effects or localStorage persistence:
- **Global store** (`src/store/`): `settings` (sidebar collapsed/expanded, persisted to localStorage), `journal` (title, text, open state with async load/save effects)
- **Feature-scoped stores**: Set up in the feature's `layout.tsx` as a nested provider. Example: `src/app/problem-discovery/find-new-problems/finding-my-customers/store/` has a single model with 20+ pure reducers managing customer profile, age range, jobs-to-be-done (with nested items/children), problems, and solutions
- Access: `useSelector((state: RootState) => state.modelName.field)` and `useDispatch<AppDispatch>()`

**React Context** — use for lighter, page-scoped multi-step forms without side effects:
- **Guided Workflow**: `src/app/problem-discovery/guided-workflow/context.tsx` — exports `WorkflowProvider` and `useWorkflow()` hook; manages the 11-step workflow state (customer fields, jobs, problems, alternatives, impacts) with pure setter functions and `getAdjacentSteps()` navigation helper
- Provider wraps the route tree in the feature's `layout.tsx`

### API Route Pattern

All routes live at `src/app/api/[entity]/route.js`. They:
- Import the Prisma singleton from `@/lib/prisma`
- Filter by `userId` query param (always `CURRENT_USER_ID` from config)
- Return `NextResponse.json()` with try/catch error handling
- Convert IDs to strings for consistency

**Database-backed pages**: Self-Discovery questions/categories, Problem Triggers, Buckets
**Client-state only (not yet persisted)**: Problem Statement Canvas (`/problem-discovery`), Guided Workflow (`/problem-discovery/guided-workflow`)

### Single-User Mode

All user-scoped data uses `CURRENT_USER_ID` from `src/lib/config.ts`. This ID must match the user created by `npm run seed` (upserts `david@simventure.co.uk`). **After seeding a fresh database**, run the app once, get the generated user ID from the DB, then update `config.ts`.

### Layout & Navigation Patterns

- `src/app/root-layout-client.tsx` — Client layout wrapper with the global sidebar (`app-sidebar.tsx`), breadcrumbs (auto-generated from pathname), and the guidance dialog
- Feature sub-flows use nested layouts with their own sidebar nav defined locally as `NAV_ITEMS` arrays (e.g., `finding-my-customers/layout.tsx` has 4 steps; `guided-workflow/layout.tsx` uses `NAV_ITEMS` from `context.tsx` with 11 steps)
- Breadcrumbs are auto-generated: kebab-case path segments become Title Case; intermediate segments are non-clickable

### Known Inconsistencies / Work In Progress

- **External service**: `src/app/problem-discovery/page.tsx` fetches from `localhost:3001` (an external JSON server) instead of the app's own `/api` routes. This is intentional for that page's current state.
- **Fallback data**: The dashboard (`src/app/page.tsx`) shows hardcoded stats (triggers, buckets, problems, solutions) rather than live DB counts.
- **i18n**: Translation infrastructure is wired but pages mostly use static strings.
- **No auth**: No middleware, sessions, or role-based access. Multi-user support is not yet implemented.
