"use client"

import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProblemCanvas } from "@/components/canvas/problem-canvas"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function ProblemCanvasPage() {
  const params = useParams()
  const problemRef = params.problemRef as string
  const problemId = Number(problemRef)
  const isWide = useContainerSize() === "wide"
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId),
  )

  if (!problem) {
    return (
      <div className="flex flex-col w-full flex-1">
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

  return (
    <div
      className={cn(
        "flex flex-col w-full flex-1 min-h-0",
        isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]",
      )}
    >
      <ProblemCanvas problem={problem} editHref={`/problems/${problemRef}`} />
    </div>
  )
}
