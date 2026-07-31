"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "@/lib/router"
import Link from "@/components/link"
import type { RootState, AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, FolderKanban, Target, Lightbulb, Pencil, Trash2, ListChecks } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { PORTFOLIO_ACTIONS } from "@/data/portfolioActions"

export default function PortfolioListPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [mounted, setMounted] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<number | null>(null)
  const isWide = useContainerSize() === "wide"

  const portfolios = useSelector((state: RootState) => state.portfolios.portfolios)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const solutions = useSelector((state: RootState) => state.solutions.solutions)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalActions = PORTFOLIO_ACTIONS.length

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 min-w-[16rem] text-base leading-relaxed">
              A <span className="font-bold">portfolio</span> is where an idea comes together. Assign it a validated problem and its solutions carry over automatically, then work through the next steps:
              build a prototype, run a customer test, map a learning roadmap, and gather what you need for a business model canvas. Use it as the summary you take into the tools where the building and testing actually happen.
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button onClick={() => router.push("/portfolios/new")} className="gap-2">
                <Plus className="h-4 w-4" />
                New portfolio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!mounted || portfolios.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-quaternary">
            <FolderKanban className="h-8 w-8 text-white" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No portfolios yet</h2>
            <p className="text-base">
              Create your first portfolio to pull a problem, its solutions, and your next steps into one place.
            </p>
          </div>
          <Button onClick={() => router.push("/portfolios/new")} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New portfolio
          </Button>
        </div>
      ) : (
        <div className={cn("grid gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3", isWide ? "flex-1 min-h-0 content-start" : "min-h-[320px]")}>
          {portfolios.map((portfolio) => {
            const problem = problems.find((p) => p.id === portfolio.problemId)
            const solutionCount = problem
              ? solutions.filter((s) => s.problemId === problem.id).length
              : 0
            const doneCount = portfolio.actions.filter((a) => a.status === "done").length
            return (
              <Card
                key={portfolio.id}
                className="group relative flex flex-col transition-colors hover:border-quaternary/40"
              >
                <Link
                  href={`/portfolios/${portfolio.id}`}
                  className="flex flex-1 flex-col gap-3 p-5"
                  aria-label={`Open portfolio: ${portfolio.title || "untitled"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-quaternary">
                      <FolderKanban className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold">
                        {portfolio.title || "Untitled portfolio"}
                      </h3>
                      {portfolio.description ? (
                        <p className="line-clamp-2 text-base text-foreground/70">{portfolio.description}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 text-base">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-800/15 px-2.5 py-1 text-red-800">
                      <Target className="h-4 w-4" />
                      {problem ? problem.title || "Untitled problem" : "No problem assigned"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-600/20 px-2.5 py-1 text-yellow-700">
                      <Lightbulb className="h-4 w-4" />
                      {solutionCount} {solutionCount === 1 ? "solution" : "solutions"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-quaternary/15 px-2.5 py-1 text-quaternary">
                      <ListChecks className="h-4 w-4" />
                      {doneCount}/{totalActions} steps done
                    </span>
                  </div>
                </Link>

                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Edit portfolio"
                    onClick={() => router.push(`/portfolios/${portfolio.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    aria-label="Delete portfolio"
                    onClick={() => setPendingDelete(portfolio.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the portfolio and its notes. The underlying problem and solutions are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (pendingDelete !== null) dispatch.portfolios.delete(pendingDelete)
                setPendingDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
