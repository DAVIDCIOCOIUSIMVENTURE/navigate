"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AboutDialog } from "@/components/about-toggle"
import { ProblemCanvas } from "@/components/canvas/problem-canvas"
import { JourneyProgressCard } from "@/components/journey-progress"
import { MemberAvatarStack } from "@/components/member-avatar"
import { DELETE_PROJECT_COPY } from "@/components/project-name-dialog"
import { ProjectSettingsDialog } from "@/components/project-settings-dialog"
import { SolutionsTable } from "@/components/solutions-table"
import { useContainerSize } from "@/context/container-size-context"
import { problemJourneyStep, summariseProblemJourney } from "@/lib/journey-steps"
import { HOME_HREF, projectDisplayName, projectRoutes } from "@/lib/projects"
import { TOUR_TARGETS } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import type { ValidationStatus } from "@/types/validation"
import { ArrowLeft, FolderKanban, Lightbulb, Plus, Scale, Settings, Target, Trash2 } from "lucide-react"

/** Solutions are identified only for problems that have come through validation as Valid or Unsure. */
const SOLUTION_READY_STATUSES: ValidationStatus[] = ["valid", "unsure"]

/**
 * A project's page: its problem on the canvas (with Explore, Validate and
 * Edit) and the solutions found for it. A project with no problem yet shows
 * the way into the project's Identify problems hub instead.
 */
export default function ProjectPage() {
  const params = useParams()
  const projectId = Number(params.projectId)
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const isWide = useContainerSize() === "wide"
  const [settingsOpen, setSettingsOpen] = useState(false)

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
      <div className="flex flex-col gap-3 w-full">
        <CardTitle size="md" icon={FolderKanban} className="text-xl text-foreground">Project</CardTitle>
        <Card className="w-full">
          <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
            <p className="text-base">Project not found.</p>
            <Button asChild variant="outline">
              <Link href={HOME_HREF}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const name = projectDisplayName(project, problem?.title)
  const journeyStep = problem ? problemJourneyStep(summariseProblemJourney(problem, solutions)) : "identify-problems"
  const solutionsReady = problem !== undefined && SOLUTION_READY_STATUSES.includes(problem.validationStatus)

  const identifySolutionsButton = (
    <Button
      onClick={() => router.push(projectRoutes.identifySolutions(project.id))}
      disabled={!solutionsReady}
      className="gap-2"
      data-tour={TOUR_TARGETS.projectIdentifySolutions}
    >
      <Plus className="h-4 w-4" />
      Identify solutions
    </Button>
  )

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <CardTitle size="md" icon={FolderKanban} className="text-xl text-foreground min-w-0">
            <span className="truncate">{name}</span>
          </CardTitle>
          <AboutDialog subject="this project">
            <p>
              A <span className="font-bold">project</span> is one problem and the solutions you find for it.
              Use <span className="font-bold">Explore</span> to dig into the problem, <span className="font-bold">Validate</span> to decide whether it is worth solving,
              then <span className="font-bold">Identify solutions</span> once it is marked Valid or Unsure. Every solution you capture is listed below the problem.
            </p>
          </AboutDialog>
          <MemberAvatarStack members={project.members} />
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={() => setSettingsOpen(true)} className="gap-2 bg-white">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <ConfirmDialog
            trigger={
              <Button variant="destructive-outline" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            }
            title={DELETE_PROJECT_COPY.title}
            description={DELETE_PROJECT_COPY.description}
            onConfirm={async () => {
              await dispatch.projects.delete(project.id)
              router.push(HOME_HREF)
            }}
          />
        </div>
      </div>

      <JourneyProgressCard activeId={journeyStep} problemId={problem?.id ?? null} orientation="horizontal" />

      {problem ? (
        <div className={cn("flex flex-col", isWide && "h-[calc(100svh-12rem)] min-h-[560px]")}>
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
                Every project starts with a problem worth solving. Identify one with Reflect, the Canvas Builder, Research, or by writing a problem statement directly.
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
          className="min-h-[320px] max-h-[640px]"
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
              {solutionsReady ? (
                identifySolutionsButton
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-flex">{identifySolutionsButton}</span>
                  </TooltipTrigger>
                  <TooltipContent>Validate the problem as Valid or Unsure first.</TooltipContent>
                </Tooltip>
              )}
              <Button
                variant="secondary-brand"
                onClick={() => router.push(projectRoutes.compare(project.id))}
                className="gap-2"
                disabled={linkedSolutions.length === 0}
              >
                <Scale className="h-4 w-4" />
                Compare solutions
              </Button>
            </>
          }
        />
      )}

      <ProjectSettingsDialog project={project} open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
