export type BrainstormColumn = {
  id: string
  title: string
  items: BrainstormItem[]
}

export type BrainstormItem = {
  id: string
  label: string
  children?: BrainstormItem[]
}

export type SavedCombination = {
  id: number
  selectedIds: string[] // all selected item ids (for restoring checkboxes)
  selections: Record<string, string[]> // column id → selected labels
  savedAt: string
}

export { brainstormColumns } from "@/data/brainstormData"
