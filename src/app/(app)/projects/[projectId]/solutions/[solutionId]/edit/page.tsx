"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useSelector, useStore } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"
import { SolutionProvider } from "../validate/context"
import { SolutionHubContent } from "@/components/solution-hub/solution-hub-content"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { FocusPageShell } from "@/components/focus-page-shell"
import { buildSolutionBundle, downloadProblemBundle } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"
import { useContainerSize } from "@/context/container-size-context"
import { projectRoutes } from "@/lib/projects"
import { cn } from "@/lib/utils"

/**
 * The per-solution edit page. A focus page like the problem edit page: no
 * header or sidebar, so the left column carries Home, the Open menu toggle,
 * the title and the journey rail, with the edit card
 * beside it. A solution being edited has been identified and is on its way to
 * validation, so the rail sits on "Test solutions".
 */
function HubBody({ projectId, solutionId }: { projectId: number; solutionId: number }) {
  const solution = useSelector((state: RootState) =>
    state.solutions.solutions.find((s) => s.id === solutionId)
  )
  const store = useStore<RootState>()
  const isWide = useContainerSize() === "wide"
  const [exportOpen, setExportOpen] = useState(false)

  const header = (
    <FocusFlowHeader
      title="Edit solution"
      icon={Lightbulb}
      className={cn(isWide && "flex-wrap")}
    />
  )

  if (!solution) {
    return (
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <FocusFlowHeader title="Edit solution" icon={Lightbulb} />
        <Card className="w-full">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-base">Solution not found.</p>
            <Button asChild variant="outline">
              <Link href={projectRoutes.page(projectId)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to the project
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleExport = (includeProblem: boolean) => {
    const bundle = buildSolutionBundle(store.getState(), solutionId, { includeProblem })
    if (!bundle) {
      toast.error("Could not export this solution.")
      return
    }
    downloadProblemBundle(bundle)
    toast.success("Solution exported.")
  }

  return (
    <FocusPageShell header={header} journeyStep="validate-solutions" journeyProblemId={solution.problemId}>
      <Card className={cn("flex w-full min-w-0 flex-col", isWide && "flex-1 min-h-0 overflow-hidden")}>
        <CardHeader className="px-10 pt-10 pb-0 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <CardTitle icon={Lightbulb}>
              {solution.title || `Solution #${solution.id}`}
            </CardTitle>
            <Button variant="outline" onClick={() => setExportOpen(true)} className="shrink-0">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <p className="text-base">
            Edit and review every part of this solution in one place.
          </p>
        </CardHeader>
        <CardContent className={cn("p-10 pt-6", isWide && "flex-1 min-h-0 overflow-y-auto")}>
          <SolutionHubContent mode="page" />
        </CardContent>
      </Card>
      <ExportBundleDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onConfirm={handleExport}
      />
    </FocusPageShell>
  )
}

export default function SolutionHubPage() {
  const params = useParams<{ projectId: string; solutionId: string }>()
  const projectId = Number(params.projectId)
  const solutionId = Number(params.solutionId)

  return (
    <SolutionProvider projectId={projectId} solutionId={solutionId}>
      <HubBody projectId={projectId} solutionId={solutionId} />
    </SolutionProvider>
  )
}
