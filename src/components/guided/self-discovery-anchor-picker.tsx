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
import { SELF_DISCOVERY_CATEGORIES } from "@/data/selfDiscoveryData"
import { getSelfDiscoveryCategoryIcon } from "@/config/navigation"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditSelfDiscoveryItemsDialog } from "@/components/reflect/edit-self-discovery-items-dialog"

type Props = {
  selectedId: string | null
  onSelect: (id: string | null, label: string | null) => void
  /** The self-discovery question a new entry is saved under. */
  addToQuestionUrl: string
  addPlaceholder: string
  addDialogOpen: boolean
  onAddDialogOpenChange: (open: boolean) => void
  editDialogOpen: boolean
  onEditDialogOpenChange: (open: boolean) => void
}

type Group = { id: string; label: string; categoryUrl: string; items: { id: string; label: string }[] }

/** Every self-discovery question, in catalogue order, with the category it belongs to. */
const QUESTIONS = SELF_DISCOVERY_CATEGORIES.flatMap((category) =>
  category.questions.map((question) => ({ url: question.url, title: question.title, categoryUrl: category.url })),
)

/**
 * Single-select picker over everything the user has saved in Self Discovery,
 * grouped by the question it answered, for the You anchor of a Guided
 * discovery run. Unlike the lenses' pickers it is not tied to one question:
 * the run may be about an experience, a job, a hobby or a skill, and the
 * branch decides which question a new entry is saved under.
 */
export function SelfDiscoveryAnchorPicker({
  selectedId,
  onSelect,
  addToQuestionUrl,
  addPlaceholder,
  addDialogOpen,
  onAddDialogOpenChange,
  editDialogOpen,
  onEditDialogOpenChange,
}: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  const [draft, setDraft] = useState("")
  const [openGroupId, setOpenGroupId] = useState<string | null>(addToQuestionUrl)

  const groups = useMemo<Group[]>(() => {
    return QUESTIONS.map((question) => ({
      id: question.url,
      label: question.title,
      categoryUrl: question.categoryUrl,
      items: items
        .filter((item) => item.questionUrl === question.url)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((item) => ({ id: item.id, label: item.title })),
    })).filter((group) => group.items.length > 0 || group.id === addToQuestionUrl)
  }, [items, addToQuestionUrl])

  const addTo = QUESTIONS.find((q) => q.url === addToQuestionUrl)

  function handleAdd() {
    const title = draft.trim()
    if (!title) return
    // Something already saved is picked rather than duplicated.
    const lower = title.toLowerCase()
    const existing = items.find((i) => i.title.trim().toLowerCase() === lower)
    if (existing) {
      onSelect(existing.id, existing.title)
    } else {
      const id = generateSelfDiscoveryItemId()
      dispatch.selfDiscoveryItems.addItem({ id, title, questionUrl: addToQuestionUrl })
      onSelect(id, title)
    }
    setDraft("")
    onAddDialogOpenChange(false)
  }

  return (
    <div role="radiogroup" aria-label="Pick one entry from your self-discovery" className="flex flex-col gap-2">
      <div className="flex flex-col rounded-lg bg-card p-2">
        {groups.map((group) => {
          const open = openGroupId === group.id
          const selectedInGroup = group.items.some((i) => selectedId === i.id)
          const GroupIcon = getSelfDiscoveryCategoryIcon(group.categoryUrl) ?? Compass
          return (
            <Collapsible key={group.id} open={open} onOpenChange={(next) => setOpenGroupId(next ? group.id : null)}>
              <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-1 py-1.5 rounded-md transition-colors bg-quaternary/10 hover:bg-quaternary/15">
                {open ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-quaternary" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-quaternary" />
                )}
                <GroupIcon className="h-4 w-4 shrink-0 text-quaternary" aria-hidden="true" />
                <span className="text-sm font-semibold tracking-wide select-none flex-1 text-left text-quaternary">{group.label}</span>
                {selectedInGroup && <span className="text-sm text-secondary-brand font-medium">Selected</span>}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul role="group" aria-label={group.label} className="ml-7 flex flex-col gap-1 pb-1">
                  {group.items.length === 0 ? (
                    <li className="text-sm px-2 py-1.5">
                      Nothing saved yet. Use &ldquo;Add your own&rdquo; or{" "}
                      <Link
                        href={`/self-discovery/discover/${group.categoryUrl}/${group.id}`}
                        className="text-quaternary font-medium underline underline-offset-2 hover:text-quaternary/80"
                      >
                        visit Self-Discovery
                      </Link>{" "}
                      to fill this in.
                    </li>
                  ) : (
                    group.items.map((item) => {
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
                    })
                  )}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      <Dialog open={addDialogOpen} onOpenChange={onAddDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add your own</DialogTitle>
            <DialogDescription>
              {addTo
                ? <>Anything you add is also saved to your self-discovery under &ldquo;{addTo.title}&rdquo;.</>
                : "Anything you add is also saved to your self-discovery."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <label htmlFor="self-discovery-anchor-new" className="text-base font-medium">
              Entry
            </label>
            <Input
              id="self-discovery-anchor-new"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAdd()
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
            <Button type="button" onClick={handleAdd} disabled={draft.trim().length === 0} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditSelfDiscoveryItemsDialog
        open={editDialogOpen}
        onOpenChange={onEditDialogOpenChange}
        title="Edit your self-discovery entries"
        description="Rename or remove what you have saved to your self-discovery."
        questionUrls={QUESTIONS.map((q) => q.url)}
      />
    </div>
  )
}
