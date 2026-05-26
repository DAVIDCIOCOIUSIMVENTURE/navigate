"use client"

import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, ArrowLeft, Pencil } from "lucide-react"
import { ProblemProvider } from "../validation/context"
import { ProblemHubContent } from "@/components/problem-hub/problem-hub-content"

function SummaryBody({ problemRef }: { problemRef: string }) {
  const router = useRouter()
  const problemId = Number(problemRef)
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
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
    <div className="flex flex-col w-full flex-1">
      <Card className="w-full">
        <CardHeader className="px-10 pt-10 pb-0 space-y-6">
          <CardTitle icon={Target}>
            {problem.description || `Problem #${problem.id}`}
          </CardTitle>
          <p className="text-base">
            A read-only overview of everything captured for this problem.
          </p>
        </CardHeader>
        <CardContent className="p-10 pt-6 flex flex-col gap-6">
          <ProblemHubContent mode="page" readOnly />

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/problems/${problemRef}`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit problem
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProblemSummaryPage() {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemProvider problemRef={problemRef}>
      <SummaryBody problemRef={problemRef} />
    </ProblemProvider>
  )
}
