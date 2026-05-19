"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { brainstormColumns } from "@/data/brainstormData"
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

const LIFE_EXPERIENCES_QUESTION_URL = "life-experiences"

type Props = {
  selectedTitle: string | null
  onSelect: (title: string | null) => void
}

/**
 * Single-select picker bound to the self-discovery
 * "What life experiences have you acquired?" question. The list mirrors
 * `selfDiscoveryItems` filtered by that question, and adding a new entry here writes
 * back through the same model so the two stay in sync.
 */
export function LifeExperiencesPicker({ selectedTitle, onSelect }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => i.questionUrl === LIFE_EXPERIENCES_QUESTION_URL)
  )
  const lifeCandidates = useSelector((s: RootState) =>
    s.problemCandidates.items.filter((c) => c.lensId === "life")
  )
  const customContexts = useSelector(
    (s: RootState) => s.customBrainstormItems.byColumn.contexts ?? []
  )
  const [draft, setDraft] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  const contextGroups = useMemo(() => {
    const col = brainstormColumns.find((c) => c.id === "contexts")
    const builtIn = col
      ? col.items.map((cat) => ({
          id: cat.id,
          label: cat.label,
          items: (cat.children ?? []).map((c) => ({ id: c.id, label: c.label })),
        }))
      : []
    if (customContexts.length === 0) return builtIn
    return [
      {
        id: "context-custom",
        label: "Your contexts",
        items: customContexts.map((c) => ({ id: c.id, label: c.label })),
      },
      ...builtIn,
    ]
  }, [customContexts])

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  )

  const usageByTitle = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of lifeCandidates) {
      const key = (c.context?.experience ?? "").trim().toLowerCase()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
  }, [lifeCandidates])

  function handleAdd() {
    const title = draft.trim()
    if (!title) return
    const exists = items.some((i) => i.title.toLowerCase() === title.toLowerCase())
    if (!exists) {
      dispatch.selfDiscoveryItems.addItem({
        title,
        questionUrl: LIFE_EXPERIENCES_QUESTION_URL,
      })
    }
    onSelect(title)
    setDraft("")
    setAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Pick one life experience"
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-semibold text-white">From your self-discovery</p>
          <Button
            type="button"
            onClick={() => setAddOpen(true)}
            className="gap-1.5 shrink-0 bg-white text-foreground hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add your own
          </Button>
        </div>
        {sortedItems.length === 0 ? (
          <p className="text-base text-white">
            Nothing saved yet. Add one above or visit Self-Discovery to fill this in.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 rounded-lg bg-card p-2">
            {sortedItems.map((item) => {
              const isSelected = selectedTitle === item.title
              const usageCount = usageByTitle.get(item.title.trim().toLowerCase()) ?? 0
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelect(isSelected ? null : item.title)}
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
                    <span className="flex-1 text-base leading-snug">{item.title}</span>
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
        )}
      </div>

      {contextGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-base font-semibold text-white">
            Or pick from common contexts
          </p>
          <p className="text-base text-white">
            Contexts come from the brainstorm Context dimension. Picking one
            replaces your current selection.
          </p>
          <div className="flex flex-col gap-2 rounded-lg bg-card p-2">
            {contextGroups.map((group) => {
              const open = openGroupId === group.id
              const selectedInGroup = group.items.some(
                (i) => selectedTitle === i.label
              )
              return (
                <Collapsible
                  key={group.id}
                  open={open}
                  onOpenChange={(next) =>
                    setOpenGroupId(next ? group.id : null)
                  }
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-2 rounded-md px-2 py-2 text-left hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-base font-medium">
                          {group.label}
                        </span>
                        {selectedInGroup && (
                          <span className="text-base bg-primary/15 text-primary rounded-full px-2 py-0.5">
                            Selected
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          open && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-1">
                    <ul
                      role="radiogroup"
                      aria-label={group.label}
                      className="flex flex-col gap-1 pl-2"
                    >
                      {group.items.map((item) => {
                        const isSelected = selectedTitle === item.label
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              onClick={() =>
                                onSelect(isSelected ? null : item.label)
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
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
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
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddOpen(false)
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
