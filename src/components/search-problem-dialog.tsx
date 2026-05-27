"use client"

import { useState, type ComponentType } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Brain, PenLine, Telescope, Microscope, ArrowRight } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { useRouter } from "next/navigation"
import { EditProblemDialog } from "@/components/edit-problem-dialog"

interface SearchProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ToolCard({
  icon: Icon,
  iconBg,
  title,
  description,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  iconBg: string
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${iconBg}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">{title}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="text-base leading-relaxed">{description}</span>
      </div>
    </button>
  )
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

  function handleNavigate(path: string) {
    handleClose()
    router.push(path)
  }

  async function handleDefine() {
    const created = await dispatch.problems.create({ source: "manual" })
    setDraftProblemId(created.id)
    onOpenChange(false)
  }

  function handleDraftClose() {
    if (draftProblem) {
      const isEmpty =
        !draftProblem.title.trim() &&
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
            <DialogTitle>Identify Problems</DialogTitle>
            <DialogDescription>
              Choose how you&apos;d like to identify a problem worth solving.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-2">
            <ToolCard
              icon={Brain}
              iconBg="bg-yellow-600"
              title="Identify Problems Tool"
              description="Combine customer segments, contexts, and types of pain to surface problems worth solving."
              onClick={() => handleNavigate("/problems/identify")}
            />

            <ToolCard
              icon={Telescope}
              iconBg="bg-teal-700"
              title="Reflect"
              description="Turn a lived experience into a problem through guided prompts about your own life and work."
              onClick={() => handleNavigate("/problems/reflect")}
            />

            <ToolCard
              icon={Microscope}
              iconBg="bg-emerald-800"
              title="Research"
              description="Hunt for problems out in the world using curated tools and a guided capture form."
              onClick={() => handleNavigate("/problems/research")}
            />

            <ToolCard
              icon={PenLine}
              iconBg="bg-blue-900"
              title="Define a Problem Statement"
              description="Already know what you want to explore? Write it directly."
              onClick={handleDefine}
            />
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
