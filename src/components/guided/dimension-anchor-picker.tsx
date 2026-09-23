"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { getGroupIcon } from "@/lib/group-icons"
import { DIMENSION_ICONS } from "@/lib/dimension-visuals"
import { dimensionColumns } from "@/data/dimensionData"
import type { CustomDimensionColumnId } from "@/store/custom-dimension-items-model"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ManageCustomItemsDialog } from "@/components/manage-custom-items-dialog"

type Props = {
  columnId: CustomDimensionColumnId
  selectedId: string | null
  onSelect: (id: string | null, label: string | null) => void
  /** What one entry is called in the add dialog, e.g. "context" or "annoyance". */
  noun: string
  addPlaceholder: string
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
  editDialogOpen: boolean
  onEditDialogOpenChange: (open: boolean) => void
}

type GroupItem = { id: string; label: string }
type Group = { id: string; label: string; items: GroupItem[] }

/**
 * Single-select picker over one dimension column (contexts or problems) for
 * the anchor of a Guided discovery run: one entry from the built-in catalogue,
 * or one the user has added in their own words. Additions persist through
 * `customDimensionItems`, so they show up in the Canvas Builder too. Same
 * markup as the other anchor pickers in `src/components/reflect/`.
 */
export function DimensionAnchorPicker({
  columnId,
  selectedId,
  onSelect,
  noun,
  addPlaceholder,
  addDialogOpen,
  onAddDialogOpenChange,
  editDialogOpen,
  onEditDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const customItems = useSelector((s: RootState) => s.customDimensionItems.byColumn[columnId] ?? [])
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const column = useMemo(() => dimensionColumns.find((c) => c.id === columnId), [columnId])
  const customGroupId = `${columnId}-custom`

  const groups = useMemo<Group[]>(() => {
    const result: Group[] = []
    if (customItems.length > 0) {
      result.push({
        id: customGroupId,
        label: `Your ${column?.title.toLowerCase() ?? columnId}s`,
        items: customItems.map((c) => ({ id: c.id, label: c.label })),
      })
    }
    for (const cat of column?.items ?? []) {
      result.push({
        id: cat.id,
        label: cat.label,
        items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
      })
    }
    return result
  }, [customItems, column, columnId, customGroupId])

  async function handleAdd() {
    const label = draft.trim()
    if (!label) return
    // Something already in the list is picked rather than duplicated.
    const lower = label.toLowerCase()
    const existing = groups.flatMap((g) => g.items).find((i) => i.label.trim().toLowerCase() === lower)
    const item = existing ?? (await dispatch.customDimensionItems.create({ columnId, label }))
    onSelect(item.id, item.label)
    setDraft("")
    onAddDialogOpenChange(false)
  }

  const CustomIcon = DIMENSION_ICONS[columnId]
  const inputId = `${columnId}-anchor-new`
  const article = /^[aeiou]/i.test(noun) ? "an" : "a"

  return (
    <div role="radiogroup" aria-label={`Pick one ${noun}`} className="flex flex-col gap-2">
      <div className="flex flex-col rounded-lg bg-card p-2">
        {groups.map((group) => {
          const open = openGroupId === group.id
          const selectedInGroup = group.items.some((i) => selectedId === i.id)
          const isCustomGroup = group.id === customGroupId
          const GroupIcon = isCustomGroup ? CustomIcon : getGroupIcon(group.label)
          return (
            <Collapsible key={group.id} open={open} onOpenChange={(next) => setOpenGroupId(next ? group.id : null)}>
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors",
                  isCustomGroup ? "bg-quaternary/10 hover:bg-quaternary/15" : "hover:bg-accent/50",
                )}
              >
                {open ? (
                  <ChevronDown className={cn("h-3.5 w-3.5 shrink-0", isCustomGroup ? "text-quaternary" : "text-muted-foreground")} />
                ) : (
                  <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isCustomGroup ? "text-quaternary" : "text-muted-foreground")} />
                )}
                <GroupIcon className={cn("h-4 w-4 shrink-0", isCustomGroup ? "text-quaternary" : "text-foreground")} aria-hidden="true" />
                <span
                  className={cn(
                    "text-sm font-semibold tracking-wide select-none flex-1 text-left",
                    isCustomGroup ? "text-quaternary" : "text-foreground",
                  )}
                >
                  {group.label}
                </span>
                {selectedInGroup && <span className="text-sm text-secondary-brand font-medium">Selected</span>}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul role="group" aria-label={group.label} className="ml-7 flex flex-col gap-1 pb-1">
                  {group.items.map((item) => {
                    const isSelected = selectedId === item.id
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => (isSelected ? onSelect(null, null) : onSelect(item.id, item.label))}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected ? "bg-primary/10 border border-primary" : "border border-transparent hover:bg-accent/40",
                          )}
                        >
                          <span
                            className={cn(
                              "grid place-content-center h-4 w-4 shrink-0 rounded-full border",
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                            )}
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          <span className="flex-1 text-sm leading-snug">{item.label}</span>
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

      <Dialog open={addDialogOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {article} {noun}</DialogTitle>
            <DialogDescription>
              Put it in your own words. Anything you add joins the {column?.title ?? columnId} dimension in the Canvas Builder and the list here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor={inputId} className="text-base font-medium capitalize">
              {noun}
            </label>
            <Input
              id={inputId}
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void handleAdd()
                }
              }}
              placeholder={addPlaceholder}
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
            <Button type="button" onClick={() => void handleAdd()} disabled={draft.trim().length === 0} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageCustomItemsDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        columnId={columnId}
        columnTitle={column?.title ?? columnId}
      />
    </div>
  )
}
