"use client"

import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * The shell every canvas card edit dialog uses: the card's own title and a
 * line saying what it holds, the fields in a scrolling body, and a footer with
 * a button into the section of the app that owns this part of the work plus
 * Done. Edits inside write to the store as they are made, so Done only closes.
 */
export function CanvasCardDialog({
  open,
  onClose,
  title,
  description,
  sectionLabel,
  sectionHref,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  /** Label for the button into the owning section, e.g. "Open Explore". */
  sectionLabel?: string
  sectionHref?: string
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent className="sm:max-w-3xl max-h-[85svh] grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader className="space-y-6">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
        <DialogFooter>
          {sectionHref && sectionLabel && (
            <Button
              variant="outline"
              className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
              onClick={() => {
                onClose()
                router.push(sectionHref)
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {sectionLabel}
            </Button>
          )}
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** The brand-coloured panel the flow editors sit on, reused inside these dialogs. */
export function CardDialogPanel({ children }: { children: React.ReactNode }) {
  return <div className="bg-secondary-brand rounded-xl p-6 flex flex-col gap-6">{children}</div>
}
