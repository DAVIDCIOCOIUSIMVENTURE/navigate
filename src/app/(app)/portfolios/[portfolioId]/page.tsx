"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil, FolderKanban, Lightbulb } from "lucide-react"
import { SolutionCanvasCards } from "@/components/canvas/solution-canvas-cards"
import { ProblemCanvasCards } from "@/components/canvas/problem-canvas-cards"

/**
 * A portfolio is scoped to one solution: the page is that solution's canvas
 * with the canvas of the problem it answers underneath. Both are resolved
 * live from the store, so the portfolio only records which solution it is.
 */
export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const portfolioId = Number(params.portfolioId as string)

  const portfolio = useSelector((state: RootState) =>
    state.portfolios.portfolios.find((p) => p.id === portfolioId),
  )
  const solution = useSelector((state: RootState) =>
    portfolio?.solutionId != null
      ? state.solutions.solutions.find((s) => s.id === portfolio.solutionId)
      : undefined,
  )
  const problem = useSelector((state: RootState) =>
    solution ? state.problems.problems.find((p) => p.id === solution.problemId) : undefined,
  )

  if (!portfolio) {
    return (
      <div className="flex w-full flex-1 flex-col">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-base">Portfolio not found.</p>
            <Button asChild variant="outline">
              <Link href="/portfolios">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              onClick={() => router.push(`/portfolios/${portfolio.id}/edit`)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {solution ? (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">The solution</h2>
            <SolutionCanvasCards solution={solution} />
          </section>

          {problem && (
            <section className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold">The problem</h2>
              <ProblemCanvasCards problem={problem} />
            </section>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-600/20">
              <Lightbulb className="h-6 w-6 text-yellow-700" />
            </div>
            <p className="max-w-sm text-base">
              No solution is assigned to this portfolio yet. Assign one so its canvas and the problem it answers appear here.
            </p>
            <Button variant="outline" onClick={() => router.push(`/portfolios/${portfolio.id}/edit`)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Assign a solution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
