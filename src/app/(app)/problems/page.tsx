"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProblemsTable } from "@/components/problems-table"
import { BundleMenuButton } from "@/components/bundle-menu-button"
import { Plus, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"

export default function ProblemsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const problems = useSelector((state: RootState) => state.problems.problems)
  const isWide = useContainerSize() === "wide"

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0", isWide && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="flex-1 min-w-[16rem] text-base leading-relaxed">
              This is your <span className="font-bold">problem library</span>, a central place to collect, refine, and track the problems you&apos;ve identified.
              The workflow has two steps. First, <span className="font-bold">identify</span> problems worth solving by combining customer segments, contexts, and types of pain with what you&apos;ve learned about yourself.
              Then <span className="font-bold">validate</span> each one by refining who feels it, when it shows up, why it matters, and how today&apos;s alternatives fall short, so you can decide whether it&apos;s real and painful enough to commit to.
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button onClick={() => router.push("/problems/identify")} className="gap-2">
                <Plus className="h-4 w-4" />
                Identify problems
              </Button>
              <BundleMenuButton kind="problem" />
            </div>
          </div>
        </CardContent>
      </Card>

      {!mounted || problems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 py-24">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-brand">
            <Target className="h-8 w-8 text-secondary-brand-foreground" />
          </div>
          <div className="text-center flex flex-col gap-2 max-w-sm">
            <h2 className="text-lg font-semibold">No problems yet</h2>
            <p className="text-base">
              Start by searching for problems using the Identify Problems tool or define one directly.
            </p>
          </div>
          <Button onClick={() => router.push("/problems/identify")} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Identify problems
          </Button>
        </div>
      ) : (
        <ProblemsTable problems={problems} showStatus showEditDelete className={cn(isWide ? "flex-1 min-h-0" : "min-h-[320px] max-h-[640px]")} />
      )}

    </div>
  )
}
