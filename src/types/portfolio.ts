/**
 * A Portfolio is the end-of-journey summary the user assembles for one idea.
 * It is assigned a single problem (by id); that problem's solutions are carried
 * over automatically (resolved live via `Solution.problemId`, never copied).
 *
 * After the problem canvas, a portfolio holds a curated list of "next step"
 * actions (build a prototype, run a customer test, business model canvas, ...)
 * drawn from `src/data/portfolioActions.ts`. Each action carries the user's own
 * status and notes so the portfolio doubles as a checklist they can hand to the
 * tools where the work actually happens (prototyping, BMC, etc.).
 */

export type PortfolioActionStatus = "not_started" | "in_progress" | "done"

export interface PortfolioActionState {
  /** Matches `PortfolioActionDef.id` in the catalogue. */
  actionId: string
  status: PortfolioActionStatus
  /** Free-text notes the user keeps against this action. */
  notes: string
}

export interface Portfolio {
  id: number
  createdAt: string
  editedAt: string
  title: string
  description: string
  /** The single problem this portfolio is built around, or null until assigned. */
  problemId: number | null
  /** Curated action sections, in display order. */
  actions: PortfolioActionState[]
}

export const DEFAULT_PORTFOLIO_FIELDS: Pick<Portfolio, "title" | "description" | "problemId" | "actions"> = {
  title: "",
  description: "",
  problemId: null,
  actions: [],
}
