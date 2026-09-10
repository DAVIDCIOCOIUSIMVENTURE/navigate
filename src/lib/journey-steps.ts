/**
 * The innovation journey as a fixed sequence of milestones, plus the pure
 * logic that turns "the step this page belongs to" into a status for every
 * step. The `JourneyProgress` component (`src/components/journey-progress.tsx`)
 * renders the result; keep the rules here so they stay testable and shared.
 */
import { Compass, Lightbulb, Microscope, ShieldCheck, Target, type LucideIcon } from "lucide-react"
import type { ValidationStatus } from "@/types/validation"
import { hasVerdict } from "@/lib/tour-steps"

export type JourneyStepId =
  | "self-discovery"
  | "identify-problems"
  | "explore-problems"
  | "validate-problems"
  | "identify-solutions"
  | "validate-solutions"

export type JourneyStepDefinition = {
  id: JourneyStepId
  label: string
  /** Where clicking the step takes the user. */
  href: string
  icon: LucideIcon
}

export const JOURNEY_STEPS: JourneyStepDefinition[] = [
  { id: "self-discovery", label: "Self Discovery", href: "/self-discovery", icon: Compass },
  { id: "identify-problems", label: "Identify problems", href: "/problems/identify", icon: Target },
  { id: "explore-problems", label: "Explore problems", href: "/problems", icon: Microscope },
  { id: "validate-problems", label: "Validate problems", href: "/problems", icon: ShieldCheck },
  { id: "identify-solutions", label: "Identify solutions", href: "/solutions/identify", icon: Lightbulb },
  { id: "validate-solutions", label: "Validate solutions", href: "/solutions", icon: ShieldCheck },
]

export type JourneyStepStatus = "completed" | "active" | "upcoming"

export type JourneyStep = JourneyStepDefinition & { status: JourneyStepStatus }

/**
 * Resolve every step's status from position alone: the steps before the
 * active one are completed (the user has been through them to get here), the
 * active step is the one the page belongs to, and everything after it is
 * upcoming because it has not been touched yet. With no active step every
 * step is upcoming.
 */
export function computeJourneySteps(activeId: JourneyStepId | null): JourneyStep[] {
  const activeIndex = activeId === null ? -1 : JOURNEY_STEPS.findIndex((step) => step.id === activeId)
  return JOURNEY_STEPS.map((step, index) => ({
    ...step,
    status: activeIndex === -1 || index > activeIndex ? "upcoming" : index === activeIndex ? "active" : "completed",
  }))
}

/** What the journey needs to know about one problem to place it. */
export type ProblemJourneySummary = {
  validationStatus: ValidationStatus
  /** Number of jobs-to-be-done recorded across the three lists. */
  jobCount: number
  existingSolutionCount: number
}

/**
 * The milestone a single problem is at, for pages about one problem (its
 * canvas): explore it first, then validate it once the Explore deep dive has
 * produced a job to be done or an existing solution, then look for solutions
 * once it has a verdict.
 */
export function problemJourneyStep(problem: ProblemJourneySummary): JourneyStepId {
  if (hasVerdict(problem.validationStatus)) return "identify-solutions"
  if (problem.jobCount > 0 || problem.existingSolutionCount > 0) return "validate-problems"
  return "explore-problems"
}
