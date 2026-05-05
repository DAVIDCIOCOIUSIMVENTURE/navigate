"use client"

import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, ArrowLeft } from "lucide-react"
import { ProblemProvider } from "./validation/context"
import { ProblemHubContent } from "@/components/problem-hub/problem-hub-content"

function HubBody({ problemRef }: { problemRef: string }) {
  const problemId = Number(problemRef)
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )

  if (!problem) {
    return (
      <Card className="w-full flex-1">
        <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
          <p className="text-md text-muted-foreground">Problem not found.</p>
          <Button asChild variant="outline">
            <Link href="/problems">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Problems
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Target}>
          {problem.description || `Problem #${problem.id}`}
        </CardTitle>
        <p className="text-md text-muted-foreground">
          Edit and review every part of this problem in one place.
        </p>
      </CardHeader>
      <CardContent className="p-10 pt-6">
        <ProblemHubContent mode="page" />
      </CardContent>
    </Card>
  )
}

export default function ProblemHubPage() {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemProvider problemRef={problemRef}>
      <HubBody problemRef={problemRef} />
    </ProblemProvider>
  )
}
