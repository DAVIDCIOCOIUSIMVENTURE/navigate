"use client"

import { useDispatch } from "react-redux"
import type { AppDispatch } from "@/store"
import type { Problem } from "@/store/problems-model"
import type {
  ExistingSolutionItem,
  ValidationAssessment,
  ValidationMetric,
  ValidationMetricKey,
} from "@/types/validation"
import { Textarea } from "@/components/ui/textarea"
import { DimensionPicker } from "@/components/dimension-picker"
import { ExistingSolutionsEditor } from "@/components/problem-strategies/existing-solutions-strategy"
import {
  CompetitionSection,
  MarketSection,
  PriceSection,
  TamSamSomPanel,
} from "@/components/problem-strategies/validation-strategy"
import { projectRoutes } from "@/lib/projects"
import { CanvasCardDialog, CardDialogPanel } from "./canvas-card-dialog"

/** The cards on the problem canvas, each with its own edit dialog. */
export type ProblemCardId =
  | "customer"
  | "context"
  | "problem-types"
  | "market"
  | "existing-solutions"

const CARD_COPY: Record<ProblemCardId, { title: string; description: string }> = {
  customer: {
    title: "Customer",
    description: "Who has this problem: the segments you picked and how you would describe them.",
  },
  context: {
    title: "Context",
    description: "Where and when the problem shows up for that customer.",
  },
  "problem-types": {
    title: "Problem types",
    description: "The kinds of problem this is, which shape the solutions worth looking for.",
  },
  market: {
    title: "Market opportunity",
    description: "What they would pay, your estimates, the competition, and the market sizes they produce.",
  },
  "existing-solutions": {
    title: "Existing solutions",
    description: "What customers use today and where each one falls short.",
  },
}

/** Where each card's work is done in full, offered as the dialog's section button. */
function cardSection(card: ProblemCardId, projectId: number | null): { label: string; href: string } {
  switch (card) {
    case "customer":
      return { label: "Open Explore", href: projectRoutes.explore(projectId, "customer") }
    case "context":
    case "problem-types":
      return { label: "Open Canvas Builder", href: projectRoutes.canvasBuilder(projectId) }
    case "market":
      return { label: "Open Validation", href: projectRoutes.validation(projectId, "market") }
    case "existing-solutions":
      return { label: "Open Explore", href: projectRoutes.explore(projectId, "existing-solutions") }
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
 * The edit dialog behind a problem canvas card title. Every field writes to the
 * problem as it changes, so there is nothing to save; the footer only offers
 * the section where this part of the work is done in full.
 */
export function ProblemCardDialog({
  card,
  problem,
  projectId,
  onClose,
}: {
  card: ProblemCardId | null
  problem: Problem
  projectId: number | null
  onClose: () => void
}) {
  const dispatch = useDispatch<AppDispatch>()
  const va = problem.validationAssessment

  const update = (patch: Parameters<typeof dispatch.problems.update>[0]["patch"]) =>
    dispatch.problems.update({ id: problem.id, patch })

  const patchAssessment = (patch: Partial<ValidationAssessment>) =>
    update({ validationAssessment: { ...va, ...patch } })

  const setMetric = (key: ValidationMetricKey) => (patch: Partial<ValidationMetric>) =>
    patchAssessment({ [key]: { ...va[key], ...patch } } as Partial<ValidationAssessment>)

  const setExistingSolutions = (val: ExistingSolutionItem[]) => update({ existingSolutions: val })

  const copy = card ? CARD_COPY[card] : null
  const section = card ? cardSection(card, projectId) : null

  return (
    <CanvasCardDialog
      open={card !== null}
      onClose={onClose}
      title={copy?.title ?? ""}
      description={copy?.description ?? ""}
      sectionLabel={section?.label}
      sectionHref={section?.href}
    >
      {card === "customer" && (
        <CardDialogPanel>
          <div className="rounded-lg bg-white/95 p-4">
            <DimensionPicker
              columnId="customers"
              ids={problem.customers}
              onChange={(ids) => update({ customers: ids })}
              label="Customer"
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="card-customer-description">Describe your customer</FieldLabel>
            <Textarea
              id="card-customer-description"
              value={problem.customerDescription}
              onChange={(e) => update({ customerDescription: e.target.value })}
              placeholder="e.g. Early-career freelance designers in the UK who struggle to price their work competitively..."
              rows={4}
              className="text-base bg-white border-white text-foreground"
            />
          </div>
        </CardDialogPanel>
      )}

      {card === "context" && (
        <CardDialogPanel>
          <div className="rounded-lg bg-white/95 p-4">
            <DimensionPicker
              columnId="contexts"
              ids={problem.contexts}
              onChange={(ids) => update({ contexts: ids })}
              label="Context"
            />
          </div>
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="card-context-when">When does the problem happen</FieldLabel>
            <Textarea
              id="card-context-when"
              value={problem.contextWhen}
              onChange={(e) => update({ contextWhen: e.target.value })}
              placeholder="e.g. In the fortnight before exchange, while juggling solicitors, removals and work..."
              rows={4}
              className="text-base bg-white border-white text-foreground"
            />
          </div>
        </CardDialogPanel>
      )}

      {card === "problem-types" && (
        <CardDialogPanel>
          <div className="rounded-lg bg-white/95 p-4">
            <DimensionPicker
              columnId="problems"
              ids={problem.problems}
              onChange={(ids) => update({ problems: ids })}
              label="Problem"
            />
          </div>
        </CardDialogPanel>
      )}

      {card === "market" && (
        <CardDialogPanel>
          <PriceSection
            worthToThem={va.worthToThem}
            setWorthToThem={setMetric("worthToThem")}
            anchorHint={false}
          />
          <MarketSection
            howManyPeople={va.howManyPeople}
            howOften={va.howOften}
            reachableShare={va.reachableShare}
            setHowManyPeople={setMetric("howManyPeople")}
            setHowOften={setMetric("howOften")}
            setReachableShare={(val) => patchAssessment({ reachableShare: val })}
          />
          <CompetitionSection
            costOfSwitching={va.costOfSwitching}
            solutionEffectiveness={va.solutionEffectiveness}
            competitorSize={va.competitorSize}
            obtainableShare={va.obtainableShare}
            setCostOfSwitching={setMetric("costOfSwitching")}
            setSolutionEffectiveness={setMetric("solutionEffectiveness")}
            setCompetitorSize={setMetric("competitorSize")}
            setObtainableShare={(val) => patchAssessment({ obtainableShare: val })}
          />
          <TamSamSomPanel
            howManyPeople={va.howManyPeople}
            howOften={va.howOften}
            worthToThem={va.worthToThem}
            reachableShare={va.reachableShare}
            obtainableShare={va.obtainableShare}
            show={{ tam: true, sam: true, som: true }}
          />
        </CardDialogPanel>
      )}

      {card === "existing-solutions" && (
        <ExistingSolutionsEditor
          existingSolutions={problem.existingSolutions}
          setExistingSolutions={setExistingSolutions}
        />
      )}
    </CanvasCardDialog>
  )
}
