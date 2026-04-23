"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Clock, PenLine, ArrowRight, Search } from "lucide-react"
import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import { useRouter } from "next/navigation"
import { brainstormColumns } from "@/data/brainstormData"
import type { ProblemPatch } from "@/store/problems-model"

const COLUMN_TO_FIELD: Record<string, keyof ProblemPatch> = {
  "customer-segments": "customerSegments",
  "contexts": "contexts",
  "jobs-to-be-done": "jobsToBeDone",
  "problem-types": "problemTypes",
}

interface SearchProblemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type View = "menu" | "manual"

export function SearchProblemDialog({ open, onOpenChange }: SearchProblemDialogProps) {
  const [view, setView] = useState<View>("menu")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [description, setDescription] = useState("")
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  function handleClose() {
    onOpenChange(false)
    setView("menu")
    setFields({})
    setDescription("")
  }

  function handleManualSubmit() {
    const patch: ProblemPatch = {}
    for (const col of brainstormColumns) {
      const field = COLUMN_TO_FIELD[col.id]
      const value = fields[col.id]?.trim()
      if (value) {
        ;(patch as Record<string, string[]>)[field] = value.split(",").map((s) => s.trim()).filter(Boolean)
      }
    }
    const trimmedDescription = description.trim()
    if (trimmedDescription) {
      patch.description = trimmedDescription
    }
    const hasColumnField = Object.entries(patch).some(([key, v]) => key !== "description" && Array.isArray(v) && v.length > 0)
    if (!hasColumnField && !trimmedDescription) return
    dispatch.problems.create({ ...patch, source: "manual" })
    handleClose()
  }

  const hasAnyField = brainstormColumns.some((col) => fields[col.id]?.trim()) || description.trim().length > 0

  function handleBrainstorm() {
    handleClose()
    router.push("/problems/brainstorm")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {view === "menu" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                Search for a New Problem
              </DialogTitle>
              <DialogDescription>
                Choose how you&apos;d like to identify a problem worth solving.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={handleBrainstorm}
                className="flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Brainstorming Tool</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Guided prompts to help you uncover problems from your own experience and observations.
                  </span>
                </div>
              </button>

              <button
                disabled
                className="flex items-start gap-4 rounded-lg border p-4 text-left opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Changes in the Environment</span>
                    <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Spot problems emerging from market shifts, technology changes, or regulatory updates.
                  </span>
                </div>
              </button>

              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 border-t" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t" />
              </div>

              <button
                onClick={() => setView("manual")}
                className="flex items-start gap-4 rounded-lg border border-dashed p-4 text-left hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted shrink-0">
                  <PenLine className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Define a Problem Statement</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Already know what you want to explore? Write it directly.
                  </span>
                </div>
              </button>
            </div>
          </>
        )}

        {view === "manual" && (
          <>
            <DialogHeader>
              <DialogTitle>Define a Problem Statement</DialogTitle>
              <DialogDescription>
                Fill in one or more fields to describe the problem. Use commas to separate multiple items.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="new-description">
                  Problem Description
                </label>
                <Textarea
                  id="new-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the problem."
                  rows={3}
                />
              </div>
              {brainstormColumns.map((col) => (
                <div key={col.id} className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor={`new-${col.id}`}>
                    {col.title}
                  </label>
                  <Input
                    id={`new-${col.id}`}
                    value={fields[col.id] ?? ""}
                    onChange={(e) => setFields((prev) => ({ ...prev, [col.id]: e.target.value }))}
                    placeholder={`e.g. ${col.items[0]?.label}`}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={handleManualSubmit} disabled={!hasAnyField}>
                  Add Problem
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
