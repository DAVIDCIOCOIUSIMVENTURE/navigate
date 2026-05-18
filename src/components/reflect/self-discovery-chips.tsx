"use client"

import { useMemo } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { filterItemsByCategory } from "@/lib/reflect-recommendations"
import { Plus } from "lucide-react"

export function SelfDiscoveryChips({
  category,
  onPick,
}: {
  /** Self-discovery category url, e.g. "knowledge" or "personal-interests". */
  category: string
  /** Called with the chip's title when the user clicks it. */
  onPick: (title: string) => void
}) {
  const items = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  const filtered = useMemo(
    () => filterItemsByCategory(items, category),
    [items, category]
  )

  if (filtered.length === 0) return null

  return (
    <div className="rounded-lg border bg-card p-4 flex flex-col gap-3">
      <div>
        <p className="text-base font-semibold">From your self-discovery</p>
        <p className="text-base">
          Pick one as a starting point. You can edit it after.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onPick(it.title)}
            className="inline-flex items-start gap-1.5 rounded-md border bg-card px-3 py-1.5 text-base leading-snug text-left hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{it.title}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
