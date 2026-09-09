"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import {
  TOUR_STEPS,
  findStepIndex,
  isStepApplicable,
  isStepDone,
  isWithinStep,
  resolveTourStep,
  stepProgress,
  type TourContext,
  type TourStep,
} from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import { SPOT_PAD, expandRect, maskPanels, type Rect, type Size } from "./geometry"
import { useTargetRect } from "./use-target-rect"
import { StepCard, WelcomeCard, type CardPlacement } from "./tour-cards"

/**
 * The guided tour layer. Reads the `tour` model, walks through `TOUR_STEPS`,
 * navigates to each step's page and spotlights its anchor. Explain steps
 * block the page; act steps leave it usable and wait for the user. All
 * content lives in `src/lib/tour-steps.ts`; all layout maths in `./geometry.ts`.
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
 * - `spotlight`: the anchor is visible; mask everything else and pin the card beside it.
 * - `centred`: explain step with no anchor; dim the page and centre the card.
 * - `docked`: act step with no anchor; leave the page alone and dock the card in a corner.
 */
type TourView = "waiting" | "spotlight" | "centred" | "docked"

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

/** A light, pure snapshot of the app state the steps can depend on. */
function useTourContext(pathname: string): TourContext {
  const journey = useSelector((s: RootState) => s.tour.journey)
  const problems = useSelector((s: RootState) => s.problems.problems)
  const solutions = useSelector((s: RootState) => s.solutions.solutions)
  return useMemo<TourContext>(
    () => ({
      pathname,
      journey,
      problems: problems.map((p) => ({ id: p.id, title: p.title, validationStatus: p.validationStatus })),
      solutions: solutions.map((s) => ({ id: s.id, problemId: s.problemId, validationStatus: s.validationStatus })),
    }),
    [pathname, journey, problems, solutions],
  )
}

function TourLayer() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  const viewport = useViewportSize()
  const ctx = useTourContext(pathname)

  const storedIndex = useSelector((s: RootState) => s.tour.stepIndex)
  const sidebarMode = useSelector((s: RootState) => s.settings.sidebarMode)

  // A stale index (steps changed between releases) restarts from the welcome card.
  const stepIndex = storedIndex < TOUR_STEPS.length ? storedIndex : 0
  const step: TourStep = TOUR_STEPS[stepIndex]
  const isAct = step.mode === "act"
  const nextIndex = findStepIndex(TOUR_STEPS, stepIndex, 1, ctx)
  const prevIndex = findStepIndex(TOUR_STEPS, stepIndex, -1, ctx)
  const progress = stepProgress(TOUR_STEPS, stepIndex, ctx)

  // The context as it was when this step was entered, for "something new appeared" checks.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entry = useMemo(() => ctx, [stepIndex])
  const done = isStepDone(step, ctx, entry)
  const canNext = !isAct || done

  // Transitions. `stop` keeps the step so a refresh reopens it; `finish` switches the tour off.
  const goNext = () => (nextIndex === null ? dispatch.tour.finish() : dispatch.tour.goTo(nextIndex))
  const goBack = () => prevIndex !== null && dispatch.tour.goTo(prevIndex)
  const skipTour = () => dispatch.tour.finish()
  const close = () => dispatch.tour.stop()

  // A step that no longer applies (for example after data changed) is skipped over.
  useEffect(() => {
    if (isStepApplicable(step, ctx)) return
    if (nextIndex !== null) dispatch.tour.goTo(nextIndex)
    else dispatch.tour.finish()
  }, [step, ctx, nextIndex, dispatch.tour])

  // When an act step completes, remember what was created and, if asked, move straight on.
  const completedStep = useRef<number>(-1)
  useEffect(() => {
    if (!done || completedStep.current === stepIndex) return
    completedStep.current = stepIndex
    if (step.capture) dispatch.tour.setJourney(step.capture(ctx))
    if (step.advance === "auto") {
      if (nextIndex === null) dispatch.tour.finish()
      else dispatch.tour.goTo(nextIndex)
    }
  }, [done, stepIndex, step, ctx, nextIndex, dispatch.tour])

  const { route, target } = useMemo(() => resolveTourStep(step, ctx), [step, ctx])
  const within = isWithinStep(step, ctx)

  // Navigate once per step, and only when the user is not already where the
  // step wants them (on its route, inside its flow, or past it). After that the
  // step counts as "arrived" and later navigation by the user (browser back,
  // working through a flow on an act step) does not drag them back.
  const navigatedForStep = useRef<number>(-1)
  useEffect(() => {
    if (navigatedForStep.current === stepIndex) return
    navigatedForStep.current = stepIndex
    if (route && !within && !done) router.push(route)
  }, [stepIndex, route, within, done, router])

  const [arrivedStep, setArrivedStep] = useState(-1)
  useEffect(() => {
    if (within) setArrivedStep(stepIndex)
  }, [within, stepIndex])
  const waitingForRoute = route !== null && arrivedStep !== stepIndex

  // A hidden sidebar has nothing to anchor to, so pull it back for menu steps.
  useEffect(() => {
    if (step.needsSidebar && sidebarMode === "collapsed") {
      dispatch.settings.setSidebarMode("expanded")
    }
  }, [step, sidebarMode, dispatch.settings])

  const anchor = useTargetRect(target, waitingForRoute, `${stepIndex}:${pathname}`)
  const unanchored: TourView = isAct ? "docked" : "centred"
  const view: TourView =
    target === null ? unanchored
    : waitingForRoute || anchor.status === "pending" ? "waiting"
    : anchor.status === "found" ? "spotlight"
    : unanchored
  const spot: Rect | null = view === "spotlight" && anchor.rect ? expandRect(anchor.rect, SPOT_PAD) : null
  const cardPlacement: CardPlacement = view === "spotlight" ? "anchored" : view === "docked" ? "docked" : "centred"

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
      } else if (e.key === "ArrowRight" && canNext) {
        e.preventDefault()
        goNext()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goBack()
      }
    }
    // Act steps leave the page usable, so keyboard shortcuts must not swallow typing.
    if (isAct) return
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // The handlers close over the current step; re-bind whenever it moves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, nextIndex, prevIndex, canNext, isAct])

  return (
    <div className={cn("fixed inset-0 z-[100]", isAct && "pointer-events-none")} data-tour-overlay="">
      {!isAct && (
        // Explain steps block the page beneath; the dim backdrop doubles as the click catcher.
        <div
          className={cn("absolute inset-0 transition-colors duration-200", view === "centred" ? "bg-black/60" : "bg-transparent")}
          aria-hidden="true"
        />
      )}
      {spot && !isAct && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-lg ring-2 ring-primary/80 transition-[top,left,width,height] duration-150"
          style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height, boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.6)" }}
        />
      )}
      {spot && isAct && (
        // Act steps mask everything except the spotlighted element, which stays clickable.
        <>
          {maskPanels(spot, viewport).map((panel, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="pointer-events-auto absolute bg-black/60"
              style={{ top: panel.top, left: panel.left, width: panel.width, height: panel.height }}
            />
          ))}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute rounded-lg ring-2 ring-secondary-brand animate-pulse"
            style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          />
        </>
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
            placement={cardPlacement}
            done={done}
            canGoBack={prevIndex !== null}
            onNext={goNext}
            onBack={goBack}
            onSkipStep={goNext}
            onSkipTour={skipTour}
            onClose={close}
          />
        )
      )}
    </div>
  )
}
