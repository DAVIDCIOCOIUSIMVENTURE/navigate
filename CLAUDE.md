# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 4000
npm run build     # Build for production
npm run lint      # Run ESLint
npm run seed      # Seed the database (prisma db seed)
npx prisma migrate dev  # Run database migrations
npx prisma studio       # Open Prisma Studio UI
```

There is no test suite configured.

## Architecture

**Navigate** is a Next.js 15 (App Router) application for guiding users through an innovation/problem-solving process: Self-Discovery → Problem Triggers → Problem Discovery → Solution Ideation/Validation.

### Stack
- **Framework**: Next.js 15 with App Router, React 19
- **Database**: PostgreSQL via Prisma ORM (local on port 5434, database `navigate`)
- **UI**: Radix UI primitives + Tailwind CSS; custom components in `src/components/ui/`
- **Drag & Drop**: `@dnd-kit` for sortable bucket organization

### Project Structure

- `src/app/api/` — CRUD API routes for domain entities (problemTriggers, problemTriggerBuckets, selfDiscoveryQuestions, etc.)
- `src/lib/` — Core utilities: `prisma.ts` (singleton client), `config.ts` (app-wide constants including `CURRENT_USER_ID`)
- `src/components/ui/` — Shared Radix UI-based components
- `prisma/schema.prisma` — Database schema
- `locales/` — i18n translations (en, es, fr)

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json`).

### Known Inconsistencies / Work In Progress

- **External service**: `src/app/problem-discovery/page.tsx` fetches from `localhost:3001` (an external JSON server) instead of the app's own `/api` routes. This is intentional for that page's current state.
- **Single-user mode**: All user-scoped data uses `CURRENT_USER_ID` from `src/lib/config.ts`. This ID must match the user created by `npm run seed` (upserts `david@simventure.co.uk`). After seeding a fresh database, run the app once to get the generated ID from the DB, then update `config.ts`.
