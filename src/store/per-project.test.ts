import { describe, it, expect, beforeEach } from "vitest"
import { createStore, type AppStore } from "./index"
import { forProject, parsePerProject, perProjectReducers, withProject, withoutProject } from "./per-project"
import { EMPTY_CANVAS_DRAFT, selectCanvasDraft } from "./canvas-drafts-model"
import { EMPTY_REFLECT_PROJECT, selectReflectProject } from "./reflect-sessions-model"
import { EMPTY_RESEARCH_PROJECT, selectResearchProject } from "./research-sessions-model"
import { selectComparisonWeights } from "./solution-comparison-model"
import { DEFAULT_METRIC_WEIGHTS } from "@/lib/solution-comparison"

describe("per-project helpers", () => {
  it("reads the empty slice for an unknown project and replaces or removes a slice", () => {
    const map = withProject({}, 3, { n: 1 })
    expect(forProject(map, 3, { n: 0 })).toEqual({ n: 1 })
    expect(forProject(map, 4, { n: 0 })).toEqual({ n: 0 })
    expect(withoutProject(map, 3)).toEqual({})
  })

  it("parses only numeric keys with valid slices", () => {
    const parsed = parsePerProject({ "1": "a", x: "b", "2": null, "1e3": "c", "": "d" }, (raw) =>
      typeof raw === "string" ? raw : null,
    )
    expect(parsed).toEqual({ 1: "a" })
  })

  it("update and clear skip the write when nothing changes", () => {
    const saved: unknown[] = []
    const { update, clear } = perProjectReducers({ n: 0 }, (byProject) => saved.push(byProject))
    const state = { byProject: {}, hydrated: true }

    expect(clear(state, 1)).toBe(state)
    expect(update(state, { projectId: 1 }, (slice) => slice)).toBe(state)
    expect(saved).toHaveLength(0)

    const changed = update(state, { projectId: 1 }, () => ({ n: 2 }))
    expect(changed.byProject).toEqual({ 1: { n: 2 } })
    expect(clear(changed, 1).byProject).toEqual({})
    expect(saved).toHaveLength(2)
  })
})

/** The drafts and preferences of one project never show in another. */
describe("state keyed by project", () => {
  let store: AppStore

  beforeEach(() => {
    localStorage.clear()
    store = createStore()
    store.dispatch.reflectSessions.init()
    store.dispatch.researchSessions.init()
    store.dispatch.canvasDrafts.init()
    store.dispatch.solutionComparison.init()
  })

  it("keeps Reflect drafts apart", () => {
    store.dispatch.reflectSessions.ensureSession({ projectId: 1, lensId: "life", sessionId: "s1", promptIds: ["p"] })
    store.dispatch.reflectSessions.setAnswerText({ projectId: 1, lensId: "life", promptId: "p", index: 0, text: "mine" })
    store.dispatch.reflectSessions.setLastPosition({ projectId: 1, lensId: "life", step: "prompts", promptIndex: 0 })
    const one = selectReflectProject(store.getState(), 1)
    expect(one.sessions.life.answers.p[0].text).toBe("mine")
    expect(one.lastPickedLensId).toBe("life")
    expect(selectReflectProject(store.getState(), 2)).toEqual(EMPTY_REFLECT_PROJECT)
    store.dispatch.reflectSessions.clearProject(1)
    expect(selectReflectProject(store.getState(), 1)).toEqual(EMPTY_REFLECT_PROJECT)
  })

  it("seeds a fresh Reflect session from saved answers", () => {
    store.dispatch.reflectSessions.ensureSession({
      projectId: 1,
      lensId: "life",
      sessionId: "s1",
      promptIds: ["p", "q"],
      seedAnswers: { p: [{ text: "seeded", context: {} }] },
    })
    const answers = selectReflectProject(store.getState(), 1).sessions.life.answers
    expect(answers.p[0].text).toBe("seeded")
    expect(answers.q[0].text).toBe("")
  })

  it("keeps Research drafts apart and seeds the tool", () => {
    store.dispatch.researchSessions.ensureSession({
      projectId: 1,
      methodId: "m",
      sessionId: "s1",
      promptIds: ["p"],
      seedAnswers: { p: [{ text: "found" }] },
      seedToolId: "tool-a",
    })
    const one = selectResearchProject(store.getState(), 1)
    expect(one.sessions.m.toolId).toBe("tool-a")
    expect(one.sessions.m.answers.p[0].text).toBe("found")
    expect(selectResearchProject(store.getState(), 2)).toEqual(EMPTY_RESEARCH_PROJECT)
  })

  it("keeps Canvas Builder drafts apart", () => {
    store.dispatch.canvasDrafts.update({ projectId: 1, patch: { selected: ["a"], title: "T" } })
    expect(selectCanvasDraft(store.getState(), 1)).toEqual({ ...EMPTY_CANVAS_DRAFT, selected: ["a"], title: "T" })
    expect(selectCanvasDraft(store.getState(), 2)).toEqual(EMPTY_CANVAS_DRAFT)
    store.dispatch.canvasDrafts.clearProject(1)
    expect(selectCanvasDraft(store.getState(), 1)).toEqual(EMPTY_CANVAS_DRAFT)
  })

  it("keeps comparison weights apart and persists them", () => {
    store.dispatch.solutionComparison.updateWeight({ projectId: 1, key: "cost", value: 0 })
    expect(selectComparisonWeights(store.getState(), 1).cost).toBe(0)
    expect(selectComparisonWeights(store.getState(), 2)).toEqual(DEFAULT_METRIC_WEIGHTS)
    const fresh = createStore()
    fresh.dispatch.solutionComparison.init()
    expect(selectComparisonWeights(fresh.getState(), 1).cost).toBe(0)
  })

  it("drops drafts saved before projects existed", () => {
    localStorage.setItem("navigate-reflect-sessions", JSON.stringify({ sessions: { life: { sessionId: "s" } } }))
    localStorage.setItem("navigate-canvas-drafts", JSON.stringify({ selected: ["a"], title: "T" }))
    localStorage.setItem("navigate-solution-comparison", JSON.stringify({ weights: { cost: 0 } }))
    const fresh = createStore()
    fresh.dispatch.reflectSessions.init()
    fresh.dispatch.canvasDrafts.init()
    fresh.dispatch.solutionComparison.init()
    expect(fresh.getState().reflectSessions.byProject).toEqual({})
    expect(fresh.getState().canvasDrafts.byProject).toEqual({})
    expect(fresh.getState().solutionComparison.byProject).toEqual({})
  })

  it("ignores a stored slice whose fields are the wrong shape", () => {
    localStorage.setItem(
      "navigate-reflect-sessions",
      JSON.stringify({ byProject: { 1: { sessions: "nope", lastStep: "elsewhere", lastPromptIndex: "two" } } }),
    )
    const fresh = createStore()
    fresh.dispatch.reflectSessions.init()
    expect(selectReflectProject(fresh.getState(), 1)).toEqual(EMPTY_REFLECT_PROJECT)
  })
})
