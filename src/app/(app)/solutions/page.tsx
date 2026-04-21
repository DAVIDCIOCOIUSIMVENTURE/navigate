"use client"

import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ArrowRight, ShieldCheck } from "lucide-react"
import type { Problem } from "@/store/problems-model"
import type { Solution } from "@/types/solution"

function statusBadge(solution: Solution | undefined) {
  if (!solution) return <Badge variant="outline">Not Started</Badge>
  if (solution.status === "complete") return <Badge variant="default">Complete</Badge>
  if (solution.status === "in_progress") return <Badge variant="secondary">In Progress</Badge>
  return <Badge variant="outline">Not Started</Badge>
}

function ProblemRow({
  problem,
  solution,
  onStart,
  onContinue,
}: {
  problem: Problem
  solution: Solution | undefined
  onStart: () => void
  onContinue: () => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2">{problem.description || "Untitled problem"}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs gap-1">
            <ShieldCheck className="h-3 w-3" />
            Validated
          </Badge>
          {statusBadge(solution)}
        </div>
      </div>
      <div className="shrink-0">
        {solution ? (
          <Button size="sm" onClick={onContinue} className="gap-1">
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" onClick={onStart} className="gap-1">
            Start
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default function SolutionsPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const validProblems = useSelector((state: RootState) =>
    state.problems.problems.filter((p) => p.validationStatus === "valid")
  )
  const allSolutions = useSelector((state: RootState) => state.solutions.solutions)

  const handleStart = (problemId: number) => {
    const newSolution = dispatch.solutions.create(problemId)
    router.push(`/solutions/${newSolution.id}/introduction`)
  }

  const handleContinue = (solutionId: number) => {
    router.push(`/solutions/${solutionId}/introduction`)
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 shrink-0">
          <Lightbulb className="h-6 w-6 text-primary" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Solutions</h1>
          <p className="text-sm text-muted-foreground">
            Discover and ideate solutions for your validated problems.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 text-sm text-muted-foreground leading-relaxed">
        <p>
          This is your <span className="font-medium text-foreground">solutions workspace</span>, where validated problems become concrete solution concepts.
          Each problem listed below has passed validation and is ready for solution discovery.
        </p>
      </div>

      {validProblems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
              <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center flex flex-col gap-2 max-w-sm">
              <h2 className="text-lg font-semibold">No validated problems yet</h2>
              <p className="text-sm text-muted-foreground">
                Validate a problem first before exploring and ideating solutions.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/problems/brainstorm")}>
              Go to Problems
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Discover Solutions ({validProblems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col gap-3">
            {validProblems.map((problem) => {
              const solution = allSolutions.find((s) => s.problemId === problem.id)
              return (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  solution={solution}
                  onStart={() => handleStart(problem.id)}
                  onContinue={() => handleContinue(solution!.id)}
                />
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
