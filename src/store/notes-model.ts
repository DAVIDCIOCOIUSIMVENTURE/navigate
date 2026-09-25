import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-notes"

/**
 * What a journal note is about. Every note is scoped to one area of the app:
 * Self Discovery, a project's problem, or one of a project's solutions. A note
 * about nothing in particular is a general note, which is also where a note
 * lands when the project it was about is deleted.
 */
export type NoteLink =
  | { kind: "none" }
  | { kind: "self-discovery" }
  | { kind: "problem"; projectId: number }
  | { kind: "solution"; projectId: number; solutionId: number }

export const GENERAL_LINK: NoteLink = { kind: "none" }
export const SELF_DISCOVERY_LINK: NoteLink = { kind: "self-discovery" }

/**
 * A journal note. The journal is one list across the whole app, so every note
 * is always visible; `link` says which area it was written about so the
 * journal can be narrowed to it.
 */
export type Note = {
  id: number
  title: string
  text: string
  link: NoteLink
  createdAt: string
  editedAt: string
}

export type NotePatch = Partial<Pick<Note, "title" | "text" | "link">>

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

function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

/** A stored link, or null when the value is not one we recognise. */
export function parseNoteLink(value: unknown): NoteLink | null {
  if (typeof value !== "object" || value === null) return null
  const { kind, projectId, solutionId } = value as { kind?: unknown; projectId?: unknown; solutionId?: unknown }
  if (kind === "none") return GENERAL_LINK
  if (kind === "self-discovery") return SELF_DISCOVERY_LINK
  if (kind === "problem" && isId(projectId)) return { kind, projectId }
  if (kind === "solution" && isId(projectId) && isId(solutionId)) return { kind, projectId, solutionId }
  return null
}

/**
 * Read what is stored without trusting it: a note saved before links existed
 * comes back general, one saved when a link was just a project id comes back
 * linked to that project's problem, and anything that is not a note is
 * dropped rather than rendered.
 */
export function parseStoredNotes(value: unknown): NotesState | null {
  if (typeof value !== "object" || value === null) return null
  const parsed = value as Partial<NotesState>
  const notes = (Array.isArray(parsed.notes) ? parsed.notes : []).flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return []
    const { id, title, text, link, projectId, createdAt, editedAt } = entry as Partial<Note> & {
      projectId?: unknown
    }
    if (!isId(id)) return []
    const legacyLink: NoteLink = isId(projectId) ? { kind: "problem", projectId } : GENERAL_LINK
    const note: Note = {
      id,
      title: typeof title === "string" ? title : "",
      text: typeof text === "string" ? text : "",
      link: parseNoteLink(link) ?? legacyLink,
      createdAt: typeof createdAt === "string" ? createdAt : "",
      editedAt: typeof editedAt === "string" ? editedAt : "",
    }
    return [note]
  })
  // Never mint an id a stored note already holds, whatever `nextId` says.
  const afterLast = notes.reduce((max, n) => Math.max(max, n.id), 0) + 1
  const nextId = isId(parsed.nextId) ? parsed.nextId : 1
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

/** Whether a note was written about `projectId`: its problem or any of its solutions. */
export function isNoteInProject(note: Note, projectId: number): boolean {
  return (note.link.kind === "problem" || note.link.kind === "solution") && note.link.projectId === projectId
}

/** The notes about one project (its problem or its solutions), in the order they are stored. */
export function notesForProject(notes: readonly Note[], projectId: number): Note[] {
  return notes.filter((n) => isNoteInProject(n, projectId))
}

/** Every note about `projectId` made general; the notes themselves stay. */
function unlinkedFrom(notes: readonly Note[], projectId: number): Note[] {
  return notes.map((n) => (isNoteInProject(n, projectId) ? { ...n, link: GENERAL_LINK } : n))
}

/** Every note about `solutionId` moved to its project's problem; the notes themselves stay. */
function unlinkedFromSolution(notes: readonly Note[], solutionId: number): Note[] {
  return notes.map((n) =>
    n.link.kind === "solution" && n.link.solutionId === solutionId
      ? { ...n, link: { kind: "problem", projectId: n.link.projectId } }
      : n,
  )
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

    unlinkNotesFromSolution(state, solutionId: number) {
      return { ...state, notes: unlinkedFromSolution(state.notes, solutionId) }
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

    /** A blank note about `link`: the area the user is in when they write it, or general. */
    create(payload: { link: NoteLink }, rootState): Note {
      const state = rootState.notes
      const now = new Date().toISOString()
      const newNote: Note = {
        id: state.nextId,
        title: "",
        text: "",
        link: payload.link,
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

    /** Called when a solution is deleted: its notes move up to the project's problem. */
    unlinkSolution(solutionId: number, rootState) {
      dispatch.notes.unlinkNotesFromSolution(solutionId)
      saveToStorage({ notes: unlinkedFromSolution(rootState.notes.notes, solutionId), nextId: rootState.notes.nextId })
    },
  }),
})
