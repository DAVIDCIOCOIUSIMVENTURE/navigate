/**
 * Guided tour content. The overlay (`src/components/tour/tour-overlay.tsx`)
 * walks through these steps in order, navigating to `route` and anchoring a
 * popover to the element carrying `data-tour={target}`. A step without a
 * target (or whose target cannot be found on the current screen) renders as a
 * centred dialog instead, so the tour degrades gracefully on mobile and when
 * a page has no content yet.
 */

export type TourPlacement = "top" | "right" | "bottom" | "left"

/** What the app knows at the time a step is shown. Extend this when a step needs to depend on more. */
export type TourContext = {
  /** Id of a problem to demonstrate the per-problem canvas with, if any exist. */
  firstProblemId: number | null
}

export interface TourStep {
  id: string
  title: string
  body: string[]
  /** `data-tour` id of the element to spotlight. Omit for a centred dialog. */
  target?: string
  placement?: TourPlacement
  /**
   * Route to open before showing the step. A resolver may return null, which
   * means "no page can show this anchor right now": the step then stays on
   * the current page as a centred card (see `resolveTourStep`).
   */
  route?: string | ((ctx: TourContext) => string | null)
  /** Skip the step entirely when this returns false. Defaults to always shown. */
  when?: (ctx: TourContext) => boolean
  /** Large centred cards that open and close the tour. */
  variant?: "welcome" | "finish"
  /** The left sidebar must be visible for the target to exist. */
  needsSidebar?: boolean
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
  problemsLibrary: "problems-library",
  canvasExplore: "canvas-explore",
  canvasValidate: "canvas-validate",
  solutionsIdentify: "solutions-identify",
  solutionMethods: "solution-methods",
} as const

const problemCanvasRoute = (ctx: TourContext) =>
  ctx.firstProblemId === null ? null : `/problems/${ctx.firstProblemId}`

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    variant: "welcome",
    title: "Welcome to Navigate",
    body: [
      "Navigate is a platform for identifying problems worth solving and discovering solutions worth pursuing. This guided tour walks you through the application so you know where everything lives and what each part is for.",
      "You will learn why the right problem matters, discover what you bring to the table, then identify, explore and validate problems before moving on to solutions and the steps that follow.",
      "You can skip the tour at any point and start it again later from Settings.",
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

  // The problem and solution journey
  {
    id: "identify-problem",
    title: "Identify a new problem",
    body: [
      "Everything starts with a problem. Click here, or the matching button in the problem library, to begin identifying one.",
    ],
    target: TOUR_TARGETS.dashboardIdentifyProblems,
    placement: "bottom",
    route: "/",
  },
  {
    id: "identify-methods",
    title: "Choose how to identify it",
    body: [
      "There are four doorways. Reflect on your own experience, combine dimensions on the Canvas Builder, Research problems out in the world, or Define a Problem Statement directly if you already have one in mind.",
      "We suggest starting with Reflect. Whichever you pick, the problem lands in your library ready to refine.",
    ],
    target: TOUR_TARGETS.identifyMethods,
    placement: "bottom",
    route: "/problems/identify",
  },
  {
    id: "problem-library",
    title: "Your problem library",
    body: [
      "Each problem you identify appears here with its status. Open one to see its canvas, a one-page summary of who has the problem, when it shows up and why it matters.",
    ],
    target: TOUR_TARGETS.problemsLibrary,
    placement: "bottom",
    route: "/problems",
  },
  {
    id: "explore-problem",
    title: "Explore the problem",
    body: [
      "Explore takes you on a deep dive: who the customer is, refining the problem with tools such as 5 Whys, mapping the solutions that already exist and capturing the jobs the customer needs done.",
      "This is where a vague idea becomes a sharp, well-understood problem.",
    ],
    target: TOUR_TARGETS.canvasExplore,
    placement: "bottom",
    route: problemCanvasRoute,
  },
  {
    id: "validate-problem",
    title: "Validate the problem",
    body: [
      "Validation asks what solving the problem is worth to the customer, how big the market is and how strong the competition is, then records a verdict: valid, invalid or unsure.",
      "Only validated problems move on to solutions.",
    ],
    target: TOUR_TARGETS.canvasValidate,
    placement: "bottom",
    route: problemCanvasRoute,
  },
  {
    id: "identify-solution",
    title: "Identify solutions",
    body: [
      "Once a problem is validated, come to the solution library and click here to start finding solutions for it.",
    ],
    target: TOUR_TARGETS.solutionsIdentify,
    placement: "bottom",
    route: "/solutions",
  },
  {
    id: "solution-methods",
    title: "Solution Discovery",
    body: [
      "Solution Discovery picks one of your validated problems, refines your understanding of it, then uses creative techniques such as analogy, SCAMPER and reverse ideation to generate candidates rather than settling for the first idea.",
    ],
    target: TOUR_TARGETS.solutionMethods,
    placement: "top",
    route: "/solutions/identify",
  },
  {
    id: "validate-solution",
    title: "Validate each solution",
    body: [
      "Every candidate can be validated by scoring it from one to five on feasibility, impact, cost and time to implement. The verdict tells you which solution is worth pursuing.",
      "Open a solution from the library and choose Validate to begin.",
    ],
    route: "/solutions",
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
      "That is the end of the tour. The guidance panel in the top bar explains every step in more detail, and you can run this tour again at any time from Settings.",
    ],
    route: "/",
  },
]

/** How a step should be shown for the current context. */
export type ResolvedTourStep = {
  /** Page to open first, or null to stay where the user is. */
  route: string | null
  /** Element to spotlight, or null for a centred card. */
  target: string | null
}

/**
 * Applies the step's route resolver. The one rule that ties route and target
 * together lives here: when a resolver says no page can show the anchor, the
 * target is dropped too, so the overlay never waits for an element that
 * cannot exist.
 */
export function resolveTourStep(step: TourStep, ctx: TourContext): ResolvedTourStep {
  if (typeof step.route === "function") {
    const route = step.route(ctx)
    return { route, target: route === null ? null : (step.target ?? null) }
  }
  return { route: step.route ?? null, target: step.target ?? null }
}

export function isStepApplicable(step: TourStep, ctx: TourContext): boolean {
  return step.when ? step.when(ctx) : true
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
