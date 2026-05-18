import { describe, it, expect, beforeEach } from "vitest"
import { createStore, type AppStore } from "./index"

/**
 * Integration tests for the candidate -> Problem promotion flow. Uses a real
 * store so we exercise both the problemCandidates and problems models together.
 */

describe("problemCandidates promote flow", () => {
  let store: AppStore

  beforeEach(() => {
    localStorage.clear()
    store = createStore()
  })

  it("creates a blank Problem with source=reflect and links the candidate", async () => {
    const created = await store.dispatch.problemCandidates.bulkCreateForSession({
      sessionId: "session-test",
      lensId: "work",
      answers: [
        {
          promptId: "time-consuming",
          title: "Approvals take forever",
          context: { "who-else": "Procurement teams" },
        },
      ],
    })
    expect(created).toHaveLength(1)
    const candidateId = created[0].id

    const newProblemId = await store.dispatch.problemCandidates.promote(candidateId)
    expect(newProblemId).not.toBeNull()
    expect(typeof newProblemId).toBe("number")

    const state = store.getState()
    const problem = state.problems.problems.find((p) => p.id === newProblemId)
    expect(problem).toBeDefined()
    expect(problem!.source).toBe("reflect")
    expect(problem!.description).toBe("Approvals take forever")
    expect(problem!.customers).toEqual([])
    expect(problem!.contexts).toEqual([])
    expect(problem!.problems).toEqual([])
    expect(problem!.you).toEqual([])

    const candidate = state.problemCandidates.items.find((c) => c.id === candidateId)
    expect(candidate!.promotedToProblemId).toBe(newProblemId)
  })

  it("does not promote the same candidate twice", async () => {
    const [created] = await store.dispatch.problemCandidates.bulkCreateForSession({
      sessionId: "session-test",
      lensId: "work",
      answers: [{ promptId: "time-consuming", title: "T", context: {} }],
    })
    const first = await store.dispatch.problemCandidates.promote(created.id)
    const second = await store.dispatch.problemCandidates.promote(created.id)
    expect(first).not.toBeNull()
    expect(second).toBeNull()
    expect(store.getState().problems.problems).toHaveLength(1)
  })

  it("filters out empty-title answers when bulk creating", async () => {
    const created = await store.dispatch.problemCandidates.bulkCreateForSession({
      sessionId: "session-test",
      lensId: "work",
      answers: [
        { promptId: "p1", title: "Real one", context: {} },
        { promptId: "p2", title: "   ", context: {} },
        { promptId: "p3", title: "", context: {} },
      ],
    })
    expect(created).toHaveLength(1)
    expect(created[0].title).toBe("Real one")
  })

  it("dismiss + restore round-trip", async () => {
    const [c] = await store.dispatch.problemCandidates.bulkCreateForSession({
      sessionId: "s",
      lensId: "work",
      answers: [{ promptId: "p", title: "T", context: {} }],
    })
    store.dispatch.problemCandidates.dismiss(c.id)
    expect(store.getState().problemCandidates.items[0].dismissedAt).toBeDefined()
    store.dispatch.problemCandidates.restore(c.id)
    expect(store.getState().problemCandidates.items[0].dismissedAt).toBeUndefined()
  })
})
