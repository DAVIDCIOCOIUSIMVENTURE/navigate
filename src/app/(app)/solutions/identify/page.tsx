"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Clock } from "lucide-react"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { MethodPickerBoard, type MethodPickerItem } from "@/components/method-picker-board"
import { saveActiveDiscoveryProblemId } from "@/lib/active-discovery-problem"

export default function IdentifySolutionsPage() {
  const router = useRouter()
  const isWide = useContainerSize() === "wide"

  const items: MethodPickerItem[] = [
    {
      id: "discovery",
      title: "Solution Discovery",
      shortDescription: "Pick a validated problem, refine your understanding, and generate solution candidates using creative techniques.",
      longDescription: "Pick a validated problem, refine your understanding, and generate solution candidates using creative techniques.",
      helperText: "Best for working through guided tools (analogy, SCAMPER, reverse ideation, root-cause attacks) instead of jumping to the first idea that comes to mind.",
      icon: Lightbulb,
      tileColor: "bg-tertiary",
      estimatedMinutes: 20,
      enabled: true,
    },
    {
      id: "quick-capture",
      title: "Quick Capture",
      shortDescription: "Already have an idea? Add it directly to the bank without going through the full discovery wizard.",
      longDescription: "Already have an idea? Add it directly to the bank without going through the full discovery wizard.",
      helperText: "Best for capturing a solution you already have in mind so you can come back and validate it later.",
      icon: Clock,
      tileColor: "bg-muted",
      estimatedMinutes: 5,
      enabled: false,
    },
  ]

  function handlePick(id: string) {
    switch (id) {
      case "discovery":
        saveActiveDiscoveryProblemId(null)
        router.push("/solutions/discover/select-problem")
        return
    }
  }

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card className={cn("w-full flex flex-col", isWide ? "flex-1 min-h-0 overflow-hidden" : "min-h-[320px]")}>
        <CardHeader className="space-y-6">
          <CardTitle icon={Lightbulb} iconBg="bg-tertiary">Identify Solutions</CardTitle>
          <div className="flex flex-col gap-3">
            <p className="text-base leading-relaxed">
              Solutions answer a problem you&apos;ve already validated. Pick the tool that fits where you are right now: each one is a different doorway into the same goal of finding a solution worth pursuing.
            </p>
            <p className="text-base leading-relaxed">
              <span className="font-semibold">Solution Discovery</span> walks you through creative techniques (analogy, SCAMPER, reverse ideation, root-cause attacks) to surface candidates you wouldn&apos;t reach by jumping to the first idea. <span className="font-semibold">Quick Capture</span> lets you log an idea you already have without working through the wizard.
            </p>
            <p className="text-base leading-relaxed">
              Whichever tool you choose, the resulting solution lands in your library where you can refine and validate it.
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
  )
}
