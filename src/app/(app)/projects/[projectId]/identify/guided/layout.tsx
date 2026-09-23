"use client"

import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import { useDispatch, useSelector } from "react-redux"
import { usePathname, useRouter } from "next/navigation"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { FocusChromeButtons } from "@/components/focus-chrome-buttons"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { GUIDED_TOOL, GUIDED_TOOL_ID } from "@/data/guidedDiscovery"
import { guidedProgressLabel, isGuidedCapture } from "@/lib/guided-discovery"
import { GuidedProvider, useGuided } from "@/components/guided/guided-context"
import { GuidedStartingCard } from "@/components/guided/guided-starting-card"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { JourneyProgressCard } from "@/components/journey-progress"
import { FOCUS_COLUMN_MAX_HEIGHT_CLASS } from "@/components/problem-flow-shell"
import { selectReflectProject, type ReflectStep } from "@/store/reflect-sessions-model"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { LensStepper } from "../[lensId]/lens-stepper"
import { clampQuestionIndex, guidedHrefs, guidedResumeHref, parseGuidedPath } from "./routes"

const GUIDED_STEPS: { id: ReflectStep; label: string }[] = [
  { id: "prompts", label: "Questions" },
  { id: "review", label: "Review" },
]

/**
 * Shell for Guided discovery. It mirrors the guided prompt tools' shell: the
 * "resume where you left off" landing on the bare tool URL, the store's last
 * position kept in step with the URL, and the chrome buttons, title and
 * stepper around each step page. The one difference is that the number of
 * questions is not fixed: it is the length of the path the answers so far have
 * opened, so a question number beyond it is sent back to the last one reached.
 */
export default function GuidedLayout({ children }: { children: ReactNode }) {
  const { projectId, problem: existing } = useProjectScope()
  // Only a run captured with this tool pre-fills a revisit; a lens capture is left alone.
  const seed = existing && isGuidedCapture(existing.reflection) ? existing.reflection : null
  return (
    <GuidedProvider projectId={projectId} seed={seed}>
      <GuidedShell>{children}</GuidedShell>
    </GuidedProvider>
  )
}

function GuidedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { projectId, problem: existing } = useProjectScope()
  const { path } = useGuided()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const { lastPickedLensId: storedToolId, lastStep: storedStep, lastPromptIndex: storedIndex } = useSelector(
    (s: RootState) => selectReflectProject(s, projectId),
  )
  const isWide = useContainerSize() === "wide"
  const hrefs = useMemo(() => guidedHrefs(projectId), [projectId])

  const route = useMemo(() => parseGuidedPath(pathname), [pathname])
  const pathLength = path.nodes.length

  // Non-canonical URLs, and a question number the path does not reach, get replaced.
  useEffect(() => {
    if (route.kind === "redirect") {
      router.replace(route.href)
      return
    }
    if (route.kind === "questions" && hydrated && route.questionIndex >= pathLength) {
      router.replace(hrefs.question(clampQuestionIndex(route.questionIndex, pathLength)))
    }
  }, [route, hydrated, pathLength, hrefs, router])

  // The bare tool URL is not a step: it lands on wherever this tool was left, or on its first question.
  useEffect(() => {
    if (route.kind !== "root" || !hydrated) return
    router.replace(guidedResumeHref(projectId, storedToolId, GUIDED_TOOL_ID, storedStep, storedIndex, pathLength))
  }, [route, hydrated, projectId, storedToolId, storedStep, storedIndex, pathLength, router])

  // Keep the store's last position in step with the URL. Nothing may be written
  // before `init` has read storage, or the write would persist an empty map
  // over every project's drafts.
  useEffect(() => {
    if (!hydrated) return
    if (route.kind === "questions" && route.questionIndex < pathLength) {
      dispatch.reflectSessions.setLastPosition({ projectId, lensId: GUIDED_TOOL_ID, step: "prompts", promptIndex: route.questionIndex })
    } else if (route.kind === "review") {
      dispatch.reflectSessions.setLastPosition({ projectId, lensId: GUIDED_TOOL_ID, step: "review", promptIndex: 0 })
    }
  }, [hydrated, route, pathLength, dispatch, projectId])

  const activeStep: ReflectStep = route.kind === "review" ? "review" : "prompts"

  const handleStepClick = useCallback(
    (id: ReflectStep) => {
      router.push(hrefs.step(id, 0))
    },
    [router, hrefs],
  )

  const handleReset = useCallback(() => {
    dispatch.reflectSessions.clearSession({ projectId, lensId: GUIDED_TOOL_ID })
    router.push(projectRoutes.identify(projectId))
  }, [dispatch, router, projectId])

  const progressLabel = route.kind === "questions" ? guidedProgressLabel(route.questionIndex, path) : null

  const ToolIcon = GUIDED_TOOL.icon
  const sectionTitle = (
    <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0 text-foreground">
      <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
        <ToolIcon className={SECTION_TITLE_ICON_CLASS} />
      </span>
      <span className="truncate">{GUIDED_TOOL.title}</span>
    </h1>
  )

  // The first question is where the starting point is chosen, so the reminder card only appears after it.
  const isFirstQuestion = route.kind === "questions" && route.questionIndex === 0

  const stepper = (
    <LensStepper
      activeId={activeStep}
      steps={GUIDED_STEPS}
      onStepClick={handleStepClick}
      progressLabel={progressLabel}
      onReset={handleReset}
      resetDescription="This will return you to the list of tools and clear in-progress answers. The problem already saved in this project is not affected."
      contextCard={!isFirstQuestion ? <GuidedStartingCard /> : undefined}
    />
  )

  // While a redirect is pending the page underneath may hold an unusable URL, so only the shell is shown.
  const content = route.kind === "questions" || route.kind === "review" ? children : null

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 flex-col gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide && "overflow-hidden max-h-[100svh]",
        )}
      >
        <div className={cn("flex flex-1 min-h-0 w-full", isWide ? "flex-row gap-3" : "flex-col gap-3")}>
          {isWide ? (
            <div className={cn("w-72 shrink-0 flex flex-col gap-4 min-h-0", FOCUS_COLUMN_MAX_HEIGHT_CLASS)}>
              <FocusChromeButtons />
              {sectionTitle}
              {/* The stepper keeps its natural height; the column scrolls when it and the rail outgrow the viewport. */}
              <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto">
                <div className="flex shrink-0 flex-col">{stepper}</div>
                <JourneyProgressCard activeId="identify-problems" problemId={existing?.id ?? null} />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 shrink-0">
                <FocusChromeButtons />
                {sectionTitle}
              </div>
              {stepper}
              <JourneyProgressCard activeId="identify-problems" problemId={existing?.id ?? null} orientation="horizontal" />
            </>
          )}
          <Card className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
            <CardContent className={cn("flex-1 flex flex-col min-h-0", isWide ? "p-10" : "p-6")}>{content}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
