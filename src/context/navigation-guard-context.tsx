"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type GuardEntry = { when: boolean; message?: string }

const DEFAULT_MESSAGE =
  "You have unsaved progress. If you leave this page your work will be lost. Save your solution first to keep it."

type NavigationGuardContextValue = {
  register: (id: string, entry: GuardEntry) => void
  unregister: (id: string) => void
  // Gate an arbitrary action through any active guard. If no guard is active,
  // the action runs immediately. Otherwise the confirm dialog is shown and the
  // action runs only if the user confirms.
  attempt: (run: () => void) => void
}

const NavigationGuardContext = createContext<NavigationGuardContextValue | null>(null)

function useNavigationGuard(): NavigationGuardContextValue {
  const ctx = useContext(NavigationGuardContext)
  if (!ctx) throw new Error("useNavigationGuard must be used within NavigationGuardProvider")
  return ctx
}

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [guards, setGuards] = useState<Record<string, GuardEntry>>({})
  const [pending, setPending] = useState<{ run: () => void } | null>(null)

  const guardsRef = useRef(guards)
  guardsRef.current = guards

  const activeGuard = useMemo(
    () => Object.values(guards).find((g) => g.when),
    [guards]
  )
  const isBlocked = activeGuard !== undefined
  const message = activeGuard?.message ?? DEFAULT_MESSAGE

  const register = useCallback((id: string, entry: GuardEntry) => {
    setGuards((prev) => {
      const existing = prev[id]
      if (existing && existing.when === entry.when && existing.message === entry.message) {
        return prev
      }
      return { ...prev, [id]: entry }
    })
  }, [])

  const unregister = useCallback((id: string) => {
    setGuards((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const attempt = useCallback((run: () => void) => {
    const blocked = Object.values(guardsRef.current).some((g) => g.when)
    if (!blocked) {
      run()
      return
    }
    setPending({ run })
  }, [])

  // Browser-level nav: tab close, refresh, address-bar URL changes.
  useEffect(() => {
    if (!isBlocked) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isBlocked])

  // In-app nav: catch <Link> / <a> clicks at the capture phase before Next.js
  // fires its own navigation. We only intercept plain primary-button left
  // clicks for same-origin links; modifier-clicks (new tab) and externals are
  // covered by beforeunload.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!Object.values(guardsRef.current).some((g) => g.when)) return
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (e.defaultPrevented) return
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (!anchor) return
      if (anchor.target && anchor.target !== "_self") return
      if (anchor.hasAttribute("download")) return
      const href = anchor.getAttribute("href")
      if (!href) return
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) return

      e.preventDefault()
      e.stopPropagation()
      const path = url.pathname + url.search + url.hash
      setPending({ run: () => router.push(path) })
    }
    document.addEventListener("click", handler, true)
    return () => document.removeEventListener("click", handler, true)
  }, [router])

  const value = useMemo<NavigationGuardContextValue>(
    () => ({ register, unregister, attempt }),
    [register, unregister, attempt]
  )

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}
      <Dialog open={pending !== null} onOpenChange={(open) => { if (!open) setPending(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsaved progress</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setPending(null)}>
              Stay on this page
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                const fn = pending?.run
                setPending(null)
                fn?.()
              }}
            >
              Leave anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </NavigationGuardContext.Provider>
  )
}

export function useUnsavedChanges({
  when,
  message,
}: {
  when: boolean
  message?: string
}) {
  const ctx = useNavigationGuard()
  const id = useId()
  useEffect(() => {
    ctx.register(id, { when, message })
    return () => ctx.unregister(id)
  }, [ctx, id, when, message])
}

type GuardedRouter = {
  push: (href: string) => void
  replace: (href: string) => void
  back: () => void
  forward: () => void
  refresh: () => void
}

export function useGuardedRouter(): GuardedRouter {
  const ctx = useNavigationGuard()
  const router = useRouter()
  return useMemo(
    () => ({
      push: (href) => ctx.attempt(() => router.push(href)),
      replace: (href) => ctx.attempt(() => router.replace(href)),
      back: () => ctx.attempt(() => router.back()),
      forward: () => ctx.attempt(() => router.forward()),
      refresh: () => router.refresh(),
    }),
    [ctx, router]
  )
}
