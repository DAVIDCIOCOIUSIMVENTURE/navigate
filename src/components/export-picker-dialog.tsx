"use client"

import { useEffect, useMemo, useState } from "react"
import { useSelector, useStore } from "react-redux"
import { toast } from "sonner"
import { Download } from "lucide-react"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  buildProblemBundle,
  buildSolutionBundle,
  downloadProblemBundle,
} from "@/lib/problem-export"
import { projectDisplayName } from "@/lib/projects"

export type ExportPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: "problem" | "solution"
}

const COPY = {
  problem: {
    title: "Export project",
    description: "Pick a project to export its problem as a JSON file you can re-import later.",
    selectLabel: "Project",
    selectPlaceholder: "Pick a project",
    emptyState: "No projects with a problem to export yet.",
    relatedLabel: "Include the solutions found in this project",
    relatedHelper: "When on, every solution in the project is bundled with its problem.",
    successPrefix: "Project",
  },
  solution: {
    title: "Export solution",
    description: "Pick a solution to export as a JSON file you can re-import later.",
    selectLabel: "Solution",
    selectPlaceholder: "Pick a solution",
    emptyState: "No solutions to export yet.",
    relatedLabel: "Include the problem this solution belongs to",
    relatedHelper: "When on, the linked problem is bundled in so the solution lands with its full context. When off, the imported solution is attached to a placeholder problem.",
    successPrefix: "Solution",
  },
} as const

export function ExportPickerDialog({ open, onOpenChange, kind }: ExportPickerDialogProps) {
  const store = useStore<RootState>()
  const projects = useSelector((s: RootState) => s.projects.projects)
  const problems = useSelector((s: RootState) => s.problems.problems)
  const solutions = useSelector((s: RootState) => s.solutions.solutions)
  const copy = COPY[kind]

  // A problem bundle is a whole project, so the list shows project names and
  // exports the problem each one holds. Projects with no problem yet have
  // nothing to export and are left out.
  const items = useMemo(() => {
    const raw = kind === "problem"
      ? projects.flatMap((project) => {
          const problem = project.problemId === null ? undefined : problems.find((p) => p.id === project.problemId)
          if (!problem) return []
          return [{ id: problem.id, label: projectDisplayName(project, problem.title), editedAt: problem.editedAt }]
        })
      : solutions.map((s) => ({ id: s.id, label: s.title || `Solution #${s.id}`, editedAt: s.editedAt }))
    return [...raw].sort((a, b) => b.editedAt.localeCompare(a.editedAt))
  }, [kind, projects, problems, solutions])

  const [selectedId, setSelectedId] = useState<string>("")
  const [includeRelated, setIncludeRelated] = useState(true)

  // Reset both controls each time the dialog reopens. Default to the most
  // recently edited record so the typical "export the thing I was just on"
  // flow takes one click.
  useEffect(() => {
    if (open) {
      setIncludeRelated(true)
      setSelectedId(items[0]?.id != null ? String(items[0].id) : "")
    }
  }, [open, items])

  const handleExport = () => {
    const noun = copy.successPrefix.toLowerCase()
    const id = Number(selectedId)
    if (!Number.isFinite(id)) {
      toast.error(`Please pick a ${noun}.`)
      return
    }
    const state = store.getState()
    const bundle = kind === "problem"
      ? buildProblemBundle(state, id, { includeSolutions: includeRelated })
      : buildSolutionBundle(state, id, { includeProblem: includeRelated })
    if (!bundle) {
      toast.error(`Could not export this ${noun}.`)
      return
    }
    downloadProblemBundle(bundle)
    toast.success(`${copy.successPrefix} exported.`)
    onOpenChange(false)
  }

  const disabled = items.length === 0 || !selectedId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription className="text-base">{copy.description}</DialogDescription>
        </DialogHeader>
        {items.length === 0 ? (
          <p className="text-base">{copy.emptyState}</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="export-picker" className="text-base">
                {copy.selectLabel}
              </Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger id="export-picker" className="text-base">
                  <SelectValue placeholder={copy.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)} className="text-base">
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/30">
              <Checkbox
                checked={includeRelated}
                onCheckedChange={(checked) => setIncludeRelated(checked === true)}
                className="mt-0.5"
              />
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium">{copy.relatedLabel}</span>
                <span className="text-base opacity-70">{copy.relatedHelper}</span>
              </div>
            </label>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={disabled}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
