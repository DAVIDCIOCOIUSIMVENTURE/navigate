"use client"

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ProblemCandidate } from "@/store/problem-candidates-model"

export function EditCandidateDialog({
  candidate,
  onOpenChange,
}: {
  candidate: ProblemCandidate | null
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const [title, setTitle] = useState(candidate?.title ?? "")

  useEffect(() => {
    if (candidate) setTitle(candidate.title)
  }, [candidate])

  function handleSave() {
    if (!candidate) return
    const trimmed = title.trim()
    if (trimmed.length === 0) return
    dispatch.problemCandidates.update({
      id: candidate.id,
      patch: { title: trimmed },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={candidate != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit candidate</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <label htmlFor="edit-candidate-title" className="text-base font-medium">
            Title
          </label>
          <Textarea
            id="edit-candidate-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base min-h-[5rem]"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={title.trim().length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
