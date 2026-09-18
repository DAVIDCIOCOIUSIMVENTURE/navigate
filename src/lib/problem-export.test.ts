import { createStore, type AppStore } from "@/store"
import {
  BUNDLE_VERSION,
  BundleParseError,
  buildProjectBundle,
  importProblemBundle,
  importSummary,
  parseProblemBundle,
} from "./problem-export"
import { selectCanvasDraft } from "@/store/canvas-drafts-model"
import { selectReflectProject } from "@/store/reflect-sessions-model"
import { selectResearchProject } from "@/store/research-sessions-model"
import { selectComparisonWeights } from "@/store/solution-comparison-model"
import { loadResearchCapture, saveResearchCapture } from "@/lib/research-capture"
import type { Problem } from "@/store/problems-model"
import type { Project } from "@/store/projects-model"
import type { Solution } from "@/types/solution"

/**
 * A project bundle has to survive the round trip: export it, import it into a
 * store that has never seen it, and the new project must hold the same work
 * under entirely new ids.
 */

function freshStore(): AppStore {
  localStorage.clear()
  const store = createStore()
  store.dispatch.projects.init()
  store.dispatch.problems.init()
  store.dispatch.solutions.init()
  store.dispatch.solutionWorkspaces.init()
  store.dispatch.customDimensionItems.init()
  store.dispatch.selfDiscoveryItems.init()
  store.dispatch.reflectSessions.init()
  store.dispatch.researchSessions.init()
  store.dispatch.canvasDrafts.init()
  store.dispatch.solutionComparison.init()
  return store
}

/** Build a project with something in every corner of it. */
async function seedProject(store: AppStore) {
  const project = (await store.dispatch.projects.create({
    name: "Rainy commutes",
    members: [{ id: "member-1", name: "Jane Okonkwo", email: "jane@example.com" }],
    visibility: "public",
  })) as unknown as Project

  const custom = (await store.dispatch.customDimensionItems.create({
    columnId: "customers",
    label: "Bike commuters",
  })) as unknown as { id: string }

  const selfDiscoveryId = "you-user-abcd1234"
  store.dispatch.selfDiscoveryItems.addItem({
    id: selfDiscoveryId,
    title: "I cycle to work every day",
    questionUrl: "personal-interests/what-do-you-enjoy",
  })

  const problem = (await store.dispatch.problems.create({
    projectId: project.id,
    source: "identify",
    title: "Cyclists arrive soaked",
    description: "Nowhere to dry wet kit at the office.",
    customers: [custom.id, "customer-teenagers"],
    contexts: [],
    problems: [],
    you: [selfDiscoveryId],
    existingSolutions: [{ id: 1, text: "Waterproofs", shortcomings: [{ id: 1, text: "Still sweaty" }] }],
    validationStatus: "valid",
    contextWhen: "Rainy weekday mornings.",
    segmentSize: 120000,
    customerDescription: "People who cycle three days a week.",
  })) as unknown as Problem

  const workspace = (await store.dispatch.solutionWorkspaces.ensureForProblem(problem.id)) as unknown as { id: number }
  await store.dispatch.solutionWorkspaces.update({
    id: workspace.id,
    patch: { rootCauseNotes: "No drying space anywhere on the route." },
  })

  const solution = (await store.dispatch.solutions.create({
    problemId: problem.id,
    workspaceId: workspace.id,
    title: "Heated drying lockers",
    description: "Ventilated lockers at cycle parking.",
    inspirationSource: "analogy",
    inspirationDetail: "Ski resort drying rooms.",
  })) as unknown as Solution
  await store.dispatch.solutions.update({
    id: solution.id,
    patch: { feasibility: 3, impact: 4, cost: 4, timeToImplement: 3, validationStatus: "valid", trafficLight: "green" },
  })

  saveResearchCapture(problem.id, {
    methodId: "interviews",
    toolId: "mom-test",
    capturedAt: "2026-09-15T00:00:00.000Z",
    prompts: [],
  })
  store.dispatch.canvasDrafts.update({ projectId: project.id, patch: { title: "A draft title" } })
  store.dispatch.reflectSessions.ensureSession({
    projectId: project.id,
    lensId: "life",
    sessionId: "session-1",
    promptIds: ["p1"],
  })
  store.dispatch.reflectSessions.setAnswerText({
    projectId: project.id,
    lensId: "life",
    promptId: "p1",
    index: 0,
    text: "Something I noticed",
  })
  store.dispatch.researchSessions.ensureSession({
    projectId: project.id,
    methodId: "interviews",
    sessionId: "session-2",
    promptIds: ["q1"],
  })
  store.dispatch.solutionComparison.setWeights({
    projectId: project.id,
    weights: { feasibility: 3, impact: 3, cost: 1, timeToImplement: 0 },
  })

  return { project, problem, solution, customId: custom.id, selfDiscoveryId }
}

describe("project bundle round trip", () => {
  it("exports the whole project and imports it as a new one", async () => {
    const source = freshStore()
    const seeded = await seedProject(source)

    const bundle = buildProjectBundle(source.getState(), seeded.project.id)
    expect(bundle).not.toBeNull()
    expect(bundle!.version).toBe(BUNDLE_VERSION)
    expect(bundle!.project?.name).toBe("Rainy commutes")

    // Re-parse through JSON so the test exercises what is actually written to disk.
    const parsed = parseProblemBundle(JSON.stringify(bundle))

    const target = freshStore()
    const result = await importProblemBundle(parsed, target.dispatch)

    const state = target.getState()
    const project = state.projects.projects.find((p) => p.id === result.projectId)
    expect(project).toBeDefined()
    expect(project!.name).toBe("Rainy commutes")
    expect(project!.members).toEqual([{ id: "member-1", name: "Jane Okonkwo", email: "jane@example.com" }])

    const problem = state.problems.problems.find((p) => p.id === result.problemId)
    expect(problem).toBeDefined()
    expect(problem!.title).toBe("Cyclists arrive soaked")
    expect(problem!.validationStatus).toBe("valid")
    expect(problem!.segmentSize).toBe(120000)
    expect(problem!.existingSolutions[0].shortcomings[0].text).toBe("Still sweaty")
    // The project owns the imported problem.
    expect(project!.problemId).toBe(problem!.id)

    const solutions = state.solutions.solutions.filter((s) => s.problemId === problem!.id)
    expect(solutions).toHaveLength(1)
    expect(solutions[0].title).toBe("Heated drying lockers")
    expect(solutions[0].trafficLight).toBe("green")
    expect(solutions[0].impact).toBe(4)
    expect(solutions[0].inspirationDetail).toBe("Ski resort drying rooms.")

    const workspace = state.solutionWorkspaces.workspaces.find((w) => w.problemId === problem!.id)
    expect(workspace?.rootCauseNotes).toBe("No drying space anywhere on the route.")

    expect(loadResearchCapture(problem!.id)?.methodId).toBe("interviews")
    expect(selectCanvasDraft(state, project!.id).title).toBe("A draft title")
    expect(selectReflectProject(state, project!.id).sessions.life?.answers.p1?.[0]?.text).toBe("Something I noticed")
    expect(selectResearchProject(state, project!.id).sessions.interviews).toBeDefined()
    expect(selectComparisonWeights(state, project!.id)).toEqual({
      feasibility: 3,
      impact: 3,
      cost: 1,
      timeToImplement: 0,
    })
  })

  it("mints new ids for everything, including the user's own catalogue entries", async () => {
    const source = freshStore()
    const seeded = await seedProject(source)
    const bundle = buildProjectBundle(source.getState(), seeded.project.id)!

    // Import into the SAME store: the copy must not collide with the original.
    const result = await importProblemBundle(parseProblemBundle(JSON.stringify(bundle)), source.dispatch)

    expect(result.projectId).not.toBe(seeded.project.id)
    expect(result.problemId).not.toBe(seeded.problem.id)

    const state = source.getState()
    expect(state.projects.projects).toHaveLength(2)
    // The copy is numbered so the two can be told apart in the projects list.
    expect(state.projects.projects.map((p) => p.name)).toEqual(["Rainy commutes", "Rainy commutes (2)"])
    expect(state.problems.problems).toHaveLength(2)

    const imported = state.problems.problems.find((p) => p.id === result.problemId)!
    const importedSolution = state.solutions.solutions.find((s) => s.problemId === imported.id)!
    expect(importedSolution.id).not.toBe(seeded.solution.id)

    // The custom dimension item was copied, not shared, so the two problems
    // point at different catalogue entries with the same label.
    const customIds = imported.customers.filter((id) => id.includes("-user-"))
    expect(customIds).toHaveLength(1)
    expect(customIds[0]).not.toBe(seeded.customId)
    const catalogue = state.customDimensionItems.byColumn.customers
    expect(catalogue.find((item) => item.id === customIds[0])?.label).toBe("Bike commuters")
    // The built-in id passes through untouched.
    expect(imported.customers).toContain("customer-teenagers")

    const youIds = imported.you
    expect(youIds).toHaveLength(1)
    expect(youIds[0]).not.toBe(seeded.selfDiscoveryId)
    expect(state.selfDiscoveryItems.items.find((i) => i.id === youIds[0])?.title).toBe("I cycle to work every day")
  })

  it("does not carry the original's public sharing over to the copy", async () => {
    const source = freshStore()
    const seeded = await seedProject(source)
    const bundle = buildProjectBundle(source.getState(), seeded.project.id)!
    expect(bundle.project?.visibility).toBe("public")

    const target = freshStore()
    const result = await importProblemBundle(parseProblemBundle(JSON.stringify(bundle)), target.dispatch)
    const project = target.getState().projects.projects.find((p) => p.id === result.projectId)
    expect(project?.visibility).toBe("private")
  })

  it("exports and imports a project that has no problem yet", async () => {
    const source = freshStore()
    const project = (await source.dispatch.projects.create({ name: "Empty so far" })) as unknown as Project
    const bundle = buildProjectBundle(source.getState(), project.id)!
    expect(bundle.problem).toBeNull()

    const target = freshStore()
    const result = await importProblemBundle(parseProblemBundle(JSON.stringify(bundle)), target.dispatch)
    expect(result.problemId).toBeNull()
    expect(result.solutionCount).toBe(0)
    const imported = target.getState().projects.projects.find((p) => p.id === result.projectId)
    expect(imported?.name).toBe("Empty so far")
    expect(imported?.problemId).toBeNull()
    expect(importSummary(result)).toContain("no problem yet")
  })

  it("returns null for a project that does not exist", () => {
    const store = freshStore()
    expect(buildProjectBundle(store.getState(), 999)).toBeNull()
  })

  it("still imports an older bundle that knows nothing about projects", async () => {
    const source = freshStore()
    const seeded = await seedProject(source)
    const bundle = buildProjectBundle(source.getState(), seeded.project.id)!
    // A v2 file: no project, no research capture.
    const legacy = { ...bundle, version: 2, project: undefined, researchCapture: undefined }

    const target = freshStore()
    const result = await importProblemBundle(parseProblemBundle(JSON.stringify(legacy)), target.dispatch)
    const state = target.getState()
    const project = state.projects.projects.find((p) => p.id === result.projectId)
    // With no project in the file, the new one is named after the problem.
    expect(project?.name).toBe("Cyclists arrive soaked")
    expect(project?.problemId).toBe(result.problemId)
    expect(state.solutions.solutions).toHaveLength(1)
  })

  it("rejects a file that is not a Navigate bundle", () => {
    expect(() => parseProblemBundle("not json")).toThrow(BundleParseError)
    expect(() => parseProblemBundle(JSON.stringify({ format: "something-else" }))).toThrow(BundleParseError)
    expect(() =>
      parseProblemBundle(JSON.stringify({ format: "navigate-problem-bundle", version: 99 })),
    ).toThrow(BundleParseError)
  })
})
