"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, PenLine, Glasses, Microscope, Target } from "lucide-react"
import { EditProblemDialog } from "@/components/edit-problem-dialog"
import { ProblemSavedDialog } from "@/components/problem-saved-dialog"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { MethodPickerBoard, type MethodPickerItem } from "@/components/method-picker-board"

export default function IdentifyProblemsPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const isWide = useContainerSize() === "wide"

  const [draftProblemId, setDraftProblemId] = useState<number | null>(null)
  const draftProblem = useSelector((s: RootState) =>
    draftProblemId !== null ? s.problems.problems.find((p) => p.id === draftProblemId) ?? null : null
  )

  const [savedProblemId, setSavedProblemId] = useState<number | null>(null)
  const [savedDialogOpen, setSavedDialogOpen] = useState(false)

  async function handleDefine() {
    const created = await dispatch.problems.create({ source: "manual" })
    setDraftProblemId(created.id)
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

  function handleDraftDone(problemId: number) {
    setDraftProblemId(null)
    setSavedProblemId(problemId)
    setSavedDialogOpen(true)
  }

  const items: MethodPickerItem[] = [
    {
      id: "reflect",
      title: "Reflect",
      shortDescription: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      longDescription: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      helperText: "Best for founders who already feel a friction in their own day-to-day and want to articulate it clearly.",
      icon: Glasses,
      tileColor: "bg-tertiary",
      estimatedMinutes: 10,
      enabled: true,
    },
    {
      id: "canvas-builder",
      title: "Canvas Builder",
      shortDescription: "Combine customer segments, contexts, and types of pain on a single canvas to surface problems worth solving.",
      longDescription: "Combine customer segments, contexts, and types of pain on a single canvas to surface problems worth solving.",
      helperText: "Best for exploring a wide space of possibilities by mixing dimensions you can choose from a curated catalog.",
      icon: Brain,
      tileColor: "bg-tertiary",
      estimatedMinutes: 15,
      enabled: true,
    },
    {
      id: "research",
      title: "Research",
      shortDescription: "Hunt for problems out in the world using curated tools and a guided capture form.",
      longDescription: "Hunt for problems out in the world using curated tools and a guided capture form.",
      helperText: "Best for looking outside your own experience: review sites, forums, communities, and conversations with strangers.",
      icon: Microscope,
      tileColor: "bg-tertiary",
      estimatedMinutes: 20,
      enabled: true,
    },
    {
      id: "define",
      title: "Define a Problem Statement",
      shortDescription: "Already know what you want to explore? Write it directly without working through a tool.",
      longDescription: "Already know what you want to explore? Write it directly without working through a tool.",
      helperText: "Best for capturing a problem you have in mind right now so you can come back and validate it later.",
      icon: PenLine,
      tileColor: "bg-tertiary",
      estimatedMinutes: 5,
      enabled: true,
    },
  ]

  function handlePick(id: string) {
    switch (id) {
      case "canvas-builder":
        router.push("/problems/identify/canvas-builder")
        return
      case "reflect":
        router.push("/problems/identify/reflect")
        return
      case "research":
        router.push("/problems/identify/research")
        return
      case "define":
        handleDefine()
        return
    }
  }

  return (
    <>
      <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
        <Card className={cn("w-full flex flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
          <CardHeader className="space-y-6">
            <CardTitle icon={Target} iconBg="bg-tertiary">Identify a Problem</CardTitle>
            <div className="flex flex-col gap-3">
              <p className="text-base leading-relaxed">
                Every problem you bring into your library starts here. Pick the tool that fits where you are right now: each one is a different doorway into the same goal of finding a problem that&apos;s real, painful, and worth solving.
              </p>
              <p className="text-base leading-relaxed">
                You can use more than one tool over time. Many founders start with the <span className="font-semibold">Canvas Builder</span> to explore broadly, then return to <span className="font-semibold">Reflect</span> or <span className="font-semibold">Research</span> when they want to ground a specific candidate in lived experience or outside evidence. If you already know what you want to explore, <span className="font-semibold">Define a Problem Statement</span> lets you skip straight to capturing it.
              </p>
              <p className="text-base leading-relaxed">
                Whichever tool you choose, the resulting problem lands in your library where you can refine and validate it.
              </p>
            </div>
          </CardHeader>
          <CardContent className={cn("flex flex-col gap-3", isWide && "flex-1 min-h-0 overflow-y-auto")}>
            <MethodPickerBoard
              items={items}
              selectedId={null}
              onPick={handlePick}
              ctaLabel="Use this tool"
              reselectLabel="Continue with this tool"
            />
          </CardContent>
        </Card>
      </div>

      <EditProblemDialog
        problem={draftProblem}
        onClose={handleDraftClose}
        onDone={handleDraftDone}
        title="Define a Problem Statement"
        showStatus={false}
      />

      <ProblemSavedDialog
        open={savedDialogOpen}
        onOpenChange={setSavedDialogOpen}
        problemId={savedProblemId}
      />
    </>
  )
}
