"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SolutionProvider } from "@/app/(app)/solutions/[solutionId]/validate/context"
import { SolutionHubContent } from "./solution-hub-content"

/**
 * Hub view of a solution rendered inside a Dialog. Used by the validation
 * sidebar's "View Solution" button so users can edit a solution without
 * leaving their current step.
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Solution</DialogTitle>
          <DialogDescription className="sr-only">
            Edit and review every part of this solution.
          </DialogDescription>
        </DialogHeader>
        {solutionId != null && (
          <SolutionProvider solutionId={solutionId}>
            <SolutionHubContent mode="dialog" />
          </SolutionProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
