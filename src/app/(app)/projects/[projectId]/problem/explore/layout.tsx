"use client"

import { GitFork, Compass, LayoutTemplate, Users, Search, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ProblemFlowShell } from "@/components/problem-flow-shell"
import { ProjectProblemGate } from "@/components/project-gates"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
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
  const { projectId, problemRef, problem } = useProblem()

  return (
    <ProblemFlowShell
      title="Explore the problem"
      icon={Compass}
      navLabel="Explore the problem steps"
      problemRef={problemRef}
      problem={problem}
      base={projectRoutes.exploreBase(projectId)}
      navItems={NAV_ITEMS}
      navIcons={NAV_ICONS}
      journeyStep="explore-problems"
    >
      {children}
    </ProblemFlowShell>
  )
}

export default function ProblemExploreLayout({ children }: { children: React.ReactNode }) {
  const scope = useProjectScope()

  return (
    <ProjectProblemGate scope={scope}>
      {(problem) => (
        <ProblemProvider projectId={scope.projectId} problemRef={String(problem.id)}>
          <LayoutContent>{children}</LayoutContent>
        </ProblemProvider>
      )}
    </ProjectProblemGate>
  )
}
