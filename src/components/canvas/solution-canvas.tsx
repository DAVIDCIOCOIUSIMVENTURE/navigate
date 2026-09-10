"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch, useStore } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Solution } from "@/types/solution"
import { Button } from "@/components/ui/button"
import {
  Printer,
  Download,
  FileJson,
  Pencil,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { toast } from "sonner"
import {
  buildSolutionExportText,
  downloadTextFile,
  safeFilename,
} from "@/lib/canvas-export"
import { buildSolutionBundle, downloadProblemBundle } from "@/lib/problem-export"
import { ExportBundleDialog } from "@/components/export-bundle-dialog"
import { SolutionCanvasCards } from "./solution-canvas-cards"

export function SolutionCanvas({
  solution,
  editHref,
  showFullView = true,
}: {
  solution: Solution
  editHref: string
  /** Hide the Full View toggle where the page already renders without the app chrome. */
  showFullView?: boolean
}) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const fullView = useSelector((s: RootState) => s.settings.fullView)
  const [exportOpen, setExportOpen] = useState(false)

  const linkedProblem = useSelector((s: RootState) =>
    s.problems.problems.find((p) => p.id === solution.problemId),
  )

  const handleDownload = () => {
    const text = buildSolutionExportText(solution, linkedProblem ?? null)
    const name = safeFilename(solution.title || `solution-${solution.id}`, `solution-${solution.id}`)
    downloadTextFile(`${name}.txt`, text)
  }

  const handleExportJson = (includeProblem: boolean) => {
    const bundle = buildSolutionBundle(store.getState(), solution.id, { includeProblem })
    if (!bundle) {
      toast.error("Could not export this solution.")
      return
    }
    downloadProblemBundle(bundle)
    toast.success("Solution exported.")
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
      {showFullView && (
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
      )}
      <Button variant="outline" size="sm" className="bg-white" onClick={handleDownload} title="Download as text">
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Download
      </Button>
      <Button variant="outline" size="sm" className="bg-white" onClick={() => setExportOpen(true)} title="Export as a re-importable JSON bundle">
        <FileJson className="h-3.5 w-3.5 mr-1.5" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="bg-white" disabled title="Coming soon">
        <Printer className="h-3.5 w-3.5 mr-1.5" />
        Print
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
    </>
  )

  return (
    <>
      <SolutionCanvasCards solution={solution} fill actions={actions} />
      <ExportBundleDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        kind="solution"
        onConfirm={handleExportJson}
      />
    </>
  )
}
