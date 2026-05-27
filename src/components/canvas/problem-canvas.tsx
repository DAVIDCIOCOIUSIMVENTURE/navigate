"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Problem } from "@/store/problems-model"
import { Button } from "@/components/ui/button"
import {
  Printer,
  Download,
  Pencil,
  Maximize2,
  Minimize2,
} from "lucide-react"
import {
  buildProblemExportText,
  downloadTextFile,
  safeFilename,
} from "@/lib/canvas-export"
import { ProblemCanvasCards } from "./problem-canvas-cards"

export function ProblemCanvas({ problem, editHref }: { problem: Problem; editHref: string }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const fullView = useSelector((s: RootState) => s.settings.fullView)
  const linkedSolutions = useSelector((s: RootState) =>
    s.solutions.solutions.filter((sol) => sol.problemId === problem.id),
  )
  const customByColumn = useSelector((s: RootState) => s.customDimensionItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)

  const handleDownload = () => {
    const text = buildProblemExportText(problem, linkedSolutions, customByColumn, selfDiscoveryItems)
    const name = safeFilename(problem.description || `problem-${problem.id}`, `problem-${problem.id}`)
    downloadTextFile(`${name}.txt`, text)
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
        onClick={() => dispatch.settings.setFullView(!fullView)}
      >
        {fullView ? (
          <Minimize2 className="h-3.5 w-3.5 mr-1.5" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
        )}
        {fullView ? "Exit Full View" : "Full View"}
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload} title="Download as text">
        <Download className="h-3.5 w-3.5 mr-1.5" />
        Download
      </Button>
      <Button variant="outline" size="sm" disabled title="Coming soon">
        <Printer className="h-3.5 w-3.5 mr-1.5" />
        Print
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
        onClick={() => router.push(editHref)}
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Edit
      </Button>
    </>
  )

  return <ProblemCanvasCards problem={problem} fill actions={actions} />
}
