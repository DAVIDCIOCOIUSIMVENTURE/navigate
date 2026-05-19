"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { brainstormColumns } from "@/data/brainstormData"
import type { CustomBrainstormColumnId } from "@/store/custom-brainstorm-items-model"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  columnId: CustomBrainstormColumnId
  selectedLabels: string[]
  onChange: (labels: string[]) => void
  addPlaceholder?: string
  ariaLabel?: string
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
}

type FlatItem = { id: string; label: string }
type Group = { id: string; label: string; items: FlatItem[] }

/**
 * Multi-select picker bound to one of the brainstorm dimensions (customers,
 * contexts, or problems). Built-in categories come from `brainstormColumns`;
 * custom additions persist through `customBrainstormItems` so they show up
 * back in the brainstorm canvas too. Visual structure mirrors
 * `LifeExperiencesPicker` so all life-lens pickers share one look.
 */
export function BrainstormDimensionPicker({
  columnId,
  selectedLabels,
  onChange,
  addPlaceholder,
  ariaLabel,
  addDialogOpen,
  onAddDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const customItems = useSelector(
    (s: RootState) => s.customBrainstormItems.byColumn[columnId] ?? []
  )
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const column = useMemo(
    () => brainstormColumns.find((c) => c.id === columnId),
    [columnId]
  )

  const builtInGroups = useMemo<Group[]>(() => {
    if (!column) return []
    return column.items.map((cat) => ({
      id: cat.id,
      label: cat.label,
      items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
    }))
  }, [column])

  const customGroup = useMemo<Group | null>(() => {
    if (customItems.length === 0) return null
    return {
      id: `${columnId}-custom`,
      label: `Your ${column?.title?.toLowerCase() ?? columnId}`,
      items: customItems.map((c) => ({ id: c.id, label: c.label })),
    }
  }, [customItems, columnId, column])

  const selectedSet = useMemo(
    () => new Set(selectedLabels.map((l) => l.trim().toLowerCase())),
    [selectedLabels]
  )

  function isSelected(label: string) {
    return selectedSet.has(label.trim().toLowerCase())
  }

  function toggle(label: string) {
    const trimmed = label.trim()
    if (trimmed.length === 0) return
    const lower = trimmed.toLowerCase()
    if (selectedSet.has(lower)) {
      onChange(selectedLabels.filter((l) => l.trim().toLowerCase() !== lower))
    } else {
      onChange([...selectedLabels, trimmed])
    }
  }

  function handleAdd() {
    const label = draft.trim()
    if (!label) return
    const allLabels = [
      ...builtInGroups.flatMap((g) => g.items.map((i) => i.label.toLowerCase())),
      ...customItems.map((i) => i.label.toLowerCase()),
    ]
    if (!allLabels.includes(label.toLowerCase())) {
      dispatch.customBrainstormItems.create({ columnId, label })
    }
    if (!selectedSet.has(label.toLowerCase())) {
      onChange([...selectedLabels, label])
    }
    setDraft("")
    onAddDialogOpenChange(false)
  }

  const groups = customGroup ? [customGroup, ...builtInGroups] : builtInGroups
  const inputId = `${columnId}-dimension-new`
  const placeholder = addPlaceholder ?? "Type your own and press Add"

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? `Pick one or more ${column?.title?.toLowerCase() ?? columnId}`}
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col rounded-lg bg-card p-2">
        {groups.map((group) => {
          const open = openGroupId === group.id
          const selectedInGroup = group.items.filter((i) => isSelected(i.label)).length
          return (
            <Collapsible
              key={group.id}
              open={open}
              onOpenChange={(next) => setOpenGroupId(next ? group.id : null)}
            >
              <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md hover:bg-accent/50 transition-colors">
                {open ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-semibold text-foreground tracking-wide select-none flex-1 text-left">
                  {group.label}
                </span>
                {selectedInGroup > 0 && (
                  <span className="text-sm text-secondary-brand font-medium">
                    {selectedInGroup} selected
                  </span>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul
                  role="group"
                  aria-label={group.label}
                  className="ml-7 flex flex-col gap-1 pb-1"
                >
                  {group.items.map((item) => {
                    const checked = isSelected(item.label)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => toggle(item.label)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            checked
                              ? "bg-primary/10 border border-primary"
                              : "border border-transparent hover:bg-accent/40"
                          )}
                        >
                          <span
                            className={cn(
                              "grid place-content-center h-4 w-4 shrink-0 rounded-sm border",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input"
                            )}
                            aria-hidden="true"
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          <span className="flex-1 text-sm leading-snug">
                            {item.label}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      {selectedLabels.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <p className="text-base font-semibold text-white">
            Selected ({selectedLabels.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => toggle(label)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-foreground px-3 py-1 text-base hover:bg-white/90"
              >
                <span>{label}</span>
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove {label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add your own</DialogTitle>
            <DialogDescription>
              Anything you add joins the {column?.title ?? columnId} dimension in
              the brainstorm canvas and the picker below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor={inputId} className="text-base font-medium">
              {column?.title ?? "Item"}
            </label>
            <Input
              id={inputId}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder={placeholder}
              className="text-base"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onAddDialogOpenChange(false)
                setDraft("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={draft.trim().length === 0}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
