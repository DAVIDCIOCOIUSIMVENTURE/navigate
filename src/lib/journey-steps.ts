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
import { getReflectLens } from "@/data/reflectLenses"
import { getResearchMethod } from "@/data/researchMethods"
import { HOME_HREF, projectRoutes } from "@/lib/projects"
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
  icon: LucideIcon
}

export const JOURNEY_STEPS: JourneyStepDefinition[] = [
  { id: "identify-problems", label: "Identify problem", icon: Target },
  { id: "explore-problems", label: "Explore problem", icon: Microscope },
  { id: "validate-problems", label: "Validate problem", icon: ShieldCheck },
  { id: "identify-solutions", label: "Identify solutions", icon: Lightbulb },
  { id: "validate-solutions", label: "Validate solutions", icon: ShieldCheck },
]

/**
 * The tool a project's problem was identified with, so the "Identify problem"
 * milestone leads back to that tool rather than to the project page the user
 * is most likely already on. A guided-prompt tool is named by its lens and
 * Research by its method, because each opens pre-filled from what was
 * captured. A problem typed straight into the Define dialog has no page of
 * its own, so it leads to the hub, where Define reopens it.
 */
export type IdentifyOrigin =
  | { tool: "canvas-builder" }
  | { tool: "lens"; lensId: string }
  | { tool: "research"; methodId: string | null }
  | { tool: "hub" }

/**
 * Read the origin off a problem. The lens is the surer signal than `source`,
 * since a guided-prompt tool records the lens it captured and saves the
 * problem under the same source as the Canvas Builder. The research method is
 * not on the problem itself: it comes from the capture kept beside it
 * (`src/lib/research-capture.ts`), so the caller passes it in.
 *
 * A lens or method is only an origin while the hub still offers it, because
 * the tool's own parser sends anything else back to the hub: resolving it
 * here means the link lands where it means to rather than bouncing. So a
 * problem captured with a lens that no longer exists, like one restored from
 * an old bundle, leads to the hub, and so does one saved before the guided
 * tools recorded their lens (the legacy `reflect` source).
 */
export function identifyOriginOf(
  problem: Pick<Problem, "source" | "reflection">,
  researchMethodId: string | null,
): IdentifyOrigin {
  if (problem.reflection) {
    const { lensId } = problem.reflection
    return getReflectLens(lensId) ? { tool: "lens", lensId } : { tool: "hub" }
  }
  if (problem.source === "research") {
    const methodId = researchMethodId !== null && getResearchMethod(researchMethodId) ? researchMethodId : null
    return { tool: "research", methodId }
  }
  if (problem.source === "identify") return { tool: "canvas-builder" }
  return { tool: "hub" }
}

/** The page the "Identify problem" milestone opens for a problem of this origin. */
export function identifyStepHref(projectId: number, origin: IdentifyOrigin): string {
  switch (origin.tool) {
    case "lens":
      return projectRoutes.lensReview(projectId, origin.lensId)
    case "research":
      return origin.methodId === null
        ? projectRoutes.research(projectId)
        : projectRoutes.researchReview(projectId, origin.methodId)
    case "canvas-builder":
      return projectRoutes.canvasBuilder(projectId)
    case "hub":
      return projectRoutes.identify(projectId)
  }
}

/**
 * The solution the "Validate solutions" milestone opens: the first of the
 * problem's solutions still without a verdict, so the rail leads to the work
 * that is left, and otherwise the first one, so the step still lands in a
 * validation flow once every solution has been judged. A problem with no
 * solutions yet has nothing to open.
 */
export function journeySolutionId(problemId: number, solutions: readonly Solution[]): number | null {
  const linked = solutions.filter((solution) => solution.problemId === problemId)
  if (linked.length === 0) return null
  return (linked.find((solution) => !hasVerdict(solution.validationStatus)) ?? linked[0]).id
}

/**
 * Where the rail's links lead for the problem in view: the tool its problem
 * came from and the solution to validate. `origin` is null when the project
 * has no problem yet, and `solutionId` when it has no solutions.
 */
export type JourneyTarget = {
  origin: IdentifyOrigin | null
  solutionId: number | null
}

export const NO_JOURNEY_TARGET: JourneyTarget = { origin: null, solutionId: null }

/**
 * Where a milestone leads inside a project. Every page the rail appears on
 * belongs to a project, so each step links into that project: the identify
 * hub while the project has no problem yet, then the tool the problem was
 * identified with, the problem's own Explore and Validation flows, the
 * Identify Solutions flow and one solution's validation. Every one of them
 * opens on the project's own work rather than on an empty flow. Without a
 * project (the rail rendered outside one) every step leads home.
 */
export function journeyStepHref(
  step: JourneyStepDefinition,
  projectId: number | null,
  target: JourneyTarget,
): string {
  if (projectId === null) return HOME_HREF
  if (target.origin === null) {
    return step.id === "identify-problems" ? projectRoutes.identify(projectId) : projectRoutes.page(projectId)
  }
  switch (step.id) {
    case "identify-problems":
      return identifyStepHref(projectId, target.origin)
    case "explore-problems":
      return projectRoutes.explore(projectId)
    case "validate-problems":
      return projectRoutes.validation(projectId)
    case "identify-solutions":
      return projectRoutes.identifySolutions(projectId)
    case "validate-solutions":
      // Nothing to validate yet, so the project page, where solutions are listed.
      return target.solutionId === null
        ? projectRoutes.page(projectId)
        : projectRoutes.solutionValidate(projectId, target.solutionId)
  }
}

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
 * project page): explore it first, then validate it once the Explore deep
 * dive has produced a job to be done or an existing solution, then look for
 * solutions once it has a verdict, and finally validate those solutions once
 * the problem has any. The last of those matters because the active step is
 * drawn ahead of a completed one: without it a problem whose solutions have
 * been judged would sit on "Identify solutions" with a completed step after
 * it.
 */
export function problemJourneyStep(problem: ProblemJourneySummary): JourneyStepId {
  if (problem.solutionCount > 0) return "validate-solutions"
  if (hasVerdict(problem.validationStatus)) return "identify-solutions"
  if (isExplored(problem)) return "validate-problems"
  return "explore-problems"
}
