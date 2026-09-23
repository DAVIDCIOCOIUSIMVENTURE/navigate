"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useIdentifySolutions, getAdjacentSteps } from "../context"
import type { DiscoveryToolType } from "@/types/solution"
import { Shuffle, ArrowLeft, Lightbulb, RotateCcw, GitCompare, Wrench } from "lucide-react"
import { MethodPickerBoard, type MethodPickerItem } from "@/components/method-picker-board"

type ToolKey = "scamper" | "reverse" | "analogy" | "improve"

const TOOL_ITEMS: MethodPickerItem[] = [
  {
    id: "scamper",
    title: "SCAMPER",
    shortDescription: "Take an existing solution and transform it in seven ways to generate new solution ideas.",
    longDescription: "SCAMPER starts from a solution that already exists, whether one people use today or your own first idea, and asks seven questions of it: what could you Substitute, Combine, Adapt, Modify, Put to Other Use, Eliminate or Reverse? Each transformation is a candidate solution you would not reach by conventional brainstorming.",
    helperText: "Best when a solution already exists, or you have a first idea, and want structured ways to turn it into something new.",
    icon: Lightbulb,
    estimatedMinutes: 20,
    enabled: true,
  },
  {
    id: "improve",
    title: "Improve Existing Solutions",
    shortDescription: "Systematically improve an existing product or service across 15 customer journey dimensions.",
    longDescription: "Rather than inventing something entirely new, systematically improve an existing product or service from the customer's perspective. Work through 15 improvement dimensions covering the entire customer journey: core functionality, ease of use, trust, delivery, and post-purchase experience.",
    helperText: "Best when a solution already exists and you want to make it meaningfully better.",
    icon: Wrench,
    estimatedMinutes: 20,
    enabled: true,
  },
  {
    id: "analogy",
    title: "Analogy Thinking",
    shortDescription: "Look outside your domain for inspiration and cross-pollinate ideas from other industries.",
    longDescription: "Look outside your domain for inspiration. How have other industries solved similar problems? Cross-pollinating ideas from different fields often leads to breakthrough solutions that feel fresh and unexpected.",
    helperText: "Best when you feel stuck inside your own industry's conventions.",
    icon: GitCompare,
    estimatedMinutes: 15,
    enabled: true,
  },
  {
    id: "reverse",
    title: "Reverse Ideation",
    shortDescription: "Generate ideas by first making the problem worse, then flipping each one into a solution.",
    longDescription: "Instead of solving the problem directly, first generate ways to make it worse. Then flip each 'make it worse' idea to discover creative solutions you might not have considered. This counterintuitive approach breaks you out of conventional thinking patterns.",
    helperText: "Best when conventional brainstorming keeps circling the same few ideas.",
    icon: RotateCcw,
    estimatedMinutes: 15,
    enabled: true,
  },
]

export default function PickMethodPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { projectId, discoveryToolType, setDiscoveryToolType } = useIdentifySolutions()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, projectId)

  const selectedTool = (discoveryToolType || null) as ToolKey | null

  const handleChoose = (tool: ToolKey) => {
    setDiscoveryToolType(tool as DiscoveryToolType)
    if (nextPath) router.push(nextPath)
  }

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Shuffle}>Pick a method</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <p className="text-base leading-relaxed">
          Use creative ideation techniques to generate solution candidates. Pick the method that fits where you are right now: each one is a different angle on the same problem.
        </p>

        <MethodPickerBoard
          items={TOOL_ITEMS}
          selectedId={selectedTool}
          onPick={(id) => handleChoose(id as ToolKey)}
        />

        {prevPath && (
          <div className="flex justify-start mt-2">
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
