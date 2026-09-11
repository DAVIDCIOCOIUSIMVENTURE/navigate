"use client"

import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Lightbulb } from "lucide-react"
import { SolutionCanvas } from "@/components/canvas/solution-canvas"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { FocusPageShell } from "@/components/focus-page-shell"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

/**
 * The per-solution canvas. A focus page like the problem canvas: no header or
 * sidebar, so the left column carries Back (to Solutions), the top-bar
 * toggle, the title and the journey rail, with the canvas beside it. A
 * solution on its canvas has been identified and is on its way to validation,
 * so the rail sits on "Validate solutions".
 */
export default function SolutionCanvasPage() {
  const params = useParams()
  const solutionId = Number(params.solutionId)
  const isWide = useContainerSize() === "wide"
  const solution = useSelector((state: RootState) =>
    state.solutions.solutions.find((s) => s.id === solutionId),
  )

  const header = (
    <FocusFlowHeader title="Solution canvas" icon={Lightbulb} backHref="/solutions" className={cn(isWide && "flex-wrap")} />
  )

  if (!solution) {
    return (
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        {header}
        <Card className="w-full">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-base">Solution not found.</p>
            <Button asChild variant="outline">
              <Link href="/solutions">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Solutions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <FocusPageShell header={header} journeyStep="validate-solutions">
      <SolutionCanvas solution={solution} editHref={`/solutions/${solutionId}/edit`} showFullView={false} />
    </FocusPageShell>
  )
}
