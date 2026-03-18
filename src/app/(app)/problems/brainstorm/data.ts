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

export { brainstormColumns } from "@/data/brainstormData"
