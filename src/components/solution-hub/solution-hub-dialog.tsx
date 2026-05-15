"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
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
            Edit and review every part of this solution.
          </DialogDescription>
        </DialogHeader>
        {solutionId != null && (
          <div className="-mx-6 -mb-6 flex-1 min-h-0 overflow-y-auto px-6 pb-6">
            <SolutionProvider solutionId={solutionId}>
              <SolutionHubContent mode="dialog" />
            </SolutionProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
