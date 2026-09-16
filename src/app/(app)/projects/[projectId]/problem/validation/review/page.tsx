"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, LayoutTemplate } from "lucide-react"
import { useProblem, getAdjacentSteps } from "../context"
import { ProblemCanvasCards } from "@/components/canvas/problem-canvas-cards"
import { NextStepsSection } from "@/components/problem-hub/problem-hub-content"
import { projectRoutes } from "@/lib/projects"

export default function ReviewPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { projectId, problemId, problem } = useProblem()
  const { prevPath } = getAdjacentSteps(pathname, projectId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={LayoutTemplate}>Review &amp; Next Steps</CardTitle>
        <p className="text-base">A read-only overview of everything you have captured so far. Use <strong>Open Problem</strong> to jump to the editable problem page.</p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        {problem && <ProblemCanvasCards problem={problem} />}

        <NextStepsSection projectId={projectId} problemId={problemId} />

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          <Button
            variant="outline"
            className="bg-white border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
            onClick={() => router.push(projectRoutes.problemEdit(projectId))}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Problem to edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
