"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProblemProvider } from "@/app/(app)/problems/[problemRef]/validation/context"
import { ProblemHubContent } from "./problem-hub-content"

/**
 * Hub view of a problem rendered inside a Dialog. Used by the validation
 * sidebar's "View Problem" button so users can open and edit a problem without
 * leaving their current step.
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Problem</DialogTitle>
          <DialogDescription className="sr-only">
            Edit and review every part of this problem.
          </DialogDescription>
        </DialogHeader>
        {problemRef && (
          <ProblemProvider problemRef={problemRef}>
            <ProblemHubContent mode="dialog" />
          </ProblemProvider>
        )}
      </DialogContent>
    </Dialog>
  )
}
