"use client"

import { ShieldCheck, LayoutTemplate, ClipboardCheck, TrendingUp, Building2, PoundSterling } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { ProblemFlowShell } from "@/components/problem-flow-shell"
import { ProjectProblemGate } from "@/components/project-gates"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
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
  const { projectId, problemRef, problem } = useProblem()

  return (
    <ProblemFlowShell
      title="Validate the problem"
      icon={ClipboardCheck}
      navLabel="Problem validation steps"
      problemRef={problemRef}
      problem={problem}
      base={projectRoutes.validationBase(projectId)}
      navItems={NAV_ITEMS}
      navIcons={NAV_ICONS}
      journeyStep="validate-problems"
    >
      {children}
    </ProblemFlowShell>
  )
}

export default function ProblemValidationLayout({ children }: { children: React.ReactNode }) {
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
