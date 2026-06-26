"use client"

import Link from "@/components/link"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpRight, CheckCircle2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { getPortfolioActionIcon } from "@/config/navigation"
import type { PortfolioActionDef } from "@/data/portfolioActions"
import type { PortfolioActionState, PortfolioActionStatus } from "@/types/portfolio"

const STATUS_OPTIONS: { value: PortfolioActionStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
]

const STATUS_PILL: Record<PortfolioActionStatus, string> = {
  not_started: "bg-muted text-foreground/70",
  in_progress: "bg-yellow-600/20 text-yellow-700",
  done: "bg-green-800/15 text-green-800",
}

/**
 * One "next step" section inside a portfolio: the action's guidance (outcome +
 * checklist), a status control, and a free-text notes box. Both the status and
 * the notes are owned by the portfolio and persisted as the user edits.
 */
export function PortfolioActionSection({
  def,
  state,
  onStatusChange,
  onNotesChange,
}: {
  def: PortfolioActionDef
  state: PortfolioActionState
  onStatusChange: (status: PortfolioActionStatus) => void
  onNotesChange: (notes: string) => void
}) {
  const Icon = getPortfolioActionIcon(def.iconKey)
  const status = state.status

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-start gap-4 p-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", def.iconBg)}>
          <Icon className="h-5 w-5 text-white" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{def.title}</h3>
            <span className={cn("rounded-full px-2.5 py-0.5 text-base", STATUS_PILL[status])}>
              {STATUS_OPTIONS.find((o) => o.value === status)?.label}
            </span>
          </div>
          <p className="mt-1 text-base text-foreground/70">{def.tagline}</p>
        </div>

        <Select value={status} onValueChange={(v) => onStatusChange(v as PortfolioActionStatus)}>
          <SelectTrigger className="w-[10rem] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 border-t p-5 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-base font-medium">What you&apos;ll walk away with</p>
            <p className="mt-1 text-base text-foreground/80">{def.outcome}</p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {def.checklist.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-base">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-quaternary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {def.whereItHappens ? (
            <p className="flex items-start gap-2 text-base text-foreground/70">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{def.whereItHappens}</span>
            </p>
          ) : null}
          {def.nextStepsUrl ? (
            <Link
              href={`/next-steps/${def.nextStepsUrl}`}
              className="inline-flex w-fit items-center gap-1 text-base font-medium text-secondary-brand hover:underline"
            >
              Read the full guidance
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-medium" htmlFor={`portfolio-action-notes-${def.id}`}>
            Your notes
          </label>
          <Textarea
            id={`portfolio-action-notes-${def.id}`}
            value={state.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Capture what you've done, what you learned, and what's left."
            className="min-h-[8rem] flex-1"
          />
        </div>
      </div>
    </div>
  )
}
