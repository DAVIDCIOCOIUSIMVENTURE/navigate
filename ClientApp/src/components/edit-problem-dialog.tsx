"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "@/lib/router"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { dimensionColumns } from "@/data/dimensionData"
import { StatusSelect } from "@/components/ui/status-select"
import type { Problem, ProblemPatch } from "@/store/problems-model"
import type { ValidationStatus } from "@/types/validation"
import { DimensionPicker } from "@/components/dimension-picker"
import { ArrowRight, Compass, ExternalLink } from "lucide-react"

const COLUMN_TO_FIELD: Record<string, "customers" | "contexts" | "problems"> = {
  customers: "customers",
  contexts: "contexts",
  problems: "problems",
}

const EDITABLE_COLUMNS = dimensionColumns.filter((col) => col.id in COLUMN_TO_FIELD)

interface EditProblemDialogProps {
  problem: Problem | null
  onClose: () => void
  title?: string
  showStatus?: boolean
  onDone?: (problemId: number) => void
}

export function EditProblemDialog({ problem, onClose, title: dialogTitle = "Edit Problem", showStatus = true, onDone }: EditProblemDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const [problemTitle, setProblemTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ValidationStatus>("unvalidated")
  const initRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!problem) return
    initRef.current = false
    setProblemTitle(problem.title ?? "")
    setDescription(problem.description ?? "")
    setStatus(problem.validationStatus ?? "unvalidated")
  }, [problem])

  useEffect(() => {
    if (!problem) return
    if (!initRef.current) { initRef.current = true; return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch.problems.update({ id: problem.id, patch: { title: problemTitle, description } })
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [problemTitle, description, problem, dispatch])

  // Live ids for the chip pickers come straight from the redux store - the
  // chip onChange handlers below dispatch updates synchronously, so no local
  // copy is needed and we always render the latest values.
  const updateColumn = (columnId: string, ids: string[]) => {
    if (!problem) return
    const field = COLUMN_TO_FIELD[columnId]
    const patch: ProblemPatch = { [field]: ids }
    dispatch.problems.update({ id: problem.id, patch })
  }

  return (
    <Dialog open={problem !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Refine the problem statement and the dimensions that frame it.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium" htmlFor="edit-title">
              Problem title
            </label>
            <Input
              id="edit-title"
              value={problemTitle}
              onChange={(e) => setProblemTitle(e.target.value)}
              placeholder="Give the problem a short, memorable name..."
              className="bg-[#fcfbf8]"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-base font-medium" htmlFor="edit-description">
              Problem description
            </label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..."
              rows={3}
              className="bg-[#fcfbf8]"
            />
          </div>
          <Separator />
          <div className="flex flex-col gap-3">
            {EDITABLE_COLUMNS.map((col) => (
              <DimensionPicker
                key={col.id}
                columnId={col.id}
                ids={(problem?.[COLUMN_TO_FIELD[col.id]] as string[] | undefined) ?? []}
                onChange={(ids) => updateColumn(col.id, ids)}
                label={col.title}
              />
            ))}
          </div>
          {showStatus && (
            <>
              <Separator />
              <StatusSelect
                status={status}
                setStatus={(v) => {
                  setStatus(v)
                  if (problem) dispatch.problems.update({ id: problem.id, patch: { validationStatus: v } })
                }}
              />
            </>
          )}
        </div>
        {problem && (() => {
          const hasContent =
            problemTitle.trim().length > 0 ||
            description.trim().length > 0 ||
            (problem.customers?.length ?? 0) > 0 ||
            (problem.contexts?.length ?? 0) > 0 ||
            (problem.problems?.length ?? 0) > 0
          const disabledHint = hasContent
            ? undefined
            : "Add a title, description, or pick at least one dimension item first"
          return (
            <DialogFooter>
              <Button
                variant="outline"
                className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
                disabled={!hasContent}
                title={disabledHint}
                onClick={() => {
                  onClose()
                  router.push(`/problems/${problem.id}/edit`)
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Problem
              </Button>
              <Button
                variant="outline"
                className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
                disabled={!hasContent}
                title={disabledHint}
                onClick={() => {
                  onClose()
                  router.push(`/problems/${problem.id}/explore/introduction`)
                }}
              >
                <Compass className="h-4 w-4 mr-2" />
                Explore the Problem
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                disabled={!hasContent}
                title={disabledHint}
                onClick={() => {
                  if (onDone) onDone(problem.id)
                  else onClose()
                }}
              >
                Done
              </Button>
            </DialogFooter>
          )
        })()}
      </DialogContent>
    </Dialog>
  )
}
