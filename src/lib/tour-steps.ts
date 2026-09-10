/**
 * Guided tour content. The overlay (`src/components/tour/tour-overlay.tsx`)
 * walks through these steps in order, navigating to `route` and anchoring a
 * popover to the element carrying `data-tour={target}`.
 *
 * There are two kinds of step:
 *
 * - **explain** (the default): the page is blocked, the card describes what
 *   the spotlighted element is for, and Next moves on.
 * - **act**: the user does something for real. The page stays usable, the
 *   card says what to do, and `done(ctx, entry)` decides when it has
 *   happened. `capture` records ids created along the way in the journey so
 *   later steps can point at the same problem and solution.
 *
 * A step without a target (or whose target cannot be found) renders as a
 * centred card (explain) or a docked card in the corner (act), so the tour
 * degrades gracefully on mobile and when a page has no content yet.
 */
import type { ValidationStatus } from "@/types/validation"

export type TourPlacement = "top" | "right" | "bottom" | "left"

/** One `data-tour` id, or an ordered click chain of them. */
export type TourTarget = string | string[]

/** Ids created while working through the hands-on part of the tour. Persisted by the tour model. */
export type TourJourney = {
  problemId: number | null
  solutionId: number | null
}

export const EMPTY_JOURNEY: TourJourney = { problemId: null, solutionId: null }

export type TourProblemSummary = { id: number; title: string; validationStatus: ValidationStatus }
export type TourSolutionSummary = { id: number; problemId: number; validationStatus: ValidationStatus }

/** What the app knows at the time a step is shown. Extend this when a step needs to depend on more. */
export type TourContext = {
  pathname: string
  journey: TourJourney
  problems: TourProblemSummary[]
  solutions: TourSolutionSummary[]
}

export interface TourStep {
  id: string
  title: string
  body: string[]
  /**
   * What to spotlight. A single `data-tour` id, or a click chain: a list of
   * ids where each click reveals or enables the next (a tab that mounts its
   * panel, a card that enables Next). The spotlight sits on the last id in
   * the chain that is rendered and enabled, so it moves along as the user
   * clicks. A resolver may pick ids from the context (for example the card
   * for the tour's own problem). Omit for a centred or docked card.
   */
  target?: TourTarget | ((ctx: TourContext) => TourTarget | null)
  placement?: TourPlacement
  /**
   * Route to open when the step is entered. A resolver may return null, which
   * means "no page can show this anchor right now": the step then stays on
   * the current page without an anchor (see `resolveTourStep`).
   */
  route?: string | ((ctx: TourContext) => string | null)
  /**
   * True when the user is already inside this step's flow (for example part-way
   * through Explore), so entering or resuming the step must not navigate to
   * `route` and drag them back to its first page. Defaults to "only on the
   * route itself".
   */
  within?: (ctx: TourContext) => boolean
  /** Skip the step entirely when this returns false. Defaults to always shown. */
  when?: (ctx: TourContext) => boolean
  /** Large centred cards that open and close the tour. */
  variant?: "welcome" | "finish"
  /** The left sidebar must be visible for the target to exist. */
  needsSidebar?: boolean

  /** `act` steps wait for the user to do something; see the module comment. Defaults to `explain`. */
  mode?: "explain" | "act"
  /**
   * Act steps only: when the user has done what the card asks. `entry` is the
   * context as it was when the step was entered, for "something new appeared"
   * checks.
   */
  done?: (ctx: TourContext, entry: TourContext) => boolean
  /** Act steps only: ids to remember once `done` is true. */
  capture?: (ctx: TourContext) => Partial<TourJourney>
  /** Act steps only: move on as soon as `done` is true instead of waiting for Next. */
  advance?: "auto"
}

/** Stable ids for the `data-tour` attribute. Add one here before anchoring a step to a new element. */
export const TOUR_TARGETS = {
  sidebarItem: (url: string) => `sidebar-${url === "/" ? "home" : url.replace(/^\//, "")}`,
  headerSidebarTrigger: "header-sidebar-trigger",
  headerBreadcrumb: "header-breadcrumb",
  headerAdmin: "header-admin",
  headerTeam: "header-team",
  headerJournal: "header-journal",
  headerGuidance: "header-guidance",
  headerAccount: "header-account",
  dashboardIdentifyProblems: "dashboard-identify-problems",
  identifyMethods: "identify-methods",
  /** The "Use this tool" button on the "Define a Problem Statement" card of the identify hub. */
  identifyDefineUse: "identify-define-use",
  problemsLibrary: "problems-library",
  canvasExplore: "canvas-explore",
  canvasValidate: "canvas-validate",
  /** The "Identify solutions" button on the solution library; it opens Identify Solutions directly. */
  solutionsIdentify: "solutions-identify",
  /** A problem card on the Identify Solutions "Select a Problem" step. */
  discoverProblem: (problemId: number) => `discover-problem-${problemId}`,
  /** The Next button on that step; disabled until a problem is picked. */
  discoverNext: "discover-next",
} as const

// Context helpers, shared by the step definitions and the overlay.

const VERDICTS: ValidationStatus[] = ["valid", "unsure", "invalid"]

export function hasVerdict(status: ValidationStatus | undefined): boolean {
  return status !== undefined && VERDICTS.includes(status)
}

export function journeyProblem(ctx: TourContext): TourProblemSummary | undefined {
  return ctx.problems.find((p) => p.id === ctx.journey.problemId)
}

export function journeySolution(ctx: TourContext): TourSolutionSummary | undefined {
  return ctx.solutions.find((s) => s.id === ctx.journey.solutionId)
}

/** The most recently created item, by id. */
export function latest<T extends { id: number }>(items: T[]): T | undefined {
  return items.reduce<T | undefined>((best, item) => (best === undefined || item.id > best.id ? item : best), undefined)
}

const problemRoute = (suffix: string) => (ctx: TourContext) =>
  ctx.journey.problemId === null ? null : `/problems/${ctx.journey.problemId}${suffix}`

const solutionRoute = (suffix: string) => (ctx: TourContext) =>
  ctx.journey.solutionId === null ? null : `/solutions/${ctx.journey.solutionId}${suffix}`

const withinProblemFlow = (flow: string) => (ctx: TourContext) =>
  ctx.journey.problemId !== null && ctx.pathname.startsWith(`/problems/${ctx.journey.problemId}/${flow}`)

const withinSolutionFlow = (flow: string) => (ctx: TourContext) =>
  ctx.journey.solutionId !== null && ctx.pathname.startsWith(`/solutions/${ctx.journey.solutionId}/${flow}`)

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    variant: "welcome",
    title: "Welcome to Navigate",
    body: [
      "Navigate is a platform for identifying problems worth solving and discovering solutions worth pursuing. This guided tour walks you through the application so you know where everything lives and what each part is for.",
      "It starts with a look around the menu and the top bar. Then it becomes hands-on: you will create your first problem, explore and validate it, and find and validate a solution for it, with the tour guiding each step.",
      "You can close the tour at any point and it will pick up where you left off. You can also skip it and start it again later from Settings.",
    ],
  },

  // Left-hand menu
  {
    id: "sidebar-home",
    title: "Home",
    body: [
      "Your home page shows everything you have captured so far: your problems and your solutions in one place. Come back here whenever you want an overview of your progress.",
    ],
    target: TOUR_TARGETS.sidebarItem("/"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },
  {
    id: "sidebar-foundations",
    title: "Why It Matters",
    body: [
      "Short reading sections on why finding the right problem matters, how to search for one, how to test it and when to commit. Start here if innovation is new to you.",
    ],
    target: TOUR_TARGETS.sidebarItem("/foundations"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },
  {
    id: "sidebar-self-discovery",
    title: "Self Discovery",
    body: [
      "A questionnaire about your interests, knowledge, skills, experience and the people you know. Your answers feed the You column when you identify problems, so every problem stays grounded in what you can actually do.",
    ],
    target: TOUR_TARGETS.sidebarItem("/self-discovery"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },
  {
    id: "sidebar-problems",
    title: "Problem library",
    body: [
      "Every problem you identify lands here. From the library you can open a problem, explore it in depth and validate whether it is real and painful enough to commit to.",
    ],
    target: TOUR_TARGETS.sidebarItem("/problems"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },
  {
    id: "sidebar-solutions",
    title: "Solution library",
    body: [
      "Solutions answer a validated problem. This library collects your candidates and lets you score each one on feasibility, impact, cost and time to implement.",
    ],
    target: TOUR_TARGETS.sidebarItem("/solutions"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },
  {
    id: "sidebar-next-steps",
    title: "Next Steps",
    body: [
      "Guidance on what to do once you have a validated problem and solution: building, testing, planning, finding people and iterating.",
    ],
    target: TOUR_TARGETS.sidebarItem("/next-steps"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },
  {
    id: "sidebar-portfolios",
    title: "Portfolios",
    body: [
      "Group related problems and solutions into a portfolio you can present or share as a single body of work.",
    ],
    target: TOUR_TARGETS.sidebarItem("/portfolios"),
    placement: "right",
    route: "/",
    needsSidebar: true,
  },

  // Top bar
  {
    id: "header-sidebar-trigger",
    title: "Show or hide the menu",
    body: [
      "This button cycles the left menu between full labels, icons only and hidden. You can also press Ctrl+B (Cmd+B on a Mac).",
    ],
    target: TOUR_TARGETS.headerSidebarTrigger,
    placement: "bottom",
    route: "/",
  },
  {
    id: "header-breadcrumb",
    title: "Where you are",
    body: [
      "The breadcrumb shows where you are in the application. Click an earlier part of it to jump back up a level.",
    ],
    target: TOUR_TARGETS.headerBreadcrumb,
    placement: "bottom",
    route: "/",
  },
  {
    id: "header-admin",
    title: "Admin panel",
    body: ["Manage establishments, classes and users from the admin panel."],
    target: TOUR_TARGETS.headerAdmin,
    placement: "bottom",
    route: "/",
  },
  {
    id: "header-team",
    title: "Your team",
    body: ["These avatars show who else is working alongside you."],
    target: TOUR_TARGETS.headerTeam,
    placement: "bottom",
    route: "/",
  },
  {
    id: "header-journal",
    title: "Journal",
    body: [
      "Open the journal to jot down notes as you go. It sits beside the page so you can write while you work.",
    ],
    target: TOUR_TARGETS.headerJournal,
    placement: "bottom",
    route: "/",
  },
  {
    id: "header-guidance",
    title: "Guidance",
    body: [
      "Open the guidance panel for help on the page you are on. It explains the thinking behind each step, so use it whenever something is unclear.",
    ],
    target: TOUR_TARGETS.headerGuidance,
    placement: "bottom",
    route: "/",
  },
  {
    id: "header-account",
    title: "Account and settings",
    body: ["Open your account menu to update your profile, change settings or run this tour again."],
    target: TOUR_TARGETS.headerAccount,
    placement: "bottom",
    route: "/",
  },

  // Hands-on: create a problem, explore and validate it, then find and validate a solution.
  {
    id: "journey-intro",
    title: "Now let's do it for real",
    body: [
      "The rest of the tour is hands-on. You will create a problem, explore and validate it, then find a solution for it and validate that too. Each card tells you what to do and waits until you have done it.",
      "Take as long as you like. Close the tour at any point and it will pick up from the same step next time.",
    ],
    route: "/",
  },
  {
    id: "act-identify",
    mode: "act",
    title: "Identify a new problem",
    body: ["Everything starts with a problem. Click Identify new problems to begin."],
    target: TOUR_TARGETS.dashboardIdentifyProblems,
    placement: "bottom",
    route: "/",
    done: (ctx) => ctx.pathname === "/problems/identify",
    advance: "auto",
  },
  {
    id: "act-define",
    mode: "act",
    title: "Choose how to identify it",
    body: [
      "There are four doorways: Reflect on your own experience, combine dimensions on the Canvas Builder, Research problems out in the world, or Define a Problem Statement directly.",
      "For this tour, press Use this tool on the Define a Problem Statement card. It is the quickest way in; you can try the other tools another time.",
    ],
    target: TOUR_TARGETS.identifyDefineUse,
    placement: "bottom",
    route: "/problems/identify",
    done: (ctx, entry) => ctx.problems.length > entry.problems.length,
    capture: (ctx) => ({ problemId: latest(ctx.problems)?.id ?? null }),
    advance: "auto",
  },
  {
    id: "act-describe",
    mode: "act",
    title: "Describe your problem",
    body: [
      "Give the problem a title and a sentence or two on who has it and when it shows up. A rough first draft is fine; you will sharpen it in the next step.",
      "Press Done, then on the Problem Saved dialog choose Explore the Problem.",
    ],
    done: (ctx) => ctx.journey.problemId !== null && ctx.pathname.startsWith(`/problems/${ctx.journey.problemId}/explore`),
    advance: "auto",
  },
  {
    id: "act-explore",
    mode: "act",
    title: "Explore your problem",
    body: [
      "Explore is a deep dive into the problem: who the customer is, refining it with tools such as 5 Whys, mapping the solutions that already exist and capturing the jobs the customer needs done.",
      "Work through the steps in the left-hand nav; each one saves as you go. When you reach Review, press Continue to Problem Validation.",
    ],
    route: problemRoute("/explore/introduction"),
    within: withinProblemFlow("explore"),
    done: withinProblemFlow("validation"),
    advance: "auto",
  },
  {
    id: "act-validate",
    mode: "act",
    title: "Validate your problem",
    body: [
      "Validation asks what solving the problem is worth to the customer, how big the market is and how strong the competition is.",
      "Work through Worth, Market and Competition, then on Verdict choose Valid, Unsure or Invalid. Only problems marked Valid or Unsure can move on to solutions.",
    ],
    route: problemRoute("/validation/introduction"),
    within: withinProblemFlow("validation"),
    done: (ctx) => hasVerdict(journeyProblem(ctx)?.validationStatus),
  },
  {
    id: "act-identify-solution",
    mode: "act",
    title: "Identify a solution",
    body: [
      "Now find a solution for your problem. Click Identify solutions to open the Identify Solutions flow, which walks you from a validated problem to concrete candidates using creative techniques.",
    ],
    target: TOUR_TARGETS.solutionsIdentify,
    placement: "bottom",
    route: "/solutions",
    done: (ctx) => ctx.pathname.startsWith("/solutions/identify"),
    advance: "auto",
  },
  {
    id: "act-discover-problem",
    mode: "act",
    title: "Pick your problem",
    body: [
      "Only problems marked Valid or Unsure are listed. Select the problem you just validated, then press Next.",
    ],
    target: (ctx) =>
      ctx.journey.problemId === null ? null : [TOUR_TARGETS.discoverProblem(ctx.journey.problemId), TOUR_TARGETS.discoverNext],
    placement: "top",
    route: "/solutions/identify/select-problem",
    done: (ctx) => ctx.pathname.startsWith("/solutions/identify/") && ctx.pathname !== "/solutions/identify/select-problem",
    advance: "auto",
  },
  {
    id: "act-discover",
    mode: "act",
    title: "Discover a solution",
    body: [
      "Pick a method such as analogy or SCAMPER, work through its prompts and save at least one candidate. Each one lands in your solution library.",
      "When a candidate is saved, press Next.",
    ],
    route: "/solutions/identify/pick-method",
    within: (ctx) => ctx.pathname.startsWith("/solutions/identify"),
    done: (ctx, entry) =>
      ctx.solutions.some((s) => s.problemId === ctx.journey.problemId) || ctx.solutions.length > entry.solutions.length,
    capture: (ctx) => ({
      solutionId: (latest(ctx.solutions.filter((s) => s.problemId === ctx.journey.problemId)) ?? latest(ctx.solutions))?.id ?? null,
    }),
  },
  {
    id: "act-validate-solution",
    mode: "act",
    title: "Validate your solution",
    body: [
      "Score the candidate from one to five on feasibility, impact, cost and time to implement, then record a verdict. The verdict tells you whether this is the solution worth pursuing.",
    ],
    route: solutionRoute("/validate/introduction"),
    within: withinSolutionFlow("validate"),
    done: (ctx) => hasVerdict(journeySolution(ctx)?.validationStatus),
  },
  {
    id: "next-steps",
    title: "What comes next",
    body: [
      "With a validated problem and solution in hand, Next Steps guides you through building, testing, planning, finding people and iterating. Portfolios let you package the work to present or share.",
    ],
    route: "/next-steps",
  },
  {
    id: "finish",
    variant: "finish",
    title: "You are ready to go",
    body: [
      "That is the end of the tour. Your problem and solution are in their libraries, ready to refine further. The guidance panel in the top bar explains every step in more detail, and you can run this tour again at any time from Settings.",
    ],
    route: "/",
  },
]

/** How a step should be shown for the current context. */
export type ResolvedTourStep = {
  /** Page to open first, or null to stay where the user is. */
  route: string | null
  /** The click chain to spotlight, in order; empty for a card with no anchor. */
  targets: string[]
}

function resolveTargets(step: TourStep, ctx: TourContext): string[] {
  const target = typeof step.target === "function" ? step.target(ctx) : step.target
  if (target === undefined || target === null) return []
  return Array.isArray(target) ? target : [target]
}

/**
 * Applies the step's route and target resolvers. The one rule that ties them
 * together lives here: when a route resolver says no page can show the
 * anchor, the targets are dropped too, so the overlay never waits for an
 * element that cannot exist.
 */
export function resolveTourStep(step: TourStep, ctx: TourContext): ResolvedTourStep {
  const route = typeof step.route === "function" ? step.route(ctx) : (step.route ?? null)
  if (typeof step.route === "function" && route === null) return { route, targets: [] }
  return { route, targets: resolveTargets(step, ctx) }
}

/** Whether the user is already where the step wants them: on its route, or inside its flow. */
export function isWithinStep(step: TourStep, ctx: TourContext): boolean {
  const { route } = resolveTourStep(step, ctx)
  if (route === null || route === ctx.pathname) return true
  return step.within ? step.within(ctx) : false
}

export function isStepApplicable(step: TourStep, ctx: TourContext): boolean {
  return step.when ? step.when(ctx) : true
}

/** Whether an act step's condition is met. Explain steps are never "done"; they just move on. */
export function isStepDone(step: TourStep, ctx: TourContext, entry: TourContext): boolean {
  return step.mode === "act" && step.done !== undefined && step.done(ctx, entry)
}

/**
 * Index of the nearest applicable step strictly after (`+1`) or before (`-1`)
 * `from`, or null when there is none in that direction.
 */
export function findStepIndex(steps: TourStep[], from: number, direction: 1 | -1, ctx: TourContext): number | null {
  for (let i = from + direction; i >= 0 && i < steps.length; i += direction) {
    if (isStepApplicable(steps[i], ctx)) return i
  }
  return null
}

/**
 * Progress for the "Step X of N" counter. Only ordinary applicable steps
 * count; the welcome and finish cards report `current` 0.
 */
export function stepProgress(steps: TourStep[], index: number, ctx: TourContext): { current: number; total: number } {
  let current = 0
  let total = 0
  steps.forEach((step, i) => {
    if (step.variant || !isStepApplicable(step, ctx)) return
    total += 1
    if (i === index) current = total
  })
  return { current, total }
}
