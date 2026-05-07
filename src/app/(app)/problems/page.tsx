"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SearchProblemDialog } from "@/components/search-problem-dialog"
import { ProblemsTable } from "@/components/problems-table"
import { Plus, Target, Search, ShieldCheck } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function ProblemsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const isWide = useContainerSize() === "wide"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card>
        <CardContent className="py-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 min-w-[16rem] text-base text-muted-foreground leading-relaxed">
              This is your <span className="font-medium text-foreground">problem library</span>, a central place to collect, refine, and track the problems you&apos;ve identified.
              The goal of this section is to find problems that are real, painful, and worth solving before you spend time building anything. A good problem is one that specific people feel, in a specific context, strongly enough that they&apos;d pay attention to a fix.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Identify problems
            </Button>
          </div>
          <div className={cn("grid gap-4 pt-3 border-t", isWide ? "grid-cols-2" : "grid-cols-1")}>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                <Search className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground">1. Identify</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  Brainstorm problems worth solving by combining customer segments, contexts, and types of pain with what you&apos;ve learned about yourself.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold text-foreground">2. Validate</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                  Open a problem and refine it: who feels it, when it shows up, why it matters, and how today&apos;s alternatives fall short. Then decide whether it&apos;s real and painful enough to commit to.
                </p>
              </div>
            </div>
          </div>
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
        <ProblemsTable problems={problems} showStatus showEditDelete className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")} />
      )}

      <SearchProblemDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
