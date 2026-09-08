"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import {
  TOUR_STEPS,
  findStepIndex,
  isStepApplicable,
  resolveTourStep,
  stepProgress,
  type TourContext,
  type TourStep,
} from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import { SPOT_PAD, expandRect, type Rect, type Size } from "./geometry"
import { useTargetRect } from "./use-target-rect"
import { StepCard, WelcomeCard } from "./tour-cards"

/**
 * The guided tour layer. Reads the `tour` model, walks through `TOUR_STEPS`,
 * navigates to each step's page and spotlights its anchor. All content lives
 * in `src/lib/tour-steps.ts`; all layout maths in `./geometry.ts`.
 */
export function TourOverlay() {
  const hydrated = useSelector((s: RootState) => s.tour.hydrated)
  const phase = useSelector((s: RootState) => s.tour.phase)
  if (!hydrated || phase !== "running") return null
  return <TourLayer />
}

/**
 * How the current step is being shown right now:
 * - `waiting`: the page is still loading or the anchor has not been found yet; nothing is drawn.
 * - `spotlight`: the anchor is visible; dim everything else and pin the card beside it.
 * - `centred`: no anchor for this step (by design, or it never appeared); dim the page and centre the card.
 */
type TourView = "waiting" | "spotlight" | "centred"

function useViewportSize(): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return size
}

function TourLayer() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  const viewport = useViewportSize()

  const storedIndex = useSelector((s: RootState) => s.tour.stepIndex)
  const sidebarMode = useSelector((s: RootState) => s.settings.sidebarMode)
  const firstProblemId = useSelector((s: RootState) => s.problems.problems[0]?.id ?? null)
  const ctx = useMemo<TourContext>(() => ({ firstProblemId }), [firstProblemId])

  // A stale index (steps changed between releases) restarts from the welcome card.
  const stepIndex = storedIndex < TOUR_STEPS.length ? storedIndex : 0
  const step: TourStep = TOUR_STEPS[stepIndex]
  const nextIndex = findStepIndex(TOUR_STEPS, stepIndex, 1, ctx)
  const prevIndex = findStepIndex(TOUR_STEPS, stepIndex, -1, ctx)
  const progress = stepProgress(TOUR_STEPS, stepIndex, ctx)

  // Transitions. `stop` keeps the step so a refresh reopens it; `finish` switches the tour off.
  const goNext = () => (nextIndex === null ? dispatch.tour.finish() : dispatch.tour.goTo(nextIndex))
  const goBack = () => prevIndex !== null && dispatch.tour.goTo(prevIndex)
  const skip = () => dispatch.tour.finish()
  const close = () => dispatch.tour.stop()

  // A step that no longer applies (for example after data changed) is skipped over.
  useEffect(() => {
    if (isStepApplicable(step, ctx)) return
    if (nextIndex !== null) dispatch.tour.goTo(nextIndex)
    else dispatch.tour.finish()
  }, [step, ctx, nextIndex, dispatch.tour])

  const { route, target } = useMemo(() => resolveTourStep(step, ctx), [step, ctx])
  const waitingForRoute = route !== null && route !== pathname

  // Navigate once per step. Keyed on the step so a user pressing the browser
  // back button is not dragged straight back to the step's page.
  const navigatedForStep = useRef<number>(-1)
  useEffect(() => {
    if (navigatedForStep.current === stepIndex) return
    navigatedForStep.current = stepIndex
    if (route && route !== pathname) router.push(route)
  }, [stepIndex, route, pathname, router])

  // A hidden sidebar has nothing to anchor to, so pull it back for menu steps.
  useEffect(() => {
    if (step.needsSidebar && sidebarMode === "collapsed") {
      dispatch.settings.setSidebarMode("expanded")
    }
  }, [step, sidebarMode, dispatch.settings])

  const anchor = useTargetRect(target, waitingForRoute, `${stepIndex}:${pathname}`)
  const view: TourView =
    target === null ? "centred"
    : waitingForRoute || anchor.status === "pending" ? "waiting"
    : anchor.status === "found" ? "spotlight"
    : "centred"
  const spot: Rect | null = view === "spotlight" && anchor.rect ? expandRect(anchor.rect, SPOT_PAD) : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // The handlers close over the current step; re-bind whenever it moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, nextIndex, prevIndex])

  return (
    <div className="fixed inset-0 z-[100]" data-tour-overlay="">
      {/* Blocks interaction with the page beneath while the tour runs. */}
      <div
        className={cn("absolute inset-0 transition-colors duration-200", view === "centred" ? "bg-black/60" : "bg-transparent")}
        aria-hidden="true"
      />
      {spot && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-lg ring-2 ring-primary/80 transition-[top,left,width,height] duration-150"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.6)",
          }}
        />
      )}
      {view !== "waiting" && (
        step.variant ? (
          <WelcomeCard
            key={step.id}
            step={step}
            onStart={goNext}
            onBack={step.variant === "finish" ? goBack : undefined}
            onClose={(dontShowAgain) => (dontShowAgain ? dispatch.tour.finish() : dispatch.tour.stop())}
          />
        ) : (
          <StepCard
            key={step.id}
            step={step}
            progress={progress}
            spot={spot}
            viewport={viewport}
            canGoBack={prevIndex !== null}
            onNext={goNext}
            onBack={goBack}
            onSkip={skip}
            onClose={close}
          />
        )
      )}
    </div>
  )
}
