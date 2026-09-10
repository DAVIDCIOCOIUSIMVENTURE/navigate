"use client"

import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target } from "lucide-react"
import { ProblemCanvas } from "@/components/canvas/problem-canvas"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { FocusPageShell } from "@/components/focus-page-shell"
import { useContainerSize } from "@/context/container-size-context"
import { problemJourneyStep } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"

/**
 * The per-problem canvas. A focus page like the Identify hubs: no header or
 * sidebar, so the left column carries Back (to the library), the top-bar
 * toggle, the title and the journey rail, with the canvas beside it. The rail
 * highlights the problem's own next milestone (explore, validate, or find
 * solutions) rather than a fixed step.
 */
export default function ProblemCanvasPage() {
  const params = useParams()
  const problemRef = params.problemRef as string
  const problemId = Number(problemRef)
  const isWide = useContainerSize() === "wide"
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId),
  )

  const header = <FocusFlowHeader title="Problem canvas" icon={Target} backHref="/problems" className={cn(isWide && "flex-wrap")} />

  if (!problem) {
    return (
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {header}
        <Card className="w-full">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-base">Problem not found.</p>
            <Button asChild variant="outline">
              <Link href="/problems">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Problems
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const journeyStep = problemJourneyStep({
    validationStatus: problem.validationStatus,
    jobCount:
      problem.jobsToBeDone.functional.length +
      problem.jobsToBeDone.emotional.length +
      problem.jobsToBeDone.social.length,
    existingSolutionCount: problem.existingSolutions.length,
  })

  return (
    <FocusPageShell header={header} journeyStep={journeyStep}>
      <ProblemCanvas problem={problem} editHref={`/problems/${problemRef}/edit`} showFullView={false} />
    </FocusPageShell>
  )
}
