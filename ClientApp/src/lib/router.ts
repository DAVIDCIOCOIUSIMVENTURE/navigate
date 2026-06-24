/**
 * Router compatibility shim.
 *
 * Provides the small slice of the Next.js `next/navigation` client API that the
 * app relied on, backed by React Router. Keeping the same function names and
 * shapes means feature components only changed their import source, not their
 * call sites (`router.push(...)`, `usePathname()`, `params.problemRef`, ...).
 */

import { useMemo } from "react"
import {
  useNavigate,
  useLocation,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
} from "react-router-dom"

export interface AppRouter {
  push: (href: string) => void
  replace: (href: string) => void
  back: () => void
  forward: () => void
  /** No-op: there is no server cache to revalidate in the SPA. */
  refresh: () => void
  /** No-op: React Router has no prefetch concept here. */
  prefetch: (href: string) => void
}

export function useRouter(): AppRouter {
  const navigate = useNavigate()
  return useMemo(
    () => ({
      push: (href: string) => navigate(href),
      replace: (href: string) => navigate(href, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => {},
      prefetch: () => {},
    }),
    [navigate],
  )
}

export function usePathname(): string {
  return useLocation().pathname
}

/**
 * Mirrors Next's `useParams<T>()`, whose values were non-optional strings.
 * React Router types params as possibly-undefined; we cast to match the call
 * sites that were written against Next.
 */
export function useParams<
  T extends Record<string, string> = Record<string, string>,
>(): T {
  return useRouterParams() as unknown as T
}

/** Mirrors Next's read-only `useSearchParams()` by returning just the params. */
export function useSearchParams(): URLSearchParams {
  return useRouterSearchParams()[0]
}

/** Thrown by `notFound()`, caught by the route error boundary in routes.tsx. */
export class NotFoundError extends Error {
  constructor() {
    super("NOT_FOUND")
    this.name = "NotFoundError"
  }
}

export function notFound(): never {
  throw new NotFoundError()
}
