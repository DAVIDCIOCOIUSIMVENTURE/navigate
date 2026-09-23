"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import type { Problem } from "@/store/problems-model"
import { resolveDimensionLabel } from "@/lib/dimension-labels"
import { useProjectIdForProblem } from "@/hooks/use-projects"
import {
  Users,
  MapPin,
  TriangleAlert,
  TrendingUp,
  GitFork,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { computeMarket, formatMoney } from "@/lib/market"
import { describeCompetitionSignals, describeMarketEstimates } from "@/lib/market-summary"
import { DEFAULT_REACHABLE_SHARE } from "@/types/validation"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Cell,
  Placeholder,
  StatusPill,
  type CellTone,
} from "./canvas-shared"
import { ProblemCardDialog, type ProblemCardId } from "./problem-card-dialog"

/**
 * The cobalt pill the public project preview uses. Brand cards tint it white
 * instead, since cobalt on cobalt would disappear.
 */
const pillClass = (brand: boolean) =>
  cn(
    "rounded-full px-3 py-1 text-base",
    brand ? "bg-white/15 text-white" : "bg-secondary-brand/10 text-secondary-brand",
  )

/** The picked items on a card, each as a pill. */
function PillList({ items, brand }: { items: string[]; brand: boolean }) {
  if (items.length === 0) return <Placeholder />
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((text, i) => (
        <li key={`${text}-${i}`} className={pillClass(brand)}>
          {text}
        </li>
      ))}
    </ul>
  )
}

/**
 * A figure with its label in one pill (the market sizes), so a card can carry
 * its few headline numbers in the same treatment as its picks.
 */
function FigurePillList({
  items,
  brand,
}: {
  items: { label: string; value: string }[]
  brand: boolean
}) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map(({ label, value }) => (
        <li key={label} className={cn(pillClass(brand), "flex items-baseline gap-2")}>
          <span>{label}</span>
          <span className="font-semibold">{value}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * A free-text field on a card (the customer description, when the problem
 * happens) as a labelled pill under the catalogue picks. The text is a
 * sentence or two rather than a catalogue item, so the pill is rounded rather
 * than fully round and keeps the user's line breaks.
 */
function NotePill({
  label,
  text,
  brand,
}: {
  label: string
  text: string
  brand: boolean
}) {
  if (!text.trim()) return null
  return (
    <div className="flex flex-col gap-1">
      <p className={cn("text-base font-semibold", brand ? "text-white/80" : "text-secondary-brand")}>
        {label}
      </p>
      <p className={cn(pillClass(brand), "rounded-2xl whitespace-pre-wrap")}>{text}</p>
    </div>
  )
}

/**
 * The customer segment size, sat at the right-hand end of the card header.
 * The pill shows the bare number so the header stays short; "Segment size" is
 * what the tooltip says, and it is in the pill's label too so a screen reader
 * gets it without hovering.
 */
function SegmentSizePill({ value, brand }: { value: number; brand: boolean }) {
  const formatted = value.toLocaleString()
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-label={`Segment size: ${formatted}`}
            className={cn(
              pillClass(brand),
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            {formatted}
          </span>
        </TooltipTrigger>
        <TooltipContent>Segment size</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function DimensionList({
  columnId,
  ids,
  brand,
}: {
  columnId: string
  ids: string[]
  brand: boolean
}) {
  const customByColumn = useSelector((s: RootState) => s.customDimensionItems.byColumn)
  const selfDiscoveryItems = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  const labels = (ids ?? []).map((id) =>
    resolveDimensionLabel(columnId, id, customByColumn, selfDiscoveryItems),
  )
  return <PillList items={labels} brand={brand} />
}

/**
 * Visual card grid for a Problem: header (title + status pill + optional
 * actions slot) over cards for the customer, context, problem types, market
 * opportunity and existing solutions. Used by the problem canvas page, the
 * problem validation summary, and the "View Problem" dialog so the read-only
 * view is identical everywhere. The project's own solutions are listed by the
 * solutions table on the project page, not here.
 *
 * `fill` switches on the canvas-page layout: the grid stretches to fill
 * the available height and cards scroll internally. Without it, the grid
 * lays out at natural height (suited to summary cards and dialogs).
 *
 * `tone` picks the card surface: `card` (default cream) or `brand`, which
 * paints every card in the cobalt secondary brand colour with white text.
 *
 * `editable` turns every card title into a button that opens that card's edit
 * dialog. The canvas pages switch it on; the read-only views (the View Problem
 * dialog, the validation review step) leave it off.
 */
export function ProblemCanvasCards({
  problem,
  fill = false,
  actions,
  tone = "card",
  editable = false,
}: {
  problem: Problem
  fill?: boolean
  actions?: React.ReactNode
  tone?: CellTone
  editable?: boolean
}) {
  const projectId = useProjectIdForProblem(problem.id)
  const [editing, setEditing] = useState<ProblemCardId | null>(null)
  const edit = (card: ProblemCardId) => (editable ? () => setEditing(card) : undefined)
  const brand = tone === "brand"
  const status = problem.validationStatus ?? "unvalidated"
  const va = problem.validationAssessment

  const currency = va.worthToThem.unit || "GBP"
  const {
    totalMarket, reachableMarket, realisticShare: realisticShareValue, ready: marketReady,
  } = computeMarket({
    customers: va.howManyPeople.value ?? 0,
    frequency: va.howOften.value ?? 0,
    price: va.worthToThem.value ?? 0,
    reachableShare: va.reachableShare ?? DEFAULT_REACHABLE_SHARE,
    obtainableShare: va.obtainableShare,
  })
  const marketSentences = [describeMarketEstimates(va), describeCompetitionSignals(va)].filter(
    (text): text is string => text !== null,
  )

  return (
    <div className={cn("canvas-print-root flex flex-col gap-3 w-full", fill && "flex-1 min-h-0")}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="flex-1 min-w-0 flex items-baseline gap-2">
            <p className="text-lg font-bold leading-tight shrink-0">Problem title:</p>
            <h1 className="text-lg font-bold leading-tight truncate">
              {problem.title || "Untitled problem"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusPill status={status} />
          {actions && (
            <div className="flex items-center gap-2" data-canvas-no-print>
              {actions}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-12 gap-3",
          fill &&
            // The market and existing solutions rows take their content height
            // (the latter capped on its cell below) and the top row gets the rest.
            "lg:grid-rows-[minmax(0,1fr)_auto_auto] flex-1 lg:min-h-0",
        )}
      >
        <Cell
          icon={Users}
          label="Customer"
          tone={tone}
          className="sm:col-span-6 lg:col-span-4"
          empty={problem.customers.length === 0 && !problem.customerDescription && !problem.segmentSize}
          onEdit={edit("customer")}
          headerRight={
            problem.segmentSize != null && (
              <SegmentSizePill value={problem.segmentSize} brand={brand} />
            )
          }
        >
          <div className="flex flex-col gap-2">
            <DimensionList columnId="customers" ids={problem.customers} brand={brand} />
            <NotePill label="Description" text={problem.customerDescription} brand={brand} />
          </div>
        </Cell>

        <Cell
          icon={MapPin}
          label="Context"
          tone={tone}
          className="sm:col-span-6 lg:col-span-4"
          empty={problem.contexts.length === 0 && !problem.contextWhen}
          onEdit={edit("context")}
        >
          <div className="flex flex-col gap-2">
            <DimensionList columnId="contexts" ids={problem.contexts} brand={brand} />
            <NotePill label="When it happens" text={problem.contextWhen} brand={brand} />
          </div>
        </Cell>

        <Cell
          icon={TriangleAlert}
          label="Problem types"
          tone={tone}
          className="sm:col-span-12 lg:col-span-4"
          empty={problem.problems.length === 0}
          onEdit={edit("problem-types")}
        >
          <DimensionList columnId="problems" ids={problem.problems} brand={brand} />
        </Cell>

        <Cell
          icon={TrendingUp}
          label="Market opportunity"
          tone={tone}
          className="sm:col-span-12"
          empty={!marketReady && marketSentences.length === 0}
          onEdit={edit("market")}
        >
          {/* Three things at most: the estimates as a sentence, the competition
              as a sentence, and the three market sizes as pills. The fields
              themselves stay in the edit dialog. */}
          <div className="flex flex-col gap-3">
            {marketSentences.length > 0 && <p>{marketSentences.join(" ")}</p>}
            {marketReady ? (
              <FigurePillList
                items={[
                  { label: "Total market", value: formatMoney(totalMarket, { currency, compact: true }) },
                  { label: "Reachable market", value: formatMoney(reachableMarket, { currency, compact: true }) },
                  { label: "Realistic share of the market", value: formatMoney(realisticShareValue, { currency, compact: true }) },
                ]}
                brand={brand}
              />
            ) : (
              <span className="italic opacity-60">Market size not yet captured</span>
            )}
          </div>
        </Cell>

        <Cell
          icon={GitFork}
          label="Existing solutions"
          tone={tone}
          className={cn("sm:col-span-12", fill && "lg:max-h-48")}
          empty={problem.existingSolutions.length === 0}
          onEdit={edit("existing-solutions")}
        >
          {/* The shortcomings stay in the edit dialog: the canvas only names
              what customers use today. */}
          <PillList
            items={problem.existingSolutions.map((s) => s.text || "Untitled solution")}
            brand={brand}
          />
        </Cell>
      </div>

      {editable && (
        <ProblemCardDialog
          card={editing}
          problem={problem}
          projectId={projectId}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
