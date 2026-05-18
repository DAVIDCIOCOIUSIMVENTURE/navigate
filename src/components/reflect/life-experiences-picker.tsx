"use client"

import { useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const LIFE_EXPERIENCES_QUESTION_URL = "life-experiences"

type Props = {
  selectedTitle: string | null
  onSelect: (title: string | null) => void
}

/**
 * Single-select picker bound to the self-discovery
 * "What significant life experiences have shaped you?" question. The list mirrors
 * `selfDiscoveryItems` filtered by that question, and adding a new entry here writes
 * back through the same model so the two stay in sync.
 */
export function LifeExperiencesPicker({ selectedTitle, onSelect }: Props) {
  const dispatch = useDispatch<AppDispatch>()
  const items = useSelector((s: RootState) =>
    s.selfDiscoveryItems.items.filter((i) => i.questionUrl === LIFE_EXPERIENCES_QUESTION_URL)
  )
  const [draft, setDraft] = useState("")

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items]
  )

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
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="life-experience-new" className="text-base font-semibold">
          Add your own
        </label>
        <p className="text-base">
          Anything you add is also saved to your self-discovery under
          &quot;What significant life experiences have shaped you?&quot;.
        </p>
        <div className="flex gap-2">
          <Input
            id="life-experience-new"
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
          <Button
            type="button"
            onClick={handleAdd}
            disabled={draft.trim().length === 0}
            variant="secondary-brand"
            className="gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Pick one significant life experience"
        className="flex flex-col gap-2"
      >
        <p className="text-base font-semibold">From your self-discovery</p>
        {sortedItems.length === 0 ? (
          <p className="text-base">
            Nothing saved yet. Add one above or visit Self-Discovery to fill this in.
          </p>
        ) : (
          <ul className="flex flex-col gap-1 rounded-lg border bg-card p-2">
            {sortedItems.map((item) => {
              const isSelected = selectedTitle === item.title
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
                    <span className="text-base leading-snug">{item.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
