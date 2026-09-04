"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "@/lib/router"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProblemHubDialog } from "@/components/problem-hub/problem-hub-dialog"
import { ProblemProvider, useProblem, NAV_ITEMS } from "./context"
import {
  GitFork, Compass, FileText, LayoutTemplate, Users, ChevronDown, Eye, Search, Sparkles,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { NAV_ITEM_ACTIVE_CLASS } from "@/lib/nav-item-styles"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: Compass,
  customer: Users,
  "choose-refinement": Search,
  refine: Search,
  "existing-solutions": GitFork,
  "jobs-to-be-done": Sparkles,
  summary: LayoutTemplate,
}

function NavItems({
  base,
  pathname,
  onNavigate,
}: {
  base: string
  pathname: string
  onNavigate: (path: string) => void
}) {
  return (
    <ul className="flex flex-col gap-1 list-none m-0 p-0" role="list">
      {NAV_ITEMS.map((item) => {
        const href = `${base}/${item.path}`
        const isActive = pathname === href
        const Icon = NAV_ICONS[item.path] ?? FileText
        return (
          <li key={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2",
                isActive && NAV_ITEM_ACTIVE_CLASS,
              )}
              onClick={() => onNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                  isActive ? "bg-tertiary" : "bg-tertiary/10",
                )}
              >
                <Icon
                  className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-tertiary")}
                  aria-hidden="true"
                />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          </li>
        )
      })}
    </ul>
  )
}

function ViewProblemButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="w-full gap-2" onClick={onClick}>
      <Eye className="h-3.5 w-3.5" />
      View Problem
    </Button>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isWide = useContainerSize() === "wide"

  const base = `/problems/${problemRef}/explore`

  const activeItem = NAV_ITEMS.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : Compass

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className={cn("flex flex-col gap-3 flex-1 w-full min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
    {!isWide && (
    <nav aria-label="Explore the problem steps" className="w-full">
      <DropdownMenu open={mobileNavOpen} onOpenChange={setMobileNavOpen} modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-2 px-3 bg-white"
          >
            <span className="flex items-center gap-2 text-sm font-medium min-w-0">
              <span className="flex items-center justify-center w-6 h-6 rounded-md shrink-0 bg-tertiary">
                <ActiveIcon className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              </span>
              <span className="truncate">{activeItem?.label ?? "Navigation"}</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                mobileNavOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[16rem] p-1 bg-white"
        >
          {NAV_ITEMS.map((item) => {
            const href = `${base}/${item.path}`
            const isActive = pathname === href
            const Icon = NAV_ICONS[item.path] ?? FileText
            return (
              <DropdownMenuItem
                key={item.path}
                onSelect={() => handleNavigate(href)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 py-2 px-3 text-sm",
                  isActive && cn(NAV_ITEM_ACTIVE_CLASS, "focus:bg-secondary-brand/10 focus:text-secondary-brand")
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-md shrink-0",
                    isActive ? "bg-tertiary" : "bg-tertiary/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-white" : "text-tertiary"
                    )}
                    aria-hidden="true"
                  />
                </span>
                <span className="flex-1 text-left whitespace-normal">
                  {item.label}
                </span>
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              setMobileNavOpen(false)
              setDialogOpen(true)
            }}
            className="flex items-center gap-2 py-2 px-3 text-sm"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>View Problem</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
    )}

    <div className={cn("flex gap-6 flex-1 w-full min-h-0", isWide ? "items-stretch" : "items-start")}>
      {isWide && (
      <nav aria-label="Explore the problem steps" className="flex w-56 flex-col gap-3 shrink-0 min-h-0">
        <Card className="flex flex-col min-h-0 flex-1">
          <CardContent className="p-3 flex flex-col min-h-0 flex-1">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
            </div>
            <div className="border-t mt-2 pt-2 shrink-0">
              <ViewProblemButton onClick={() => setDialogOpen(true)} />
            </div>
          </CardContent>
        </Card>
      </nav>
      )}

      <div className={cn("flex-1 min-w-0 flex flex-col", isWide && "min-h-0 overflow-y-auto")}>{children}</div>
    </div>

    <ProblemHubDialog open={dialogOpen} onOpenChange={setDialogOpen} problemRef={problemRef} />
    </div>
  )
}

export default function ProblemExploreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemProvider>
  )
}
