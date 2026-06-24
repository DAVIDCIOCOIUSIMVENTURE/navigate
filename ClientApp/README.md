# Navigate: React + Vite frontend

This is the Navigate UI extracted from the original Next.js app into a standalone **React 19 + Vite + TypeScript** single-page application, ready to drop into an ASP.NET Core Web API project (e.g. as the `ClientApp` of a hosted SPA, or built and served as static files).

All application logic, components, Tailwind theme, Rematch store, and Vitest tests are unchanged from the original. Only the framework layer (routing, build, server bits) was swapped.

> Note: `CLAUDE.md` in this folder describes the original Next.js architecture and the project's writing/theme conventions. The conventions still apply; for the build/routing setup, this README is the source of truth.

## Commands

```shell
npm install           # install dependencies
npm run dev           # Vite dev server on http://localhost:4000
npm run build         # type-check (tsc -b) + production build to dist/
npm run preview       # preview the production build
npm run lint          # ESLint (flat config)
npm run test          # Vitest (watch)
npm run test:run      # Vitest (once)
npx tsc --noEmit      # type-check only
```

## What changed from the Next.js version

| Area | Next.js (before) | Vite (now) |
| ---- | ---------------- | ---------- |
| Build / dev | `next dev` / `next build` (Turbopack) | Vite 7 |
| Routing | File-based App Router (`src/app/**/page.tsx`) | React Router v7, declared in `src/routes.tsx` |
| Navigation API | `next/navigation`, `next/link` | shims in `src/lib/router.ts` and `src/components/link.tsx` |
| Entry / HTML shell | `src/app/layout.tsx` + `head.tsx` | `index.html` + `src/main.tsx` |
| Font | `next/font/google` (Nunito) | Google Fonts `<link>` in `index.html` + `body` rule in `globals.css` |
| Auth | login page + `middleware.ts` + `/api/auth/*` | **removed** (the C# backend owns auth) |
| Database | Prisma (already unused) | **removed** |

### Routing

The on-disk folder structure under `src/app/(app)/...` is **kept exactly as it was** so all relative imports between pages, contexts, and data modules keep resolving. `src/routes.tsx` is the single place that maps URLs to those page modules:

- Each Next dynamic segment `[param]` is a React Router `:param`.
- Each `layout.tsx` is a layout route rendering `<TheLayout><Outlet/></TheLayout>`.
- `notFound()` (from the router shim) throws and is caught by `src/components/route-error-boundary.tsx`, which renders `src/app/(app)/not-found.tsx`. A catch-all `*` route renders the same page for unknown URLs.

### The compatibility shims

To avoid rewriting ~80 feature files, two local modules reproduce the small slice of the Next API the app used:

- `src/lib/router.ts`: `useRouter()` (`push`/`replace`/`back`/`forward`/`refresh`/`prefetch`), `usePathname()`, `useParams`, `useSearchParams()`, and `notFound()`, all backed by React Router.
- `src/components/link.tsx`: a `Link` that maps `href` to React Router's `to`.

Call sites (`router.push(...)`, `usePathname()`, `<Link href=...>`) are unchanged. The `"use client"` directives left at the top of files are inert no-ops under Vite and can be removed at leisure.

## Integrating with ASP.NET Core

- **Auth was intentionally dropped.** Wire the C# backend (e.g. ASP.NET Core Identity + OIDC) and add a client guard / login UI against your API. State (Rematch models) persists to `localStorage`; there is no client gate.
- **Talking to the API.** Add a Vite dev proxy in `vite.config.ts` (so `/api` calls hit the C# dev server during `npm run dev`), or read a base URL from `import.meta.env.VITE_API_BASE`. Vite only exposes env vars prefixed with `VITE_`.
- **Production.** `npm run build` emits static assets to `dist/`. Serve them from ASP.NET Core (static files + SPA fallback to `index.html` so client-side routes resolve on refresh).

## State

All app state is client-side (Rematch + `localStorage`), exactly as before. Models live in `src/store/` and hydrate on mount via `src/app/root-layout-client.tsx`. See `CLAUDE.md` for the model/localStorage-key reference.
