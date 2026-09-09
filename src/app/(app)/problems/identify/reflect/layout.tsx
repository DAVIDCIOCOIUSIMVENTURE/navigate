"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useDispatch, useSelector } from "react-redux"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft, Glasses, PanelTop } from "lucide-react"
import type { AppDispatch, RootState } from "@/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFocusChrome } from "@/context/focus-chrome-context"
import { useContainerSize } from "@/context/container-size-context"
import { cn } from "@/lib/utils"
import { getReflectLens } from "@/data/reflectLenses"
import { ReflectProvider } from "@/components/reflect/reflect-context"
import { ReflectingOnCard } from "@/components/reflect/reflecting-on-card"
import type { ReflectStep } from "@/store/reflect-sessions-model"
import { SECTION_TITLE_ICON_CLASS, SECTION_TITLE_TILE_CLASS } from "@/lib/nav-item-styles"
import { ReflectStepper } from "./reflect-stepper"
import {
  parseReflectPath,
  reflectPickHref,
  reflectResumeHref,
  reflectStepHref,
} from "./routes"

/**
 * Shell for the Reflect flow. It stays mounted while the user moves between
 * the step routes underneath it, so it owns the one-off "resume where you left
 * off" redirect, keeps the store's last position in step with the URL, and
 * renders the back button, title and stepper around each step page.
 */
export default function ReflectLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const hydrated = useSelector((s: RootState) => s.reflectSessions.hydrated)
  const storedLensId = useSelector((s: RootState) => s.reflectSessions.lastPickedLensId)
  const storedStep = useSelector((s: RootState) => s.reflectSessions.lastStep)
  const storedPromptIndex = useSelector((s: RootState) => s.reflectSessions.lastPromptIndex)
  const isWide = useContainerSize() === "wide"
  const { revealTopNav } = useFocusChrome()

  const route = useMemo(() => parseReflectPath(pathname), [pathname])
  const [restored, setRestored] = useState(false)
  const resumeHrefRef = useRef<string | null>(null)

  // Non-canonical URLs (unknown lens, prompt number out of range) get replaced.
  useEffect(() => {
    if (route.kind === "redirect") router.replace(route.href)
  }, [route, router])

  // Entering at the root with an interrupted session picks up where it stopped.
  useEffect(() => {
    if (restored || !hydrated) return
    setRestored(true)
    if (route.kind !== "pick") return
    const href = reflectResumeHref(storedLensId, storedStep, storedPromptIndex)
    if (!href) return
    resumeHrefRef.current = href
    router.replace(href)
  }, [restored, hydrated, route.kind, storedLensId, storedStep, storedPromptIndex, router])

  const isResuming = resumeHrefRef.current !== null && pathname !== resumeHrefRef.current
  if (resumeHrefRef.current !== null && pathname === resumeHrefRef.current) {
    resumeHrefRef.current = null
  }

  // Keep the store's last position in step with the URL for prompts and review.
  useEffect(() => {
    if (!restored || isResuming) return
    if (route.kind === "prompts") {
      dispatch.reflectSessions.setLastPosition({
        lensId: route.lens.id,
        step: "prompts",
        promptIndex: route.promptIndex,
      })
    } else if (route.kind === "review") {
      dispatch.reflectSessions.setLastPosition({
        lensId: route.lens.id,
        step: "review",
        promptIndex: 0,
      })
    }
  }, [restored, isResuming, route, dispatch])

  // On the picker the lens is remembered so it still shows as selected and the
  // later steps stay reachable; only the step itself changes.
  useEffect(() => {
    if (!restored || isResuming || route.kind !== "pick") return
    const lensId = storedLensId && getReflectLens(storedLensId) ? storedLensId : null
    dispatch.reflectSessions.setLastPosition({
      lensId,
      step: lensId ? "pick" : null,
      promptIndex: storedPromptIndex,
    })
  }, [restored, isResuming, route.kind, storedLensId, storedPromptIndex, dispatch])

  const routeLens = route.kind === "prompts" || route.kind === "review" ? route.lens : null
  const storedLens = storedLensId ? getReflectLens(storedLensId) ?? null : null
  const activeLens = routeLens ?? storedLens
  const activeStep: ReflectStep = route.kind === "prompts" || route.kind === "review" ? route.kind : "pick"

  const handleStepClick = useCallback(
    (id: ReflectStep) => {
      if (id === "pick") {
        router.push(reflectPickHref())
        return
      }
      if (!activeLens) return
      router.push(reflectStepHref(id, activeLens.id, 0))
    },
    [router, activeLens],
  )

  const handleReset = useCallback(() => {
    dispatch.reflectSessions.clearAllSessions()
    router.push(reflectPickHref())
  }, [dispatch, router])

  const promptsProgress =
    route.kind === "prompts"
      ? { current: route.promptIndex + 1, total: route.lens.prompts.length }
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
        <Glasses className={SECTION_TITLE_ICON_CLASS} />
      </span>
      <span className="truncate">Reflect</span>
    </h1>
  )

  // The anchor prompt is where the user picks what to reflect on, so the
  // reminder card only appears on the steps that follow it.
  const isAnchorPrompt =
    route.kind === "prompts" && route.lens.prompts[route.promptIndex]?.contextOnly === true

  const stepper = (
    <ReflectStepper
      activeId={activeStep}
      onStepClick={handleStepClick}
      isStepEnabled={(id) => id === "pick" || activeLens !== null}
      promptsProgress={promptsProgress}
      onReset={handleReset}
      resetDescription="This will return you to the method picker and clear in-progress answers. Saved problems are not affected."
      contextCard={routeLens && !isAnchorPrompt ? <ReflectingOnCard /> : undefined}
    />
  )

  // While a redirect is pending the page underneath may hold an unusable URL
  // (for example a lens that does not exist), so only the shell is shown.
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
        {routeLens ? <ReflectProvider lens={routeLens}>{inner}</ReflectProvider> : inner}
      </div>
    </div>
  )
}
