import { useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { brainstormColumns } from "@/data/brainstormData"
import type { BrainstormItem } from "@/app/(app)/problems/brainstorm/data"
import type { RootState, AppDispatch } from "@/store"
import { generateCustomItemId, type CustomBrainstormItem } from "@/store/custom-brainstorm-items-model"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"

export const DELETED_ITEM_LABEL = "(deleted item)"

/**
 * Walk a tree of brainstorm items (groups + leaves) looking for a given id.
 * Returns the matching node or null.
 */
export function findInTree(items: BrainstormItem[], id: string): BrainstormItem | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const child = findInTree(item.children, id)
      if (child) return child
    }
  }
  return null
}

/**
 * Find a built-in item id by exact label match within a column.
 * Used by resolveOrCreate when the user free-types a value that matches a built-in.
 */
export function findBuiltInIdByLabel(columnId: string, label: string): string | null {
  const column = brainstormColumns.find((c) => c.id === columnId)
  if (!column) return null
  const trimmed = label.trim().toLowerCase()
  function walk(items: BrainstormItem[]): string | null {
    for (const item of items) {
      if (item.label.trim().toLowerCase() === trimmed) return item.id
      if (item.children) {
        const found = walk(item.children)
        if (found) return found
      }
    }
    return null
  }
  return walk(column.items)
}

/**
 * Resolve a saved dimension id to its display label.
 * 1. Built-in catalog (brainstormData.ts)
 * 2. User-added custom catalog (customBrainstormItems)
 * 3. Self-discovery items (only for the "you" column)
 * 4. Falls back to "(deleted item)".
 */
export function resolveDimensionLabel(
  columnId: string,
  id: string,
  customByColumn: Record<string, CustomBrainstormItem[]>,
  selfDiscoveryItems: SelfDiscoveryItem[]
): string {
  // 1. Built-in tree
  const column = brainstormColumns.find((c) => c.id === columnId)
  if (column) {
    const found = findInTree(column.items, id)
    if (found) return found.label
  }
  // 2. User catalog
  const custom = customByColumn[columnId]?.find((i) => i.id === id)
  if (custom) return custom.label
  // 3. Self-discovery items (only "you" references these)
  if (columnId === "you") {
    const item = selfDiscoveryItems.find((i) => i.id === id)
    if (item) return item.title
  }
  return DELETED_ITEM_LABEL
}

/**
 * React hook variant of resolveDimensionLabel. Subscribes to the relevant Redux
 * slices and re-resolves on change.
 */
export function useDimensionLabel(columnId: string, id: string): string {
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)
  const items = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  return useMemo(
    () => resolveDimensionLabel(columnId, id, customByColumn, items),
    [columnId, id, customByColumn, items]
  )
}

/**
 * Resolve a list of ids to labels in one go.
 */
export function useDimensionLabels(columnId: string, ids: string[]): string[] {
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)
  const items = useSelector((s: RootState) => s.selfDiscoveryItems.items)
  return useMemo(
    () => ids.map((id) => resolveDimensionLabel(columnId, id, customByColumn, items)),
    [columnId, ids, customByColumn, items]
  )
}

/**
 * Take a free-typed token and return the right id for it:
 *   1. Already a known id → return it.
 *   2. Matches a built-in label → return its built-in id.
 *   3. Matches an existing custom item label → return that id.
 *   4. Otherwise mint a new custom item and return its id.
 *
 * Note: this dispatches in case 4. Only call from event handlers, never from render.
 */
export function useResolveOrCreate() {
  const customByColumn = useSelector((s: RootState) => s.customBrainstormItems.byColumn)
  const dispatch = useDispatch<AppDispatch>()

  return (columnId: string, token: string): string => {
    const trimmed = token.trim()
    if (!trimmed) return ""

    // Fast path: already an id?
    if (isKnownId(columnId, trimmed, customByColumn)) return trimmed

    // Built-in match by label?
    const builtIn = findBuiltInIdByLabel(columnId, trimmed)
    if (builtIn) return builtIn

    // Existing custom item match?
    const lower = trimmed.toLowerCase()
    const existing = customByColumn[columnId]?.find(
      (i) => i.label.trim().toLowerCase() === lower
    )
    if (existing) return existing.id

    // Mint a new custom item synchronously. We dispatch the addItem reducer
    // (sync, returns void) rather than the create effect (which would wrap the
    // value in a Promise).
    const item: CustomBrainstormItem = {
      id: generateCustomItemId(columnId),
      label: trimmed,
      createdAt: new Date().toISOString(),
    }
    dispatch.customBrainstormItems.addItem({ columnId, item })
    return item.id
  }
}

function isKnownId(
  columnId: string,
  token: string,
  customByColumn: Record<string, CustomBrainstormItem[]>
): boolean {
  if (columnId === "you") return token.startsWith("you-user-")
  const column = brainstormColumns.find((c) => c.id === columnId)
  if (column && findInTree(column.items, token)) return true
  if (customByColumn[columnId]?.some((i) => i.id === token)) return true
  return false
}
