"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { useIdeas } from "@/store/ideas-hooks"
import { Briefcase, CircleDot, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import type { ProblemItem } from "@/types/idea"

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  unvalidated: { label: "Unvalidated", className: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700" },
  valid: { label: "Valid", className: "bg-green-100 text-green-700" },
  invalid: { label: "Invalid", className: "bg-red-100 text-red-700" },
}

export default function PickAProblemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { selectedProblemId, setSelectedProblemId } = useProblemValidation()
  const { getIdea } = useIdeas()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, ideaId)

  const idea = getIdea(ideaId)
  const jobs = idea?.jobs ?? []
  const problems = (idea?.problems ?? []).filter((p) => p.text.trim())
  const validations = idea?.validations ?? []

  const namedJobs = jobs.filter((j) => j.job.trim())
  const problemsByJob = namedJobs
    .map((job) => ({ job, items: problems.filter((p) => p.jobId === job.id) }))
    .filter((g) => g.items.length > 0)
  const unlinkedProblems = problems.filter((p) => p.jobId === null)
  const hasProblems = problems.length > 0

  function renderProblem(problem: ProblemItem) {
    const isSelected = selectedProblemId === problem.id
    const validation = validations.find((v) => v.problemId === problem.id)
    const badge = validation ? STATUS_BADGE[validation.status] : null

    return (
      <li key={problem.id}>
        <button
          onClick={() => setSelectedProblemId(isSelected ? null : problem.id)}
          className={`w-full text-left rounded-lg border-2 px-4 py-3 flex items-center gap-3 transition-colors ${
            isSelected
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-muted/40"
          }`}
        >
          {isSelected ? (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
          )}
          <span className="text-sm flex-1">{problem.text}</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </button>
      </li>
    )
  }

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <CircleDot className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Pick a Problem to Validate</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a problem from your discovery to validate. You&apos;ll assess its alternatives, context,
          shortcomings, and impact to determine if it&apos;s worth solving.
        </p>

        {!hasProblems ? (
          <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <Briefcase className="h-5 w-5" />
            <p className="text-sm">
              No problems discovered yet.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/ideas/${ideaId}/problem-discovery/problems`)}
            >
              Back to Problem Discovery
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {problemsByJob.map(({ job, items }) => (
              <div key={job.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 px-1">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {job.job}
                  </p>
                </div>
                <ul className="flex flex-col gap-2">{items.map(renderProblem)}</ul>
              </div>
            ))}
            {unlinkedProblems.length > 0 && (
              <div className="flex flex-col gap-2">
                {problemsByJob.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    Other Problems
                  </p>
                )}
                <ul className="flex flex-col gap-2">{unlinkedProblems.map(renderProblem)}</ul>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)} className="gap-1.5">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
          ) : <div />}
          {nextPath && (
            <Button
              onClick={() => router.push(nextPath)}
              disabled={selectedProblemId === null}
              className="gap-1.5"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
