"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { SearchSolutionDialog } from "@/components/search-solution-dialog"
import { SolutionsTable } from "@/components/solutions-table"
import { Plus, Lightbulb } from "lucide-react"

export default function SolutionsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary shrink-0">
            <Lightbulb className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Solutions</h1>
            <p className="text-sm text-muted-foreground">
              Discover and validate solutions worth pursuing.
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Search for new solution
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          This is your <span className="font-medium text-foreground">solution library</span>, a central place to collect, refine, and track the solutions you&apos;ve identified.
          Use the <span className="font-medium text-foreground">Search for new solution</span> button to pick a validated problem and generate candidates through a guided discovery wizard, then validate each one to decide whether it&apos;s worth pursuing.
        </p>
      </div>

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
            Search for new solution
          </Button>
        </div>
      ) : (
        <SolutionsTable solutions={solutions} />
      )}

      <SearchSolutionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
