import { describe, it, expect } from 'vitest'
import { journal } from './journal-model'

// Rematch reducers are pure functions; we can call them directly
// without setting up the full Redux store.
const reducers = journal.reducers
const initialState = journal.state

describe('journal model reducers', () => {
  it('has correct initial state', () => {
    expect(initialState).toEqual({
      title: '',
      text: '',
      open: false,
      loading: false,
    })
  })

  it('setTitle updates title without mutating state', () => {
    const newState = reducers.setTitle(initialState, 'My Journal')
    expect(newState.title).toBe('My Journal')
    expect(initialState.title).toBe('') // original unchanged
  })

  it('setText updates text without mutating state', () => {
    const newState = reducers.setText(initialState, 'Some content')
    expect(newState.text).toBe('Some content')
    expect(initialState.text).toBe('')
  })

  it('setOpen toggles open flag', () => {
    const opened = reducers.setOpen(initialState, true)
    expect(opened.open).toBe(true)
    const closed = reducers.setOpen(opened, false)
    expect(closed.open).toBe(false)
  })

  it('setLoading toggles loading flag', () => {
    const loading = reducers.setLoading(initialState, true)
    expect(loading.loading).toBe(true)
  })

  it('setEntry updates title and text together', () => {
    const newState = reducers.setEntry(initialState, { title: 'T', text: 'Body' })
    expect(newState.title).toBe('T')
    expect(newState.text).toBe('Body')
    expect(newState.open).toBe(false) // other fields untouched
  })

  it('reducers return a new object reference (no mutation)', () => {
    const newState = reducers.setTitle(initialState, 'Hello')
    expect(newState).not.toBe(initialState)
  })
})
