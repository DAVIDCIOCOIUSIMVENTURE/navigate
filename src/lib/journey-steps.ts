/**
 * The innovation journey as a fixed sequence of milestones, plus the pure
 * logic that turns "the step this page belongs to" and "how far this problem
 * has come" into a status for every step. The `JourneyProgress` component
 * (`src/components/journey-progress.tsx`) renders the result; keep the rules
 * here so they stay testable and shared.
 */
import { Lightbulb, Microscope, ShieldCheck, Target, type LucideIcon } from "lucide-react"
import type { ValidationStatus } from "@/types/validation"
import type { Solution } from "@/types/solution"
import type { Problem } from "@/store/problems-model"
import { IDENTIFY_SOLUTIONS_START_HREF } from "@/lib/active-discovery-problem"
import { hasVerdict } from "@/lib/tour-steps"

export type JourneyStepId =
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
  { id: "identify-problems", label: "Identify problems", href: "/problems/identify", icon: Target },
  { id: "explore-problems", label: "Explore problems", href: "/problems", icon: Microscope },
  { id: "validate-problems", label: "Validate problems", href: "/problems", icon: ShieldCheck },
  { id: "identify-solutions", label: "Identify solutions", href: IDENTIFY_SOLUTIONS_START_HREF, icon: Lightbulb },
  { id: "validate-solutions", label: "Validate solutions", href: "/solutions", icon: ShieldCheck },
]

export type JourneyStepStatus = "completed" | "active" | "upcoming"

export type JourneyStep = JourneyStepDefinition & { status: JourneyStepStatus }

/**
 * Resolve every step's status. The active step is always highlighted. When
 * `completed` is given (a page about one problem or solution), it is the set
 * of milestones that problem has actually reached, so a step is done only if
 * the work behind it exists and grey otherwise, wherever it sits in the
 * sequence. Without it (the identify hubs, where there is no problem yet) the
 * steps before the active one count as done because the user has been
 * through them to get here, and everything after it is upcoming. With no
 * active step every step is upcoming.
 */
export function computeJourneySteps(
  activeId: JourneyStepId | null,
  completed?: readonly JourneyStepId[],
): JourneyStep[] {
  const activeIndex = activeId === null ? -1 : JOURNEY_STEPS.findIndex((step) => step.id === activeId)
  return JOURNEY_STEPS.map((step, index) => {
    if (index === activeIndex) return { ...step, status: "active" }
    const done = completed ? completed.includes(step.id) : activeIndex !== -1 && index < activeIndex
    return { ...step, status: done ? "completed" : "upcoming" }
  })
}

/** What the journey needs to know about one problem to place it. */
export type ProblemJourneySummary = {
  validationStatus: ValidationStatus
  /** Number of jobs-to-be-done recorded across the three lists. */
  jobCount: number
  existingSolutionCount: number
  /** Solutions linked to the problem. */
  solutionCount: number
  /** Linked solutions that have reached a validation verdict. */
  validatedSolutionCount: number
}

/** Build the summary for a problem from the store's problem and solution lists. */
export function summariseProblemJourney(problem: Problem, solutions: readonly Solution[]): ProblemJourneySummary {
  const linked = solutions.filter((solution) => solution.problemId === problem.id)
  return {
    validationStatus: problem.validationStatus,
    jobCount:
      problem.jobsToBeDone.functional.length +
      problem.jobsToBeDone.emotional.length +
      problem.jobsToBeDone.social.length,
    existingSolutionCount: problem.existingSolutions.length,
    solutionCount: linked.length,
    validatedSolutionCount: linked.filter((solution) => hasVerdict(solution.validationStatus)).length,
  }
}

/** Whether the problem has been through the Explore deep dive. */
function isExplored(problem: ProblemJourneySummary): boolean {
  return problem.jobCount > 0 || problem.existingSolutionCount > 0
}

/**
 * The milestones one problem has actually reached: it exists, so it has been
 * identified; it is explored once the deep dive has produced a job to be done
 * or an existing solution; validated once it has a verdict; it has solutions
 * once one is linked to it; and a solution is validated once any linked
 * solution has a verdict. Each is judged on its own, so a problem validated
 * straight away still shows Explore as not done.
 */
export function completedJourneySteps(problem: ProblemJourneySummary): JourneyStepId[] {
  const completed: JourneyStepId[] = ["identify-problems"]
  if (isExplored(problem)) completed.push("explore-problems")
  if (hasVerdict(problem.validationStatus)) completed.push("validate-problems")
  if (problem.solutionCount > 0) completed.push("identify-solutions")
  if (problem.validatedSolutionCount > 0) completed.push("validate-solutions")
  return completed
}

/**
 * The milestone a single problem is at, for pages about one problem (its
 * canvas): explore it first, then validate it once the Explore deep dive has
 * produced a job to be done or an existing solution, then look for solutions
 * once it has a verdict.
 */
export function problemJourneyStep(problem: ProblemJourneySummary): JourneyStepId {
  if (hasVerdict(problem.validationStatus)) return "identify-solutions"
  if (isExplored(problem)) return "validate-problems"
  return "explore-problems"
}
