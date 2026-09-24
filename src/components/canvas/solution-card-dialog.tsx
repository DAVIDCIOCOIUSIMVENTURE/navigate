"use client"

import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import {
  INSPIRATION_SOURCE_LABELS,
  type InspirationSource,
  type Solution,
  type SolutionMetricKey,
} from "@/types/solution"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MetricStrategy } from "@/components/solution-strategies/metric-strategy"
import {
  COST_CONTENT,
  FEASIBILITY_CONTENT,
  IMPACT_CONTENT,
  TIME_CONTENT,
} from "@/components/solution-strategies/metric-content"
import type { MetricContent } from "@/components/solution-strategies/metric-strategy"
import { projectRoutes } from "@/lib/projects"
import { CanvasCardDialog, CardDialogPanel } from "./canvas-card-dialog"

/** The cards on the solution canvas, each with its own edit dialog. */
export type SolutionCardId = "description" | "linked-problem" | "method" | "metrics"

const CARD_COPY: Record<SolutionCardId, { title: string; description: string }> = {
  description: {
    title: "Description",
    description: "What the solution is, in the words you would use to explain it to someone else.",
  },
  "linked-problem": {
    title: "Linked problem",
    description: "The problem this solution answers. Editing here changes the problem itself.",
  },
  method: {
    title: "Method used",
    description: "How this candidate was found, and what came out of it.",
  },
  metrics: {
    title: "Metrics",
    description: "The four scores that decide whether this solution is worth pursuing.",
  },
}

/** The four validation metrics, in the order the validation flow scores them. */
const METRICS: { key: SolutionMetricKey; content: MetricContent }[] = [
  { key: "feasibility", content: FEASIBILITY_CONTENT },
  { key: "impact", content: IMPACT_CONTENT },
  { key: "cost", content: COST_CONTENT },
  { key: "timeToImplement", content: TIME_CONTENT },
]

/** Where each card's work is done in full, offered as the dialog's section button. */
function cardSection(
  card: SolutionCardId,
  projectId: number | null,
  solutionId: number,
): { label: string; href: string } {
  switch (card) {
    case "description":
      return { label: "Open solution details", href: projectRoutes.solutionEdit(projectId, solutionId) }
    case "linked-problem":
      return { label: "Open problem", href: projectRoutes.problemEdit(projectId) }
    case "method":
      return { label: "Open Identify solutions", href: projectRoutes.identifySolutions(projectId) }
    case "metrics":
      return {
        label: "Open the test",
        href: projectRoutes.solutionValidate(projectId, solutionId, "feasibility"),
      }
  }
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-base font-medium text-white">
      {children}
    </label>
  )
}

/**
 * The edit dialog behind a solution canvas card title. Every field writes to
 * the store as it changes, so there is nothing to save; the footer only offers
 * the section where this part of the work is done in full.
 */
export function SolutionCardDialog({
  card,
  solution,
  projectId,
  onClose,
}: {
  card: SolutionCardId | null
  solution: Solution
  projectId: number | null
  onClose: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const problem = useSelector((s: RootState) =>
    s.problems.problems.find((p) => p.id === solution.problemId),
  )

  const update = (patch: Parameters<typeof dispatch.solutions.update>[0]["patch"]) =>
    dispatch.solutions.update({ id: solution.id, patch })

  const copy = card ? CARD_COPY[card] : null
  const section = card ? cardSection(card, projectId, solution.id) : null

  return (
    <CanvasCardDialog
      open={card !== null}
      onClose={onClose}
      title={copy?.title ?? ""}
      description={copy?.description ?? ""}
      sectionLabel={section?.label}
      sectionHref={section?.href}
    >
      {card === "description" && (
        <CardDialogPanel>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="card-solution-title">Title</FieldLabel>
            <Input
              id="card-solution-title"
              value={solution.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Give the solution a short, memorable name..."
              className="text-base bg-white border-white text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="card-solution-description">Description</FieldLabel>
            <Textarea
              id="card-solution-description"
              value={solution.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Describe how the solution works and what it changes for the customer..."
              rows={6}
              className="text-base bg-white border-white text-foreground"
            />
          </div>
        </CardDialogPanel>
      )}

      {card === "linked-problem" && (
        <CardDialogPanel>
          {problem ? (
            <>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="card-linked-problem-title">Problem title</FieldLabel>
                <Input
                  id="card-linked-problem-title"
                  value={problem.title}
                  onChange={(e) =>
                    dispatch.problems.update({ id: problem.id, patch: { title: e.target.value } })
                  }
                  placeholder="Give the problem a short, memorable name..."
                  className="text-base bg-white border-white text-foreground"
                />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="card-linked-problem-description">Problem description</FieldLabel>
                <Textarea
                  id="card-linked-problem-description"
                  value={problem.description}
                  onChange={(e) =>
                    dispatch.problems.update({ id: problem.id, patch: { description: e.target.value } })
                  }
                  placeholder="Describe the problem in one or two sentences..."
                  rows={4}
                  className="text-base bg-white border-white text-foreground"
                />
              </div>
            </>
          ) : (
            <p className="text-base italic text-white">This solution is not linked to a problem.</p>
          )}
        </CardDialogPanel>
      )}

      {card === "method" && (
        <CardDialogPanel>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="card-solution-method">Method</FieldLabel>
            <Select
              value={solution.inspirationSource || undefined}
              onValueChange={(val) => update({ inspirationSource: val as InspirationSource })}
            >
              <SelectTrigger
                id="card-solution-method"
                className="text-base w-64 bg-white border-white text-foreground"
              >
                <SelectValue placeholder="Pick the method this came from" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INSPIRATION_SOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="card-solution-method-detail">What came out of it</FieldLabel>
            <Textarea
              id="card-solution-method-detail"
              value={solution.inspirationDetail}
              onChange={(e) => update({ inspirationDetail: e.target.value })}
              placeholder="e.g. The prompt that sparked this, or the analogy it came from..."
              rows={5}
              className="text-base bg-white border-white text-foreground"
            />
          </div>
        </CardDialogPanel>
      )}

      {card === "metrics" && (
        <div className="flex flex-col gap-4">
          {METRICS.map(({ key, content }) => (
            <MetricStrategy
              key={key}
              icon={content.icon}
              strategyTitle={content.strategyTitle}
              strategyLabel={content.strategyLabel}
              strategyDescription={content.strategyDescription}
              scale={content.scale}
              value={solution[key]}
              onChange={(val) => update({ [key]: val })}
              accent={content.accent}
            />
          ))}
        </div>
      )}
    </CanvasCardDialog>
  )
}
