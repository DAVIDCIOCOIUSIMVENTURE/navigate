export type DimensionColumn = {
  id: string
  title: string
  items: DimensionItem[]
}

export type DimensionItem = {
  id: string
  label: string
  children?: DimensionItem[]
}

export { dimensionColumns } from "@/data/dimensionData"
