"use client"

import { useState, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, PenLine, Glasses, Microscope, ArrowRight, Target } from "lucide-react"
import { EditProblemDialog } from "@/components/edit-problem-dialog"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

type ToolOption = {
  icon: ComponentType<{ className?: string }>
  iconBg: string
  title: string
  description: string
  bestFor: string
  onSelect: () => void
}

function ToolCard({ option }: { option: ToolOption }) {
  const Icon = option.icon
  return (
    <button
      onClick={option.onSelect}
      className="group flex w-full items-start gap-4 rounded-lg border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className={cn("flex items-center justify-center w-12 h-12 rounded-lg shrink-0", option.iconBg)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-lg">{option.title}</span>
          <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
        <p className="text-base leading-relaxed">{option.description}</p>
        <p className="text-base">
          <span className="font-semibold">Best for: </span>
          {option.bestFor}
        </p>
      </div>
    </button>
  )
}

export default function IdentifyProblemsPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const isWide = useContainerSize() === "wide"

  const [draftProblemId, setDraftProblemId] = useState<number | null>(null)
  const draftProblem = useSelector((s: RootState) =>
    draftProblemId !== null ? s.problems.problems.find((p) => p.id === draftProblemId) ?? null : null
  )

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

  const tools: ToolOption[] = [
    {
      icon: Brain,
      iconBg: "bg-yellow-600",
      title: "Identify Problems Tool",
      description: "Combine customer segments, contexts, and types of pain on a single canvas to surface problems worth solving.",
      bestFor: "exploring a wide space of possibilities by mixing dimensions you can choose from a curated catalog.",
      onSelect: () => router.push("/problems/identify/canvas-builder"),
    },
    {
      icon: Glasses,
      iconBg: "bg-teal-700",
      title: "Reflect",
      description: "Turn a lived experience into a problem through guided prompts about your own life and work.",
      bestFor: "founders who already feel a friction in their own day-to-day and want to articulate it clearly.",
      onSelect: () => router.push("/problems/reflect"),
    },
    {
      icon: Microscope,
      iconBg: "bg-emerald-800",
      title: "Research",
      description: "Hunt for problems out in the world using curated tools and a guided capture form.",
      bestFor: "looking outside your own experience: review sites, forums, communities, and conversations with strangers.",
      onSelect: () => router.push("/problems/research"),
    },
    {
      icon: PenLine,
      iconBg: "bg-blue-900",
      title: "Define a Problem Statement",
      description: "Already know what you want to explore? Write it directly without working through a method.",
      bestFor: "capturing a problem you have in mind right now so you can come back and validate it later.",
      onSelect: handleDefine,
    },
  ]

  return (
    <>
      <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
        <Card className={cn("w-full flex flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
          <CardHeader className="space-y-6">
            <CardTitle icon={Target} iconBg="bg-tertiary">Identify a Problem</CardTitle>
            <div className="flex flex-col gap-3">
              <p className="text-base leading-relaxed">
                Every problem you bring into your library starts here. Pick the method that fits where you are right now: each one is a different doorway into the same goal of finding a problem that&apos;s real, painful, and worth solving.
              </p>
              <p className="text-base leading-relaxed">
                You can use more than one method over time. Many founders start with the <span className="font-semibold">Identify Problems Tool</span> to explore broadly, then return to <span className="font-semibold">Reflect</span> or <span className="font-semibold">Research</span> when they want to ground a specific candidate in lived experience or outside evidence. If you already know what you want to explore, <span className="font-semibold">Define a Problem Statement</span> lets you skip straight to capturing it.
              </p>
              <p className="text-base leading-relaxed">
                Whichever method you choose, the resulting problem lands in your library where you can refine and validate it.
              </p>
            </div>
          </CardHeader>
          <CardContent className={cn("flex flex-col gap-3", isWide && "flex-1 min-h-0 overflow-y-auto")}>
            {tools.map((tool) => (
              <ToolCard key={tool.title} option={tool} />
            ))}
          </CardContent>
        </Card>
      </div>

      <EditProblemDialog
        problem={draftProblem}
        onClose={handleDraftClose}
        title="Define a Problem Statement"
        showStatus={false}
      />
    </>
  )
}
