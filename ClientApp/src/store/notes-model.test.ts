import { describe, it, expect } from 'vitest'
import { notes, type Note } from './notes-model'

const reducers = notes.reducers
const initialState = notes.state

const sampleNote = (overrides: Partial<Note> = {}): Note => ({
  id: 1,
  title: "",
  text: "",
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
