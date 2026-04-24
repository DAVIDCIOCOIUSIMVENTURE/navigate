"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { getAdjacentSteps, useDiscovery } from "../context"

export default function SelectProblemPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemId, setProblemId } = useDiscovery()
  const { prevPath, nextPath } = getAdjacentSteps(pathname)

  const validProblems = useSelector((state: RootState) =>
    state.problems.problems.filter((p) => p.validationStatus === "valid")
  )

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Target}>Select a Problem</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md leading-relaxed">
          Choose a validated problem to anchor your solution discovery. Only problems marked as <span className="font-semibold">Valid</span> appear here. You can continue to the next step once a problem is selected.
        </p>

        {validProblems.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center flex flex-col items-center gap-3">
            <Target className="h-8 w-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold">No validated problems yet</p>
              <p className="text-sm text-muted-foreground">
                Validate a problem first before starting solution discovery.
              </p>
            </div>
            <Button variant="outline" onClick={() => router.push("/problems")}>Go to Problems</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {validProblems.map((problem) => {
              const selected = problemId === problem.id
              return (
                <button
                  key={problem.id}
                  onClick={() => setProblemId(problem.id)}
                  className={`flex items-start gap-4 rounded-lg border p-4 text-left transition-colors ${
                    selected ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                    selected ? "bg-primary" : "bg-primary/10"
                  }`}>
                    {selected
                      ? <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      : <Target className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-medium">{problem.description || "Untitled problem"}</p>
                    {(problem.customerSegments.length > 0 || problem.contexts.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {problem.customerSegments.slice(0, 3).map((s) => (
                          <span key={`cs-${s}`} className="rounded-md bg-background px-2 py-0.5 text-xs border">{s}</span>
                        ))}
                        {problem.contexts.slice(0, 3).map((c) => (
                          <span key={`ctx-${c}`} className="rounded-md bg-background px-2 py-0.5 text-xs border">{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath
            ? <Button variant="outline" onClick={() => router.push(prevPath)}><ArrowLeft className="h-4 w-4" />Previous</Button>
            : <span />}
          {nextPath && (
            <Button onClick={() => router.push(nextPath)} disabled={problemId == null}>
              Next<ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
