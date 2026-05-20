"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchSolutionDialog } from "@/components/search-solution-dialog"
import { SolutionsTable } from "@/components/solutions-table"
import { Plus, Lightbulb } from "lucide-react"
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
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 min-w-[16rem] text-base leading-relaxed">
              This is your <span className="font-bold">solution library</span>, a central place to collect, refine, and track the solutions you&apos;ve identified.
              The workflow has three steps. <span className="font-bold">Pick a problem</span> from your validated library to anchor the work.
              Then <span className="font-bold">discover candidates</span> using guided tools (analogy, SCAMPER, reverse ideation, root-cause attacks) instead of jumping to the first idea.
              Finally, <span className="font-bold">validate</span> each candidate by scoring it on feasibility, impact, cost, and time to implement, so you can decide which one is worth pursuing.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Identify solutions
            </Button>
          </div>
        </CardContent>
      </Card>

      {!mounted || solutions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-brand">
            <Lightbulb className="h-8 w-8 text-secondary-brand-foreground" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No solutions yet</h2>
            <p className="text-sm">
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
