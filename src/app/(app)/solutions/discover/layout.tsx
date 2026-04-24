"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { DiscoveryProvider, useDiscovery, NAV_ITEMS } from "./context"
import {
  Lightbulb, BookOpen, Target, Search, Shuffle, LayoutTemplate,
  FileText, ChevronDown, Lock,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "select-problem": Target,
  "choose-refinement": Search,
  refine: Search,
  "choose-discovery": Shuffle,
  discover: Lightbulb,
  summary: LayoutTemplate,
}

const LOCKED_PATHS = new Set([
  "choose-refinement",
  "refine",
  "choose-discovery",
  "discover",
  "summary",
])

function NavItems({
  pathname,
  problemSelected,
  onNavigate,
}: {
  pathname: string
  problemSelected: boolean
  onNavigate: (path: string) => void
}) {
  return (
    <ul className="flex flex-col gap-1 list-none m-0 p-0" role="list">
      {NAV_ITEMS.map((item) => {
        const href = `/solutions/discover/${item.path}`
        const isActive = pathname === href
        const Icon = NAV_ICONS[item.path] ?? FileText
        const locked = LOCKED_PATHS.has(item.path) && !problemSelected
        return (
          <li key={item.path}>
            {item.section && (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 pt-3 pb-1">
                {item.section}
              </p>
            )}
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 ${isActive ? "text-primary" : ""}`}
              onClick={() => onNavigate(href)}
              disabled={locked}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={locked}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : ""}`} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />}
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemId } = useDiscovery()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const isWide = useContainerSize() === "wide"
  const problemSelected = problemId != null

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeItem = NAV_ITEMS.find((item) => pathname === `/solutions/discover/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : BookOpen

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className="flex flex-col gap-6 flex-1 w-full">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary shrink-0">
          <Lightbulb className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Solution Discovery</h1>
          <p className="text-sm text-muted-foreground">
            Pick a problem, refine it, and discover solution candidates.
          </p>
        </div>
      </div>

      {!isWide && (
      <nav aria-label="Solution discovery steps" className="w-full">
        <Collapsible open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <Card>
            <CardContent className="p-2">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-auto py-2 px-3"
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <ActiveIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {activeItem?.label ?? "Navigation"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      mobileNavOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1">
                <NavItems pathname={pathname} problemSelected={problemSelected} onNavigate={handleNavigate} />
              </CollapsibleContent>
            </CardContent>
          </Card>
        </Collapsible>
      </nav>
      )}

      <div className="flex gap-6 flex-1 w-full items-start">
        {isWide && (
        <nav aria-label="Solution discovery steps" className="flex w-56 flex-col gap-3 shrink-0">
          <Card>
            <CardContent className="p-3">
              <NavItems pathname={pathname} problemSelected={problemSelected} onNavigate={handleNavigate} />
            </CardContent>
          </Card>
        </nav>
        )}

        <div className="flex-1 min-w-0">{mounted ? children : null}</div>
      </div>
    </div>
  )
}

export default function DiscoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <DiscoveryProvider>
      <LayoutContent>{children}</LayoutContent>
    </DiscoveryProvider>
  )
}
