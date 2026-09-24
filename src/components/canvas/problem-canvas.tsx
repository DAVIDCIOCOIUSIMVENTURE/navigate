"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch, useStore } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Problem } from "@/store/problems-model"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ClipboardCheck,
  Download,
  FileJson,
  Pencil,
  Maximize2,
  Minimize2,
  Compass,
  Settings,
} from "lucide-react"
import { toast } from "sonner"
import {
  buildProblemExportText,
  downloadTextFile,
  safeFilename,
} from "@/lib/canvas-export"
import { downloadProjectBundle } from "@/lib/problem-export"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { useProjectIdForProblem } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { ProblemCanvasCards } from "./problem-canvas-cards"

export function ProblemCanvas({
  problem,
  editHref,
  showFullView = true,
}: {
  problem: Problem
  editHref: string
  /** Hide the Full View toggle where the page already renders without the app chrome. */
  showFullView?: boolean
}) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const store = useStore<RootState>()
  const fullView = useSelector((s: RootState) => s.settings.fullView)
  const linkedSolutions = useSelector((s: RootState) =>
    s.solutions.solutions.filter((sol) => sol.problemId === problem.id),
  )
  const customByColumn = useSelector((s: RootState) => s.customDimensionItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  const projectId = useProjectIdForProblem(problem.id)

  const handleDownload = () => {
    const text = buildProblemExportText(problem, linkedSolutions, customByColumn, selfDiscoveryItems)
    const name = safeFilename(problem.title || `problem-${problem.id}`, `problem-${problem.id}`)
    downloadTextFile(`${name}.txt`, text)
  }

  // Export is always the whole project: the problem, its solutions and
  // everything captured alongside them, so the file can be imported as a
  // working project rather than a fragment of one.
  const handleExportJson = () => {
    if (projectId !== null && downloadProjectBundle(store.getState(), projectId)) {
      toast.success("Project exported.")
    } else {
      toast.error("Could not export this project.")
    }
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
   * One menu rather than a row of buttons, so the header leaves the problem
   * title the room it needs. `modal={false}` keeps the page clickable after
   * the export dialog the menu opens is closed. The tour anchors sit on the
   * trigger and on the items, so a step can chain "open the menu, then click
   * Explore".
   */
  const actions = (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-white"
          aria-label="Problem actions"
          title="Problem actions"
          data-tour={TOUR_TARGETS.canvasActions}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(projectRoutes.explore(projectId))}
          data-tour={TOUR_TARGETS.canvasExplore}
        >
          <Compass className="h-3.5 w-3.5" />
          Explore
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push(projectRoutes.validation(projectId))}
          data-tour={TOUR_TARGETS.canvasValidate}
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Test
        </DropdownMenuItem>
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
        <DropdownMenuItem onClick={handleExportJson}>
          <FileJson className="h-3.5 w-3.5" />
          Export project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return <ProblemCanvasCards problem={problem} fill editable actions={actions} />
}
