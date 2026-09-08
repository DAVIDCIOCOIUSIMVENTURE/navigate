"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Compass, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { TourStep } from "@/lib/tour-steps"
import { cn } from "@/lib/utils"
import { CARD_WIDTH, MARGIN, arrowGeometry, placeCard, type Rect, type Size } from "./geometry"

function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return ref
}

/** Tracks the rendered size of the card so it can be positioned precisely. */
function useMeasuredSize(ref: React.RefObject<HTMLElement | null>): Size | null {
  const [size, setSize] = useState<Size | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setSize({ width: el.offsetWidth, height: el.offsetHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener("resize", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [ref])
  return size
}

function Body({ step }: { step: TourStep }) {
  return (
    <>
      {step.body.map((paragraph, i) => (
        <p key={i} className="text-base leading-relaxed">
          {paragraph}
        </p>
      ))}
    </>
  )
}

/** The large centred card that opens and closes the tour. */
export function WelcomeCard({
  step,
  onStart,
  onBack,
  onClose,
}: {
  step: TourStep
  /** Start the tour, or on the finish card, end it. */
  onStart: () => void
  /** Shown on the finish card only. */
  onBack?: () => void
  /** Close the welcome card; `dontShowAgain` is the checkbox state. */
  onClose: (dontShowAgain: boolean) => void
}) {
  const ref = useAutoFocus<HTMLDivElement>()
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const isWelcome = step.variant === "welcome"
  const titleId = `tour-${step.id}-title`

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 text-card-foreground shadow-2xl outline-none sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Compass className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="text-2xl font-bold leading-tight tracking-tight text-primary">
          {step.title}
        </h2>
      </div>
      <div className="mt-5 flex items-center gap-6">
        <div className="flex flex-1 flex-col gap-3 min-w-0">
          <Body step={step} />
        </div>
        {isWelcome && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/illustrations/02-compass.svg"
            alt=""
            className="hidden sm:block w-64 h-auto shrink-0 rounded-lg"
          />
        )}
      </div>
      {isWelcome ? (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="tour-dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <Label htmlFor="tour-dont-show-again" className="text-base font-normal">
              Don&apos;t show this again
            </Label>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onClose(dontShowAgain)}>
              Close
            </Button>
            <Button type="button" onClick={onStart} className="gap-2">
              Start the tour
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-end gap-2">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          )}
          <Button type="button" onClick={onStart}>
            Finish
          </Button>
        </div>
      )}
    </div>
  )
}

/** A step popover anchored beside its spotlight, or centred when there is nothing to anchor to. */
export function StepCard({
  step,
  progress,
  spot,
  viewport,
  canGoBack,
  onNext,
  onBack,
  onSkip,
  onClose,
}: {
  step: TourStep
  progress: { current: number; total: number }
  /** The spotlight rectangle, or null to centre the card. */
  spot: Rect | null
  viewport: Size
  canGoBack: boolean
  onNext: () => void
  onBack: () => void
  /** Ends the tour and switches it off. */
  onSkip: () => void
  /** Hides the tour but keeps this step, so it returns on the next visit. */
  onClose: () => void
}) {
  const ref = useAutoFocus<HTMLDivElement>()
  const size = useMeasuredSize(ref)
  const titleId = `tour-${step.id}-title`

  const placed = spot && size ? placeCard(spot, size, step.placement ?? "bottom", viewport) : null
  const arrow = placed && spot && size ? arrowGeometry(placed, spot, size) : null

  // Anchored cards are hidden until measured so they never flash at a guessed position.
  const positionStyle: React.CSSProperties = spot
    ? placed
      ? { top: placed.top, left: placed.left, width: CARD_WIDTH }
      : { top: MARGIN, left: MARGIN, width: CARD_WIDTH, visibility: "hidden" }
    : {}

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        "absolute max-w-[calc(100vw-1.5rem)] rounded-xl border bg-card p-5 text-card-foreground shadow-2xl outline-none",
        !spot && "left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
      )}
      style={positionStyle}
    >
      {arrow && (
        <span
          aria-hidden="true"
          className="absolute h-3 w-3 rotate-45 border bg-card"
          style={{ ...arrow.offset, clipPath: arrow.clipPath }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          {progress.current > 0 && (
            <span className="text-base font-medium text-secondary-brand">
              Step {progress.current} of {progress.total}
            </span>
          )}
          <h2 id={titleId} className="text-lg font-semibold leading-tight tracking-tight text-primary">
            {step.title}
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 -mr-2 -mt-1"
          onClick={onClose}
          aria-label="Close for now"
          title="Close for now. The tour carries on from here next time."
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Body step={step} />
      </div>
      <div className="mt-5 flex items-center justify-between gap-2">
        <Button type="button" variant="link" className="px-0 text-base" onClick={onSkip}>
          Skip tour
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onBack} disabled={!canGoBack} className="gap-1.5 text-base">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button type="button" size="sm" onClick={onNext} className="gap-1.5 text-base">
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
