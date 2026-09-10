"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { computeJourneySteps, type JourneyStep, type JourneyStepId } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"

/**
 * The rail inside its own card: the arrangement every page uses, so the
 * padding stays the same everywhere. Vertical rails sit in a side column
 * (under a stepper or a header), horizontal ones span the top of a narrow page.
 */
export function JourneyProgressCard({
  activeId,
  orientation = "vertical",
  className,
}: {
  activeId: JourneyStepId | null
  orientation?: "vertical" | "horizontal"
  className?: string
}) {
  return (
    <Card className={cn("shrink-0", className)}>
      <CardContent className={orientation === "vertical" ? "p-5" : "p-4"}>
        <JourneyProgress activeId={activeId} orientation={orientation} />
      </CardContent>
    </Card>
  )
}

/**
 * The user's position in the innovation journey: Self Discovery,
 * identify / explore / validate problems, identify / validate solutions.
 * Status is positional: the steps before the page's own step are done (muted
 * primary), that step is highlighted (solid primary), and the steps after it
 * are grey because nothing there has been touched yet.
 *
 * `vertical` (the default) is a rail with the label beside each circle, for
 * a left column on wide containers. `horizontal` is a compact row of circles
 * with the labels beneath, for the top of a narrow page. The rail carries no
 * visible heading; `heading` is only its accessible name.
 *
 * The labels sit at `text-sm` on purpose: the rail is a compact wayfinding
 * aid beside the content, not body copy.
 */
export function JourneyProgress({
  activeId,
  orientation = "vertical",
  heading = "Your journey",
  className,
}: {
  /** The milestone the current page belongs to, or null to show every step as upcoming. */
  activeId: JourneyStepId | null
  orientation?: "vertical" | "horizontal"
  /** Accessible name for the rail (not rendered visually). */
  heading?: string
  className?: string
}) {
  const steps = computeJourneySteps(activeId)

  if (orientation === "horizontal") {
    return (
      <nav aria-label={heading} className={cn("w-full", className)}>
        <ol className="flex w-full items-start">
          {steps.map((step, i) => (
            <li key={step.id} className="flex flex-1 min-w-0 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <Connector visible={i > 0} done={steps[i - 1]?.status === "completed"} orientation="horizontal" />
                <StepCircle step={step} />
                <Connector visible={i < steps.length - 1} done={step.status === "completed"} orientation="horizontal" />
              </div>
              <StepLabel step={step} className="text-center" />
            </li>
          ))}
        </ol>
      </nav>
    )
  }

  return (
    <nav aria-label={heading} className={cn("flex flex-col", className)}>
      <ol className="flex flex-col">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-stretch gap-2.5">
            <div className="flex flex-col items-center">
              <StepCircle step={step} />
              {i < steps.length - 1 && <Connector visible done={step.status === "completed"} orientation="vertical" />}
            </div>
            <StepLabel step={step} className={cn("pt-1", i < steps.length - 1 && "pb-5")} />
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** The milestone circle: solid primary with a soft halo when active, muted primary when done, a grey disc when upcoming. */
function StepCircle({ step }: { step: JourneyStep }) {
  const Icon = step.icon
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors",
        step.status === "active" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
        step.status === "completed" && "bg-primary/65 text-primary-foreground",
        step.status === "upcoming" && "bg-muted text-foreground/50",
      )}
      aria-hidden="true"
    >
      <Icon className="h-3.5 w-3.5 [stroke-width:2.5]" />
    </span>
  )
}

function StepLabel({ step, className }: { step: JourneyStep; className?: string }) {
  const status =
    step.status === "active" ? " (current step)" : step.status === "completed" ? " (completed)" : ""
  return (
    <Link
      href={step.href}
      aria-current={step.status === "active" ? "step" : undefined}
      className={cn(
        "text-sm leading-snug rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
