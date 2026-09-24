"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/**
 * Copy for taking one entry off a list the user is still building ("Remove this answer?").
 * Every removal in the app confirms first, so spread this into a `ConfirmDialog` and
 * override `description` when the entry takes something else with it.
 */
export function removeCopy(noun: string, description?: string) {
  return {
    title: `Remove this ${noun}?`,
    description: description ?? "It will be taken off the list. You can add it again later.",
    confirmLabel: "Remove",
  }
}

/** The description for removing one answer to a prompt in the identify tools. */
export const ANSWER_REMOVE_DESCRIPTION =
  "It will be taken out of your answers. You can give it again from the prompt."

/** The description for unticking one item picked from a catalogue. */
export const SELECTION_REMOVE_DESCRIPTION =
  "It will be unticked. You can pick it again from the list."

interface ConfirmDialogProps {
  /** Omit when the dialog is opened from elsewhere, e.g. a menu item, via `open`. */
  trigger?: React.ReactNode
  /** Drive the dialog from the outside; leave unset for a trigger-owned dialog. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  tooltip?: string
}

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  tooltip,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger &&
        (tooltip ? (
          <Tooltip>
            <AlertDialogTrigger asChild>
              <TooltipTrigger asChild>{trigger}</TooltipTrigger>
            </AlertDialogTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        ))}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
