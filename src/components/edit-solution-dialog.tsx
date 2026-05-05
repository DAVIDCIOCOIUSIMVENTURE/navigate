"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { StatusSelect } from "@/components/ui/status-select"
import type { Solution } from "@/store/solutions-model"
import type { SolutionPatch } from "@/store/solutions-model"
import type { ValidationStatus } from "@/types/validation"
import { ExternalLink } from "lucide-react"

function useDebouncedCallback<T>(callback: (value: T) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (value: T) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => callback(value), delay)
  }
}

interface EditSolutionDialogProps {
  solution: Solution | null
  onClose: () => void
}

export function EditSolutionDialog({ solution, onClose }: EditSolutionDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [fields, setFields] = useState<{ title: string; description: string; validationStatus: ValidationStatus }>({
    title: "",
    description: "",
    validationStatus: "unvalidated",
  })
  const initRef = useRef(false)

  useEffect(() => {
    if (!solution) return
    initRef.current = false
    setFields({
      title: solution.title ?? "",
      description: solution.description ?? "",
      validationStatus: solution.validationStatus ?? "unvalidated",
    })
  }, [solution])

  const saveDebounced = useDebouncedCallback((next: typeof fields) => {
    if (!solution) return
    const patch: SolutionPatch = {
      title: next.title,
      description: next.description,
    }
    dispatch.solutions.update({ id: solution.id, patch })
  }, 500)

  useEffect(() => {
    if (!initRef.current) { initRef.current = true; return }
    saveDebounced(fields)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields])

  return (
    <Dialog open={solution !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Solution</DialogTitle>
          <DialogDescription className="sr-only">Edit Solution</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-solution-title">Title</label>
              <Input
                id="edit-solution-title"
                value={fields.title}
                onChange={(e) => setFields((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Short solution title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-solution-description">Description</label>
              <Textarea
                id="edit-solution-description"
                value={fields.description}
                onChange={(e) => setFields((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the solution..."
                rows={4}
              />
            </div>
          </div>
          <Separator />
          <StatusSelect
            status={fields.validationStatus}
            setStatus={(v) => {
              setFields((prev) => ({ ...prev, validationStatus: v }))
              if (solution) dispatch.solutions.update({ id: solution.id, patch: { validationStatus: v } })
            }}
          />
        </div>
        {solution && (
          <DialogFooter>
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => {
                onClose()
                router.push(`/solutions/${solution.id}`)
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Solution
            </Button>
            <Button onClick={onClose}>Done</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
