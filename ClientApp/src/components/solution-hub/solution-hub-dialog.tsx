"use client"

import Link from "@/components/link"
import { useSelector } from "react-redux"
import { ExternalLink, Pencil } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SolutionCanvasCards } from "@/components/canvas/solution-canvas-cards"

/**
 * Read-only view of a solution rendered inside a Dialog. Used by the
 * validation sidebar's "View Solution" button. Renders the same canvas
 * cards used by the solution canvas page and validation summary so the
 * three surfaces stay in sync. The header offers a link to the
 * full-page canvas and a separate link to the edit hub.
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
            <DialogTitle>Solution canvas</DialogTitle>
            {solutionId != null && (
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/solutions/${solutionId}`}>
                    <ExternalLink />
                    Open as full page
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/solutions/${solutionId}/edit`}>
                    <Pencil />
                    Edit
                  </Link>
                </Button>
              </div>
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
