"use client"

import { useSelector, useStore } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Download } from "lucide-react"
import { toast } from "sonner"
import { ProblemProvider } from "../validation/context"
import { ProblemHubContent } from "@/components/problem-hub/problem-hub-content"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { FocusPageShell } from "@/components/focus-page-shell"
import { ProjectProblemGate } from "@/components/project-gates"
import { downloadProjectBundle } from "@/lib/problem-export"
import { useContainerSize } from "@/context/container-size-context"
import { useProjectScope } from "@/hooks/use-projects"
import { problemJourneyStep, summariseProblemJourney } from "@/lib/journey-steps"
import type { Problem } from "@/store/problems-model"
import { cn } from "@/lib/utils"

/**
 * The project's problem edit page. A focus page like the Identify hub: no
 * header or sidebar, so the left column carries Home, the Open menu
 * toggle, the title and the journey rail, with the edit card beside
 * it. On wide containers the card is fitted to the viewport and only its
 * content scrolls.
 */
function HubBody({ projectId, problem }: { projectId: number; problem: Problem }) {
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const store = useStore<RootState>()
  const isWide = useContainerSize() === "wide"

  const header = (
    <FocusFlowHeader
      title="Edit problem"
      icon={Target}
      className={cn(isWide && "flex-wrap")}
    />
  )

  const journeyStep = problemJourneyStep(summariseProblemJourney(problem, solutions))

  // Always the whole project, so the file imports as a working project.
  const handleExport = () => {
    if (downloadProjectBundle(store.getState(), projectId)) {
      toast.success("Project exported.")
    } else {
      toast.error("Could not export this project.")
    }
  }

  return (
    <FocusPageShell header={header} journeyStep={journeyStep} journeyProblemId={problem.id}>
      <Card className={cn("flex w-full min-w-0 flex-col", isWide && "flex-1 min-h-0 overflow-hidden")}>
        <CardHeader className="px-10 pt-10 pb-0 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <CardTitle icon={Target}>
              {problem.title || `Problem #${problem.id}`}
            </CardTitle>
            <Button variant="outline" onClick={handleExport} className="shrink-0">
              <Download className="h-4 w-4 mr-2" />
              Export project
            </Button>
          </div>
          <p className="text-base">
            Edit and review every part of this problem in one place.
          </p>
        </CardHeader>
        <CardContent className={cn("p-10 pt-6", isWide && "flex-1 min-h-0 overflow-y-auto")}>
          <ProblemHubContent mode="page" />
        </CardContent>
      </Card>
    </FocusPageShell>
  )
}

export default function ProblemHubPage() {
  const scope = useProjectScope()

  return (
    <ProjectProblemGate scope={scope}>
      {(problem) => (
        <ProblemProvider projectId={scope.projectId} problemRef={String(problem.id)}>
          <HubBody projectId={scope.projectId} problem={problem} />
        </ProblemProvider>
      )}
    </ProjectProblemGate>
  )
}
