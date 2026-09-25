"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { ProblemCanvas } from "@/components/canvas/problem-canvas"
import { IdentifySolutionsButton, SolutionsGuardDialog } from "@/components/solutions-guard"
import { FocusFlowHeader } from "@/components/focus-flow-header"
import { FocusPageShell } from "@/components/focus-page-shell"
import { MemberAvatarStack } from "@/components/member-avatar"
import { ProjectSettingsDialog } from "@/components/project-settings-dialog"
import { SolutionsTable } from "@/components/solutions-table"
import { useContainerSize } from "@/context/container-size-context"
import { problemJourneyStep, summariseProblemJourney } from "@/lib/journey-steps"
import { PROJECTS_HREF, projectDisplayName, projectRoutes } from "@/lib/projects"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import { ArrowLeft, FolderKanban, Lightbulb, Plus, Scale, Settings, Target } from "lucide-react"

/**
 * A project's page: its problem on the canvas (with Explore, Validate and
 * Edit) and the solutions found for it. A project with no problem yet shows
 * the way into the project's Identify problems hub instead.
 *
 * Unlike the flows it leads into, the page keeps the app header: opening a
 * project should always show the top menu. The left sidebar stays hidden
 * (see `hidesSidebarPath` in root-layout-client.tsx), and the project's own
 * left column takes its place: the project's name, its team, Settings and the
 * journey rail, with the canvas and the solutions beside it. Home and the
 * menu are in the header, so the column draws no chrome buttons of its own.
 */
export default function ProjectPage() {
  const params = useParams()
  const projectId = Number(params.projectId)
  const router = useRouter()
  const isWide = useContainerSize() === "wide"
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [nothingToCompare, setNothingToCompare] = useState(false)

  const hydrated = useSelector((state: RootState) => state.projects.hydrated)
  const project = useSelector((state: RootState) => state.projects.projects.find((p) => p.id === projectId))
  const problem = useSelector((state: RootState) =>
    project?.problemId == null ? undefined : state.problems.problems.find((p) => p.id === project.problemId),
  )
  const solutions = useSelector((state: RootState) => state.solutions.solutions)
  const linkedSolutions = problem ? solutions.filter((s) => s.problemId === problem.id) : []

  if (!hydrated) return null

  if (!project) {
    return (
      <div className="flex w-full flex-1 flex-col gap-3">
        <FocusFlowHeader title="Project" icon={FolderKanban} className="flex-wrap" chromeButtons={false} />
        <Card className="w-full">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-base">Project not found.</p>
            <Button asChild variant="outline">
              <Link href={PROJECTS_HREF}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to your projects
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const name = projectDisplayName(project, problem?.title)
  const journeyStep = problem ? problemJourneyStep(summariseProblemJourney(problem, solutions)) : "identify-problems"

  const header = (
    <FocusFlowHeader title={name} icon={FolderKanban} className="flex-wrap" chromeButtons={false}>
      <MemberAvatarStack members={project.members} />
      {/* One button: the portfolio and the way to delete the project both
          live inside the dialog it opens. */}
      <Button variant="outline" className="gap-2 bg-white" onClick={() => setSettingsOpen(true)}>
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </FocusFlowHeader>
  )

  return (
    <FocusPageShell header={header} journeyStep={journeyStep} journeyProblemId={problem?.id ?? null} chrome="app">
      {/* The canvas and the solutions scroll together beside the fixed left column. */}
      <div className={cn("flex w-full min-w-0 flex-col gap-4", isWide && "flex-1 min-h-0 overflow-y-auto")}>
        {problem ? (
          /* The canvas fills the viewport under the app header, leaving the solutions table peeking below. */
          <div className={cn("flex shrink-0 flex-col", isWide && "h-[calc(100svh-14rem)] min-h-[560px]")}>
            <ProblemCanvas problem={problem} editHref={projectRoutes.problemEdit(project.id)} />
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="p-10 flex flex-col items-center gap-6 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary-brand">
                <Target className="h-8 w-8 text-secondary-brand-foreground" />
              </div>
              <div className="flex flex-col gap-2 max-w-md">
                <h2 className="text-lg font-semibold">No problem yet</h2>
                <p className="text-base">
                  Every project starts with a problem worth solving. Identify one with a guided set of prompts, the Canvas Builder, Research, or by writing a problem statement directly.
                </p>
              </div>
              <Button size="lg" className="gap-2" onClick={() => router.push(projectRoutes.identify(project.id))} data-tour={TOUR_TARGETS.projectIdentifyProblem}>
                <Plus className="h-4 w-4" />
                Identify a problem
              </Button>
            </CardContent>
          </Card>
        )}

        {problem && (
          <SolutionsTable
            solutions={linkedSolutions}
            showProblem={false}
            className="shrink-0 min-h-[320px] max-h-[640px]"
            headerLead={
              <CardTitle size="md" className="text-foreground">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Solutions ({linkedSolutions.length})
                </span>
              </CardTitle>
            }
            headerExtra={
              <>
                <IdentifySolutionsButton
                  projectId={project.id}
                  status={problem.validationStatus}
                  className="gap-2"
                  data-tour={TOUR_TARGETS.projectIdentifySolutions}
                >
                  <Plus className="h-4 w-4" />
                  Identify solutions
                </IdentifySolutionsButton>
                <Button
                  variant="secondary-brand"
                  onClick={() =>
                    linkedSolutions.length === 0
                      ? setNothingToCompare(true)
                      : router.push(projectRoutes.compare(project.id))
                  }
                  className="gap-2"
                >
                  <Scale className="h-4 w-4" />
                  Compare solutions
                </Button>
              </>
            }
          />
        )}
      </div>

      {problem && (
        <SolutionsGuardDialog
          projectId={project.id}
          status={problem.validationStatus}
          reason="nothing-to-compare"
          open={nothingToCompare}
          onOpenChange={setNothingToCompare}
        />
      )}

      <ProjectSettingsDialog
        project={project}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onDeleted={() => router.push(PROJECTS_HREF)}
      />
    </FocusPageShell>
  )
}
