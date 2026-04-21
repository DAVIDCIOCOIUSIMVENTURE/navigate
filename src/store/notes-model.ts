import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-notes"

export type Note = {
  id: number
  title: string
  text: string
  createdAt: string
  editedAt: string
}

export type NotePatch = Partial<Pick<Note, "title" | "text">>

interface NotesState {
  notes: Note[]
  nextId: number
}

const defaultState: NotesState = {
  notes: [],
  nextId: 1,
}

function saveToStorage(state: NotesState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): NotesState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as NotesState
  } catch {
    return null
  }
}

export const notes = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addNote(state, note: Note) {
      return { ...state, notes: [...state.notes, note], nextId: state.nextId + 1 }
    },

    removeNote(state, id: number) {
      return { ...state, notes: state.notes.filter((n) => n.id !== id) }
    },

    updateNote(state, { id, patch }: { id: number; patch: NotePatch & { editedAt: string } }) {
      return {
        ...state,
        notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      }
    },

    setAll(_, loaded: NotesState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.notes.setAll(stored)
      }
    },

    create(_: void, rootState): Note {
      const state = rootState.notes
      const now = new Date().toISOString()
      const newNote: Note = {
        id: state.nextId,
        title: "",
        text: "",
        createdAt: now,
        editedAt: now,
      }
      dispatch.notes.addNote(newNote)
      saveToStorage({
        notes: [...state.notes, newNote],
        nextId: state.nextId + 1,
      })
      return newNote
    },

    update({ id, patch }: { id: number; patch: NotePatch }, rootState) {
      const editedAt = new Date().toISOString()
      dispatch.notes.updateNote({ id, patch: { ...patch, editedAt } })
      const updated = rootState.notes.notes.map((n) =>
        n.id === id ? { ...n, ...patch, editedAt } : n
      )
      saveToStorage({ notes: updated, nextId: rootState.notes.nextId })
    },

    delete(id: number, rootState) {
      dispatch.notes.removeNote(id)
      const remaining = rootState.notes.notes.filter((n) => n.id !== id)
      saveToStorage({ notes: remaining, nextId: rootState.notes.nextId })
    },
  }),
})
