"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch, useStore } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Problem } from "@/store/problems-model"
import { Button } from "@/components/ui/button"
import {
  ClipboardCheck,
  Download,
  FileJson,
  Pencil,
  Maximize2,
  Minimize2,
  Compass,
} from "lucide-react"
import { toast } from "sonner"
import {
  buildProblemExportText,
  downloadTextFile,
  safeFilename,
} from "@/lib/canvas-export"
import { buildProblemBundle, downloadProblemBundle } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"
import { ProblemCanvasCards } from "./problem-canvas-cards"

export function ProblemCanvas({ problem, editHref }: { problem: Problem; editHref: string }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const fullView = useSelector((s: RootState) => s.settings.fullView)
  const [exportOpen, setExportOpen] = useState(false)
  const linkedSolutions = useSelector((s: RootState) =>
    s.solutions.solutions.filter((sol) => sol.problemId === problem.id),
  )
  const customByColumn = useSelector((s: RootState) => s.customDimensionItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)

  const handleDownload = () => {
    const text = buildProblemExportText(problem, linkedSolutions, customByColumn, selfDiscoveryItems)
    const name = safeFilename(problem.title || `problem-${problem.id}`, `problem-${problem.id}`)
    downloadTextFile(`${name}.txt`, text)
  }

  const handleExportJson = (includeSolutions: boolean) => {
    const bundle = buildProblemBundle(store.getState(), problem.id, { includeSolutions })
    if (!bundle) {
      toast.error("Could not export this problem.")
      return
    }
    downloadProblemBundle(bundle)
    toast.success("Problem exported.")
  }

  useEffect(() => {
    return () => {
      document.body.classList.remove("canvas-printing")
      dispatch.settings.setFullView(false)
    }
  }, [dispatch.settings])

  useEffect(() => {
    if (!fullView) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch.settings.setFullView(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [fullView, dispatch.settings])

  const actions = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="bg-white"
        onClick={() => dispatch.settings.setFullView(!fullView)}
      >
        {fullView ? (
          <Minimize2 className="h-3.5 w-3.5 mr-1.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        {fullView ? "Exit Full View" : "Full View"}
      </Button>
      <Button variant="outline" size="sm" className="bg-white" onClick={handleDownload} title="Download as text">
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Download
      </Button>
      <Button variant="outline" size="sm" className="bg-white" onClick={() => setExportOpen(true)} title="Export as a re-importable JSON bundle">
        <FileJson className="h-3.5 w-3.5 mr-1.5" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-white"
        onClick={() => router.push(`/problems/${problem.id}/validation/introduction`)}
      >
        <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
        Validate
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="bg-white border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
        onClick={() => router.push(editHref)}
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Edit
      </Button>
      <Button
        size="sm"
        onClick={() => router.push(`/problems/${problem.id}/explore/introduction`)}
      >
        <Compass className="h-3.5 w-3.5 mr-1.5" />
        Explore
      </Button>
    </>
  )

  return (
    <>
      <ProblemCanvasCards problem={problem} fill actions={actions} />
      <ExportBundleDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind="problem"
        onConfirm={handleExportJson}
      />
    </>
  )
}
