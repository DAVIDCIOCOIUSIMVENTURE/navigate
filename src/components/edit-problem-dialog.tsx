"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { brainstormColumns } from "@/data/brainstormData"
import { StatusSelect } from "@/components/ui/status-select"
import type { Problem, ProblemPatch } from "@/store/problems-model"
import type { ValidationStatus } from "@/types/idea"
import { DimensionPicker } from "@/components/dimension-picker"
import { ExternalLink } from "lucide-react"

const COLUMN_TO_FIELD: Record<string, "customers" | "contexts" | "problems"> = {
  customers: "customers",
  contexts: "contexts",
  problems: "problems",
}

const EDITABLE_COLUMNS = brainstormColumns.filter((col) => col.id in COLUMN_TO_FIELD)

interface EditProblemDialogProps {
  problem: Problem | null
  onClose: () => void
  title?: string
  showStatus?: boolean
}

export function EditProblemDialog({ problem, onClose, title = "Edit Problem", showStatus = true }: EditProblemDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<ValidationStatus>("unvalidated")
  const initRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!problem) return
    initRef.current = false
    setDescription(problem.description ?? "")
    setStatus(problem.validationStatus ?? "unvalidated")
  }, [problem])

  useEffect(() => {
    if (!problem) return
    if (!initRef.current) { initRef.current = true; return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch.problems.update({ id: problem.id, patch: { description } })
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [description, problem, dispatch])

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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-description">
              Problem description
            </label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..."
              rows={3}
            />
          </div>
          {EDITABLE_COLUMNS.map((col) => (
            <DimensionPicker
              key={col.id}
              columnId={col.id}
              ids={(problem?.[COLUMN_TO_FIELD[col.id]] as string[] | undefined) ?? []}
              onChange={(ids) => updateColumn(col.id, ids)}
              label={col.title}
            />
          ))}
          {showStatus && (
            <StatusSelect
              status={status}
              setStatus={(v) => {
                setStatus(v)
                if (problem) dispatch.problems.update({ id: problem.id, patch: { validationStatus: v } })
              }}
            />
          )}
        </div>
        {problem && (
          <DialogFooter>
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => {
                onClose()
                router.push(`/problems/${problem.id}`)
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Problem
            </Button>
            <Button onClick={onClose}>Done</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
