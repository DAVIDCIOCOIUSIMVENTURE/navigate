import { createModel } from "@rematch/core"
import type { RootModel } from "."

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
    async load(journalId: string) {
      dispatch.journal.setLoading(true)
      try {
        const res = await fetch(`/journalEntry?id=${journalId}`)
        const data = await res.json()
        if (data && data.length > 0) {
          dispatch.journal.setEntry({ title: data[0].title ?? "", text: data[0].text ?? "" })
        } else {
          dispatch.journal.setEntry({ title: "", text: "" })
        }
      } finally {
        dispatch.journal.setLoading(false)
      }
    },
    async save(payload: { journalId: string; title: string; text: string; userId: string }) {
      dispatch.journal.setLoading(true)
      try {
        await fetch(`/journalEntry/${payload.journalId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: payload.journalId,
            title: payload.title,
            text: payload.text,
            userId: payload.userId,
          }),
        })
      } finally {
        dispatch.journal.setLoading(false)
      }
    },
  }),
})
