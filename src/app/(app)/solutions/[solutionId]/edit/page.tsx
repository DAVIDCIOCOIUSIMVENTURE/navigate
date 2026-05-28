"use client"

import { useParams } from "next/navigation"
import { useSelector } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowLeft } from "lucide-react"
import { SolutionProvider } from "../validate/context"
import { SolutionHubContent } from "@/components/solution-hub/solution-hub-content"

function HubBody({ solutionId }: { solutionId: number }) {
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
            Edit and review every part of this solution in one place.
          </p>
        </CardHeader>
        <CardContent className="p-10 pt-6">
          <SolutionHubContent mode="page" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function SolutionHubPage() {
  const params = useParams()
  const solutionId = Number(params.solutionId)

  return (
    <SolutionProvider solutionId={solutionId}>
      <HubBody solutionId={solutionId} />
    </SolutionProvider>
  )
}
