"use client"

import { useCallback, useEffect, useMemo, type ReactNode } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, usePathname, useRouter } from "next/navigation"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { FocusChromeButtons } from "@/components/focus-chrome-buttons"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { getReflectLens } from "@/data/reflectLenses"
import { ReflectProvider } from "@/components/reflect/reflect-context"
import { useProjectScope } from "@/hooks/use-projects"
import { projectRoutes } from "@/lib/projects"
import { ReflectingOnCard } from "@/components/reflect/reflecting-on-card"
import { JourneyProgressCard } from "@/components/journey-progress"
import { FOCUS_COLUMN_MAX_HEIGHT_CLASS } from "@/components/problem-flow-shell"
import { selectReflectProject, type ReflectStep } from "@/store/reflect-sessions-model"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { LensStepper } from "./lens-stepper"
import { lensHrefs, lensResumeHref, parseLensPath } from "./routes"

/**
 * Shell for one guided-prompt tool. The tool is named by the URL rather than
 * picked inside the flow, so this owns the "resume where you left off" landing
 * on the bare tool URL, keeps the store's last position in step with the URL,
 * and renders the chrome buttons, title and stepper around each step page.
 */
export default function LensLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { lensId } = useParams<{ lensId: string }>()
  // The tool runs inside a project: its drafts and last position are the
  // project's own. When the project already has its problem, a run of the tool
  // it was captured with is pre-filled and saving updates that problem.
  const { projectId, problem: existing } = useProjectScope()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const { lastPickedLensId: storedLensId, lastStep: storedStep, lastPromptIndex: storedPromptIndex } = useSelector(
    (s: RootState) => selectReflectProject(s, projectId),
  )
  const isWide = useContainerSize() === "wide"
  const hrefs = useMemo(() => lensHrefs(projectId, lensId), [projectId, lensId])

  const route = useMemo(() => parseLensPath(pathname), [pathname])
  const lens = getReflectLens(lensId)

  // Non-canonical URLs (a name that is not a lens, a prompt number out of range) get replaced.
  useEffect(() => {
    if (route.kind === "redirect") router.replace(route.href)
  }, [route, router])

  // The bare tool URL is not a step: it lands on wherever this tool was left,
  // or on its first prompt.
  useEffect(() => {
    if (route.kind !== "root" || !hydrated) return
    router.replace(lensResumeHref(projectId, route.lens, storedLensId, storedStep, storedPromptIndex))
  }, [route, hydrated, projectId, storedLensId, storedStep, storedPromptIndex, router])

  // Keep the store's last position in step with the URL, so leaving and
  // reopening the tool comes back to the same prompt. Nothing may be written
  // before `init` has read storage, or the write would persist an empty map
  // over every project's drafts.
  useEffect(() => {
    if (!hydrated) return
    if (route.kind === "prompts") {
      dispatch.reflectSessions.setLastPosition({
        projectId,
        lensId: route.lens.id,
        step: "prompts",
        promptIndex: route.promptIndex,
      })
    } else if (route.kind === "review") {
      dispatch.reflectSessions.setLastPosition({
        projectId,
        lensId: route.lens.id,
        step: "review",
        promptIndex: 0,
      })
    }
  }, [hydrated, route, dispatch, projectId])

  const activeStep: ReflectStep = route.kind === "review" ? "review" : "prompts"

  const handleStepClick = useCallback(
    (id: ReflectStep) => {
      router.push(hrefs.step(id, 0))
    },
    [router, hrefs],
  )

  const handleReset = useCallback(() => {
    dispatch.reflectSessions.clearProject(projectId)
    router.push(projectRoutes.identify(projectId))
  }, [dispatch, router, projectId])

  const promptsProgress =
    route.kind === "prompts"
      ? { current: route.promptIndex + 1, total: route.lens.prompts.length }
      : null

  // A URL naming something that is not a lens has nothing to render: the
  // effect above is already sending it back to the hub. Every hook has run by
  // here, so bailing out now is safe.
  if (!lens) return null

  const LensIcon = lens.icon
  const sectionTitle = (
    <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0 text-foreground">
      <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
        <LensIcon className={SECTION_TITLE_ICON_CLASS} />
      </span>
      <span className="truncate">{lens.title}</span>
    </h1>
  )

  // The anchor prompt is where the user picks what to reflect on, so the
  // reminder card only appears on the steps that follow it.
  const isAnchorPrompt =
    route.kind === "prompts" && route.lens.prompts[route.promptIndex]?.contextOnly === true

  const stepper = (
    <LensStepper
      activeId={activeStep}
      onStepClick={handleStepClick}
      promptsProgress={promptsProgress}
      onReset={handleReset}
      resetDescription="This will return you to the list of tools and clear in-progress answers. The problem already saved in this project is not affected."
      contextCard={!isAnchorPrompt ? <ReflectingOnCard /> : undefined}
    />
  )

  // While a redirect is pending the page underneath may hold an unusable URL
  // (for example a prompt number out of range), so only the shell is shown.
  const content = route.kind === "prompts" || route.kind === "review" ? children : null

  const inner = (
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
        <CardContent className={cn("flex-1 flex flex-col min-h-0", isWide ? "p-10" : "p-6")}>
          {content}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex flex-1 min-h-0 w-full flex-col">
      <div
        className={cn(
          "mx-auto flex w-full max-w-screen-2xl flex-1 min-h-0 flex-col gap-3",
          "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          isWide && "overflow-hidden max-h-[100svh]",
        )}
      >
        <ReflectProvider projectId={projectId} lens={lens} seed={existing?.reflection ?? null}>
          {inner}
        </ReflectProvider>
      </div>
    </div>
  )
}
