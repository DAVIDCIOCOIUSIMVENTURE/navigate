import { describe, it, expect } from 'vitest'
import { notes, notesForProject, parseNoteLink, parseStoredNotes, type Note } from './notes-model'

const reducers = notes.reducers
const initialState = notes.state

const sampleNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  title: "",
  text: "",
  link: { kind: "none" },
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

  it('updateNote can link a note to an area and make it general again', () => {
    const state = { notes: [sampleNote({ id: 1 })], nextId: 2 }
    const linked = reducers.updateNote(state, {
      id: 1,
      patch: { link: { kind: "solution", projectId: 7, solutionId: 3 }, editedAt: "2026-04-22T00:00:00.000Z" },
    })
    expect(linked.notes[0].link).toEqual({ kind: "solution", projectId: 7, solutionId: 3 })
    const unlinked = reducers.updateNote(linked, { id: 1, patch: { link: { kind: "none" }, editedAt: "2026-04-23T00:00:00.000Z" } })
    expect(unlinked.notes[0].link).toEqual({ kind: "none" })
  })

  it('unlinkNotesFromProject keeps the notes and makes only that project\'s notes general', () => {
    const state = {
      notes: [
        sampleNote({ id: 1, link: { kind: "problem", projectId: 7 } }),
        sampleNote({ id: 2, link: { kind: "solution", projectId: 7, solutionId: 3 } }),
        sampleNote({ id: 3, link: { kind: "problem", projectId: 8 } }),
        sampleNote({ id: 4, link: { kind: "self-discovery" } }),
      ],
      nextId: 5,
    }
    const newState = reducers.unlinkNotesFromProject(state, 7)
    expect(newState.notes.map((n) => n.id)).toEqual([1, 2, 3, 4])
    expect(newState.notes.map((n) => n.link)).toEqual([
      { kind: "none" },
      { kind: "none" },
      { kind: "problem", projectId: 8 },
      { kind: "self-discovery" },
    ])
  })

  it('unlinkNotesFromSolution moves that solution\'s notes up to the project\'s problem', () => {
    const state = {
      notes: [
        sampleNote({ id: 1, link: { kind: "solution", projectId: 7, solutionId: 3 } }),
        sampleNote({ id: 2, link: { kind: "solution", projectId: 7, solutionId: 4 } }),
      ],
      nextId: 3,
    }
    const newState = reducers.unlinkNotesFromSolution(state, 3)
    expect(newState.notes.map((n) => n.link)).toEqual([
      { kind: "problem", projectId: 7 },
      { kind: "solution", projectId: 7, solutionId: 4 },
    ])
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
  it('returns the notes about that project\'s problem or solutions', () => {
    const list = [
      sampleNote({ id: 1, link: { kind: "problem", projectId: 7 } }),
      sampleNote({ id: 2 }),
      sampleNote({ id: 3, link: { kind: "solution", projectId: 7, solutionId: 1 } }),
      sampleNote({ id: 4, link: { kind: "self-discovery" } }),
    ]
    expect(notesForProject(list, 7).map((n) => n.id)).toEqual([1, 3])
    expect(notesForProject(list, 9)).toEqual([])
  })
})

describe('parseNoteLink', () => {
  it('reads every kind of link', () => {
    expect(parseNoteLink({ kind: "none" })).toEqual({ kind: "none" })
    expect(parseNoteLink({ kind: "self-discovery" })).toEqual({ kind: "self-discovery" })
    expect(parseNoteLink({ kind: "problem", projectId: 7 })).toEqual({ kind: "problem", projectId: 7 })
    expect(parseNoteLink({ kind: "solution", projectId: 7, solutionId: 2 })).toEqual({ kind: "solution", projectId: 7, solutionId: 2 })
  })

  it('rejects a link with a missing id or an unknown kind', () => {
    expect(parseNoteLink({ kind: "problem" })).toBeNull()
    expect(parseNoteLink({ kind: "solution", projectId: 7 })).toBeNull()
    expect(parseNoteLink({ kind: "portfolio", projectId: 7 })).toBeNull()
    expect(parseNoteLink("problem")).toBeNull()
  })
})

describe('parseStoredNotes', () => {
  it('reads notes saved before links existed as general', () => {
    const stored = parseStoredNotes({
      notes: [{ id: 1, title: "t", text: "x", createdAt: "2026-04-21T00:00:00.000Z", editedAt: "2026-04-21T00:00:00.000Z" }],
      nextId: 2,
    })
    expect(stored?.notes).toEqual([sampleNote({ id: 1, title: "t", text: "x" })])
    expect(stored?.nextId).toBe(2)
  })

  it('reads a note saved with a bare project id as linked to that project\'s problem', () => {
    const stored = parseStoredNotes({
      notes: [
        { id: 1, projectId: 7 },
        { id: 2, projectId: "7" },
        { id: 3, projectId: null },
      ],
      nextId: 4,
    })
    expect(stored?.notes.map((n) => n.link)).toEqual([{ kind: "problem", projectId: 7 }, { kind: "none" }, { kind: "none" }])
  })

  it('keeps a stored link and drops a link it does not recognise', () => {
    const stored = parseStoredNotes({
      notes: [
        { id: 1, link: { kind: "solution", projectId: 7, solutionId: 2 } },
        { id: 2, link: { kind: "elsewhere" } },
        { id: 3, link: { kind: "self-discovery" } },
      ],
      nextId: 4,
    })
    expect(stored?.notes.map((n) => n.link)).toEqual([
      { kind: "solution", projectId: 7, solutionId: 2 },
      { kind: "none" },
      { kind: "self-discovery" },
    ])
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
