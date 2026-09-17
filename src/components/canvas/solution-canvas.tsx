"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch, useStore } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Solution } from "@/types/solution"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Printer,
  Download,
  FileJson,
  Pencil,
  Maximize2,
  Minimize2,
  Settings,
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

  /**
   * One menu rather than a row of buttons, so the header leaves the solution
   * title the room it needs. `modal={false}` keeps the page clickable after
   * the export dialog the menu opens is closed.
   */
  const actions = (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white"
          aria-label="Solution actions"
          title="Solution actions"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(editHref)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {showFullView && (
          <DropdownMenuItem onClick={() => dispatch.settings.setFullView(!fullView)}>
            {fullView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {fullView ? "Exit full view" : "Full view"}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-3.5 w-3.5" />
          Download as text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setExportOpen(true)}>
          <FileJson className="h-3.5 w-3.5" />
          Export
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Printer className="h-3.5 w-3.5" />
          Print (coming soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
