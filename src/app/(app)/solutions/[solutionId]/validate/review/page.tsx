"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, LayoutTemplate } from "lucide-react"
import { getAdjacentSteps, useSolution } from "../context"
import { SolutionCanvasCards } from "@/components/canvas/solution-canvas-cards"
import { NextStepsSection } from "@/components/solution-hub/solution-hub-content"

export default function ValidationReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId, solution } = useSolution()
  const { prevPath } = getAdjacentSteps(pathname, solutionId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={LayoutTemplate} iconBg="bg-tertiary">Review</CardTitle>
        <p className="text-base">A read-only overview of everything you have captured for this solution. Use <strong>Open Solution</strong> to jump to the editable solution page.</p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {solution && <SolutionCanvasCards solution={solution} />}

        <NextStepsSection solutionId={solutionId} />

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <Button
            variant="outline"
            className="bg-[#fcfbf8] border-tertiary/40 text-tertiary hover:bg-tertiary/5 hover:text-tertiary"
            onClick={() => router.push(`/solutions/${solutionId}/edit`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Solution to edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
