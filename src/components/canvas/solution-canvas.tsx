"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { Solution } from "@/types/solution"
import { Button } from "@/components/ui/button"
import {
  Target,
  Wrench,
  TrendingUp,
  Coins,
  Hourglass,
  Sparkles,
  FileText,
  Printer,
  Download,
  Pencil,
  Maximize2,
  Minimize2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Circle,
  Clock,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<Solution["validationStatus"], { label: string; className: string; icon: LucideIcon }> = {
  valid: { label: "Valid", className: "bg-success text-white border-success", icon: CheckCircle2 },
  invalid: { label: "Invalid", className: "bg-destructive text-white border-destructive", icon: XCircle },
  unsure: { label: "Unsure", className: "bg-primary text-primary-foreground border-primary", icon: HelpCircle },
  in_progress: { label: "In progress", className: "bg-secondary-brand text-white border-secondary-brand", icon: Clock },
  unvalidated: { label: "Unvalidated", className: "bg-muted-foreground text-white border-muted-foreground", icon: Circle },
}

function Cell({
  icon: Icon,
  label,
  iconBg = "bg-primary",
  className,
  children,
  empty,
}: {
  icon: LucideIcon
  label: string
  iconBg?: string
  className?: string
  empty?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden", className)}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 text-white",
            iconBg,
          )}
          aria-hidden="true"
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="flex-1 font-semibold text-base">{label}</h3>
      </div>
      <div className={cn("px-4 pb-4 flex-1 min-h-0 overflow-y-auto text-base", empty && "italic opacity-60")}>
        {children}
      </div>
    </div>
  )
}

function Placeholder() {
  return <span>Not yet captured</span>
}

function ScoreCell({
  icon,
  label,
  iconBg,
  score,
  scaleNote,
  className,
}: {
  icon: LucideIcon
  label: string
  iconBg: string
  score: number | null
  scaleNote: string
  className?: string
}) {
  const filled = score ?? 0
  return (
    <Cell icon={icon} label={label} iconBg={iconBg} className={className} empty={score == null}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={cn(
                "h-3 flex-1 rounded",
                n <= filled ? iconBg : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="text-base">
          {score != null ? `${score} / 5` : "Not scored"} {scaleNote}
        </p>
      </div>
    </Cell>
  )
}

export function SolutionCanvas({ solution, editHref }: { solution: Solution; editHref: string }) {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const fullView = useSelector((s: RootState) => s.settings.fullView)
  const status = solution.validationStatus ?? "unvalidated"
  const statusConfig = STATUS_CONFIG[status]

  const linkedProblem = useSelector((s: RootState) =>
    s.problems.problems.find((p) => p.id === solution.problemId),
  )

  useEffect(() => {
    return () => {
      document.body.classList.remove("canvas-printing")
      dispatch.settings.setFullView(false)
    }
  }, [dispatch.settings])

  useEffect(() => {
    if (!fullView) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch.settings.setFullView(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [fullView, dispatch.settings])

  return (
    <div className="canvas-print-root flex flex-col gap-3 w-full flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <p className="text-lg font-semibold leading-tight shrink-0">Solution title:</p>
            <h1 className="text-lg font-semibold leading-tight truncate">
              {solution.title || "Untitled solution"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full border",
              statusConfig.className,
            )}
          >
            <statusConfig.icon className="h-3 w-3" />
            {statusConfig.label}
          </span>
          <div className="flex items-center gap-2" data-canvas-no-print>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch.settings.setFullView(!fullView)}
            >
              {fullView ? (
                <Minimize2 className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
              )}
              {fullView ? "Exit Full View" : "Full View"}
            </Button>
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </Button>
            <Button variant="outline" size="sm" disabled title="Coming soon">
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
              onClick={() => router.push(editHref)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)] flex-1 lg:min-h-0">
        <Cell icon={FileText} label="Description" iconBg="bg-tertiary" className="sm:col-span-12 lg:col-span-6 lg:row-span-2" empty={!solution.description}>
          {solution.description ? (
            <p className="whitespace-pre-wrap">{solution.description}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell icon={Target} label="Linked problem" iconBg="bg-tertiary" className="sm:col-span-6" empty={!linkedProblem}>
          {linkedProblem ? (
            <p>{linkedProblem.description || `Problem #${linkedProblem.id}`}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell icon={Sparkles} label="Inspiration" iconBg="bg-tertiary" className="sm:col-span-6" empty={!solution.inspirationSource && !solution.inspirationDetail}>
          <div className="flex flex-col gap-1">
            {solution.inspirationSource && (
              <p className="capitalize font-medium">{solution.inspirationSource.replace(/_/g, " ")}</p>
            )}
            {solution.inspirationDetail && (
              <p className="whitespace-pre-wrap">{solution.inspirationDetail}</p>
            )}
          </div>
        </Cell>

        <ScoreCell
          icon={Wrench}
          label="Feasibility"
          iconBg="bg-secondary-brand"
          score={solution.feasibility}
          scaleNote="(1 hard, 5 easy)"
          className="sm:col-span-6 lg:col-span-3"
        />
        <ScoreCell
          icon={TrendingUp}
          label="Impact"
          iconBg="bg-secondary-brand"
          score={solution.impact}
          scaleNote="(1 low, 5 high)"
          className="sm:col-span-6 lg:col-span-3"
        />
        <ScoreCell
          icon={Coins}
          label="Cost"
          iconBg="bg-secondary-brand"
          score={solution.cost}
          scaleNote="(1 cheap, 5 expensive)"
          className="sm:col-span-6 lg:col-span-3"
        />
        <ScoreCell
          icon={Hourglass}
          label="Time to implement"
          iconBg="bg-secondary-brand"
          score={solution.timeToImplement}
          scaleNote="(1 fast, 5 slow)"
          className="sm:col-span-6 lg:col-span-3"
        />
      </div>
    </div>
  )
}
