"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import {
  completedJourneySteps,
  computeJourneySteps,
  identifyOriginOf,
  journeySolutionId,
  journeyStepHref,
  summariseProblemJourney,
  NO_JOURNEY_TARGET,
  type JourneyStep,
  type JourneyStepId,
  type JourneyTarget,
} from "@/lib/journey-steps"
import {
  isReadyForSolutions,
  SolutionsGuardDialog,
  type SolutionsGuardReason,
} from "@/components/solutions-guard"
import { useProjectIdForProblem } from "@/hooks/use-projects"
import { projectIdFromPathname } from "@/lib/projects"
import { loadResearchCapture } from "@/lib/research-capture"
import { cn } from "@/lib/utils"

/**
 * The rail inside its own card: the arrangement every page uses, so the
 * padding stays the same everywhere. Vertical rails sit in a side column
 * (under a stepper, or first in the column), horizontal ones span the top of
 * a narrow page. A page with no stepper card puts its section title at the
 * head of this card instead, as `header` (a `CardSectionTitle`).
 */
export function JourneyProgressCard({
  activeId,
  problemId,
  orientation = "vertical",
  header,
  className,
}: {
  activeId: JourneyStepId | null
  /** The problem the page is about, when there is one; drives which steps show as done. */
  problemId?: number | null
  orientation?: "vertical" | "horizontal"
  /** Drawn above the rail, inside the card: the page's title when it has no stepper card to carry it. */
  header?: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("shrink-0", className)}>
      <CardContent className={cn("flex flex-col gap-4", orientation === "vertical" ? "p-5" : "px-4 py-3")}>
        {header}
        <JourneyProgress activeId={activeId} problemId={problemId} orientation={orientation} />
      </CardContent>
    </Card>
  )
}

/**
 * The user's position in the innovation journey: identify / explore /
 * validate problems, identify / validate solutions. The page's own step is
 * always highlighted (solid primary). When the page is about one problem
 * (`problemId`), every other step reflects that problem's real progress: done
 * (muted primary) only once the work behind it exists, grey otherwise, so a
 * problem with no solutions yet shows both solution steps grey while a
 * problem with a validated solution lights up the whole rail. Without a
 * problem, the steps before the page's own count as done and the rest are
 * grey.
 *
 * `vertical` (the default) is a rail with the label beside each circle, for
 * a left column on wide containers. `horizontal` is a compact row of circles
 * with the labels beneath, for the top of a narrow page. The rail carries no
 * visible heading; `heading` is only its accessible name.
 *
 * The labels sit at `text-xs` on purpose: the rail is a compact wayfinding
 * aid beside the content, not body copy.
 */
export function JourneyProgress({
  activeId,
  problemId = null,
  orientation = "vertical",
  heading = "Your journey",
  className,
}: {
  /** The milestone the current page belongs to, or null to show every step as upcoming. */
  activeId: JourneyStepId | null
  /** The problem the page is about, when there is one; drives which steps show as done. */
  problemId?: number | null
  orientation?: "vertical" | "horizontal"
  /** Accessible name for the rail (not rendered visually). */
  heading?: string
  className?: string
}) {
  const problem = useSelector((state: RootState) =>
    problemId === null ? undefined : state.problems.problems.find((p) => p.id === problemId),
  )
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  // The rail links into the project the page belongs to: the problem's project
  // when a problem is in view, otherwise the project in the URL (the identify hub).
  const pathname = usePathname()
  const problemProjectId = useProjectIdForProblem(problem?.id)
  const projectId = problemProjectId ?? projectIdFromPathname(pathname)
  const completed = problem ? completedJourneySteps(summariseProblemJourney(problem, solutions)) : undefined
  const steps = computeJourneySteps(activeId, completed)
  // The research method the problem came from is kept beside the problem in
  // storage rather than on it, so it is read here and handed to the pure
  // rules. Nothing is read until the store has hydrated a problem, so this
  // never differs between the server render and the first client one.
  const target: JourneyTarget = useMemo(() => {
    if (!problem) return NO_JOURNEY_TARGET
    return {
      origin: identifyOriginOf(problem, loadResearchCapture(problem.id)?.methodId ?? null),
      solutionId: journeySolutionId(problem.id, solutions),
    }
  }, [problem, solutions])
  const hrefFor = (step: JourneyStep) => journeyStepHref(step, projectId, target)

  // The two solution milestones are never blocked, but a step that has nothing
  // behind it yet says so first: the same dialog the project page's buttons
  // raise. Without a problem in view there is nothing to say, so the link
  // stands (it leads to the project page).
  const [guard, setGuard] = useState<SolutionsGuardReason | null>(null)
  const linkedSolutions = problem ? solutions.filter((s) => s.problemId === problem.id) : []
  const guardFor = (step: JourneyStep): SolutionsGuardReason | null => {
    if (!problem || projectId === null) return null
    if (step.id === "identify-solutions" && !isReadyForSolutions(problem.validationStatus)) return "unvalidated"
    if (step.id === "validate-solutions" && linkedSolutions.length === 0) return "nothing-to-validate"
    return null
  }
  const labelFor = (step: JourneyStep, labelClassName?: string) => (
    <StepLabel step={step} href={hrefFor(step)} onGuard={guardFor(step)} onOpenGuard={setGuard} className={labelClassName} />
  )

  const rail =
    orientation === "horizontal" ? (
      <nav aria-label={heading} className={cn("w-full", className)}>
        <ol className="flex w-full items-start">
          {steps.map((step, i) => (
            <li key={step.id} className="flex flex-1 min-w-0 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <Connector visible={i > 0} done={steps[i - 1]?.status === "completed"} orientation="horizontal" />
                <StepCircle step={step} compact />
                <Connector visible={i < steps.length - 1} done={step.status === "completed"} orientation="horizontal" />
              </div>
              {labelFor(step, "text-center")}
            </li>
          ))}
        </ol>
      </nav>
    ) : (
      <nav aria-label={heading} className={cn("flex flex-col", className)}>
        <ol className="flex flex-col">
          {steps.map((step, i) => (
            <li key={step.id} className="flex items-stretch gap-2.5">
              <div className="flex flex-col items-center">
                <StepCircle step={step} />
                {i < steps.length - 1 && <Connector visible done={step.status === "completed"} orientation="vertical" />}
              </div>
              {labelFor(step, cn("pt-1", i < steps.length - 1 && "pb-5"))}
            </li>
          ))}
        </ol>
      </nav>
    )

  if (!problem || projectId === null) return rail

  return (
    <>
      {rail}
      <SolutionsGuardDialog
        projectId={projectId}
        status={problem.validationStatus}
        reason={guard ?? "unvalidated"}
        open={guard !== null}
        onOpenChange={(open) => { if (!open) setGuard(null) }}
      />
    </>
  )
}

/**
 * The milestone circle: solid primary with a soft halo when active, muted
 * primary when done, a grey disc when upcoming. `compact` is the horizontal
 * rail, which sits above a page's content rather than beside it and so takes
 * as little height as it can.
 */
function StepCircle({ step, compact = false }: { step: JourneyStep; compact?: boolean }) {
  const Icon = step.icon
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full transition-colors",
        compact ? "h-6 w-6" : "h-7 w-7",
        step.status === "active" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
        step.status === "completed" && "bg-primary/65 text-primary-foreground",
        step.status === "upcoming" && "bg-muted text-foreground/50",
      )}
      aria-hidden="true"
    >
      <Icon className={cn("[stroke-width:2.5]", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
    </span>
  )
}

function StepLabel({
  step,
  href,
  onGuard,
  onOpenGuard,
  className,
}: {
  step: JourneyStep
  href: string
  /** Set when this step has nothing behind it yet, so the click opens a dialog instead. */
  onGuard?: SolutionsGuardReason | null
  onOpenGuard?: (reason: SolutionsGuardReason) => void
  className?: string
}) {
  const status =
    step.status === "active" ? " (current step)" : step.status === "completed" ? " (completed)" : ""
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (!onGuard || !onOpenGuard) return
        e.preventDefault()
        onOpenGuard(onGuard)
      }}
      aria-current={step.status === "active" ? "step" : undefined}
      className={cn(
        "text-xs leading-snug rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        step.status === "active" ? "font-semibold text-primary" : "text-foreground",
        className,
      )}
    >
      {step.label}
      <span className="sr-only">{status}</span>
    </Link>
  )
}

/** The line joining two circles; tinted primary when the step before it is done. */
function Connector({
  visible,
  done,
  orientation,
}: {
  visible: boolean
  done: boolean
  orientation: "vertical" | "horizontal"
}) {
  return (
    <span
      className={cn(
        orientation === "vertical" ? "w-0.5 flex-1 min-h-6" : "h-0.5 flex-1",
        visible ? (done ? "bg-primary/40" : "bg-border") : "bg-transparent",
      )}
      aria-hidden="true"
    />
  )
}
