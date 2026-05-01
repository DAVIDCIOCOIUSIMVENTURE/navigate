"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchProblemDialog } from "@/components/search-problem-dialog"
import { ProblemsTable } from "@/components/problems-table"
import { Plus, Target } from "lucide-react"

export default function ProblemsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const problems = useSelector((state: RootState) => state.problems.problems)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col gap-3 w-full flex-1">
      <Card>
        <CardContent className="py-4 flex items-center gap-4">
          <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
            This is your <span className="font-medium text-foreground">problem library</span>, a central place to collect, refine, and track the problems you&apos;ve identified.
            Use the <span className="font-medium text-foreground">Identify problems</span> button to brainstorm and discover problems worth solving, then validate each one to determine whether it&apos;s a real pain point with a viable opportunity behind it.
          </p>
          <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Identify problems
          </Button>
        </CardContent>
      </Card>

      {!mounted || problems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary">
            <Target className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No problems yet</h2>
            <p className="text-sm text-muted-foreground">
              Start by searching for problems using the brainstorming tool or define one directly.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Identify problems
          </Button>
        </div>
      ) : (
        <ProblemsTable problems={problems} showStatus showEditDelete />
      )}

      <SearchProblemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
