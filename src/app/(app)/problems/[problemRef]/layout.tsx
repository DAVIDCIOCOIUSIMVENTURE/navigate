"use client"

import { useState } from "react"
import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ProblemValidationProvider, useProblemValidation, NAV_ITEMS } from "./context"
import {
  GitFork, Clock, ShieldCheck, FileText, LayoutTemplate, BookOpen, Users, ChevronDown, ArrowRight,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "customer": Users,
  "existing-solutions": GitFork,
  "context-step": Clock,
  validate: ShieldCheck,
  "problem-statement": LayoutTemplate,
  "next-steps": ArrowRight,
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
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 ${isActive ? "text-primary" : ""}`}
              onClick={() => onNavigate(href)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : ""}`} aria-hidden="true" />
              {item.label}
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
  const { problemRef } = useProblemValidation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const base = `/problems/${problemRef}`

  const activeItem = NAV_ITEMS.find((item) => pathname === `${base}/${item.path}`)
  const ActiveIcon = activeItem ? (NAV_ICONS[activeItem.path] ?? FileText) : BookOpen

  const handleNavigate = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  return (
    <div className="flex flex-col gap-6 flex-1 w-full">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary shrink-0">
          <ShieldCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Problem Validation</h1>
          <p className="text-sm text-muted-foreground">
            Validate that the problems you&apos;ve identified are real, painful, and worth solving.
          </p>
        </div>
      </div>

    {/* Mobile: collapsible top bar */}
    <nav aria-label="Problem validation steps" className="lg:hidden w-full">
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
              <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>
    </nav>

    <div className="flex gap-6 flex-1 w-full items-start">
      {/* Desktop: sidebar */}
      <nav aria-label="Problem validation steps" className="hidden lg:flex w-56 flex-col gap-3 shrink-0">
        <Card>
          <CardContent className="p-3">
            <NavItems base={base} pathname={pathname} onNavigate={handleNavigate} />
          </CardContent>
        </Card>
      </nav>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
    </div>
  )
}

export default function ProblemRefLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemValidationProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemValidationProvider>
  )
}
