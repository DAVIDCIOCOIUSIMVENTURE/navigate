"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchSolutionDialog } from "@/components/search-solution-dialog"
import { SolutionsTable } from "@/components/solutions-table"
import { Plus, Lightbulb, Target, Sparkles, ShieldCheck } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function SolutionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const isWide = useContainerSize() === "wide"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card>
        <CardContent className="py-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 min-w-[16rem] text-base leading-relaxed">
              This is your <span className="font-bold">solution library</span>, a central place to collect, refine, and track the solutions you&apos;ve identified.
              The goal of this section is to generate solution candidates for a validated problem, then pressure-test each one before committing. A good solution is feasible to build, has real impact for the customer, and is worth the cost and time it takes.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Identify solutions
            </Button>
          </div>
          <div className={cn("grid gap-4 pt-3 border-t", isWide ? "grid-cols-3" : "grid-cols-1")}>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                <Target className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold">1. Pick a problem</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  Choose a validated problem from your library to anchor the work. Everything you discover here will be tied back to it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold">2. Discover candidates</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  Use guided tools (analogy, SCAMPER, reverse brainstorm, root-cause attacks) to generate solution ideas instead of jumping to the first one.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold">3. Validate</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  Score each candidate on feasibility, impact, cost, and time to implement, then decide which one is worth pursuing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!mounted || solutions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
            <Lightbulb className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No solutions yet</h2>
            <p className="text-sm text-muted-foreground">
              Start by searching for a solution. Pick a validated problem and work through the discovery wizard.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Identify solutions
          </Button>
        </div>
      ) : (
        <SolutionsTable solutions={solutions} className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")} />
      )}

      <SearchSolutionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
