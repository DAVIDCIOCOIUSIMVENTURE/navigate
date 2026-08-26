"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChevronRight,
  Lightbulb,
  Target,
  Compass,
  BookOpen,
  Plus,
} from "lucide-react"
import { useRouter } from "@/lib/router"
import { ProblemsTable } from "@/components/problems-table"
import { SolutionsTable } from "@/components/solutions-table"
import Link from "@/components/link"
import { useState } from "react"
import { useSelector } from "react-redux"

import type { RootState } from "@/store"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const [view, setView] = useState<"problems" | "solutions">("problems")

  const isWide = useContainerSize() === "wide"

  return (
    <div className={cn("flex flex-col gap-4 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      {/* Row 1: Foundations + Self Discovery prompts */}
      <div className={cn("flex gap-3 shrink-0", isWide ? "flex-row items-stretch" : "flex-col items-stretch")}>
        <Link href="/foundations" className="flex-1 min-w-0 flex">
          <Card className="hover:shadow-md transition-shadow w-full bg-primary text-primary-foreground border-primary">
            <CardContent className="p-4 h-full flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <p className="text-base font-semibold">New here? Start with Why It Matters</p>
                </div>
                <p className="text-base mt-2">Optional reading on why validating ideas, problems, and solutions is worth the time.</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/self-discovery" className="flex-1 min-w-0 flex">
          <Card className="hover:shadow-md transition-shadow w-full">
            <CardContent className="p-4 h-full flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-tertiary shrink-0" />
                  <p className="text-base font-semibold">Explore Self Discovery</p>
                </div>
                <p className="text-base mt-2">Surface interests, skills, and experiences that point you toward problems worth solving.</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Row 2: toggleable problems / solutions table */}
      <div className="flex flex-1 min-h-0 flex-col">
        {(() => {
          const tableClassName = cn(isWide ? "flex-1 min-h-0 min-w-0" : "min-h-[320px] max-h-[640px]")
          const viewToggle = (
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => {
                if (value === "problems" || value === "solutions") setView(value)
              }}
              size="sm"
              className="shrink-0 bg-card border-border divide-x divide-border"
            >
              <ToggleGroupItem
                value="problems"
                aria-label="Show problems"
                className="gap-1.5 px-3 rounded-none bg-card data-[state=on]:bg-secondary-brand data-[state=on]:text-secondary-brand-foreground"
              >
                <Target className="h-3.5 w-3.5" />
                <span>Problems</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="solutions"
                aria-label="Show solutions"
                className="gap-1.5 px-3 rounded-none bg-card data-[state=on]:bg-secondary-brand data-[state=on]:text-secondary-brand-foreground"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Solutions</span>
              </ToggleGroupItem>
            </ToggleGroup>
          )
          const identifyButtons = (
            <>
              <Button onClick={() => router.push("/problems/identify")} className="gap-2">
                <Plus className="h-4 w-4" />
                Identify new problems
              </Button>
              <Button onClick={() => router.push("/solutions/identify")} className="gap-2">
                <Plus className="h-4 w-4" />
                Identify new solutions
              </Button>
            </>
          )
          return view === "problems" ? (
            <ProblemsTable
              problems={problems}
              showStatus
              showEditDelete
              showSource={false}
              className={tableClassName}
              headerLead={viewToggle}
              headerExtra={identifyButtons}
            />
          ) : (
            <SolutionsTable
              solutions={solutions}
              showStatus
              showEditDelete
              className={tableClassName}
              headerLead={viewToggle}
              headerExtra={identifyButtons}
            />
          )
        })()}
      </div>

    </div>
  )
}
