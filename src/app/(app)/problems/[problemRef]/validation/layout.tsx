"use client"

import { useParams } from "next/navigation"
import { ShieldCheck, LayoutTemplate, ClipboardCheck, TrendingUp, Building2, PoundSterling } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ProblemFlowShell } from "@/components/problem-flow-shell"
import { ProblemProvider, useProblem, NAV_ITEMS } from "./context"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: ClipboardCheck,
  worth: PoundSterling,
  market: TrendingUp,
  competition: Building2,
  verdict: ShieldCheck,
  review: LayoutTemplate,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { problemRef, problem } = useProblem()

  return (
    <ProblemFlowShell
      title="Validate the problem"
      icon={ClipboardCheck}
      navLabel="Problem validation steps"
      problemRef={problemRef}
      problem={problem}
      base={`/problems/${problemRef}/validation`}
      navItems={NAV_ITEMS}
      navIcons={NAV_ICONS}
      journeyStep="validate-problems"
    >
      {children}
    </ProblemFlowShell>
  )
}

export default function ProblemRefLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemProvider>
  )
}
