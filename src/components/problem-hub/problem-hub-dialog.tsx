"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <DialogTitle>Problem</DialogTitle>
            {problemRef && (
              <Link
                href={`/problems/${problemRef}`}
                className="inline-flex items-center gap-1.5 text-base hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open as full page
              </Link>
            )}
          </div>
          <DialogDescription className="sr-only">
            Edit and review every part of this problem.
          </DialogDescription>
        </DialogHeader>
        {problemRef && (
          <div className="-mx-6 -mb-6 flex-1 min-h-0 overflow-y-auto px-6 pb-6">
            <ProblemProvider problemRef={problemRef}>
              <ProblemHubContent mode="dialog" />
            </ProblemProvider>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
