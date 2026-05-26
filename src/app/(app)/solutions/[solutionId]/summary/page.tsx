"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowLeft, Pencil } from "lucide-react"
import { SolutionProvider } from "../validate/context"
import { SolutionHubContent } from "@/components/solution-hub/solution-hub-content"

function SummaryBody({ solutionId }: { solutionId: number }) {
  const router = useRouter()
  const solution = useSelector((state: RootState) =>
    state.solutions.solutions.find((s) => s.id === solutionId)
  )

  if (!solution) {
    return (
      <div className="flex flex-col w-full flex-1">
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
    <div className="flex flex-col w-full flex-1">
      <Card className="w-full">
        <CardHeader className="px-10 pt-10 pb-0 space-y-6">
          <CardTitle icon={Lightbulb}>
            {solution.title || `Solution #${solution.id}`}
          </CardTitle>
          <p className="text-base">
            A read-only overview of everything captured for this solution.
          </p>
        </CardHeader>
        <CardContent className="p-10 pt-6 flex flex-col gap-6">
          <SolutionHubContent mode="page" readOnly />

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
              onClick={() => router.push(`/solutions/${solutionId}`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit solution
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SolutionSummaryPage() {
  const params = useParams()
  const solutionId = Number(params.solutionId)

  return (
    <SolutionProvider solutionId={solutionId}>
      <SummaryBody solutionId={solutionId} />
    </SolutionProvider>
  )
}
