"use client"

import { useState, useRef, useEffect, useMemo, useDeferredValue, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "@/store"
import type { BrainstormMode } from "@/store/settings-model"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Grid3X3,
  Layers,
  Maximize2,
  Minimize2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  Trash2,
  X,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { brainstormColumns, type BrainstormItem, type BrainstormColumn } from "./data"
import type { Problem } from "@/store/problems-model"
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { resolveDimensionLabel } from "@/lib/dimension-labels"
import { DimensionPicker } from "@/components/dimension-picker"
import { AddCustomItemDialog } from "@/components/add-custom-item-dialog"
import { ManageCustomItemsDialog } from "@/components/manage-custom-items-dialog"
import { EditableLeafItem } from "@/components/editable-leaf-item"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { cn } from "@/lib/utils"
import { useContainerSize } from "@/context/container-size-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { DIMENSION_ICONS as COLUMN_ICONS, DIMENSION_COLORS as COLUMN_COLORS } from "@/lib/dimension-visuals"

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  "customers": "Who experiences this problem?",
  "contexts": "In what situation does it occur?",
  "problems": "What kind of friction do they face?",
  "you": "Areas surfaced from your self-discovery.",
}

const COLUMN_TO_FIELD: Record<string, keyof Pick<Problem, "customers" | "contexts" | "problems" | "you">> = {
  "customers": "customers",
  "contexts": "contexts",
  "problems": "problems",
  "you": "you",
}

function collectAllIds(items: BrainstormItem[]): string[] {
  return items.flatMap((item) =>
    item.children ? collectAllIds(item.children) : [item.id]
  )
}

function getSelectedForColumn(items: BrainstormItem[], selected: Set<string>): { id: string; label: string }[] {
  return collectAllIds(items)
    .filter((id) => selected.has(id))
    .map((id) => ({ id, label: findLabel(items, id)! }))
}

function findLabel(items: BrainstormItem[], id: string): string | null {
  for (const item of items) {
    if (item.id === id) return item.label
    if (item.children) {
      const found = findLabel(item.children, id)
      if (found) return found
    }
  }
  return null
}

function filterItems(items: BrainstormItem[], query: string): BrainstormItem[] {
  const lower = query.toLowerCase()
  return items.flatMap((item) => {
    if (item.children) {
      const filtered = filterItems(item.children, query)
      if (filtered.length > 0) return [{ ...item, children: filtered }]
      // Also include group if its own label matches
      if (item.label.toLowerCase().includes(lower)) return [item]
      return []
    }
    return item.label.toLowerCase().includes(lower) ? [item] : []
  })
}

function BrainstormCheckItem({
  item,
  selected,
  onToggle,
  forceOpen,
  customItemColumns,
}: {
  item: BrainstormItem
  selected: Set<string>
  onToggle: (id: string) => void
  forceOpen?: boolean
  customItemColumns: Map<string, string>
}) {
  const isGroup = !!item.children?.length
  const [open, setOpen] = useState(false)
  const effectiveOpen = forceOpen || open

  if (isGroup) {
    const selectedCount = item.children!.filter((c) => selected.has(c.id)).length
    return (
      <Collapsible open={effectiveOpen} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors group">
          {effectiveOpen
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          }
          <span className="text-sm font-semibold text-foreground tracking-wide select-none flex-1 text-left">
            {item.label}
          </span>
          {selectedCount > 0 && (
            <span className="text-xs text-primary font-medium tabular-nums">
              {selectedCount}
            </span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-4 flex flex-col">
            {item.children!.map((child) => (
              <BrainstormCheckItem
                key={child.id}
                item={child}
                selected={selected}
                onToggle={onToggle}
                forceOpen={forceOpen}
                customItemColumns={customItemColumns}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <EditableLeafItem
      item={item}
      isChecked={selected.has(item.id)}
      onToggle={() => onToggle(item.id)}
      customColumnId={customItemColumns.get(item.id)}
    />
  )
}

function useDebouncedCallback<T>(callback: (value: T) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  return (value: T) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => callback(value), delay)
  }
}

function ProblemFormDialog({
  open,
  onOpenChange,
  title,
  description,
  onDescriptionChange,
  idsByColumn,
  onColumnChange,
  columns,
  actions,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onDescriptionChange: (value: string) => void
  idsByColumn: Record<string, string[]>
  onColumnChange: (columnId: string, ids: string[]) => void
  columns: BrainstormColumn[]
  actions?: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor={`${title}-description`}>
              Problem description
            </label>
            <Textarea
              id={`${title}-description`}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Describe the problem..."
              rows={3}
            />
          </div>
          {columns.map((column) => (
            <DimensionPicker
              key={column.id}
              columnId={column.id}
              ids={idsByColumn[column.id] ?? []}
              onChange={(ids) => onColumnChange(column.id, ids)}
              label={column.title}
            />
          ))}
        </div>
        {actions && <div className="flex justify-end gap-2">{actions}</div>}
      </DialogContent>
    </Dialog>
  )
}

function NoSearchResults({ onClear }: { onClear?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
      <Search className="h-5 w-5 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No items match your search.</p>
      <p className="text-xs text-muted-foreground">Try a different term or clear the search.</p>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear} className="mt-1 gap-1.5">
          <X className="h-3.5 w-3.5" />
          Clear search
        </Button>
      )}
    </div>
  )
}

/* ─── Problem Builder (guided mode) ─── */

const STEP_GUIDANCE: Record<string, { title: string; description: string; tips: string[] }> = {
  pick: {
    title: "Choose a Dimension",
    description: "Every problem can be explored from multiple angles. Start by picking one dimension to frame your thinking. You can always come back and add more.",
    tips: [
      "Customer: Start here if you have a specific audience in mind (e.g. freelancers, retirees, small business owners).",
      "Context: Good when a problem is tied to a situation, like commuting, working from home, or managing finances.",
      "Problem: Useful when you already sense the kind of friction (e.g. too much complexity, lack of trust, poor timing).",
      "You: Draws from your earlier self-discovery answers to surface personal triggers and themes.",
    ],
  },
  choose: {
    title: "Select Options",
    description: "Browse the options below and check any that resonate with the problem you're exploring. Don't overthink it, you can refine later.",
    tips: [
      "Select multiple options if the problem spans several areas.",
      "Use the group headings to narrow your focus.",
      "You don't need to be exhaustive. Even one or two selections are enough to move forward.",
    ],
  },
  review: {
    title: "Review & Save",
    description: "Look over what you've assembled. Add a short description to capture the essence of the problem in your own words, then save it.",
    tips: [
      "A good description answers: \"What's the core frustration or unmet need?\"",
      "Keep it to one or two sentences. You'll flesh it out during validation.",
      "After saving you can continue brainstorming or move straight to Problem Validation.",
    ],
  },
}

const DIMENSION_GUIDANCE: Record<string, { description: string; examples: string[] }> = {
  "customers": {
    description: "Think about who experiences this problem. A well-defined customer helps you empathise with real people rather than abstract \"users\".",
    examples: [
      "Young professionals juggling side projects",
      "Parents returning to the workforce",
      "Small business owners with no IT support",
    ],
  },
  "contexts": {
    description: "Consider the situation or environment where this problem shows up. Context shapes how severe a problem feels and what solutions are viable.",
    examples: [
      "During the morning commute",
      "While onboarding a new employee",
      "At the point of making a purchase decision",
    ],
  },
  "problems": {
    description: "What kind of friction or barrier does the person face? Naming the type of problem helps you spot patterns and prioritise.",
    examples: [
      "Too many steps to complete a simple task (friction)",
      "Can't tell if a provider is trustworthy (trust gap)",
      "Information is scattered across tools (information gap)",
    ],
  },
  "you": {
    description: "These themes surfaced from your own self-discovery responses. They represent areas where you may have personal insight or passion, making them a great foundation for innovation.",
    examples: [
      "Themes you rated highly in the questionnaire",
      "Triggers you flagged during reflection",
    ],
  },
}

function GuidancePanel({ title, description, tips, className }: {
  title: string
  description: string
  tips: string[]
  className?: string
}) {
  return (
    <ScrollArea className={cn("min-h-0", className)}>
      <div className="flex flex-col gap-3 text-sm pr-3">
        <h3 className="font-semibold text-base">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        <ul className="flex flex-col gap-1.5 text-muted-foreground">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  )
}

/* ─── Problem Builder (dimension → category → items) ─── */

const BUILDER_STEPS = [
  { id: "pick", label: "Pick a dimension" },
  { id: "category", label: "Pick a category" },
  { id: "choose", label: "Choose options" },
  { id: "review", label: "Review & save" },
] as const

type BuilderStepId = (typeof BUILDER_STEPS)[number]["id"]

const CATEGORY_GUIDANCE: { title: string; description: string; tips: string[] } = {
  title: "Narrow Your Focus",
  description: "Each dimension is organised into categories. Pick one to focus on, and you'll only see a handful of options instead of the full list.",
  tips: [
    "Choose the category that best matches the area you want to explore.",
    "After selecting items you'll return here to explore more categories.",
    "When you're done with this dimension, click \"Done with this dimension\" to move on.",
  ],
}

function ProblemBuilder({
  columns,
  onSave,
  resetRef,
  onClearSearch,
  customItemColumns,
}: {
  columns: BrainstormColumn[]
  onSave: (selections: Record<string, string[]>, description: string) => void
  resetRef?: React.MutableRefObject<(() => void) | null>
  onClearSearch?: () => void
  customItemColumns: Map<string, string>
}) {
  const dispatch = useDispatch<AppDispatch>()
  const step = useSelector((state: RootState) => state.settings.brainstormBuilderStep)
  const activeColumnId = useSelector((state: RootState) => state.settings.brainstormBuilderActiveColumnId)
  const activeCategoryId = useSelector((state: RootState) => state.settings.brainstormBuilderActiveCategoryId)
  // Selections are shared with the canvas mode via state.settings.brainstormSelected
  // so toggling an item in either mode is reflected in the other.
  const brainstormSelectedArray = useSelector((state: RootState) => state.settings.brainstormSelected)
  const selectedSet = useMemo(() => new Set(brainstormSelectedArray), [brainstormSelectedArray])
  const description = useSelector((state: RootState) => state.settings.brainstormBuilderDescription)
  const isWide = useContainerSize() === "wide"
  const [stepperOpen, setStepperOpen] = useState(false)

  const setStep = (next: BuilderStepId) => dispatch.settings.setBrainstormBuilderStep(next)
  const setActiveColumnId = (id: string | null) => dispatch.settings.setBrainstormBuilderActiveColumnId(id)
  const setActiveCategoryId = (id: string | null) => dispatch.settings.setBrainstormBuilderActiveCategoryId(id)
  const setDescription = (next: string) => dispatch.settings.setBrainstormBuilderDescription(next)

  const stepIndex = BUILDER_STEPS.findIndex((s) => s.id === step)
  // Group the flat selection by column so the builder UI can show per-column
  // counts, pills, and check states.
  const selectedByColumn = useMemo<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    for (const col of columns) {
      const ids = collectAllIds(col.items).filter((id) => selectedSet.has(id))
      if (ids.length > 0) map[col.id] = ids
    }
    return map
  }, [columns, selectedSet])
  const activeColumn = columns.find((c) => c.id === activeColumnId)
  const activeCategory = activeColumn?.items.find((item) => item.id === activeCategoryId)

  // For dimensions whose items are all flat (no children / only one group), skip the category step
  const hasCategories = activeColumn ? activeColumn.items.some((item) => item.children?.length) : false

  const hasAnyItems = useMemo(
    () => columns.some((c) => c.items.length > 0),
    [columns]
  )
  const totalSelections = selectedSet.size

  const pickColumn = (columnId: string) => {
    setActiveColumnId(columnId)
    setActiveCategoryId(null)
    const col = columns.find((c) => c.id === columnId)
    const colHasCategories = col ? col.items.some((item) => item.children?.length) : false
    setStep(colHasCategories ? "category" : "choose")
  }

  const pickCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId)
    setStep("choose")
  }

  const toggleItem = (_columnId: string, itemId: string) => {
    const next = new Set(selectedSet)
    if (next.has(itemId)) next.delete(itemId)
    else next.add(itemId)
    dispatch.settings.setBrainstormSelected(Array.from(next))
  }

  const handleSave = () => {
    const selections: Record<string, string[]> = {}
    for (const col of columns) {
      // Save ids, not labels. selectedByColumn already groups ids by column.
      selections[col.id] = selectedByColumn[col.id] ?? []
    }
    onSave(selections, description)
    dispatch.settings.resetBrainstormBuilder()
  }

  const reset = useCallback(() => {
    dispatch.settings.resetBrainstormBuilder()
  }, [dispatch])

  useEffect(() => {
    if (resetRef) resetRef.current = reset
  }, [reset, resetRef])

  // Items to show in the "choose" step: either the children of the active category, or all flat items
  const chooseItems = useMemo<BrainstormItem[]>(() => {
    if (!activeColumn) return []
    if (activeCategory?.children) return activeCategory.children
    // Flat dimension (no categories): show all items directly
    if (!hasCategories) return activeColumn.items
    return []
  }, [activeColumn, activeCategory, hasCategories])

  return (
    <>
    <Card className="flex flex-col flex-1 min-h-0">
      <CardContent className="flex flex-col gap-6 pt-6 flex-1 min-h-0">
        {/* Stepper */}
        {(() => {
          const isStepClickable = (id: BuilderStepId) =>
            id === "pick" ||
            (id === "category" && activeColumnId !== null && hasCategories) ||
            (id === "choose" && activeColumnId !== null && (activeCategoryId !== null || !hasCategories)) ||
            (id === "review" && totalSelections > 0)
          const activeStep = BUILDER_STEPS[stepIndex] ?? BUILDER_STEPS[0]

          if (isWide) {
            return (
              <div className="flex items-center">
                {BUILDER_STEPS.map((s, i) => {
                  const isActive = s.id === step
                  const isCompleted = i < stepIndex
                  const isClickable = isStepClickable(s.id)
                  return (
                    <div key={s.id} className="flex items-center flex-1 last:flex-none">
                      <button
                        disabled={!isClickable}
                        onClick={() => isClickable && setStep(s.id)}
                        className="flex items-center gap-2 shrink-0 disabled:opacity-100"
                      >
                        <span className={cn(
                          "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors",
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : isCompleted
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-muted-foreground/30 bg-transparent text-muted-foreground"
                        )}>
                          {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        </span>
                        <span className={cn(
                          "text-sm whitespace-nowrap",
                          isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}>
                          {s.label}
                        </span>
                      </button>
                      {i < BUILDER_STEPS.length - 1 && (
                        <div className={cn(
                          "flex-1 h-px mx-3",
                          i < stepIndex ? "bg-primary" : "bg-border"
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          }

          return (
            <Collapsible open={stepperOpen} onOpenChange={setStepperOpen}>
              <div className="rounded-lg border">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-auto py-2 px-3"
                  >
                    <span className="flex items-center gap-2 text-sm font-medium min-w-0">
                      <span className="flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 border-primary bg-primary text-primary-foreground shrink-0">
                        {stepIndex + 1}
                      </span>
                      <span className="truncate font-semibold text-foreground">
                        Step {stepIndex + 1} of {BUILDER_STEPS.length}: {activeStep.label}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                        stepperOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="flex flex-col gap-0.5 list-none m-0 p-2 pt-0" role="list">
                    {BUILDER_STEPS.map((s, i) => {
                      const isActive = s.id === step
                      const isCompleted = i < stepIndex
                      const isClickable = isStepClickable(s.id)
                      return (
                        <li key={s.id}>
                          <Button
                            type="button"
                            variant={isActive ? "secondary" : "ghost"}
                            disabled={!isClickable}
                            onClick={() => {
                              if (!isClickable) return
                              setStepperOpen(false)
                              setStep(s.id)
                            }}
                            aria-current={isActive ? "step" : undefined}
                            className="w-full justify-start h-auto py-2 px-3 gap-2.5"
                          >
                            <span className={cn(
                              "flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold border-2 transition-colors shrink-0",
                              isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : isCompleted
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-muted-foreground/30 bg-transparent text-muted-foreground"
                            )}>
                              {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                            </span>
                            <span className={cn(
                              "text-sm whitespace-normal text-left",
                              isActive ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                              {s.label}
                            </span>
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )
        })()}

        {/* Step content */}
        <div className={cn("flex-1 min-h-0 flex flex-col", !isWide && "overflow-y-auto")}>
          {/* Step 1: Pick a dimension (also serves as "add more") */}
          {step === "pick" && (
            <div className={cn("flex", isWide ? "flex-row gap-6 flex-1 min-h-0" : "flex-col gap-4")}>
              <GuidancePanel {...STEP_GUIDANCE.pick} className={isWide ? "w-1/3 shrink-0" : "w-full shrink-0"} />
              <div className={cn("flex flex-col gap-3 min-w-0", isWide && "flex-1 min-h-0")}>
                <div className="flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold">Dimensions</h3>
                  {totalSelections > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStep("review")}
                    >
                      Skip to review
                    </Button>
                  )}
                </div>
                {!hasAnyItems ? (
                  <NoSearchResults onClear={onClearSearch} />
                ) : <ScrollArea className="flex-1 min-h-0"><div className="grid grid-cols-2 gap-3 pr-3">
                  {columns.map((col) => {
                    const Icon = COLUMN_ICONS[col.id]
                    const colors = COLUMN_COLORS[col.id]
                    return (
                      <button
                        key={col.id}
                        onClick={() => pickColumn(col.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-5 rounded-xl border border-t-4 transition-all",
                          cn(colors?.bgIdle, "hover:shadow-sm"),
                          colors?.border || "border-border",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <span className={cn(
                              "inline-flex items-center justify-center h-6 w-6 rounded",
                              colors?.iconBg || "bg-muted",
                            )}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </span>
                          )}
                          <span className={cn("text-base font-bold", colors?.icon)}>{col.title}</span>
                        </div>
                        {COLUMN_DESCRIPTIONS[col.id] && (
                          <span className="text-sm text-foreground text-center leading-snug">
                            {COLUMN_DESCRIPTIONS[col.id]}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div></ScrollArea>}
              </div>
            </div>
          )}

          {/* Step 2: Pick a category within the dimension */}
          {step === "category" && activeColumn && (
            <div className={cn("flex", isWide ? "flex-row gap-6 flex-1 min-h-0" : "flex-col gap-4")}>
              <GuidancePanel {...CATEGORY_GUIDANCE} className={isWide ? "w-1/3 shrink-0" : "w-full shrink-0"} />
              <div className={cn("flex flex-col gap-3 min-w-0", isWide && "flex-1 min-h-0")}>
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = COLUMN_ICONS[activeColumn.id]
                      const colors = COLUMN_COLORS[activeColumn.id]
                      return Icon ? (
                        <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded", colors?.iconBg || "bg-muted")}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </span>
                      ) : null
                    })()}
                    <h3 className={cn("text-base font-bold", COLUMN_COLORS[activeColumn.id]?.icon)}>{activeColumn.title}</h3>
                    {(selectedByColumn[activeColumn.id] ?? []).length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({(selectedByColumn[activeColumn.id] ?? []).length} selected)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary-outline"
                      size="sm"
                      onClick={() => { setActiveColumnId(null); setActiveCategoryId(null); setStep("pick") }}
                    >
                      Done with this dimension
                    </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1 min-h-0"><div className="grid grid-cols-2 gap-3 pr-3">
                  {activeColumn.items.filter((item) => item.children?.length).map((group) => {
                    const childIds = group.children!.map((c) => c.id)
                    const colSelected = selectedByColumn[activeColumn.id] ?? []
                    const selectedInGroup = childIds.filter((id) => colSelected.includes(id)).length
                    const explored = selectedInGroup > 0
                    const colors = COLUMN_COLORS[activeColumn.id]
                    const previewItems = group.children!.slice(0, 3).map((c) => c.label)
                    return (
                      <button
                        key={group.id}
                        onClick={() => pickCategory(group.id)}
                        className={cn(
                          "flex flex-col items-start gap-2 p-4 rounded-xl border border-t-4 transition-all text-left",
                          cn(colors?.bgIdle, "hover:shadow-sm"),
                          colors?.border || "border-border",
                        )}
                      >
                        <span className="text-sm font-medium">{group.label}</span>
                        <span className="text-xs text-foreground leading-relaxed">
                          {previewItems.join(", ")}{group.children!.length > 3 ? `, +${group.children!.length - 3} more` : ""}
                        </span>
                        {explored && (
                          <span className={cn("inline-flex items-center gap-1 text-xs font-medium", colors?.icon)}>
                            <Check className="h-3 w-3" />
                            {selectedInGroup} selected
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div></ScrollArea>
              </div>
            </div>
          )}

          {/* Step 3: Choose options within the selected category */}
          {step === "choose" && activeColumn && (
            <div className={cn("flex", isWide ? "flex-row gap-6 flex-1 min-h-0" : "flex-col gap-4")}>
              <ScrollArea className={cn("min-h-0", isWide ? "w-1/3 shrink-0" : "w-full shrink-0")}>
                <div className="flex flex-col gap-4 pr-3">
                  <GuidancePanel {...STEP_GUIDANCE.choose} />
                  {DIMENSION_GUIDANCE[activeColumn.id] && (
                    <div className="flex flex-col gap-2 rounded-lg bg-accent/30 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = COLUMN_ICONS[activeColumn.id]
                          const colors = COLUMN_COLORS[activeColumn.id]
                          return Icon ? (
                            <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded", colors?.iconBg || "bg-muted")}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </span>
                          ) : null
                        })()}
                        <span className={cn("text-base font-bold", COLUMN_COLORS[activeColumn.id]?.icon)}>{activeColumn.title}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {DIMENSION_GUIDANCE[activeColumn.id].description}
                      </p>
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Examples</span>
                        {DIMENSION_GUIDANCE[activeColumn.id].examples.map((ex, i) => (
                          <span key={i} className="text-xs text-muted-foreground italic">&ldquo;{ex}&rdquo;</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className={cn("flex flex-col gap-3 min-w-0", isWide && "flex-1 min-h-0")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = COLUMN_ICONS[activeColumn.id]
                      const colors = COLUMN_COLORS[activeColumn.id]
                      return Icon ? (
                        <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded", colors?.iconBg || "bg-muted")}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </span>
                      ) : null
                    })()}
                    <h3 className={cn("text-base font-bold", COLUMN_COLORS[activeColumn.id]?.icon)}>{activeColumn.title}</h3>
                    {activeCategory && (
                      <>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{activeCategory.label}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      ({(selectedByColumn[activeColumn.id] ?? []).length} selected)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasCategories && (
                      <>
                        <Button
                          variant="primary-outline"
                          size="sm"
                          onClick={() => { setActiveColumnId(null); setActiveCategoryId(null); setStep("pick") }}
                        >
                          Done with this dimension
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => { setActiveCategoryId(null); setStep("category") }}
                        >
                          More categories
                        </Button>
                      </>
                    )}
                    {!hasCategories && (
                      <Button
                        size="sm"
                        onClick={() => { setActiveColumnId(null); setActiveCategoryId(null); setStep("pick") }}
                        disabled={(selectedByColumn[activeColumn.id] ?? []).length === 0}
                        className="gap-1.5"
                      >
                        Continue
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <ScrollArea className="flex-1 min-h-0 max-h-[50vh] border rounded-lg p-3">
                  <div className="flex flex-col gap-0.5 pr-3">
                    {chooseItems.length === 0 ? (
                      <NoSearchResults onClear={onClearSearch} />
                    ) : chooseItems.map((item) => (
                      <EditableLeafItem
                        key={item.id}
                        item={item}
                        isChecked={(selectedByColumn[activeColumn.id] ?? []).includes(item.id)}
                        onToggle={() => toggleItem(activeColumn.id, item.id)}
                        customColumnId={customItemColumns.get(item.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Step 4: Review & save */}
          {step === "review" && (
            <div className={cn("flex", isWide ? "flex-row gap-6 flex-1 min-h-0" : "flex-col gap-4")}>
              <GuidancePanel {...STEP_GUIDANCE.review} className={isWide ? "w-1/3 shrink-0" : "w-full shrink-0"} />
              <div className={cn("flex flex-col gap-4 min-w-0", isWide && "flex-1")}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Problem Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the problem you've discovered..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={reset}>
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Start Over
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStep("pick")}>
                    Add More Dimensions
                  </Button>
                  <Button onClick={handleSave} disabled={totalSelections === 0} className="gap-2">
                    <Save className="h-3.5 w-3.5" />
                    Save Problem
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {totalSelections > 0 && (
      <Card className="shrink-0">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-1.5">
            {columns.flatMap((col) => {
              const ids = selectedByColumn[col.id] ?? []
              if (ids.length === 0) return []
              const colors = COLUMN_COLORS[col.id]
              const Icon = COLUMN_ICONS[col.id]
              return ids.map((id) => {
                const label = findLabel(col.items, id)
                return (
                  <span
                    key={id}
                    className={cn("inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5", colors?.pill || "bg-primary/10 text-primary")}
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0" />}
                    {label}
                    <button
                      onClick={() => toggleItem(col.id, id)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })
            })}
          </div>
        </CardContent>
      </Card>
    )}
    </>
  )
}

export default function BrainstormPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const savedProblems = useSelector((state: RootState) =>
    state.problems.problems.filter((p) => p.source === "brainstorm")
  )
  const triggers = useSelector((state: RootState) => state.selfDiscoveryItems.items)
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)

  const youColumn = useMemo<BrainstormColumn>(() => {
    // Map each question URL to its parent category
    const questionToCat = new Map<string, { url: string; title: string }>()
    for (const cat of SELF_DISCOVERY_CATEGORIES) {
      for (const q of cat.questions) {
        questionToCat.set(q.url, { url: cat.url, title: cat.title })
      }
    }
    // Group triggers by category
    const groups = new Map<string, { title: string; children: BrainstormItem[] }>()
    for (const t of triggers) {
      const cat = questionToCat.get(t.questionUrl)
      const catUrl = cat?.url ?? t.questionUrl
      const catTitle = cat?.title ?? t.questionUrl
      if (!groups.has(catUrl)) groups.set(catUrl, { title: catTitle, children: [] })
      groups.get(catUrl)!.children.push({ id: t.id, label: t.title })
    }
    const items: BrainstormItem[] = Array.from(groups.entries()).map(([url, { title, children }]) => ({
      id: `sd-group-${url}`,
      label: title,
      children,
    }))
    const customYou = customByColumn.you ?? []
    if (customYou.length > 0) {
      items.push({
        id: "you-user-group",
        label: "Your items",
        children: customYou.map((i) => ({ id: i.id, label: i.label })),
      })
    }
    return { id: "you", title: "You", items }
  }, [triggers, customByColumn])

  const customItemColumns = useMemo(() => {
    const map = new Map<string, string>()
    for (const [colId, items] of Object.entries(customByColumn)) {
      for (const item of items) {
        map.set(item.id, colId)
      }
    }
    return map
  }, [customByColumn])

  // Inject a synthetic "Your items" group into each Customer/Context/Problem
  // column whenever the user has authored at least one custom item there. The
  // group is only present at render time; nothing is persisted on the column tree.
  const columnsWithCustomItems = useMemo<BrainstormColumn[]>(() => {
    return brainstormColumns.map((col) => {
      const custom = customByColumn[col.id] ?? []
      if (custom.length === 0) return col
      const yourGroup: BrainstormItem = {
        id: `${col.id}-user-group`,
        label: "Your items",
        children: custom.map((i) => ({ id: i.id, label: i.label })),
      }
      return { ...col, items: [...col.items, yourGroup] }
    })
  }, [customByColumn])

  const allColumns = useMemo<BrainstormColumn[]>(
    () => [youColumn, ...columnsWithCustomItems],
    [youColumn, columnsWithCustomItems]
  )

  const hiddenColumnsArray = useSelector((state: RootState) => state.settings.hiddenBrainstormColumns)
  const hiddenColumns = useMemo(() => new Set(hiddenColumnsArray), [hiddenColumnsArray])

  const toggleColumnVisibility = (columnId: string) => {
    const next = hiddenColumns.has(columnId)
      ? hiddenColumnsArray.filter((id) => id !== columnId)
      : [...hiddenColumnsArray, columnId]
    dispatch.settings.setHiddenBrainstormColumns(next)
  }

  const brainstormSelectedArray = useSelector((state: RootState) => state.settings.brainstormSelected)
  const selected = useMemo(() => new Set(brainstormSelectedArray), [brainstormSelectedArray])
  const setSelected = (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    const next = typeof updater === "function" ? updater(selected) : updater
    dispatch.settings.setBrainstormSelected(Array.from(next))
  }
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedQuery = useDeferredValue(searchQuery)

  const filteredColumnsMap = useMemo(() => {
    if (!debouncedQuery) return null
    const map = new Map<string, BrainstormItem[]>()
    for (const col of allColumns) {
      map.set(col.id, filterItems(col.items, debouncedQuery))
    }
    return map
  }, [debouncedQuery, allColumns])

  const filteredColumns = useMemo(() => {
    if (!filteredColumnsMap) return allColumns
    return allColumns.map((col) => ({
      ...col,
      items: filteredColumnsMap.get(col.id) ?? col.items,
    }))
  }, [allColumns, filteredColumnsMap])

  const [editingProblem, setEditingProblem] = useState<Problem | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [editIdsByColumn, setEditIdsByColumn] = useState<Record<string, string[]>>({})
  const initRef = useRef(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [saveDescription, setSaveDescription] = useState("")
  const [saveIdsByColumn, setSaveIdsByColumn] = useState<Record<string, string[]>>({})
  const [nextStepDialogOpen, setNextStepDialogOpen] = useState(false)
  const [lastSavedProblemId, setLastSavedProblemId] = useState<number | null>(null)
  const [tableDrawerOpen, setTableDrawerOpen] = useState(false)
  const [addCustomDialogOpen, setAddCustomDialogOpen] = useState(false)
  const [managingColumnId, setManagingColumnId] = useState<string | null>(null)
  const builderResetRef = useRef<(() => void) | null>(null)
  const fullView = useSelector((state: RootState) => state.settings.fullView)
  const brainstormMode = useSelector((state: RootState) => state.settings.brainstormMode)
  const containerSize = useContainerSize()
  // Columns the user can edit (excludes "you", which is populated only from
  // self-discovery selections).
  const editableColumns = useMemo<BrainstormColumn[]>(
    () => allColumns.filter((c) => c.id !== "you"),
    [allColumns]
  )

  const handleBuilderSave = useCallback(async (selections: Record<string, string[]>, description: string) => {
    const patch: Partial<Pick<Problem, "customers" | "contexts" | "problems" | "you">> = {}
    for (const column of allColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      patch[field] = selections[column.id] ?? []
    }
    const newProblem = await dispatch.problems.create({ ...patch, source: "brainstorm", description })
    setLastSavedProblemId(newProblem.id)
    setNextStepDialogOpen(true)
  }, [allColumns, dispatch.problems])

  // Exit full view when navigating away from this page
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname.includes("/brainstorm")) {
      dispatch.settings.setFullView(false)
    }
  }, [pathname, dispatch.settings])

  // Escape key exits full view
  useEffect(() => {
    if (!fullView) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch.settings.setFullView(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [fullView, dispatch.settings])

  const saveDescriptionDebounced = useDebouncedCallback((value: string) => {
    if (!editingProblem) return
    dispatch.problems.update({ id: editingProblem.id, patch: { description: value } })
  }, 500)

  useEffect(() => {
    if (!initRef.current) { initRef.current = true; return }
    saveDescriptionDebounced(editDescription)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDescription])

  const toggleItem = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const clearAll = () => setSelected(new Set())

  const totalSelected = selected.size

  const openSaveDialog = () => {
    const ids: Record<string, string[]> = {}
    for (const column of editableColumns) {
      ids[column.id] = collectAllIds(column.items).filter((id) => selected.has(id))
    }
    setSaveDescription("")
    setSaveIdsByColumn(ids)
    setSaveDialogOpen(true)
  }

  const saveCombination = async () => {
    const patch: Partial<Pick<Problem, "customers" | "contexts" | "problems" | "you">> = {}
    for (const column of editableColumns) {
      const field = COLUMN_TO_FIELD[column.id] as "customers" | "contexts" | "problems"
      patch[field] = saveIdsByColumn[column.id] ?? []
    }
    // Carry the live "you" selection straight through as ids: it never goes through the dialog.
    const youColumnDef = allColumns.find((c) => c.id === "you")
    if (youColumnDef) {
      const youIds = collectAllIds(youColumnDef.items).filter((id) => selected.has(id))
      patch.you = youIds
    }
    const newProblem = await dispatch.problems.create({ ...patch, source: "brainstorm", description: saveDescription.trim() })
    clearAll()
    setSaveDialogOpen(false)
    setLastSavedProblemId(newProblem.id)
    setNextStepDialogOpen(true)
  }

  const openEditDialog = (problem: Problem) => {
    initRef.current = false
    const ids: Record<string, string[]> = {}
    for (const column of editableColumns) {
      const field = COLUMN_TO_FIELD[column.id]
      ids[column.id] = [...(problem[field] as string[])]
    }
    setEditDescription(problem.description ?? "")
    setEditIdsByColumn(ids)
    setEditingProblem(problem)
  }

  const updateEditColumn = (columnId: string, ids: string[]) => {
    if (!editingProblem) return
    setEditIdsByColumn((prev) => ({ ...prev, [columnId]: ids }))
    const field = COLUMN_TO_FIELD[columnId] as "customers" | "contexts" | "problems"
    dispatch.problems.update({ id: editingProblem.id, patch: { [field]: ids } })
  }

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 min-h-[50vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const content = (
    <div className={cn("flex flex-col gap-3 w-full flex-1 min-h-0 min-w-0 overflow-x-hidden", containerSize === "wide" && "max-h-[calc(100svh-7rem)] lg:max-h-[calc(100svh-8rem)]")}>
      <Card className="shrink-0">
        <CardContent className="py-3">
          {/* Mode toggle + description + action buttons */}
          <div className={cn("flex gap-4 min-w-0", containerSize === "wide" ? "items-center justify-between" : "flex-col items-stretch")}>
            <div className={cn(
              "flex min-w-0",
              containerSize === "medium"
                ? "flex-row items-center gap-3"
                : "flex-col items-start gap-2"
            )}>
              <ToggleGroup
                type="single"
                value={brainstormMode}
                onValueChange={(value) => {
                  if (value) dispatch.settings.setBrainstormMode(value as BrainstormMode)
                }}
                size="sm"
                className="shrink-0"
              >
                <ToggleGroupItem value="canvas" aria-label="Canvas mode" className="gap-1.5 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Canvas
                </ToggleGroupItem>
                <ToggleGroupItem value="builder" aria-label="Problem Builder mode" className="gap-1.5 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  Builder
                </ToggleGroupItem>
              </ToggleGroup>
              <p className={cn("text-sm text-muted-foreground", containerSize === "narrow" ? "hidden" : "block")}>
                {brainstormMode === "canvas"
                  ? "Explore potential areas for innovation by navigating through the options below."
                  : "Build a problem step by step by selecting from each dimension."}
              </p>
            </div>
            <div className={cn("flex items-center gap-2 flex-wrap", containerSize === "wide" && "ml-auto gap-3")}>
              <div className={cn("relative", containerSize === "narrow" && "w-full")}>
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("pl-9 h-8 bg-white", containerSize === "narrow" ? "w-full" : "w-44")}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddCustomDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                Add your own item
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch.settings.setFullView(!fullView)}
                className="gap-2"
              >
                {fullView ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                {fullView ? "Exit Full View" : "Full View"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTableDrawerOpen(true)}
                className="gap-2"
              >
                Show Saved Problems ({savedProblems.length})
              </Button>
              <ConfirmDialog
                trigger={
                  <Button variant="outline" size="sm" className="gap-2">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                }
                title="Reset brainstorm?"
                description={
                  brainstormMode === "canvas"
                    ? "This will clear your current selection across all dimensions. Saved problems are not affected."
                    : "This will clear your in-progress problem builder. Saved problems are not affected."
                }
                confirmLabel="Reset"
                onConfirm={() => {
                  if (brainstormMode === "canvas") {
                    clearAll()
                  } else if (brainstormMode === "builder") {
                    builderResetRef.current?.()
                  }
                }}
              />
              {brainstormMode === "canvas" && (
                <Button
                  size="sm"
                  onClick={openSaveDialog}
                  disabled={totalSelected === 0}
                  className="gap-2"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Problem
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {brainstormMode === "builder" ? (
        <ProblemBuilder columns={filteredColumns} onSave={handleBuilderSave} resetRef={builderResetRef} onClearSearch={() => setSearchQuery("")} customItemColumns={customItemColumns} />
      ) : (<>
      <div className={cn(
        "grid gap-4 flex-1 min-h-0 overflow-y-auto",
        containerSize === "narrow" ? "grid-cols-1" : containerSize === "medium" ? "grid-cols-2" : "grid-cols-4",
      )}>
        {allColumns.map((column) => {
          const columnSelected = getSelectedForColumn(column.items, selected)
          const isHidden = hiddenColumns.has(column.id)
          const Icon = COLUMN_ICONS[column.id]

          const colors = COLUMN_COLORS[column.id]

          if (isHidden) {
            return (
              <Card key={column.id} className="flex flex-col items-center pt-3 pb-4 min-h-0 w-12 shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => toggleColumnVisibility(column.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Show column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex-1" />
                <span className={cn("text-xs font-semibold [writing-mode:vertical-lr] rotate-180 select-none mb-3", colors?.icon || "text-muted-foreground")}>
                  {column.title}
                </span>
                {Icon && <Icon className={cn("h-4 w-4 mb-3", colors?.icon || "text-muted-foreground")} />}
              </Card>
            )
          }

          return (
            <Card key={column.id} className="flex flex-col min-h-[300px] flex-1 min-w-0">
              <CardHeader className="pb-3">
                <div className={cn("flex items-center justify-between px-2 py-1 rounded-md", colors?.bg)}>
                  <div className="flex items-center gap-2">
                    {Icon && (
                      <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded", colors?.iconBg || "bg-muted")}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </span>
                    )}
                    <CardTitle className="text-base font-bold">
                      {column.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">
                      {columnSelected.length} / {collectAllIds(column.items).length}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleColumnVisibility(column.id)}>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide column
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setManagingColumnId(column.id)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Manage your items
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-0 flex flex-col gap-3 min-h-0">
                <ScrollArea className="flex-1 min-h-0">
                  <div className="flex flex-col gap-0.5 pr-3">
                    {(() => {
                      const items = filteredColumnsMap?.get(column.id) ?? column.items
                      return items.length > 0 ? items.map((item) => (
                        <BrainstormCheckItem
                          key={item.id}
                          item={item}
                          selected={selected}
                          onToggle={toggleItem}
                          forceOpen={!!debouncedQuery}
                          customItemColumns={customItemColumns}
                        />
                      )) : (
                        <p className="text-xs text-muted-foreground py-4 text-center">No matches</p>
                      )
                    })()}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {totalSelected > 0 && (
        <Card className="shrink-0">
          <CardContent className="py-3">
            <div className="flex flex-wrap gap-1.5">
              {allColumns.flatMap((column) => {
                const columnSelected = getSelectedForColumn(column.items, selected)
                if (columnSelected.length === 0) return []
                const colors = COLUMN_COLORS[column.id]
                const Icon = COLUMN_ICONS[column.id]
                return columnSelected.map(({ id, label }) => (
                  <span
                    key={id}
                    className={cn("inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5", colors?.pill || "bg-primary/10 text-primary")}
                  >
                    {Icon && <Icon className="h-3 w-3 shrink-0" />}
                    {label}
                    <button
                      onClick={() => toggleItem(id)}
                      className="hover:opacity-70 transition-opacity"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </>)}

      <Drawer open={tableDrawerOpen} onOpenChange={setTableDrawerOpen}>
        <DrawerContent className="max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Saved Problems ({savedProblems.length})</DrawerTitle>
            <DrawerDescription className="sr-only">Problems saved from the brainstorming tool</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-auto px-4 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Description</TableHead>
                  {allColumns.map((column) => (
                    <TableHead key={column.id}>{column.title}</TableHead>
                  ))}
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedProblems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={allColumns.length + 3}
                      className="text-center text-muted-foreground py-8"
                    >
                      No problems saved yet. Select items above and click &quot;Save Problem&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  savedProblems.map((problem, index) => (
                    <TableRow key={problem.id}>
                      <TableCell className="text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-sm max-w-48">
                        {problem.description ? (
                          <span className="line-clamp-2">{problem.description}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      {allColumns.map((column) => {
                        const field = COLUMN_TO_FIELD[column.id]
                        const ids = problem[field]
                        return (
                          <TableCell key={column.id}>
                            {ids.length > 0 ? (
                              <span className="text-sm">
                                {ids.map((id) => resolveDimensionLabel(column.id, id, customByColumn, triggers)).join(", ")}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => openEditDialog(problem)}
                            aria-label="Edit problem"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => dispatch.problems.delete(problem.id)}
                            aria-label="Delete problem"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/problems/${problem.id}/validation/introduction`)}
                            aria-label="Validate problem"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span className="ml-1">Validate</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DrawerContent>
      </Drawer>

      <ProblemFormDialog
        open={saveDialogOpen}
        onOpenChange={(open) => { if (!open) setSaveDialogOpen(false) }}
        title="Save Problem"
        description={saveDescription}
        onDescriptionChange={setSaveDescription}
        idsByColumn={saveIdsByColumn}
        onColumnChange={(columnId, ids) => setSaveIdsByColumn((prev) => ({ ...prev, [columnId]: ids }))}
        columns={editableColumns}
        actions={
          <>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCombination}>Save Problem</Button>
          </>
        }
      />

      <ProblemFormDialog
        open={editingProblem !== null}
        onOpenChange={(open) => { if (!open) setEditingProblem(null) }}
        title="Edit Problem"
        description={editDescription}
        onDescriptionChange={setEditDescription}
        idsByColumn={editIdsByColumn}
        onColumnChange={updateEditColumn}
        columns={editableColumns}
      />

      <AddCustomItemDialog
        open={addCustomDialogOpen}
        onOpenChange={setAddCustomDialogOpen}
        onCreated={(_columnId, id) => {
          // Auto-tick the new item.
          dispatch.settings.setBrainstormSelected([...brainstormSelectedArray, id])
        }}
      />

      {managingColumnId && (
        <ManageCustomItemsDialog
          open={managingColumnId !== null}
          onOpenChange={(open) => { if (!open) setManagingColumnId(null) }}
          columnId={managingColumnId}
          columnTitle={allColumns.find((c) => c.id === managingColumnId)?.title ?? ""}
        />
      )}

      <Dialog open={nextStepDialogOpen} onOpenChange={setNextStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Problem Saved</DialogTitle>
            <DialogDescription>
              Your problem has been saved. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                setNextStepDialogOpen(false)
                if (lastSavedProblemId !== null) {
                  router.push(`/problems/${lastSavedProblemId}/validation/introduction`)
                }
              }}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Continue to Problem Validation
            </Button>
            <Button
              variant="outline"
              onClick={() => setNextStepDialogOpen(false)}
            >
              Keep Brainstorming
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  return content
}
