"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { generateSelfDiscoveryItemId } from "@/store/self-discovery-items-model"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, ChevronRight, Compass, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
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
import { EditSelfDiscoveryItemsDialog } from "@/components/reflect/edit-self-discovery-items-dialog"

const LIFE_EXPERIENCES_QUESTION_URL = "life-experiences"

type Props = {
  selectedId: string | null
  onSelect: (id: string | null, label: string | null) => void
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
  editDialogOpen: boolean
  onEditDialogOpenChange: (open: boolean) => void
}

/**
 * Single-select picker bound to the self-discovery
 * "What life experiences have you acquired?" question. The list mirrors
 * `selfDiscoveryItems` filtered by that question, and adding a new entry here writes
 * back through the same model so the two stay in sync.
 */
export function LifeExperiencesPicker({
  selectedId,
  onSelect,
  addDialogOpen,
  onAddDialogOpenChange,
  editDialogOpen,
  onEditDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => i.questionUrl === LIFE_EXPERIENCES_QUESTION_URL)
  )
  const problems = useSelector((s: RootState) => s.problems.problems)
  const customContexts = useSelector(
    (s: RootState) => s.customDimensionItems.byColumn.contexts ?? []
  )
  const [draft, setDraft] = useState("")
  const [selfDiscoveryOpen, setSelfDiscoveryOpen] = useState(true)
  const [openContextGroupId, setOpenContextGroupId] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  )

  const selfDiscoveryGroup = useMemo(
    () => ({
      id: "self-discovery",
      label: "From your self-discovery",
      items: sortedItems.map((i) => ({ id: i.id, label: i.title })),
    }),
    [sortedItems]
  )

  const contextGroups = useMemo(() => {
    const col = dimensionColumns.find((c) => c.id === "contexts")
    const builtIn = col
      ? col.items.map((cat) => ({
          id: cat.id,
          label: cat.label,
          items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
        }))
      : []
    const result: { id: string; label: string; items: { id: string; label: string }[] }[] = []
    if (customContexts.length > 0) {
      result.push({
        id: "context-custom",
        label: "Your contexts",
        items: customContexts.map((c) => ({ id: c.id, label: c.label })),
      })
    }
    return [...result, ...builtIn]
  }, [customContexts])

  const usageByTitle = useMemo(
    () => countAnchorUsage(problems, "life"),
    [problems]
  )

  function saveAndSelect(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    const id = generateSelfDiscoveryItemId()
    dispatch.selfDiscoveryItems.addItem({
      id,
      title: trimmed,
      questionUrl: LIFE_EXPERIENCES_QUESTION_URL,
    })
    onSelect(id, trimmed)
    setDraft("")
    onAddDialogOpenChange(false)
  }

  function handleAdd() {
    saveAndSelect(draft)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Pick one life experience"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col rounded-lg bg-card p-2">
        <Collapsible open={selfDiscoveryOpen} onOpenChange={setSelfDiscoveryOpen}>
          <CollapsibleTrigger
            className={cn(
              "flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors",
              "bg-quaternary/10 hover:bg-quaternary/15"
            )}
          >
            {selfDiscoveryOpen
              ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-quaternary" />
              : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-quaternary" />
            }
            <Compass className="h-4 w-4 text-quaternary shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold tracking-wide select-none flex-1 text-left text-quaternary">
              {selfDiscoveryGroup.label}
            </span>
            {selfDiscoveryGroup.items.some((i) => selectedId === i.id) && (
              <span className="text-sm text-secondary-brand font-medium">
                Selected
              </span>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="ml-7 flex flex-col gap-1 pb-1">
              {selfDiscoveryGroup.items.length === 0 ? (
                <li className="text-sm text-muted-foreground px-2 py-1.5">
                  Nothing saved yet. Use &ldquo;Add your own&rdquo; or{" "}
                  <Link
                    href="/self-discovery/discover/personal-interests/life-experiences"
                    className="text-quaternary font-medium underline underline-offset-2 hover:text-quaternary/80"
                  >
                    visit Self-Discovery
                  </Link>{" "}
                  to fill this in.
                </li>
              ) : (
                selfDiscoveryGroup.items.map((item) => {
                  const isSelected = selectedId === item.id
                  const usageCount =
                    usageByTitle.get(item.label.trim().toLowerCase()) ?? 0
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
                        <span className="flex-1 text-sm leading-snug">
                          {item.label}
                        </span>
                        {usageCount > 0 && (
                          <span className="ml-2 shrink-0 text-sm bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                            Reflected {usageCount}x
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent className="max-h-[85svh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add a life experience</DialogTitle>
            <DialogDescription>
              Anything you add is also saved to your self-discovery under &quot;What
              life experiences have you acquired?&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="life-experience-new" className="text-base font-medium">
              Experience
            </label>
            <Input
              id="life-experience-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
                }
              }}
              placeholder="e.g. Moving country, becoming a parent, switching careers"
              className="text-base"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2 min-h-0 flex-1">
            <p className="text-base font-medium">Or pick from common contexts</p>
            <p className="text-sm text-muted-foreground">
              Picking one adds it to your self-discovery as a life experience.
            </p>
            <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card p-2">
              {contextGroups.map((group) => {
                const open = openContextGroupId === group.id
                if (group.items.length === 0) return null
                return (
                  <Collapsible
                    key={group.id}
                    open={open}
                    onOpenChange={(next) =>
                      setOpenContextGroupId(next ? group.id : null)
                    }
                  >
                    <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors hover:bg-accent/50">
                      {open
                        ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      }
                      <span className="text-sm font-semibold tracking-wide select-none flex-1 text-left text-foreground">
                        {group.label}
                      </span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="ml-7 flex flex-col gap-1 pb-1">
                        {group.items.map((item) => (
                          <li key={item.id}>
                            <button
                              type="button"
                              onClick={() => saveAndSelect(item.label)}
                              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left border border-transparent hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                              <span className="flex-1 text-sm leading-snug">
                                {item.label}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
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

      <EditSelfDiscoveryItemsDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        title="Edit your life experiences"
        description="Rename or remove the life experiences you've saved to your self-discovery."
        questionUrls={[LIFE_EXPERIENCES_QUESTION_URL]}
      />
    </div>
  )
}
