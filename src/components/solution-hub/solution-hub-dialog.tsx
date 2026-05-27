"use client"

import Link from "next/link"
import { useSelector } from "react-redux"
import { ExternalLink } from "lucide-react"
import type { RootState } from "@/store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SolutionCanvasCards } from "@/components/canvas/solution-canvas-cards"

/**
 * Read-only view of a solution rendered inside a Dialog. Used by the
 * validation sidebar's "View Solution" button. Renders the same canvas
 * cards used by the solution canvas page and validation summary so the
 * three surfaces stay in sync. Editing happens on the full solution page
 * via the "Open as full page" link.
 */
export function SolutionHubDialog({
  open,
  onOpenChange,
  solutionId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  solutionId: number | null
}) {
  const solution = useSelector((s: RootState) =>
    solutionId != null ? s.solutions.solutions.find((sol) => sol.id === solutionId) : undefined,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <DialogTitle>Solution</DialogTitle>
            {solutionId != null && (
              <Link
                href={`/solutions/${solutionId}`}
                className="inline-flex items-center gap-1.5 text-base hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open as full page
              </Link>
            )}
          </div>
          <DialogDescription className="sr-only">
            Review every part of this solution.
          </DialogDescription>
        </DialogHeader>
        {solution && (
          <div className="-mx-6 -mb-6 flex-1 min-h-0 overflow-y-auto px-6 pb-6">
            <SolutionCanvasCards solution={solution} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
