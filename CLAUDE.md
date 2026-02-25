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
```

There is no test suite configured.

## Architecture

**Navigate** is a Next.js 15 (App Router) application guiding users through an innovation process: Self-Discovery → Problem Triggers → Problem Discovery → Solution Ideation/Validation.

### Stack
- **Framework**: Next.js 15 with App Router, React 19
- **Database**: PostgreSQL via Prisma ORM (local on port 5434, database `navigate`)
- **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
- **State**: Rematch (Redux wrapper) — `@rematch/core` + `react-redux`
- **Drag & Drop**: `@dnd-kit` for sortable bucket organization
- **Tables**: `@tanstack/react-table`
- **Notifications**: `sonner`

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Project Structure

- `src/app/api/` — CRUD API routes (`.js` files) for domain entities: `problemTriggers`, `problemTriggerBuckets`, `selfDiscoveryQuestionCategories`, `selfDiscoveryQuestions`
- `src/lib/` — Core utilities: `prisma.ts` (singleton client), `config.ts` (app-wide constants including `CURRENT_USER_ID`)
- `src/config/navigation.ts` — Centralized nav items (title, url, icon) used by sidebar, dashboard, and breadcrumbs
- `src/lib/discoveryMethods.ts` — Three problem discovery methods with hrefs and metadata
- `src/components/ui/` — Shared Radix UI-based primitives
- `src/store/` — Global Rematch store (models: `settings`, `journal`)
- `prisma/schema.prisma` — Database schema
- `locales/` — i18n translations (en, es, fr) via `next-i18next`; infrastructure exists but not heavily used

### State Management

Two separate Rematch store instances coexist:

**Global store** (`src/store/`): App-wide UI state.
- `settings` model — sidebar collapsed/expanded, persisted to localStorage
- `journal` model — journal entry (title, text, open state) with async effects for load/save

**Feature-scoped stores**: Complex isolated workflows get their own store, set up in the feature's `layout.tsx` as a nested provider. Example: `src/app/problem-discovery/find-new-problems/finding-my-customers/store/` manages the customer profiling multi-step flow (customer profile, age range, jobs-to-be-done, problems, solutions) with 20+ pure reducers and no effects.

Access pattern: `useSelector((state: RootState) => state.modelName.field)` and `useDispatch<AppDispatch>()`.

### API Route Pattern

All routes live at `src/app/api/[entity]/route.js`. They:
- Import the Prisma singleton from `@/lib/prisma`
- Filter by `userId` query param (always `CURRENT_USER_ID` from config)
- Return `NextResponse.json()` with try/catch error handling
- Convert IDs to strings for consistency

### Single-User Mode

All user-scoped data uses `CURRENT_USER_ID` from `src/lib/config.ts`. This ID must match the user created by `npm run seed` (upserts `david@simventure.co.uk`). **After seeding a fresh database**, run the app once, get the generated user ID from the DB, then update `config.ts`.

### Layout & Navigation Patterns

- `src/app/root-layout-client.tsx` — Client layout wrapper with the global sidebar (`app-sidebar.tsx`), breadcrumbs (auto-generated from pathname), and the guidance dialog
- Feature sub-flows use nested layouts with their own sidebar nav (e.g., `finding-my-customers/layout.tsx` renders a step-by-step nav from a local `NAV_ITEMS` array)
- Breadcrumbs are auto-generated: kebab-case path segments become Title Case; intermediate segments are non-clickable

### Known Inconsistencies / Work In Progress

- **External service**: `src/app/problem-discovery/page.tsx` fetches from `localhost:3001` (an external JSON server) instead of the app's own `/api` routes. This is intentional for that page's current state.
- **Fallback data**: Several pages show placeholder/demo data when the DB returns empty results.
- **i18n**: Translation infrastructure is wired but pages mostly use static strings.
- **No auth**: No middleware, sessions, or role-based access. Multi-user support is not yet implemented.
