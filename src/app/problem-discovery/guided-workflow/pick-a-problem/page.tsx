"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useWorkflow, getAdjacentSteps } from "../context"
import { Briefcase, CircleDot, CheckCircle2 } from "lucide-react"
import { BASE } from "../context"

export default function PickAProblemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { jobs, problems, selectedProblemId, setSelectedProblemId } = useWorkflow()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  const namedJobs = jobs.filter((j) => j.job.trim())
  const filledProblems = problems.filter((p) => p.text.trim())

  // Group problems: by job first, then unlinked
  const problemsByJob = namedJobs.map((job) => ({
    job,
    items: filledProblems.filter((p) => p.jobId === job.id),
  })).filter((g) => g.items.length > 0)

  const unlinkedProblems = filledProblems.filter((p) => p.jobId === null)

  const hasProlbems = filledProblems.length > 0

  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <CircleDot className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Pick a Problem</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Select the single most important problem to focus on. This will become the core problem on
          your canvas.
        </p>

        {!hasProlbems ? (
          <div className="rounded-lg border border-dashed p-6 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <Briefcase className="h-5 w-5" />
            <p className="text-sm">
              No problems added yet. Go back to{" "}
              <button
                className="font-medium text-foreground underline underline-offset-2"
                onClick={() => router.push(`${BASE}/problems`)}
              >
                Problems
              </button>{" "}
              to add some first.
            </p>
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
                <ul className="flex flex-col gap-2">
                  {items.map((problem) => {
                    const isSelected = selectedProblemId === problem.id
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
                          <span className="text-sm">{problem.text}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            {unlinkedProblems.length > 0 && (
              <div className="flex flex-col gap-2">
                {problemsByJob.length > 0 && (
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                    Other Problems
                  </p>
                )}
                <ul className="flex flex-col gap-2">
                  {unlinkedProblems.map((problem) => {
                    const isSelected = selectedProblemId === problem.id
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
                          <span className="text-sm">{problem.text}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>
              Previous
            </Button>
          ) : (
            <div />
          )}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
