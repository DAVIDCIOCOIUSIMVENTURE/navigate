import type { NextStepsIconKey } from "./nextStepsData"

/**
 * The catalogue of "next step" actions a portfolio can hold. Most map onto an
 * existing Next Steps topic (so the portfolio can deep-link to the full
 * guidance page) but the catalogue is deliberately portfolio-owned: it adds
 * actions that live outside the Next Steps section (the Business Model Canvas,
 * which is built in another application) and lets us re-order / curate the set
 * for a portfolio summary without touching the Next Steps pages.
 *
 * The icon keys reuse `NextStepsIconKey` plus a couple of portfolio-only keys,
 * resolved via `getPortfolioActionIcon` in `src/config/navigation.ts`.
 */
export type PortfolioActionIconKey = NextStepsIconKey | "layout-dashboard" | "presentation"

export interface PortfolioActionDef {
  /** Stable id, persisted on the portfolio. */
  id: string
  title: string
  shortTitle: string
  tagline: string
  iconKey: PortfolioActionIconKey
  /** Background tile colour, drawn from the brand tile palette. */
  iconBg: string
  /** What the user should walk away with once this action is done. */
  outcome: string
  /** A short, concrete checklist of what to gather / do for this action. */
  checklist: string[]
  /** Optional link to the matching Next Steps topic for the full guidance. */
  nextStepsUrl?: string
  /** Optional note about where the work actually happens (another app, etc.). */
  whereItHappens?: string
}

export const PORTFOLIO_ACTIONS: PortfolioActionDef[] = [
  {
    id: "build-a-prototype",
    title: "Build a small prototype",
    shortTitle: "Build a prototype",
    tagline: "Make the cheapest version of your solution that a real person can react to.",
    iconKey: "hammer",
    iconBg: "bg-yellow-600",
    outcome: "A throwaway artefact (sketch, mockup, landing page) that lets someone outside your head react to the idea.",
    checklist: [
      "Pick the cheapest format that lets a real person form an opinion.",
      "Decide the single question the prototype needs to answer.",
      "Set a tight deadline before you start (a week, ideally less).",
      "Plan to throw it away: it's a learning instrument, not version one.",
    ],
    nextStepsUrl: "build-a-prototype",
  },
  {
    id: "run-a-customer-test",
    title: "Run a focused customer test",
    shortTitle: "Run a customer test",
    tagline: "Design one experiment with a clear yes-or-no signal.",
    iconKey: "flask",
    iconBg: "bg-blue-900",
    outcome: "A single experiment with a success threshold defined up front and a clean answer at the end.",
    checklist: [
      "Identify the assumption that, if wrong, kills the idea.",
      "Define what success looks like before you run the test.",
      "Recruit people from your target segment (not friends and family).",
      "Watch what people do, not what they say.",
    ],
    nextStepsUrl: "run-a-customer-test",
  },
  {
    id: "build-business-model-canvas",
    title: "Build a business model canvas",
    shortTitle: "Business model canvas",
    tagline: "Map how the idea creates, delivers, and captures value on a single page.",
    iconKey: "layout-dashboard",
    iconBg: "bg-teal-700",
    outcome: "A one-page business model: customer segments, value proposition, channels, revenue, costs, and key activities.",
    checklist: [
      "Carry over the validated problem, customer segment, and worth-to-them figure.",
      "List the channels you'd reach customers through.",
      "Sketch the revenue streams and the main cost drivers.",
      "Note the key activities, resources, and partners the idea relies on.",
    ],
    whereItHappens: "The canvas itself is built in a separate tool. This section gathers everything you need to fill it in.",
  },
  {
    id: "map-a-learning-roadmap",
    title: "Map a learning roadmap",
    shortTitle: "Learning roadmap",
    tagline: "Sequence what you need to learn before what you want to build.",
    iconKey: "route",
    iconBg: "bg-emerald-800",
    outcome: "An ordered list of the questions you still need to answer, ranked by how much they would change the plan.",
    checklist: [
      "List every assumption the idea relies on.",
      "Mark each with its risk: high, medium, or low.",
      "Give each a test method and a 'what would change my mind' condition.",
      "Start with the highest-risk assumption.",
    ],
    nextStepsUrl: "map-a-learning-roadmap",
  },
  {
    id: "decide-on-commitment",
    title: "Decide on commitment",
    shortTitle: "Decide on commitment",
    tagline: "Validation tells you the idea is real. Commitment is a separate question.",
    iconKey: "users",
    iconBg: "bg-green-800",
    outcome: "A deliberate decision about how much of your time, money, and risk this idea deserves next.",
    checklist: [
      "Separate 'is the idea real?' from 'do I want to bet my next few years on it?'.",
      "Be honest about what you can afford to give up.",
      "Talk to the people commitment will affect.",
      "Define your kill criteria up front.",
    ],
    nextStepsUrl: "decide-on-commitment",
  },
]

export function getPortfolioAction(id: string): PortfolioActionDef | undefined {
  return PORTFOLIO_ACTIONS.find((a) => a.id === id)
}
