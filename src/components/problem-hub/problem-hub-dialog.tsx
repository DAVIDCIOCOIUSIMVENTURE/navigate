"use client"

import Link from "next/link"
import { useSelector } from "react-redux"
import { ExternalLink, Pencil } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProblemCanvasCards } from "@/components/canvas/problem-canvas-cards"
import { useProjectIdForProblem } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"

/**
 * Read-only view of a problem rendered inside a Dialog, opened by the
 * "View Problem" button in the problem and solution validation flows. It
 * renders the same canvas cards as the project page and the validation
 * summary so the surfaces stay in sync, and its header links to the
 * problem's project page and to the edit hub.
 */
export function ProblemHubDialog({
  open,
  onOpenChange,
  problemId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemId: number | null
}) {
  const problem = useSelector((s: RootState) =>
    problemId != null ? s.problems.problems.find((p) => p.id === problemId) : undefined,
  )
  const projectId = useProjectIdForProblem(problemId)
  const projectHref = projectRoutes.page(projectId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <DialogTitle>Problem canvas</DialogTitle>
            {problemId !== null && (
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" className="bg-white" asChild>
                  <Link href={projectHref}>
                    <ExternalLink />
                    Open project
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white" asChild>
                  <Link href={projectRoutes.problemEdit(projectId)}>
                    <Pencil />
                    Edit
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <DialogDescription className="sr-only">
            Review every part of this problem.
          </DialogDescription>
        </DialogHeader>
        {problem && (
          <div className="-mx-6 -mb-6 flex-1 min-h-0 overflow-y-auto px-6 pb-6">
            <ProblemCanvasCards problem={problem} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
