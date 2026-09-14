/**
 * A Portfolio is the end-of-journey summary the user assembles for one idea.
 * It is scoped to a single solution (by id). The problem it answers is derived
 * live from `Solution.problemId`, never copied, so the portfolio page is the
 * solution canvas with the problem canvas underneath.
 */

export interface Portfolio {
  id: number
  createdAt: string
  editedAt: string
  title: string
  description: string
  /** The single solution this portfolio is built around, or null until assigned. */
  solutionId: number | null
}

export const DEFAULT_PORTFOLIO_FIELDS: Pick<Portfolio, "title" | "description" | "solutionId"> = {
  title: "",
  description: "",
  solutionId: null,
}
