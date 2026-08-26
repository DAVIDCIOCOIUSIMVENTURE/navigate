"use client"

import { cn } from "@/lib/utils"

export type ProgressRingLabelPosition = "bottom" | "left" | "right" | "none"

export interface ProgressRingProps {
  /** Number of completed units. Clamped to the 0..total range. */
  completed: number
  total: number
  /** Outer diameter in pixels. */
  size?: number
  /** Ring thickness in pixels. */
  strokeWidth?: number
  /** Text shown next to the ring. Always names the ring for assistive tech. */
  label?: string
  /** Where the label sits relative to the ring. "none" hides it visually. */
  labelPosition?: ProgressRingLabelPosition
  className?: string
}

/**
 * Circular completion indicator shared by the progression displays (self discovery,
 * problems, solutions). The percentage sits inside the ring, which turns green once
 * everything is complete.
 */
export function ProgressRing({
  completed,
  total,
  size = 64,
  strokeWidth = 6,
  label = "Progress",
  labelPosition = "bottom",
  className,
}: ProgressRingProps) {
  const safeTotal = Math.max(0, total)
  const safeCompleted = Math.min(Math.max(0, completed), safeTotal)
  const percent = safeTotal === 0 ? 0 : Math.round((safeCompleted / safeTotal) * 100)
  const isComplete = safeTotal > 0 && safeCompleted === safeTotal

  const centre = size / 2
  const radius = centre - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)

  const showLabel = labelPosition !== "none"

  const ring = (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCompleted}
      aria-valuetext={`${percent}%, ${safeCompleted} of ${safeTotal} completed`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-secondary"
        />
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${centre} ${centre})`}
          className={cn(
            "transition-[stroke-dashoffset] duration-500",
            isComplete ? "stroke-success" : "stroke-primary",
          )}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-semibold tabular-nums">
        {percent}%
      </span>
    </div>
  )

  if (!showLabel) {
    return <div className={cn("inline-flex", className)}>{ring}</div>
  }

  return (
    <div
      className={cn(
        "flex",
        labelPosition === "bottom"
          ? "flex-col items-center gap-2 text-center"
          : "items-center gap-3",
        labelPosition === "left" && "flex-row-reverse",
        className,
      )}
    >
      {ring}
      <span className="text-base font-medium">{label}</span>
    </div>
  )
}
