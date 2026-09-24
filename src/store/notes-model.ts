import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-notes"

/**
 * A journal note. The journal is one list across the whole app, so every note
 * is always visible; `projectId` optionally links a note to a project (and so
 * to its problem) so the journal can be narrowed to what was written about it.
 * A note linked to nothing is a general note.
 */
export type Note = {
  id: number
  title: string
  text: string
  projectId: number | null
  createdAt: string
  editedAt: string
}

export type NotePatch = Partial<Pick<Note, "title" | "text" | "projectId">>

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

/**
 * Read what is stored without trusting it: a note saved before links existed
 * has no `projectId` and comes back unlinked, and anything that is not a note
 * is dropped rather than rendered.
 */
export function parseStoredNotes(value: unknown): NotesState | null {
  if (typeof value !== "object" || value === null) return null
  const parsed = value as Partial<NotesState>
  const notes = (Array.isArray(parsed.notes) ? parsed.notes : []).flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return []
    const { id, title, text, projectId, createdAt, editedAt } = entry as Partial<Note>
    if (typeof id !== "number" || !Number.isFinite(id)) return []
    const note: Note = {
      id,
      title: typeof title === "string" ? title : "",
      text: typeof text === "string" ? text : "",
      projectId: typeof projectId === "number" && Number.isFinite(projectId) ? projectId : null,
      createdAt: typeof createdAt === "string" ? createdAt : "",
      editedAt: typeof editedAt === "string" ? editedAt : "",
    }
    return [note]
  })
  // Never mint an id a stored note already holds, whatever `nextId` says.
  const afterLast = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1
  const nextId = typeof parsed.nextId === "number" && Number.isFinite(parsed.nextId) ? parsed.nextId : 1
  return { notes, nextId: Math.max(nextId, afterLast) }
}

function loadFromStorage(): NotesState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseStoredNotes(JSON.parse(raw))
  } catch {
    return null
  }
}

/** The notes linked to one project, in the order they are stored. */
export function notesForProject(notes: readonly Note[], projectId: number): Note[] {
  return notes.filter((n) => n.projectId === projectId)
}

/** Every note with its link to `projectId` removed; the notes themselves stay. */
function unlinkedFrom(notes: readonly Note[], projectId: number): Note[] {
  return notes.map((n) => (n.projectId === projectId ? { ...n, projectId: null } : n))
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

    unlinkNotesFromProject(state, projectId: number) {
      return { ...state, notes: unlinkedFrom(state.notes, projectId) }
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

    /** A blank note, linked to `projectId` when written from inside a project. */
    create(payload: { projectId: number | null }, rootState): Note {
      const state = rootState.notes
      const now = new Date().toISOString()
      const newNote: Note = {
        id: state.nextId,
        title: "",
        text: "",
        projectId: payload.projectId,
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

    /**
     * Called when a project is deleted. The journal is the user's own record,
     * so its notes are kept and only lose their link; they read as general
     * notes from then on.
     */
    unlinkProject(projectId: number, rootState) {
      dispatch.notes.unlinkNotesFromProject(projectId)
      saveToStorage({ notes: unlinkedFrom(rootState.notes.notes, projectId), nextId: rootState.notes.nextId })
    },
  }),
})
