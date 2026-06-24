"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/lib/router"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { ProblemCandidate } from "@/store/problem-candidates-model"

export function PromoteCandidateDialog({
  candidate,
  onOpenChange,
}: {
  candidate: ProblemCandidate | null
  onOpenChange: (open: boolean) => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [title, setTitle] = useState(candidate?.title ?? "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (candidate) setTitle(candidate.title)
  }, [candidate])

  async function handlePromote() {
    if (!candidate) return
    setSaving(true)
    try {
      const trimmed = title.trim()
      if (trimmed !== candidate.title) {
        dispatch.problemCandidates.update({
          id: candidate.id,
          patch: { title: trimmed },
        })
      }
      const newProblemId = await dispatch.problemCandidates.promote(candidate.id)
      onOpenChange(false)
      if (newProblemId != null) {
        toast.success("Created Problem from candidate", {
          action: {
            label: "Open Problem",
            onClick: () => router.push(`/problems/${newProblemId}/edit`),
          },
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={candidate != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Promote to Problem</DialogTitle>
          <DialogDescription>
            This creates a new, blank Problem with the title below. You will fill in
            customers, contexts, and the rest in the refinement flow.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <label htmlFor="promote-title" className="text-base font-medium">
            Title
          </label>
          <Input
            id="promote-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePromote}
            disabled={saving || title.trim().length === 0}
            className="gap-2"
          >
            {saving ? "Promoting..." : "Promote"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
