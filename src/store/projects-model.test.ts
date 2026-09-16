import { describe, it, expect, beforeEach } from "vitest"
import { createStore, type AppStore } from "./index"
import { defaultProjectName } from "./projects-model"
import { selectCanvasDraft } from "./canvas-drafts-model"
import { selectReflectProject } from "./reflect-sessions-model"
import { selectResearchProject } from "./research-sessions-model"
import { selectComparisonWeights } from "./solution-comparison-model"
import { DEFAULT_METRIC_WEIGHTS } from "@/lib/solution-comparison"
import { loadResearchCapture, saveResearchCapture } from "@/lib/research-capture"

/**
 * Integration tests for projects: every problem belongs to exactly one, the
 * project a problem is identified for takes it, and deleting a project takes
 * its problem, solutions and drafts with it.
 */
describe("projects model", () => {
  let store: AppStore

  beforeEach(() => {
    localStorage.clear()
    store = createStore()
    store.dispatch.projects.init()
    store.dispatch.reflectSessions.init()
    store.dispatch.researchSessions.init()
    store.dispatch.canvasDrafts.init()
    store.dispatch.solutionComparison.init()
  })

  it("hydrates as an empty, loaded list", () => {
    const state = store.getState().projects
    expect(state.hydrated).toBe(true)
    expect(state.projects).toEqual([])
  })

  it("create names and numbers the new project", async () => {
    const project = await store.dispatch.projects.create({ name: "  Rainy commutes  " })
    expect(project.name).toBe("Rainy commutes")
    expect(project.problemId).toBeNull()
    const unnamed = await store.dispatch.projects.create({ name: "" })
    expect(unnamed.name).toBe(`Project ${unnamed.id}`)
  })

  it("a problem identified for a project lands in that project", async () => {
    const other = await store.dispatch.projects.create({ name: "Other" })
    const project = await store.dispatch.projects.create({ name: "Mine" })
    const problem = await store.dispatch.problems.create({ source: "identify", title: "Late trains", projectId: project.id })
    const list = store.getState().projects.projects
    expect(list.find((p) => p.id === project.id)?.problemId).toBe(problem.id)
    expect(list.find((p) => p.id === other.id)?.problemId).toBeNull()
  })

  it("a problem created without a project, or for a full one, gets a project of its own", async () => {
    const project = await store.dispatch.projects.create({ name: "Mine" })
    await store.dispatch.problems.create({ source: "manual", title: "First", projectId: project.id })
    const second = await store.dispatch.problems.create({ source: "manual", title: "Second", projectId: project.id })
    const imported = await store.dispatch.problems.create({ source: "manual", title: "Imported" })
    const list = store.getState().projects.projects
    expect(list).toHaveLength(3)
    expect(list.find((p) => p.problemId === second.id)?.name).toBe("Second")
    expect(list.find((p) => p.problemId === imported.id)?.name).toBe("Imported")
  })

  it("ensureForProblems gives problems saved before projects existed a project each", async () => {
    const a = await store.dispatch.problems.create({ source: "identify", title: "A" })
    const b = await store.dispatch.problems.create({ source: "identify", title: "" })
    // Simulate a store hydrated with problems but no projects.
    store.dispatch.projects.setAll({ projects: [], nextId: 1 })
    store.dispatch.projects.ensureForProblems()
    const list = store.getState().projects.projects
    expect(list.map((p) => p.problemId).sort()).toEqual([a.id, b.id].sort())
    expect(list.find((p) => p.problemId === a.id)?.name).toBe("A")
    expect(list.find((p) => p.problemId === b.id)?.name).toBe("Project 2")
    store.dispatch.projects.ensureForProblems()
    expect(store.getState().projects.projects).toHaveLength(2)
  })

  it("deleting a problem leaves its project empty", async () => {
    const project = await store.dispatch.projects.create({ name: "Mine" })
    const problem = await store.dispatch.problems.create({ source: "manual", title: "Gone soon", projectId: project.id })
    store.dispatch.problems.delete(problem.id)
    const list = store.getState().projects.projects
    expect(list).toHaveLength(1)
    expect(list[0].problemId).toBeNull()
  })

  it("deleting a project removes its problem, solutions and drafts", async () => {
    const project = await store.dispatch.projects.create({ name: "Mine" })
    const problem = await store.dispatch.problems.create({ source: "manual", title: "P", projectId: project.id })
    await store.dispatch.solutions.create({ problemId: problem.id, title: "S1" })
    await store.dispatch.solutions.create({ problemId: problem.id, title: "S2" })
    await store.dispatch.solutionWorkspaces.ensureForProblem(problem.id)
    saveResearchCapture(problem.id, { methodId: "m", toolId: null, capturedAt: "2026-09-16T00:00:00.000Z", prompts: [] })
    const other = await store.dispatch.projects.create({ name: "Other" })
    const otherProblem = await store.dispatch.problems.create({ source: "manual", title: "Other", projectId: other.id })
    await store.dispatch.solutions.create({ problemId: otherProblem.id, title: "Keep" })
    await store.dispatch.solutionWorkspaces.ensureForProblem(otherProblem.id)
    store.dispatch.canvasDrafts.update({ projectId: project.id, patch: { title: "draft" } })
    store.dispatch.reflectSessions.ensureSession({ projectId: project.id, lensId: "life", sessionId: "s", promptIds: ["p"] })
    store.dispatch.researchSessions.ensureSession({ projectId: project.id, methodId: "m", sessionId: "s", promptIds: ["p"] })
    store.dispatch.solutionComparison.updateWeight({ projectId: project.id, key: "cost", value: 0 })

    store.dispatch.projects.delete(project.id)

    const state = store.getState()
    expect(state.projects.projects.map((p) => p.id)).toEqual([other.id])
    expect(state.problems.problems.map((p) => p.id)).toEqual([otherProblem.id])
    expect(state.solutions.solutions.map((s) => s.title)).toEqual(["Keep"])
    expect(state.solutionWorkspaces.workspaces.map((w) => w.problemId)).toEqual([otherProblem.id])
    expect(loadResearchCapture(problem.id)).toBeNull()
    expect(selectCanvasDraft(state, project.id).title).toBe("")
    expect(selectReflectProject(state, project.id).sessions).toEqual({})
    expect(selectResearchProject(state, project.id).sessions).toEqual({})
    expect(selectComparisonWeights(state, project.id)).toEqual(DEFAULT_METRIC_WEIGHTS)
  })

  it("update renames a project", async () => {
    const a = await store.dispatch.projects.create({ name: "A" })
    const b = await store.dispatch.projects.create({ name: "B" })
    store.dispatch.projects.update({ id: a.id, patch: { name: "A renamed" } })
    const state = store.getState().projects
    expect(state.projects.find((p) => p.id === a.id)?.name).toBe("A renamed")
    expect(state.projects.find((p) => p.id === b.id)?.name).toBe("B")
  })

  it("persists to localStorage and reloads", async () => {
    await store.dispatch.projects.create({ name: "Saved" })
    const fresh = createStore()
    fresh.dispatch.projects.init()
    expect(fresh.getState().projects.projects.map((p) => p.name)).toEqual(["Saved"])
    expect(fresh.getState().projects.hydrated).toBe(true)
  })
})

describe("defaultProjectName", () => {
  it("uses the problem title when there is one, else a numbered name", () => {
    expect(defaultProjectName("  Late trains ", 4)).toBe("Late trains")
    expect(defaultProjectName("   ", 4)).toBe("Project 4")
  })
})
