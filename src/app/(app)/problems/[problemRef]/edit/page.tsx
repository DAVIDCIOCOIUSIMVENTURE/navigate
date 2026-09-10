"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useSelector, useStore } from "react-redux"
import Link from "next/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"
import { ProblemProvider } from "../validation/context"
import { ProblemHubContent } from "@/components/problem-hub/problem-hub-content"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { FocusPageShell } from "@/components/focus-page-shell"
import { buildProblemBundle, downloadProblemBundle } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"
import { useContainerSize } from "@/context/container-size-context"
import { problemJourneyStep } from "@/lib/journey-steps"
import { cn } from "@/lib/utils"

/**
 * The per-problem edit page. A focus page like the problem canvas and the
 * Identify hubs: no header or sidebar, so the left column carries Back (to the
 * canvas), the top-bar toggle, the title and the journey rail, with the edit
 * card beside it. On wide containers the card is fitted to the viewport and
 * only its content scrolls.
 */
function HubBody({ problemRef }: { problemRef: string }) {
  const problemId = Number(problemRef)
  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )
  const store = useStore<RootState>()
  const isWide = useContainerSize() === "wide"
  const [exportOpen, setExportOpen] = useState(false)

  const header = (
    <FocusFlowHeader
      title="Edit problem"
      icon={Target}
      backHref={`/problems/${problemRef}`}
      className={cn(isWide && "flex-wrap")}
    />
  )

  if (!problem) {
    return (
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <FocusFlowHeader title="Edit problem" icon={Target} backHref="/problems" />
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

  const journeyStep = problemJourneyStep({
    validationStatus: problem.validationStatus,
    jobCount:
      problem.jobsToBeDone.functional.length +
      problem.jobsToBeDone.emotional.length +
      problem.jobsToBeDone.social.length,
    existingSolutionCount: problem.existingSolutions.length,
  })

  const handleExport = (includeSolutions: boolean) => {
    const bundle = buildProblemBundle(store.getState(), problemId, { includeSolutions })
    if (!bundle) {
      toast.error("Could not export this problem.")
      return
    }
    downloadProblemBundle(bundle)
    toast.success("Problem exported.")
  }

  return (
    <FocusPageShell header={header} journeyStep={journeyStep}>
      <Card className={cn("flex w-full min-w-0 flex-col", isWide && "flex-1 min-h-0 overflow-hidden")}>
        <CardHeader className="px-10 pt-10 pb-0 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <CardTitle icon={Target}>
              {problem.title || `Problem #${problem.id}`}
            </CardTitle>
            <Button variant="outline" onClick={() => setExportOpen(true)} className="shrink-0">
              <Download className="h-4 w-4 mr-2" />
              Export
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
      <ExportBundleDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind="problem"
        onConfirm={handleExport}
      />
    </FocusPageShell>
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
