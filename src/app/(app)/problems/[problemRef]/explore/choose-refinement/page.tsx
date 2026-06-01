"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useProblem, getAdjacentSteps } from "../context"
import type { AnalysisToolType } from "@/types/solution"
import { Search, ArrowLeft, ArrowRight, TreePine, HelpCircle, Users } from "lucide-react"
import { MethodPickerBoard, type MethodPickerItem } from "@/components/method-picker-board"
import { ProblemContextCard } from "@/components/problem-context-card"

type ToolKey = "root-causes" | "five-whys" | "affected-groups"

const TOOL_ITEMS: MethodPickerItem[] = [
  {
    id: "root-causes",
    title: "Root Causes",
    shortDescription: "List the underlying causes that drive the problem.",
    longDescription:
      "List the underlying causes of the problem. Move beyond surface-level symptoms to uncover what is really driving the issue. Best when you have a strong sense of the problem but want to map the multiple forces feeding it.",
    helperText:
      "Example: \"Customers receive cold food\" maps to drivers taking multi-order routes, inaccurate prep estimates, no insulated packaging requirement, and routing that prioritises distance over delivery time.",
    icon: TreePine,
    tileColor: "bg-tertiary",
    estimatedMinutes: 10,
    enabled: true,
  },
  {
    id: "five-whys",
    title: "5 Whys Technique",
    shortDescription: "Ask \"Why?\" five times to drill down to the fundamental cause.",
    longDescription:
      "Start with the problem and ask \"Why?\" five times in succession. Each answer becomes the basis for the next question, drilling down to the fundamental root cause. Best when you suspect the obvious explanation is masking a deeper issue.",
    helperText:
      "Example: \"High return rate\" leads to: product doesn't match expectations, photos are inaccurate, photos come from manufacturers, no in-house photography workflow, no budget because returns weren't tracked by cause.",
    icon: HelpCircle,
    tileColor: "bg-tertiary",
    estimatedMinutes: 10,
    enabled: true,
  },
  {
    id: "affected-groups",
    title: "Affected Groups",
    shortDescription: "Identify who is most affected by the problem and how severely.",
    longDescription:
      "Identify who is most affected by this problem and how severely. Understanding the different groups helps you design a solution that targets the right audience.",
    helperText:
      "Example: \"Patients miss appointments\" affects elderly patients (critical: tech struggles, forget without reminders), working parents (high: schedule conflicts), and rural patients (medium: long travel makes rescheduling costly).",
    icon: Users,
    tileColor: "bg-tertiary",
    estimatedMinutes: 10,
    enabled: true,
  },
]

export default function ChooseRefinementPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problem, problemRef, analysisToolType, setAnalysisToolType } = useProblem()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const selectedTool = (analysisToolType || null) as ToolKey | null

  const handlePick = (id: string) => {
    setAnalysisToolType(id as AnalysisToolType)
    if (nextPath) router.push(nextPath)
  }

  const handleNext = () => {
    if (!nextPath) return
    if (!selectedTool) {
      setConfirmOpen(true)
      return
    }
    router.push(nextPath)
  }

  return (
    <>
      <Card className="w-full flex-1">
        <CardHeader className="px-10 pt-10 pb-0">
          <CardTitle icon={Search} iconBg="bg-tertiary">Choose Your Refinement Method</CardTitle>
        </CardHeader>
        <CardContent className="p-10 pt-6 flex flex-col gap-6">
          <ProblemContextCard problem={problem} />

          <p className="text-base leading-relaxed">
            Take time to understand <strong>why</strong> this problem exists and <strong>who</strong> it affects.
            Choose a refinement technique below to get started.
          </p>

          <MethodPickerBoard
            items={TOOL_ITEMS}
            selectedId={selectedTool}
            onPick={handlePick}
            ctaLabel="Use this method"
            reselectLabel="Continue with this method"
          />

          <div className="flex justify-between mt-2">
            {prevPath ? (
              <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
                <ArrowLeft className="h-4 w-4 mr-2" />Previous
              </Button>
            ) : <div />}
            {nextPath && (
              <Button onClick={handleNext}>
                Next<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Continue without a refinement method?</DialogTitle>
            <DialogDescription>
              You haven&apos;t chosen a refinement method yet. Picking one helps you uncover why the problem exists before moving on. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Go Back</Button>
            <Button
              onClick={() => {
                setConfirmOpen(false)
                if (nextPath) router.push(nextPath)
              }}
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
