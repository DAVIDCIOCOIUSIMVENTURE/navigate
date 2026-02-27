import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-journal"

interface JournalState {
  title: string
  text: string
  open: boolean
  loading: boolean
}

export const journal = createModel<RootModel>()({
  state: {
    title: "",
    text: "",
    open: false,
    loading: false,
  } as JournalState,
  reducers: {
    setTitle(state, title: string) {
      return { ...state, title }
    },
    setText(state, text: string) {
      return { ...state, text }
    },
    setOpen(state, open: boolean) {
      return { ...state, open }
    },
    setLoading(state, loading: boolean) {
      return { ...state, loading }
    },
    setEntry(state, payload: { title: string; text: string }) {
      return { ...state, title: payload.title, text: payload.text }
    },
  },
  effects: (dispatch) => ({
    load() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const stored = JSON.parse(raw)
          dispatch.journal.setEntry({ title: stored.title ?? "", text: stored.text ?? "" })
        } else {
          dispatch.journal.setEntry({ title: "", text: "" })
        }
      } catch {
        dispatch.journal.setEntry({ title: "", text: "" })
      }
    },
    save(payload: { title: string; text: string }) {
      if (typeof window === "undefined") return
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: payload.title, text: payload.text }))
      } catch {
        // ignore storage errors
      }
    },
  }),
})
