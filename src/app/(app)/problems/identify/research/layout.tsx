"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useDispatch, useSelector } from "react-redux"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Microscope, PanelTop } from "lucide-react"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { getResearchMethod } from "@/data/researchMethods"
import { ResearchProvider } from "@/components/research/research-context"
import type { ResearchStep } from "@/store/research-sessions-model"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { ResearchStepper } from "./research-stepper"
import {
  parseResearchPath,
  researchPickHref,
  researchResumeHref,
  researchStepHref,
} from "./routes"

/**
 * Shell for the Research flow. It stays mounted while the user moves between
 * the step routes underneath it, so it owns the one-off "resume where you left
 * off" redirect, keeps the store's last position in step with the URL, and
 * renders the back button, title and stepper around each step page.
 */
export default function ResearchLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.researchSessions.hydrated)
  const storedMethodId = useSelector((s: RootState) => s.researchSessions.lastPickedMethodId)
  const storedStep = useSelector((s: RootState) => s.researchSessions.lastStep)
  const storedPromptIndex = useSelector((s: RootState) => s.researchSessions.lastPromptIndex)
  const isWide = useContainerSize() === "wide"
  const { revealTopNav } = useFocusChrome()

  const route = useMemo(() => parseResearchPath(pathname), [pathname])
  const [restored, setRestored] = useState(false)
  const resumeHrefRef = useRef<string | null>(null)

  const routeMethod = route.kind === "pick" || route.kind === "redirect" ? null : route.method
  const storedMethod = storedMethodId ? getResearchMethod(storedMethodId) ?? null : null
  const activeMethod = routeMethod ?? storedMethod
  const activeStep: ResearchStep = route.kind === "redirect" ? "pick" : route.kind
  const activeToolId = useSelector((s: RootState) =>
    activeMethod ? s.researchSessions.sessions[activeMethod.id]?.toolId ?? null : null,
  )

  // Non-canonical URLs (unknown method, prompt number out of range) get replaced.
  useEffect(() => {
    if (route.kind === "redirect") router.replace(route.href)
  }, [route, router])

  // Entering at the root with an interrupted session picks up where it stopped.
  useEffect(() => {
    if (restored || !hydrated) return
    setRestored(true)
    if (route.kind !== "pick") return
    const href = researchResumeHref(storedMethodId, storedStep, storedPromptIndex)
    if (!href) return
    resumeHrefRef.current = href
    router.replace(href)
  }, [restored, hydrated, route.kind, storedMethodId, storedStep, storedPromptIndex, router])

  const isResuming = resumeHrefRef.current !== null && pathname !== resumeHrefRef.current
  if (resumeHrefRef.current !== null && pathname === resumeHrefRef.current) {
    resumeHrefRef.current = null
  }

  // Keep the store's last position in step with the URL for the method steps.
  useEffect(() => {
    if (!restored || isResuming) return
    if (route.kind === "pick" || route.kind === "redirect") return
    dispatch.researchSessions.setLastPosition({
      methodId: route.method.id,
      step: route.kind,
      promptIndex: route.kind === "capture" ? route.promptIndex : 0,
    })
  }, [restored, isResuming, route, dispatch])

  // On the picker the method is remembered so it still shows as selected and
  // the later steps stay reachable; only the step itself changes.
  useEffect(() => {
    if (!restored || isResuming || route.kind !== "pick") return
    const methodId = storedMethodId && getResearchMethod(storedMethodId) ? storedMethodId : null
    dispatch.researchSessions.setLastPosition({
      methodId,
      step: methodId ? "pick" : null,
      promptIndex: storedPromptIndex,
    })
  }, [restored, isResuming, route.kind, storedMethodId, storedPromptIndex, dispatch])

  const isStepEnabled = useCallback(
    (id: ResearchStep) => {
      if (id === "pick") return true
      if (!activeMethod) return false
      if (id === "tool") return true
      // capture and review both require a selected tool
      return activeToolId !== null
    },
    [activeMethod, activeToolId],
  )

  const handleStepClick = useCallback(
    (id: ResearchStep) => {
      if (!isStepEnabled(id)) return
      if (id === "pick" || !activeMethod) {
        router.push(researchPickHref())
        return
      }
      router.push(researchStepHref(id, activeMethod.id, 0))
    },
    [router, activeMethod, isStepEnabled],
  )

  const handleReset = useCallback(() => {
    dispatch.researchSessions.clearAllSessions()
    router.push(researchPickHref())
  }, [dispatch, router])

  const promptsProgress =
    route.kind === "capture"
      ? { current: route.promptIndex + 1, total: route.method.prompts.length }
      : null

  const backAndPanel = (
    <div className="flex items-center gap-2 shrink-0">
      <Button variant="tertiary-outline" onClick={() => router.push("/problems/identify")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="bg-white"
        onClick={revealTopNav}
        aria-label="Show top bar"
        title="Top bar"
      >
        <PanelTop className="h-4 w-4" />
      </Button>
    </div>
  )

  const sectionTitle = (
    <h1 className="flex items-center gap-2 text-xl font-bold min-w-0 shrink-0 text-foreground">
      <span className={SECTION_TITLE_TILE_CLASS} aria-hidden="true">
        <Microscope className={SECTION_TITLE_ICON_CLASS} />
      </span>
      <span className="truncate">Research</span>
    </h1>
  )

  const stepper = (
    <ResearchStepper
      activeId={activeStep}
      onStepClick={handleStepClick}
      isStepEnabled={isStepEnabled}
      promptsProgress={promptsProgress}
      onReset={handleReset}
      resetDescription="This will return you to the method picker and clear in-progress capture answers. Saved problems are not affected."
    />
  )

  // While a redirect is pending the page underneath may hold an unusable URL
  // (for example a method that does not exist), so only the shell is shown.
  const content = route.kind === "redirect" ? null : children

  const inner = (
    <div className={cn("flex flex-1 min-h-0 w-full", isWide ? "flex-row gap-3" : "flex-col gap-3")}>
      {isWide ? (
        <div className="w-72 shrink-0 h-full flex flex-col gap-4 min-h-0">
          {backAndPanel}
          {sectionTitle}
          {stepper}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 shrink-0">
            {backAndPanel}
            {sectionTitle}
          </div>
          {stepper}
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
        {routeMethod ? <ResearchProvider method={routeMethod}>{inner}</ResearchProvider> : inner}
      </div>
    </div>
  )
}
