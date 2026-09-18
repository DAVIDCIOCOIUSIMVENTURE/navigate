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
import { countAnchorUsage } from "@/lib/reflect-usage"
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
import { ManageCustomItemsDialog } from "@/components/manage-custom-items-dialog"

const COLUMN_ID = "problems"
const CUSTOM_GROUP_ID = `${COLUMN_ID}-custom`

type Props = {
  selectedId: string | null
  onSelect: (id: string | null, label: string | null) => void
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
  editDialogOpen: boolean
  onEditDialogOpenChange: (open: boolean) => void
}

type GroupItem = { id: string; label: string }
type Group = { id: string; label: string; items: GroupItem[] }

/**
 * Single-select picker for the anchor of the "Something that annoys you" tool:
 * one kind of pain from the Problems dimension catalogue, or one the user has
 * added in their own words. Additions persist through `customDimensionItems`,
 * so they show up in the Canvas Builder's Problem column too. Visual structure
 * mirrors `AudiencePicker` so all anchor pickers share one look.
 */
export function AnnoyancePicker({
  selectedId,
  onSelect,
  addDialogOpen,
  onAddDialogOpenChange,
  editDialogOpen,
  onEditDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const customProblems = useSelector(
    (s: RootState) => s.customDimensionItems.byColumn[COLUMN_ID] ?? []
  )
  const problems = useSelector((s: RootState) => s.problems.problems)
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const column = useMemo(
    () => dimensionColumns.find((c) => c.id === COLUMN_ID),
    []
  )

  const groups = useMemo<Group[]>(() => {
    const result: Group[] = []
    if (customProblems.length > 0) {
      result.push({
        id: CUSTOM_GROUP_ID,
        label: "Your problems",
        items: customProblems.map((c) => ({ id: c.id, label: c.label })),
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
  }, [customProblems, column])

  const usageByTitle = useMemo(
    () => countAnchorUsage(problems, "annoyance"),
    [problems]
  )

  async function handleAdd() {
    const label = draft.trim()
    if (!label) return
    // Something already in the list is picked rather than duplicated.
    const lower = label.toLowerCase()
    const existing = groups
      .flatMap((g) => g.items)
      .find((i) => i.label.trim().toLowerCase() === lower)
    const item = existing ?? (await dispatch.customDimensionItems.create({ columnId: COLUMN_ID, label }))
    onSelect(item.id, item.label)
    setDraft("")
    onAddDialogOpenChange(false)
  }

  const CustomIcon = DIMENSION_ICONS[COLUMN_ID]

  return (
    <div
      role="radiogroup"
      aria-label="Pick one annoyance"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col rounded-lg bg-card p-2">
        {groups.map((group) => {
          const open = openGroupId === group.id
          const selectedInGroup = group.items.some((i) => selectedId === i.id)
          const isCustomGroup = group.id === CUSTOM_GROUP_ID
          const GroupIcon = isCustomGroup ? CustomIcon : getGroupIcon(group.label)
          return (
            <Collapsible
              key={group.id}
              open={open}
              onOpenChange={(next) => setOpenGroupId(next ? group.id : null)}
            >
              <CollapsibleTrigger
                className={cn(
                  "flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors",
                  isCustomGroup
                    ? "bg-quaternary/10 hover:bg-quaternary/15"
                    : "hover:bg-accent/50"
                )}
              >
                {open
                  ? <ChevronDown className={cn("h-3.5 w-3.5 shrink-0", isCustomGroup ? "text-quaternary" : "text-muted-foreground")} />
                  : <ChevronRight className={cn("h-3.5 w-3.5 shrink-0", isCustomGroup ? "text-quaternary" : "text-muted-foreground")} />
                }
                <GroupIcon
                  className={cn("h-4 w-4 shrink-0", isCustomGroup ? "text-quaternary" : "text-foreground")}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "text-base font-semibold tracking-wide select-none flex-1 text-left",
                    isCustomGroup ? "text-quaternary" : "text-foreground"
                  )}
                >
                  {group.label}
                </span>
                {selectedInGroup && (
                  <span className="text-base text-secondary-brand font-medium">
                    Selected
                  </span>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="ml-7 flex flex-col gap-1 pb-1">
                  {group.items.map((item) => {
                    const isSelected = selectedId === item.id
                    const usageCount = usageByTitle.get(item.label.trim().toLowerCase()) ?? 0
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() =>
                            isSelected
                              ? onSelect(null, null)
                              : onSelect(item.id, item.label)
                          }
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isSelected
                              ? "bg-primary/10 border border-primary"
                              : "border border-transparent hover:bg-accent/40"
                          )}
                        >
                          <span
                            className={cn(
                              "grid place-content-center h-4 w-4 shrink-0 rounded-full border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input"
                            )}
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          <span className="flex-1 text-base leading-snug">
                            {item.label}
                          </span>
                          {usageCount > 0 && (
                            <span className="ml-2 shrink-0 text-base bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                              Reflected {usageCount}x
                            </span>
                          )}
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
            <DialogTitle>Add an annoyance</DialogTitle>
            <DialogDescription>
              Put it in your own words. Anything you add joins the Problem
              dimension in the Canvas Builder and the list here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="annoyance-new" className="text-base font-medium">
              Annoyance
            </label>
            <Input
              id="annoyance-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void handleAdd()
                }
              }}
              placeholder="e.g. Being kept on hold to fix something that should take two minutes"
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
              onClick={() => void handleAdd()}
              disabled={draft.trim().length === 0}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ManageCustomItemsDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        columnId={COLUMN_ID}
        columnTitle={column?.title ?? "Problem"}
      />
    </div>
  )
}
