"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Brain, Clock, PenLine, ArrowRight, Target } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { useRouter } from "next/navigation"
import { EditProblemDialog } from "@/components/edit-problem-dialog"

interface SearchProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchProblemDialog({ open, onOpenChange }: SearchProblemDialogProps) {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const [draftProblemId, setDraftProblemId] = useState<number | null>(null)
  const draftProblem = useSelector((s: RootState) =>
    draftProblemId !== null ? s.problems.problems.find((p) => p.id === draftProblemId) ?? null : null
  )

  function handleClose() {
    onOpenChange(false)
  }

  function handleBrainstorm() {
    handleClose()
    router.push("/problems/brainstorm")
  }

  async function handleDefine() {
    const created = await dispatch.problems.create({ source: "manual" })
    setDraftProblemId(created.id)
    onOpenChange(false)
  }

  function handleDraftClose() {
    if (draftProblem) {
      const isEmpty =
        !draftProblem.description.trim() &&
        draftProblem.customers.length === 0 &&
        draftProblem.contexts.length === 0 &&
        draftProblem.problems.length === 0
      if (isEmpty) {
        dispatch.problems.delete(draftProblem.id)
      }
    }
    setDraftProblemId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary shrink-0">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              Identify Problems
            </DialogTitle>
            <DialogDescription>
              Choose how you&apos;d like to identify a problem worth solving.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <button
              onClick={handleBrainstorm}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500 shrink-0">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Brainstorming Tool</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm leading-relaxed">
                  Guided prompts to help you uncover problems from your own experience and observations.
                </span>
              </div>
            </button>

            <button
              onClick={handleDefine}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500 shrink-0">
                <PenLine className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Define a Problem Statement</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm leading-relaxed">
                  Already know what you want to explore? Write it directly.
                </span>
              </div>
            </button>

            <button
              disabled
              className="flex items-start gap-4 rounded-lg border bg-card p-4 text-left opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Changes in the Environment</span>
                  <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
                </div>
                <span className="text-sm leading-relaxed">
                  Spot problems emerging from market shifts, technology changes, or regulatory updates.
                </span>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <EditProblemDialog
        problem={draftProblem}
        onClose={handleDraftClose}
        title="Define a Problem Statement"
        showStatus={false}
      />
    </>
  )
}
