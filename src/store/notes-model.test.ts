import { describe, it, expect } from 'vitest'
import { notes, notesForProject, parseStoredNotes, type Note } from './notes-model'

const reducers = notes.reducers
const initialState = notes.state

const sampleNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  title: "",
  text: "",
  projectId: null,
  createdAt: "2026-04-21T00:00:00.000Z",
  editedAt: "2026-04-21T00:00:00.000Z",
  ...overrides,
})

describe('notes model reducers', () => {
  it('has correct initial state', () => {
    expect(initialState).toEqual({ notes: [], nextId: 1 })
  })

  it('addNote appends and increments nextId', () => {
    const note = sampleNote()
    const newState = reducers.addNote(initialState, note)
    expect(newState.notes).toEqual([note])
    expect(newState.nextId).toBe(2)
    expect(initialState.notes).toEqual([])
  })

  it('removeNote drops the matching id', () => {
    const state = { notes: [sampleNote({ id: 1 }), sampleNote({ id: 2 })], nextId: 3 }
    const newState = reducers.removeNote(state, 1)
    expect(newState.notes).toEqual([sampleNote({ id: 2 })])
  })

  it('updateNote merges patch into the matching note', () => {
    const state = { notes: [sampleNote({ id: 1, title: "old" })], nextId: 2 }
    const patch = { title: "new", editedAt: "2026-04-22T00:00:00.000Z" }
    const newState = reducers.updateNote(state, { id: 1, patch })
    expect(newState.notes[0].title).toBe("new")
    expect(newState.notes[0].editedAt).toBe("2026-04-22T00:00:00.000Z")
  })

  it('updateNote can link a note to a project and unlink it again', () => {
    const state = { notes: [sampleNote({ id: 1 })], nextId: 2 }
    const linked = reducers.updateNote(state, { id: 1, patch: { projectId: 7, editedAt: "2026-04-22T00:00:00.000Z" } })
    expect(linked.notes[0].projectId).toBe(7)
    const unlinked = reducers.updateNote(linked, { id: 1, patch: { projectId: null, editedAt: "2026-04-23T00:00:00.000Z" } })
    expect(unlinked.notes[0].projectId).toBeNull()
  })

  it('unlinkNotesFromProject keeps the notes and clears only that project link', () => {
    const state = {
      notes: [sampleNote({ id: 1, projectId: 7 }), sampleNote({ id: 2, projectId: 8 }), sampleNote({ id: 3 })],
      nextId: 4,
    }
    const newState = reducers.unlinkNotesFromProject(state, 7)
    expect(newState.notes.map((n) => n.id)).toEqual([1, 2, 3])
    expect(newState.notes.map((n) => n.projectId)).toEqual([null, 8, null])
  })

  it('setAll replaces the entire state', () => {
    const loaded = { notes: [sampleNote({ id: 5 })], nextId: 6 }
    const newState = reducers.setAll(initialState, loaded)
    expect(newState).toEqual(loaded)
  })

  it('reducers return a new object reference (no mutation)', () => {
    const newState = reducers.addNote(initialState, sampleNote())
    expect(newState).not.toBe(initialState)
  })
})

describe('notesForProject', () => {
  it('returns only the notes linked to that project', () => {
    const list = [sampleNote({ id: 1, projectId: 7 }), sampleNote({ id: 2 }), sampleNote({ id: 3, projectId: 7 })]
    expect(notesForProject(list, 7).map((n) => n.id)).toEqual([1, 3])
    expect(notesForProject(list, 9)).toEqual([])
  })
})

describe('parseStoredNotes', () => {
  it('reads notes saved before links existed as unlinked', () => {
    const stored = parseStoredNotes({
      notes: [{ id: 1, title: "t", text: "x", createdAt: "2026-04-21T00:00:00.000Z", editedAt: "2026-04-21T00:00:00.000Z" }],
      nextId: 2,
    })
    expect(stored?.notes).toEqual([sampleNote({ id: 1, title: "t", text: "x" })])
    expect(stored?.nextId).toBe(2)
  })

  it('keeps a numeric project link and drops anything else', () => {
    const stored = parseStoredNotes({
      notes: [
        { id: 1, projectId: 7 },
        { id: 2, projectId: "7" },
        { id: 3, projectId: null },
      ],
      nextId: 4,
    })
    expect(stored?.notes.map((n) => n.projectId)).toEqual([7, null, null])
  })

  it('drops entries that are not notes and never reuses a stored id', () => {
    const stored = parseStoredNotes({ notes: [null, "note", { title: "no id" }, { id: 9 }], nextId: 2 })
    expect(stored?.notes.map((n) => n.id)).toEqual([9])
    expect(stored?.nextId).toBe(10)
  })

  it('rejects anything that is not an object', () => {
    expect(parseStoredNotes(null)).toBeNull()
    expect(parseStoredNotes("notes")).toBeNull()
  })
})
