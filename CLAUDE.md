# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server on port 4000
npm run build            # Build for production
npm run lint             # Run ESLint
```

There is no test suite configured.

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

### Known Inconsistencies / Work In Progress

- **Prisma leftovers**: `@prisma/client`, `prisma`, and related scripts remain in `package.json` but the database is not used. They can be removed once there's confidence no DB will be re-introduced soon.
- **i18n**: Translation infrastructure is wired but pages mostly use static strings.
- **No multi-user auth**: The password gate is a single shared password for all users. No per-user sessions or roles.
