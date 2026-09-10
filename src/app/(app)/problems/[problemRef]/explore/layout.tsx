"use client"

import { useParams } from "next/navigation"
import { GitFork, Compass, LayoutTemplate, Users, Search, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ProblemFlowShell } from "@/components/problem-flow-shell"
import { ProblemProvider, useProblem, NAV_ITEMS } from "./context"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: Compass,
  customer: Users,
  "choose-refinement": Search,
  refine: Search,
  "existing-solutions": GitFork,
  "jobs-to-be-done": Sparkles,
  review: LayoutTemplate,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { problemRef, problem } = useProblem()

  return (
    <ProblemFlowShell
      title="Explore the problem"
      icon={Compass}
      navLabel="Explore the problem steps"
      problemRef={problemRef}
      problem={problem}
      base={`/problems/${problemRef}/explore`}
      navItems={NAV_ITEMS}
      navIcons={NAV_ICONS}
      journeyStep="explore-problems"
    >
      {children}
    </ProblemFlowShell>
  )
}

export default function ProblemExploreLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemProvider>
  )
}
