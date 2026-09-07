import { Lightbulb, Target, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Problem } from "@/store/problems-model"
import type { Solution } from "@/types/solution"

interface ContextCardProps {
  /** Small uppercase label above the title, e.g. "Problem". */
  label: string
  icon: LucideIcon
  title: string
  description?: string
  /** Background and text colour classes; defaults to the problem red. */
  className?: string
}

/**
 * Solid coloured banner that reminds the user which entity a step belongs to.
 * Use `ProblemContextCard` / `SolutionContextCard` rather than this directly
 * so every flow shows the same colour and icon for the same entity.
 */
export function ContextCard({ label, icon: Icon, title, description, className }: ContextCardProps) {
  return (
    <div className={cn("rounded-lg p-4 flex flex-col gap-1 text-white", className)}>
      <p className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide">
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        {label}
      </p>
      <p className="text-base font-medium">{title}</p>
      {description && <p className="text-base">{description}</p>}
    </div>
  )
}

interface ProblemContextCardProps {
  problem: Problem | undefined
  /** Also show the problem description under the title. */
  showDescription?: boolean
}

export function ProblemContextCard({ problem, showDescription = false }: ProblemContextCardProps) {
  if (!problem) return null

  return (
    <ContextCard
      label="Problem"
      icon={Target}
      title={problem.title || "Untitled problem"}
      description={showDescription ? problem.description : undefined}
      className="bg-[#e23333]"
    />
  )
}

interface SolutionContextCardProps {
  solution: Solution | undefined
  /** Also show the solution description under the title. */
  showDescription?: boolean
}

export function SolutionContextCard({ solution, showDescription = false }: SolutionContextCardProps) {
  if (!solution) return null

  return (
    <ContextCard
      label="Solution"
      icon={Lightbulb}
      title={solution.title || "Untitled solution"}
      description={showDescription ? solution.description : undefined}
      className="bg-tertiary"
    />
  )
}
