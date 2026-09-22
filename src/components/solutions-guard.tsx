"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { projectRoutes } from "@/lib/projects"
import type { ValidationStatus } from "@/types/validation"

/** A problem has come through validation once it carries a Valid or Unsure verdict. */
const SOLUTION_READY_STATUSES: ValidationStatus[] = ["valid", "unsure"]

/** True once the problem's validation verdict says solutions are worth looking for. */
export function isReadyForSolutions(status: ValidationStatus | undefined): boolean {
  return status !== undefined && SOLUTION_READY_STATUSES.includes(status)
}

/** Why the way into a solutions flow is worth a word first. */
export type SolutionsGuardReason =
  /** Identify Solutions, from a problem with no Valid or Unsure verdict. */
  | "unvalidated"
  /** Validate solutions, from a project that has not captured any yet. */
  | "nothing-to-validate"
  /** Compare solutions, from a project that has not captured any yet. */
  | "nothing-to-compare"

const NOTHING_YET: Record<"nothing-to-validate" | "nothing-to-compare", { title: string; body: string }> = {
  "nothing-to-validate": {
    title: "No solutions to validate yet",
    body: "Validating a solution means scoring it on feasibility, impact, cost and time to implement, so there has to be one to score. Identify a solution for this problem first and it will be waiting here when you come back.",
  },
  "nothing-to-compare": {
    title: "No solutions to compare yet",
    body: "Comparing ranks the solutions you have found against each other by how much each validation metric matters to you, so there is nothing to rank until this project has some. Identify a solution or two first and the ranking will have something to work with.",
  },
}

/**
 * The word before a solutions flow. Nothing is ever blocked: the dialog says
 * why the usual order is the safer one and lets the user carry on. The reasons
 * share one dialog because they lead into each other, so "nothing here yet" can
 * offer Identify Solutions and, when the problem has not been validated, swap
 * to that warning in place rather than opening a second dialog.
 *
 * Every way into these flows raises this, so drive it from here rather than
 * writing another one.
 */
export function SolutionsGuardDialog({
  projectId,
  status,
  reason,
  open,
  onOpenChange,
}: {
  projectId: number
  /** The validation status of the project's problem. */
  status: ValidationStatus
  reason: SolutionsGuardReason
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [shown, setShown] = useState<SolutionsGuardReason>(reason)

  // Re-arm on every opening, so a run that swapped to the validation warning
  // starts again from what the user actually clicked next time.
  useEffect(() => {
    if (open) setShown(reason)
  }, [open, reason])

  const ready = isReadyForSolutions(status)
  const ruledOut = status === "invalid"

  const leave = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  // Nothing to work with yet, so the way forward is to find a solution: either
  // straight into the flow, or through the validation warning first.
  const identifySolutions = () =>
    ready ? leave(projectRoutes.identifySolutions(projectId)) : setShown("unvalidated")

  const copy =
    shown === "unvalidated"
      ? {
          title: ruledOut ? "You ruled this problem out" : "Validate the problem first?",
          body: ruledOut
            ? "Validation ended with a verdict of Invalid, so this problem is not worth solving as it stands. Revisit the validation if the verdict no longer reflects what you know, otherwise any solution you find here is aimed at a problem you have already set aside."
            : "This problem has not been validated yet. Validation tells you whether the problem is real, painful and worth solving, so the solutions you find are aimed at something that matters. You can carry on without it, but you risk spending your time on a problem that does not hold up.",
        }
      : NOTHING_YET[shown]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">{copy.body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{shown === "unvalidated" ? "Cancel" : "Close"}</AlertDialogCancel>
          {shown === "unvalidated" ? (
            <>
              <Button
                variant="outline"
                onClick={() => leave(projectRoutes.identifySolutions(projectId))}
              >
                Identify solutions anyway
              </Button>
              <Button onClick={() => leave(projectRoutes.validation(projectId))}>
                {ruledOut ? "Revisit the validation" : "Validate the problem"}
              </Button>
            </>
          ) : (
            <Button onClick={identifySolutions}>Identify solutions</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type Props = Omit<ButtonProps, "onClick"> & {
  projectId: number
  /** The validation status of the project's problem. */
  status: ValidationStatus
}

/**
 * Opens the project's Identify Solutions flow, warning first (through
 * `SolutionsGuardDialog`) when the problem has not come through validation as
 * Valid or Unsure.
 */
export function IdentifySolutionsButton({ projectId, status, children, ...props }: Props) {
  const router = useRouter()
  const [warningOpen, setWarningOpen] = useState(false)

  const ready = isReadyForSolutions(status)

  return (
    <>
      <Button
        {...props}
        onClick={() =>
          ready ? router.push(projectRoutes.identifySolutions(projectId)) : setWarningOpen(true)
        }
      >
        {children}
      </Button>

      <SolutionsGuardDialog
        projectId={projectId}
        status={status}
        reason="unvalidated"
        open={warningOpen}
        onOpenChange={setWarningOpen}
      />
    </>
  )
}
