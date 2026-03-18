"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { SearchProblemDialog } from "@/components/search-problem-dialog"
import { ProblemsTable } from "@/components/problems-table"
import { Plus, Search } from "lucide-react"

export default function ProblemsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const problems = useSelector((state: RootState) => state.problems.problems)

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Problems</h1>
          <p className="text-sm text-muted-foreground">
            Discover and validate problems worth solving.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Search for new problem
        </Button>
      </div>

      {problems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No problems yet</h2>
            <p className="text-sm text-muted-foreground">
              Start by searching for problems using the brainstorming tool or define one directly.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Search for new problem
          </Button>
        </div>
      ) : (
        <ProblemsTable problems={problems} showStatus showEditDelete />
      )}

      <SearchProblemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
