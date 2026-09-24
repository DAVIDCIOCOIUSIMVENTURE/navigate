"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { ConfirmDialog, removeCopy } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"

interface RemovablePillProps {
  /** The entry's text, used for the accessible name of the cross and as the content when `children` is omitted. */
  label: string
  onRemove: () => void
  /** What the entry is called in the confirmation ("answer", "selection"). */
  noun?: string
  /** Replaces the default line under the confirmation's title. */
  description?: string
  /** Classes for the pill itself; the default is the amber review pill. */
  className?: string
  /** Classes for the cross button. */
  buttonClassName?: string
  /** Content shown before the cross, for pills that carry an icon. Defaults to `label`. */
  children?: ReactNode
}

/**
 * A pill for one entry in a list the user is building. Only the cross removes it, and
 * only after a confirmation, so a click on the text never throws the entry away.
 */
export function RemovablePill({
  label,
  onRemove,
  noun = "entry",
  description,
  className,
  buttonClassName,
  children,
}: RemovablePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-base text-foreground",
        className,
      )}
    >
      {children ?? <span>{label}</span>}
      <ConfirmDialog
        trigger={
          <button
            type="button"
            aria-label={`Remove ${label}`}
            className={cn(
              "shrink-0 rounded-full opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              buttonClassName,
            )}
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        }
        {...removeCopy(noun, description)}
        onConfirm={onRemove}
      />
    </span>
  )
}
