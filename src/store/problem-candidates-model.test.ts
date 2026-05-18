import { describe, it, expect } from "vitest"
import { problemCandidates, type ProblemCandidate } from "./problem-candidates-model"

const reducers = problemCandidates.reducers
const initialState = problemCandidates.state

const sampleCandidate = (overrides: Partial<ProblemCandidate> = {}): ProblemCandidate => ({
  id: "candidate-aaaaaaaa",
  title: "Approvals take forever",
  lensId: "work",
  promptId: "time-consuming",
  sessionId: "session-1",
  context: {},
  createdAt: "2026-05-18T10:00:00.000Z",
  editedAt: "2026-05-18T10:00:00.000Z",
  ...overrides,
})

describe("problemCandidates model reducers", () => {
  it("has the correct initial state", () => {
    expect(initialState).toEqual({ items: [], hydrated: false })
  })

  it("addItems appends to the list", () => {
    const c1 = sampleCandidate({ id: "candidate-aaaaaaaa" })
    const c2 = sampleCandidate({ id: "candidate-bbbbbbbb", title: "Another" })
    const after = reducers.addItems(initialState, [c1, c2])
    expect(after.items).toEqual([c1, c2])
  })

  it("addItems is additive when state already has items", () => {
    const c1 = sampleCandidate({ id: "candidate-aaaaaaaa" })
    const c2 = sampleCandidate({ id: "candidate-bbbbbbbb", title: "Another" })
    const start = { items: [c1], hydrated: true }
    const after = reducers.addItems(start, [c2])
    expect(after.items).toEqual([c1, c2])
  })

  it("replaceItem swaps the matching id", () => {
    const c1 = sampleCandidate({ id: "candidate-aaaaaaaa", title: "Old" })
    const c2 = sampleCandidate({ id: "candidate-bbbbbbbb" })
    const start = { items: [c1, c2], hydrated: true }
    const updated = { ...c1, title: "New" }
    const after = reducers.replaceItem(start, updated)
    expect(after.items[0].title).toBe("New")
    expect(after.items[1]).toBe(c2)
  })

  it("removeItem drops the matching id", () => {
    const c1 = sampleCandidate({ id: "candidate-aaaaaaaa" })
    const c2 = sampleCandidate({ id: "candidate-bbbbbbbb" })
    const start = { items: [c1, c2], hydrated: true }
    const after = reducers.removeItem(start, "candidate-aaaaaaaa")
    expect(after.items).toEqual([c2])
  })

  it("setItems replaces the list and marks hydrated", () => {
    const c1 = sampleCandidate()
    const after = reducers.setItems(initialState, [c1])
    expect(after.items).toEqual([c1])
    expect(after.hydrated).toBe(true)
  })

  it("markHydrated flips the flag without touching items", () => {
    const start = { items: [sampleCandidate()], hydrated: false }
    const after = reducers.markHydrated(start)
    expect(after.hydrated).toBe(true)
    expect(after.items).toEqual(start.items)
  })

  it("reducers return a new object reference (no mutation)", () => {
    const after = reducers.addItems(initialState, [sampleCandidate()])
    expect(after).not.toBe(initialState)
    expect(after.items).not.toBe(initialState.items)
  })
})
