"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Solution } from "@/types/solution"
import { Button } from "@/components/ui/button"
import {
  Lightbulb,
  Target,
  Wrench,
  TrendingUp,
  Coins,
  Hourglass,
  Sparkles,
  FileText,
  ShieldCheck,
  Printer,
  Pencil,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Circle,
  Clock,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<Solution["validationStatus"], { label: string; className: string; icon: LucideIcon }> = {
  valid: { label: "Valid", className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  invalid: { label: "Invalid", className: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  unsure: { label: "Unsure", className: "bg-amber-100 text-amber-800 border-amber-200", icon: HelpCircle },
  in_progress: { label: "In progress", className: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock },
  unvalidated: { label: "Unvalidated", className: "bg-gray-100 text-gray-800 border-gray-200", icon: Circle },
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
    <div className={cn("flex flex-col rounded-lg border bg-card overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <span className={cn("flex items-center justify-center h-6 w-6 rounded text-white shrink-0", iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-base font-semibold leading-none">{label}</h3>
      </div>
      <div className={cn("p-3 flex-1 text-base", empty && "italic opacity-60")}>
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
}: {
  icon: LucideIcon
  label: string
  iconBg: string
  score: number | null
  scaleNote: string
}) {
  const filled = score ?? 0
  return (
    <Cell icon={icon} label={label} iconBg={iconBg} className="col-span-3" empty={score == null}>
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
        <p className="text-base opacity-70">
          {score != null ? `${score} / 5` : "Not scored"} {scaleNote}
        </p>
      </div>
    </Cell>
  )
}

export function SolutionCanvas({ solution, editHref }: { solution: Solution; editHref: string }) {
  const router = useRouter()
  const status = solution.validationStatus ?? "unvalidated"
  const statusConfig = STATUS_CONFIG[status]

  const linkedProblem = useSelector((s: RootState) =>
    s.problems.problems.find((p) => p.id === solution.problemId),
  )

  useEffect(() => {
    return () => {
      document.body.classList.remove("canvas-printing")
    }
  }, [])

  const handlePrint = () => {
    document.body.classList.add("canvas-printing")
    setTimeout(() => {
      window.print()
      document.body.classList.remove("canvas-printing")
    }, 50)
  }

  return (
    <div className="canvas-print-root flex flex-col gap-4 w-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-primary-foreground shrink-0">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-base opacity-70">Solution canvas #{solution.id}</p>
            <h1 className="text-2xl font-semibold leading-tight">
              {solution.title || "Untitled solution"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-base font-medium px-3 py-1.5 rounded-full border",
              statusConfig.className,
            )}
          >
            <statusConfig.icon className="h-4 w-4" />
            {statusConfig.label}
          </span>
          <div className="flex items-center gap-2" data-canvas-no-print>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              variant="outline"
              className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
              onClick={() => router.push(editHref)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 auto-rows-fr">
        <Cell icon={FileText} label="Description" iconBg="bg-primary" className="col-span-6 row-span-2" empty={!solution.description}>
          {solution.description ? (
            <p className="whitespace-pre-wrap">{solution.description}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell icon={Target} label="Linked problem" iconBg="bg-tertiary" className="col-span-6" empty={!linkedProblem}>
          {linkedProblem ? (
            <p>{linkedProblem.description || `Problem #${linkedProblem.id}`}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell icon={Sparkles} label="Inspiration" iconBg="bg-violet-800" className="col-span-6" empty={!solution.inspirationSource && !solution.inspirationDetail}>
          <div className="flex flex-col gap-1">
            {solution.inspirationSource && (
              <p className="capitalize font-medium">{solution.inspirationSource.replace(/_/g, " ")}</p>
            )}
            {solution.inspirationDetail && (
              <p className="opacity-80 whitespace-pre-wrap">{solution.inspirationDetail}</p>
            )}
          </div>
        </Cell>

        <ScoreCell
          icon={Wrench}
          label="Feasibility"
          iconBg="bg-emerald-800"
          score={solution.feasibility}
          scaleNote="(1 hard, 5 easy)"
        />
        <ScoreCell
          icon={TrendingUp}
          label="Impact"
          iconBg="bg-green-800"
          score={solution.impact}
          scaleNote="(1 low, 5 high)"
        />
        <ScoreCell
          icon={Coins}
          label="Cost"
          iconBg="bg-yellow-600"
          score={solution.cost}
          scaleNote="(1 cheap, 5 expensive)"
        />
        <ScoreCell
          icon={Hourglass}
          label="Time to implement"
          iconBg="bg-teal-700"
          score={solution.timeToImplement}
          scaleNote="(1 fast, 5 slow)"
        />

        <Cell icon={ShieldCheck} label="Validation notes" iconBg="bg-indigo-800" className="col-span-6" empty={!solution.validationNotes}>
          {solution.validationNotes ? (
            <p className="whitespace-pre-wrap">{solution.validationNotes}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>

        <Cell icon={ShieldCheck} label="Verdict & reasoning" iconBg="bg-tertiary" className="col-span-6" empty={!solution.validationReason}>
          {solution.validationReason ? (
            <p className="whitespace-pre-wrap">{solution.validationReason}</p>
          ) : (
            <Placeholder />
          )}
        </Cell>
      </div>
    </div>
  )
}
