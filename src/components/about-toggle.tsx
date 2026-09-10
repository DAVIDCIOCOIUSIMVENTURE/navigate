"use client"

import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type AboutToggleProps = Omit<ComponentPropsWithoutRef<typeof Button>, "children"> & {
  /** The page or section the copy describes; used for the accessible label and tooltip. */
  subject: string
}

/**
 * The square info button that sits beside a page title. It carries only the
 * icon; the "About <subject>" label lives in the tooltip and accessible name.
 * On its own it is only the trigger; wrap it in `AboutDialog` (below) so
 * pressing it opens the page's introductory copy. It forwards the trigger's
 * props and ref.
 */
export const AboutToggle = forwardRef<HTMLButtonElement, AboutToggleProps>(function AboutToggle(
  { subject, className, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn("bg-white shrink-0", className)}
      aria-label={`About ${subject}`}
      title={`About ${subject}`}
      {...props}
    >
      <Info className="h-4 w-4" aria-hidden="true" />
    </Button>
  )
})

/**
 * The About button together with the dialog it opens. Pages pass their
 * introductory copy as children; it is shown in a centred dialog rather than
 * dropped into the page, so the layout underneath never shifts.
 */
export function AboutDialog({
  subject,
  title,
  className,
  children,
}: {
  /** The page or section the copy describes; used for the button's accessible label. */
  subject: string
  /** Dialog heading. Defaults to "About <subject>". */
  title?: string
  /** Extra classes for the trigger button. */
  className?: string
  /** The introductory copy: one or more paragraphs. */
  children: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <AboutToggle subject={subject} className={className} />
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{title ?? `About ${subject}`}</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="flex flex-col gap-3 text-base leading-relaxed text-foreground">{children}</div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
