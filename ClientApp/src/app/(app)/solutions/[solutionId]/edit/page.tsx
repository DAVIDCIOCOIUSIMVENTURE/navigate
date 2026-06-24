"use client"

import { useState } from "react"
import { useParams } from "@/lib/router"
import { useSelector, useStore } from "react-redux"
import Link from "@/components/link"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"
import { SolutionProvider } from "../validate/context"
import { SolutionHubContent } from "@/components/solution-hub/solution-hub-content"
import { buildSolutionBundle, downloadProblemBundle } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"

function HubBody({ solutionId }: { solutionId: number }) {
  const solution = useSelector((state: RootState) =>
    state.solutions.solutions.find((s) => s.id === solutionId)
  )
  const store = useStore<RootState>()
  const [exportOpen, setExportOpen] = useState(false)

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
    <div className="flex flex-col w-full flex-1">
      <Card className="w-full">
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
        <CardContent className="p-10 pt-6">
          <SolutionHubContent mode="page" />
        </CardContent>
      </Card>
      <ExportBundleDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind="solution"
        onConfirm={handleExport}
      />
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
