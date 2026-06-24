"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
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

export type ExportBundleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // The thing being exported. Used to label the checkbox: "Include the related
  // [related] in this export."
  kind: "problem" | "solution"
  onConfirm: (includeRelated: boolean) => void
}

const COPY = {
  problem: {
    title: "Export problem",
    description: "Download this problem as a JSON file you can re-import later.",
    checkboxLabel: "Include solutions linked to this problem",
    helper: "When on, every solution attached to this problem is bundled with it.",
  },
  solution: {
    title: "Export solution",
    description: "Download this solution as a JSON file you can re-import later.",
    checkboxLabel: "Include the problem this solution belongs to",
    helper: "When on, the linked problem is bundled in so the solution lands with its full context. When off, the imported solution is attached to a placeholder problem.",
  },
} as const

export function ExportBundleDialog({ open, onOpenChange, kind, onConfirm }: ExportBundleDialogProps) {
  const [includeRelated, setIncludeRelated] = useState(true)
  const copy = COPY[kind]

  // Reset the checkbox to its default each time the dialog reopens.
  useEffect(() => {
    if (open) setIncludeRelated(true)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription className="text-base">{copy.description}</DialogDescription>
        </DialogHeader>
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/30">
          <Checkbox
            checked={includeRelated}
            onCheckedChange={(checked) => setIncludeRelated(checked === true)}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-1">
            <span className="text-base font-medium">{copy.checkboxLabel}</span>
            <span className="text-base opacity-70">{copy.helper}</span>
          </div>
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(includeRelated)
              onOpenChange(false)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
