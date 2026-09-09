import type { ReactNode } from "react"
import { Lightbulb, Target, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Problem } from "@/store/problems-model"
import type { Solution } from "@/types/solution"

/**
 * Amber surface shared by the problem context card and the "Reflecting on" /
 * "Researching with" cards, so every reminder of what the user is currently
 * working on reads the same. Dark text keeps contrast on the amber in both
 * themes.
 */
export const CONTEXT_HIGHLIGHT_CLASS = "bg-[#f8ba39] text-zinc-900"

interface ContextCardProps {
  /** Small uppercase label above the title, e.g. "Problem" or "Reflecting on". */
  label: string
  icon: LucideIcon
  /** The thing being worked on: plain text or a link. */
  title: ReactNode
  description?: string
  /** Background and text colour classes. */
  className?: string
  /** Tighter padding and smaller text for narrow spots such as a stepper side panel. */
  compact?: boolean
}

/**
 * Solid coloured banner that reminds the user which entity a step belongs to.
 * Use one of the wrappers (`ProblemContextCard`, `SolutionContextCard`,
 * `ReflectingOnCard`, `ResearchingWithCard`) rather than this directly so
 * every flow shows the same colour and icon for the same thing. Flows render
 * it compact in their stepper rail, directly above the Reset button.
 */
export function ContextCard({ label, icon: Icon, title, description, className, compact = false }: ContextCardProps) {
  const text = compact ? "text-sm" : "text-base"
  return (
    <div className={cn("rounded-lg flex flex-col gap-1", compact ? "p-3" : "p-4", className)}>
      <p className={cn("flex items-center gap-2 font-semibold uppercase tracking-wide", text)}>
        <Icon className={cn("shrink-0", compact ? "h-4 w-4" : "h-5 w-5")} aria-hidden="true" />
        {label}
      </p>
      <p className={cn("font-medium", text)}>{title}</p>
      {description && <p className={text}>{description}</p>}
    </div>
  )
}

interface ProblemContextCardProps {
  problem: Problem | undefined
  /** Also show the problem description under the title. */
  showDescription?: boolean
  /** Tighter padding and smaller text for narrow spots such as a stepper side panel. */
  compact?: boolean
}

export function ProblemContextCard({ problem, showDescription = false, compact = false }: ProblemContextCardProps) {
  if (!problem) return null

  return (
    <ContextCard
      label="Problem"
      icon={Target}
      title={problem.title || "Untitled problem"}
      description={showDescription ? problem.description : undefined}
      className={CONTEXT_HIGHLIGHT_CLASS}
      compact={compact}
    />
  )
}

interface SolutionContextCardProps {
  solution: Solution | undefined
  /** Also show the solution description under the title. */
  showDescription?: boolean
  /** Tighter padding and smaller text for narrow spots such as a stepper side panel. */
  compact?: boolean
}

export function SolutionContextCard({ solution, showDescription = false, compact = false }: SolutionContextCardProps) {
  if (!solution) return null

  return (
    <ContextCard
      label="Solution"
      icon={Lightbulb}
      title={solution.title || "Untitled solution"}
      description={showDescription ? solution.description : undefined}
      className="bg-tertiary text-white"
      compact={compact}
    />
  )
}
