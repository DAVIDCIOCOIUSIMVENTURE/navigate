"use client"

import { useRouter, usePathname } from "next/navigation"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProblemValidation, getAdjacentSteps } from "../context"
import {
  ArrowRight, CheckCircle2, HelpCircle, XCircle, Copy, RotateCcw, Lightbulb,
} from "lucide-react"

export default function NextStepsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const { problemRef, problemId, status } = useProblemValidation()
  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  const handleDuplicate = () => {
    const problems = JSON.parse(localStorage.getItem("navigate-problems") || '{"problems":[]}')
    const original = problems.problems.find((p: { id: number }) => p.id === problemId)
    if (!original) return

    const newProblem = dispatch.problems.create({
      source: original.source,
      description: original.description,
      customerSegments: [...original.customerSegments],
      contexts: [...original.contexts],
      jobsToBeDone: [...original.jobsToBeDone],
      problemTypes: [...original.problemTypes],
      segmentSize: original.segmentSize ?? null,
      customerDescription: original.customerDescription ?? "",
    })

    if (newProblem && typeof newProblem === "object" && "id" in newProblem) {
      router.push(`/problems/${newProblem.id}/introduction`)
    }
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={ArrowRight}>Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-md text-muted-foreground">
          Based on your validation verdict, here is what you can do next.
        </p>

        {status === "valid" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">Your problem is valid</h3>
            </div>
            <p className="text-md text-muted-foreground">
              You have confirmed that this problem is real, painful, and worth pursuing.
              The next step is to brainstorm and evaluate potential solutions.
            </p>
            <Button
              className="self-start"
              onClick={() => router.push("/solutions")}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Continue to Solutions
            </Button>
          </div>
        )}

        {status === "unsure" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-orange-500 shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">You are unsure about this problem</h3>
            </div>
            <p className="text-md text-muted-foreground">
              Uncertainty is normal at this stage. It usually means you need more information
              before you can confidently commit to solving this problem. You have two options:
            </p>
            <div className="flex flex-col gap-4 mt-1">
              <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicate and start again
                </h4>
                <p className="text-sm text-muted-foreground">
                  This creates a fresh copy of your problem, keeping the core description and
                  customer definition intact. The existing solutions and validation data will be
                  cleared so you can approach the problem from a different angle. For example,
                  try narrowing down to a more specific customer segment, reframing the context,
                  or exploring different existing solutions you may have overlooked.
                </p>
                <Button
                  size="sm"
                  className="self-start mt-1"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate &amp; Start Again
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Revisit your validation
                </h4>
                <p className="text-sm text-muted-foreground">
                  Go back to the validation step and review your scores. Think about whether your
                  estimates for market size, frequency, or willingness to pay were too conservative
                  or too optimistic. Adjusting even one factor can shift the overall picture.
                  You can also update your notes to capture what is making you uncertain, which
                  will help you decide what research or conversations you need next.
                </p>
                <Button
                  size="sm"
                  className="self-start mt-1"
                  onClick={() => router.push(`/problems/${problemRef}/validate`)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revisit Validation
                </Button>
              </div>
            </div>
          </div>
        )}

        {status === "invalid" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">This problem is not valid</h3>
            </div>
            <p className="text-md text-muted-foreground">
              Your validation suggests this problem is not worth solving in its current form.
              That does not mean the underlying idea is bad. Often, a problem becomes valid
              when you look at it through a different lens.
            </p>
            <div className="flex flex-col gap-4 mt-1">
              <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" /> Duplicate and try a different angle
                </h4>
                <p className="text-sm text-muted-foreground">
                  This creates a fresh copy of your problem, keeping the core description and
                  customer definition but clearing all existing solutions and validation data.
                  Use this to explore whether the problem becomes valid with a different customer
                  segment, a more focused context, or by reframing the jobs to be done. Many
                  successful products started by pivoting to a niche that the original validation missed.
                </p>
                <Button
                  size="sm"
                  className="self-start mt-1"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate &amp; Start Again
                </Button>
              </div>
              <div className="rounded-xl border bg-muted/30 p-5 flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" /> Move on to a different problem
                </h4>
                <p className="text-sm text-muted-foreground">
                  If you are confident this problem is not the right one, go back to your
                  problem list and pick another problem to validate. Ruling out a problem
                  is still progress, as it frees you to focus your energy where it matters most.
                </p>
                <Button
                  size="sm"
                  className="self-start mt-1"
                  onClick={() => router.push("/problems")}
                >
                  Back to Problems
                </Button>
              </div>
            </div>
          </div>
        )}

        {(status === "unvalidated" || status === "in_progress") && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
              <h3 className="text-lg font-semibold text-foreground">No verdict yet</h3>
            </div>
            <p className="text-md text-muted-foreground">
              Complete the validation step first to see your next steps.
            </p>
            <Button
              className="self-start"
              onClick={() => router.push(`/problems/${problemRef}/validate`)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Go to Validation
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
        </div>
      </CardContent>
    </Card>
  )
}
