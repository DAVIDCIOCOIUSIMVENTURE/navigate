"use client"

import { useParams, useRouter } from "@/lib/router"
import { useSelector, useDispatch } from "react-redux"
import Link from "@/components/link"
import type { RootState, AppDispatch } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil, FolderKanban, Target } from "lucide-react"
import { ProblemCanvasCards } from "@/components/canvas/problem-canvas-cards"
import { PortfolioActionSection } from "@/components/portfolio/portfolio-action-section"
import { PORTFOLIO_ACTIONS } from "@/data/portfolioActions"
import type { PortfolioActionState, PortfolioActionStatus } from "@/types/portfolio"

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const portfolioId = Number(params.portfolioId as string)

  const portfolio = useSelector((state: RootState) =>
    state.portfolios.portfolios.find((p) => p.id === portfolioId),
  )
  const problem = useSelector((state: RootState) =>
    portfolio?.problemId != null
      ? state.problems.problems.find((p) => p.id === portfolio.problemId)
      : undefined,
  )

  if (!portfolio) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-base">Portfolio not found.</p>
            <Button asChild variant="outline">
              <Link href="/portfolio">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Reconcile stored action state against the full catalogue so every action
  // shows, defaulting unseen ones to "not started" with empty notes.
  const stateByAction = new Map(portfolio.actions.map((a) => [a.actionId, a]))

  const writeActions = (next: PortfolioActionState[]) => {
    dispatch.portfolios.update({ id: portfolio.id, patch: { actions: next } })
  }

  const updateAction = (actionId: string, patch: Partial<PortfolioActionState>) => {
    const existing = stateByAction.get(actionId) ?? { actionId, status: "not_started" as PortfolioActionStatus, notes: "" }
    const merged: PortfolioActionState = { ...existing, ...patch, actionId }
    const others = portfolio.actions.filter((a) => a.actionId !== actionId)
    writeActions([...others, merged])
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-4 overflow-y-auto pb-2">
      <Card>
        <CardContent className="py-5">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-quaternary">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold">{portfolio.title || "Untitled portfolio"}</h1>
              {portfolio.description ? (
                <p className="mt-1 text-base leading-relaxed text-foreground/80">{portfolio.description}</p>
              ) : (
                <p className="mt-1 text-base italic text-foreground/60">No description yet.</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
              onClick={() => router.push(`/portfolio/${portfolio.id}/edit`)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">The problem</h2>
        {problem ? (
          <ProblemCanvasCards problem={problem} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-800/15">
                <Target className="h-6 w-6 text-red-800" />
              </div>
              <p className="max-w-sm text-base">
                No problem is assigned to this portfolio yet. Assign one so its canvas and solutions appear here.
              </p>
              <Button variant="outline" onClick={() => router.push(`/portfolio/${portfolio.id}/edit`)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Assign a problem
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Next steps</h2>
          <p className="text-base text-foreground/70">
            Work through these to take the idea forward. Some are done in other tools; this is the summary you bring with you.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {PORTFOLIO_ACTIONS.map((def) => {
            const state = stateByAction.get(def.id) ?? { actionId: def.id, status: "not_started" as PortfolioActionStatus, notes: "" }
            return (
              <PortfolioActionSection
                key={def.id}
                def={def}
                state={state}
                onStatusChange={(status) => updateAction(def.id, { status })}
                onNotesChange={(notes) => updateAction(def.id, { notes })}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}
