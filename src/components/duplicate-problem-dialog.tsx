"use client"

import { useEffect, useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type DuplicateProblemDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  linkedSolutionCount: number
  onConfirm: (includeSolutions: boolean) => void
}

export function DuplicateProblemDialog({ open, onOpenChange, linkedSolutionCount, onConfirm }: DuplicateProblemDialogProps) {
  const [includeSolutions, setIncludeSolutions] = useState(false)
  const hasSolutions = linkedSolutionCount > 0

  useEffect(() => {
    if (open) setIncludeSolutions(false)
  }, [open])

  const solutionLabel = linkedSolutionCount === 1 ? "solution" : "solutions"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate problem</DialogTitle>
          <DialogDescription className="text-base">
            Create a new problem with a copy of this one&apos;s details and refinement state.
          </DialogDescription>
        </DialogHeader>
        <label
          className={
            hasSolutions
              ? "flex items-start gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/30"
              : "flex items-start gap-3 rounded-lg border p-4 opacity-60"
          }
        >
          <Checkbox
            checked={includeSolutions}
            onCheckedChange={(checked) => setIncludeSolutions(checked === true)}
            disabled={!hasSolutions}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium">
              {hasSolutions
                ? `Also duplicate the ${linkedSolutionCount} linked ${solutionLabel}`
                : "No solutions linked to this problem"}
            </span>
            <span className="text-base opacity-70">
              {hasSolutions
                ? "When off, the new problem starts with no solutions."
                : "There are no solutions to copy across."}
            </span>
          </div>
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(includeSolutions)
              onOpenChange(false)
            }}
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
