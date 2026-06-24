"use client"

import Link from "@/components/link"
import { useSelector } from "react-redux"
import { ExternalLink, Pencil } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProblemCanvasCards } from "@/components/canvas/problem-canvas-cards"

/**
 * Read-only view of a problem rendered inside a Dialog. Used by the
 * validation sidebar's "View Problem" button. Renders the same canvas
 * cards used by the problem canvas page and validation summary so the
 * three surfaces stay in sync. The header offers a link to the
 * full-page canvas and a separate link to the edit hub.
 */
export function ProblemHubDialog({
  open,
  onOpenChange,
  problemRef,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  problemRef: string | null
}) {
  const problemId = problemRef != null ? Number(problemRef) : null
  const problem = useSelector((s: RootState) =>
    problemId != null ? s.problems.problems.find((p) => p.id === problemId) : undefined,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <DialogTitle>Problem canvas</DialogTitle>
            {problemRef && (
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/problems/${problemRef}`}>
                    <ExternalLink />
                    Open as full page
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/problems/${problemRef}/edit`}>
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
