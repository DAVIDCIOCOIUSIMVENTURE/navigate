"use client"

import { useState, useRef, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { brainstormColumns } from "@/data/brainstormData"
import { StatusSelect } from "@/components/ui/status-select"
import type { Problem, ProblemPatch } from "@/store/problems-model"
import type { ValidationStatus } from "@/types/idea"
import { resolveDimensionLabel, useResolveOrCreate } from "@/lib/dimension-labels"

const COLUMN_TO_FIELD: Record<string, keyof ProblemPatch> = {
  "customers": "customers",
  "contexts": "contexts",
  "problems": "problems",
}

function useDebouncedCallback<T>(callback: (value: T) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (value: T) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => callback(value), delay)
  }
}

interface EditProblemDialogProps {
  problem: Problem | null
  onClose: () => void
  title?: string
  showStatus?: boolean
}

export function EditProblemDialog({ problem, onClose, title = "Edit Problem", showStatus = true }: EditProblemDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  const resolveOrCreate = useResolveOrCreate()
  const [editFields, setEditFields] = useState<Record<string, string>>({})
  const initRef = useRef(false)

  useEffect(() => {
    if (!problem) return
    initRef.current = false
    const fields: Record<string, string> = { description: problem.description ?? "", validationStatus: problem.validationStatus ?? "unvalidated" }
    for (const col of brainstormColumns) {
      const field = COLUMN_TO_FIELD[col.id]
      fields[col.id] = (problem[field] as string[])
        .map((id) => resolveDimensionLabel(col.id, id, customByColumn, selfDiscoveryItems))
        .join(", ")
    }
    setEditFields(fields)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  const saveDebounced = useDebouncedCallback((fields: Record<string, string>) => {
    if (!problem) return
    const patch: ProblemPatch = { description: fields["description"] ?? "" }
    for (const col of brainstormColumns) {
      const field = COLUMN_TO_FIELD[col.id]
      const value = fields[col.id]?.trim()
      const tokens = value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []
      ;(patch as Record<string, unknown>)[field] = tokens
        .map((token) => resolveOrCreate(col.id, token))
        .filter(Boolean)
    }
    dispatch.problems.update({ id: problem.id, patch })
  }, 500)

  useEffect(() => {
    if (!initRef.current) { initRef.current = true; return }
    saveDebounced(editFields)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editFields])

  return (
    <Dialog open={problem !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">
            {title}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-description">
              Problem Description
            </label>
            <Textarea
              id="edit-description"
              value={editFields["description"] ?? ""}
              onChange={(e) =>
                setEditFields((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the problem..."
              rows={3}
            />
          </div>
          {brainstormColumns.map((col) => (
            <div key={col.id} className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor={`edit-${col.id}`}>
                {col.title}
              </label>
              <Input
                id={`edit-${col.id}`}
                value={editFields[col.id] ?? ""}
                onChange={(e) =>
                  setEditFields((prev) => ({ ...prev, [col.id]: e.target.value }))
                }
                placeholder={`e.g. ${col.items[0]?.label}`}
              />
            </div>
          ))}
          {showStatus && (
            <StatusSelect
              status={(editFields["validationStatus"] as ValidationStatus) ?? "unvalidated"}
              setStatus={(v) => {
                setEditFields((prev) => ({ ...prev, validationStatus: v }))
                if (problem) dispatch.problems.update({ id: problem.id, patch: { validationStatus: v } })
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
