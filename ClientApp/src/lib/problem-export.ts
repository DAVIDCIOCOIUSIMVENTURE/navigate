import type { AppDispatch, RootState } from "@/store"
import type { Problem } from "@/store/problems-model"
import type { Solution, SolutionWorkspace } from "@/types/solution"
import type { CustomDimensionItem } from "@/store/custom-dimension-items-model"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import { generateSelfDiscoveryItemId } from "@/store/self-discovery-items-model"

export const BUNDLE_FORMAT = "navigate-problem-bundle"
export const BUNDLE_VERSION = 2

export type ProblemExportBundle = {
  format: typeof BUNDLE_FORMAT
  version: number
  exportedAt: string
  // v2: the problem may be null when only solutions are being exported.
  problem: Problem | null
  solutions: Solution[]
  workspace: SolutionWorkspace | null
  customDimensionItems: {
    customers: CustomDimensionItem[]
    contexts: CustomDimensionItem[]
    problems: CustomDimensionItem[]
  }
  selfDiscoveryItems: SelfDiscoveryItem[]
}

// User-created dimension and self-discovery ids always carry "-user-" in the
// slug (see generateCustomItemId / generateSelfDiscoveryItemId). Built-in slugs
// from dimensionData.ts never do.
function isUserId(id: string): boolean {
  return id.includes("-user-")
}

function pickCustomItems(
  state: RootState,
  column: "customers" | "contexts" | "problems",
  ids: string[]
): CustomDimensionItem[] {
  const source = state.customDimensionItems.byColumn[column] ?? []
  return ids
    .filter(isUserId)
    .map((id) => source.find((item) => item.id === id))
    .filter((item): item is CustomDimensionItem => Boolean(item))
}

function pickSelfDiscovery(state: RootState, ids: string[]): SelfDiscoveryItem[] {
  return ids
    .filter(isUserId)
    .map((id) => state.selfDiscoveryItems.items.find((item) => item.id === id))
    .filter((item): item is SelfDiscoveryItem => Boolean(item))
}

function emptyCatalogs() {
  return {
    customDimensionItems: { customers: [], contexts: [], problems: [] },
    selfDiscoveryItems: [] as SelfDiscoveryItem[],
  }
}

export type ProblemBundleOptions = { includeSolutions: boolean }
export type SolutionBundleOptions = { includeProblem: boolean }

export function buildProblemBundle(
  state: RootState,
  problemId: number,
  options: ProblemBundleOptions = { includeSolutions: true }
): ProblemExportBundle | null {
  const problem = state.problems.problems.find((p) => p.id === problemId)
  if (!problem) return null

  const solutions = options.includeSolutions
    ? state.solutions.solutions.filter((s) => s.problemId === problemId)
    : []
  const workspace = state.solutionWorkspaces.workspaces.find((w) => w.problemId === problemId) ?? null

  return {
    format: BUNDLE_FORMAT,
    version: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    problem,
    solutions,
    workspace,
    customDimensionItems: {
      customers: pickCustomItems(state, "customers", problem.customers),
      contexts: pickCustomItems(state, "contexts", problem.contexts),
      problems: pickCustomItems(state, "problems", problem.problems),
    },
    selfDiscoveryItems: pickSelfDiscovery(state, problem.you),
  }
}

export function buildSolutionBundle(
  state: RootState,
  solutionId: number,
  options: SolutionBundleOptions = { includeProblem: true }
): ProblemExportBundle | null {
  const solution = state.solutions.solutions.find((s) => s.id === solutionId)
  if (!solution) return null

  const problem = options.includeProblem
    ? state.problems.problems.find((p) => p.id === solution.problemId) ?? null
    : null
  // Workspace is only meaningful when the problem ships with the bundle.
  const workspace = problem
    ? state.solutionWorkspaces.workspaces.find((w) => w.problemId === problem.id) ?? null
    : null

  const catalogs = problem
    ? {
        customDimensionItems: {
          customers: pickCustomItems(state, "customers", problem.customers),
          contexts: pickCustomItems(state, "contexts", problem.contexts),
          problems: pickCustomItems(state, "problems", problem.problems),
        },
        selfDiscoveryItems: pickSelfDiscovery(state, problem.you),
      }
    : emptyCatalogs()

  return {
    format: BUNDLE_FORMAT,
    version: BUNDLE_VERSION,
    exportedAt: new Date().toISOString(),
    problem,
    solutions: [solution],
    workspace,
    ...catalogs,
  }
}

export type DuplicateProblemOptions = { includeSolutions: boolean }
export type DuplicateProblemResult = {
  problemId: number
  solutionCount: number
}

/**
 * Clone a problem into a new one. Dimension and self-discovery ids point to
 * shared catalogs, so they are copied as-is. The workspace (refinement state)
 * is always duplicated so the new problem stands on its own. Solutions are
 * copied only when the caller asks.
 */
export async function duplicateProblem(
  state: RootState,
  dispatch: AppDispatch,
  problemId: number,
  options: DuplicateProblemOptions
): Promise<DuplicateProblemResult | null> {
  const original = state.problems.problems.find((p) => p.id === problemId)
  if (!original) return null

  const titleSuffix = " (copy)"
  const newProblem = (await dispatch.problems.create({
    source: original.source,
    title: original.title ? `${original.title}${titleSuffix}` : "Untitled problem (copy)",
    description: original.description,
    customers: [...original.customers],
    contexts: [...original.contexts],
    problems: [...original.problems],
    you: [...original.you],
    existingSolutions: original.existingSolutions.map((s) => ({ ...s })),
    jobsToBeDone: original.jobsToBeDone,
    validationAssessment: original.validationAssessment,
    validationStatus: original.validationStatus,
    contextWhen: original.contextWhen,
    segmentSize: original.segmentSize,
    customerDescription: original.customerDescription,
    reflection: original.reflection,
  })) as unknown as Problem
  if (!newProblem?.id) return null

  const originalWorkspace = state.solutionWorkspaces.workspaces.find((w) => w.problemId === problemId) ?? null
  let newWorkspaceId: number | null = null
  if (originalWorkspace) {
    const workspace = (await dispatch.solutionWorkspaces.ensureForProblem(newProblem.id)) as unknown as SolutionWorkspace
    newWorkspaceId = workspace.id
    await dispatch.solutionWorkspaces.update({
      id: workspace.id,
      patch: {
        analysisToolType: originalWorkspace.analysisToolType,
        discoveryToolType: originalWorkspace.discoveryToolType,
        rootCauses: originalWorkspace.rootCauses,
        fiveWhyChains: originalWorkspace.fiveWhyChains,
        affectedGroups: originalWorkspace.affectedGroups,
        rootCauseNotes: originalWorkspace.rootCauseNotes,
        reverseIdeation: originalWorkspace.reverseIdeation,
        reverseInversion: originalWorkspace.reverseInversion,
        analogyDomain: originalWorkspace.analogyDomain,
        analogyInsight: originalWorkspace.analogyInsight,
        improvementResponses: originalWorkspace.improvementResponses,
        scamperIdeas: originalWorkspace.scamperIdeas,
      },
    })
  }

  let solutionCount = 0
  if (options.includeSolutions) {
    const linked = state.solutions.solutions.filter((s) => s.problemId === problemId)
    for (const s of linked) {
      const created = (await dispatch.solutions.create({
        problemId: newProblem.id,
        workspaceId: newWorkspaceId,
        title: s.title,
        description: s.description,
        inspirationSource: s.inspirationSource,
        inspirationDetail: s.inspirationDetail,
        analogyDomain: s.analogyDomain,
        analogyInsight: s.analogyInsight,
        scamperIdeas: s.scamperIdeas,
        improveIdeas: s.improveIdeas,
        reverseWorseIdeas: s.reverseWorseIdeas,
        reverseInversions: s.reverseInversions,
      })) as unknown as Solution
      if (created?.id) {
        await dispatch.solutions.update({
          id: created.id,
          patch: {
            feasibility: s.feasibility,
            impact: s.impact,
            cost: s.cost,
            timeToImplement: s.timeToImplement,
            validationStatus: s.validationStatus,
          },
        })
        solutionCount++
      }
    }
  }

  return { problemId: newProblem.id, solutionCount }
}

export function downloadProblemBundle(bundle: ProblemExportBundle) {
  const json = JSON.stringify(bundle, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${suggestBundleSlug(bundle)}.navigate.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function suggestBundleSlug(bundle: ProblemExportBundle): string {
  const source = bundle.problem?.title
    || bundle.solutions[0]?.title
    || (bundle.problem ? `problem-${bundle.problem.id}` : "solution")
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  return slug || "navigate-bundle"
}

export class BundleParseError extends Error {}

export function parseProblemBundle(raw: string): ProblemExportBundle {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new BundleParseError("File is not valid JSON.")
  }
  if (!parsed || typeof parsed !== "object") {
    throw new BundleParseError("Bundle is not an object.")
  }
  const obj = parsed as Record<string, unknown>
  if (obj.format !== BUNDLE_FORMAT) {
    throw new BundleParseError("Not a Navigate bundle.")
  }
  if (typeof obj.version !== "number" || obj.version < 1 || obj.version > BUNDLE_VERSION) {
    throw new BundleParseError(`Unsupported bundle version: ${String(obj.version)}.`)
  }
  // v1 always had a problem; v2 allows null and adds the solo-solution case.
  if (obj.version === 1 && (!obj.problem || typeof obj.problem !== "object")) {
    throw new BundleParseError("Bundle is missing a problem.")
  }
  const bundle = parsed as ProblemExportBundle
  const hasProblem = Boolean(bundle.problem)
  const hasSolutions = Array.isArray(bundle.solutions) && bundle.solutions.length > 0
  if (!hasProblem && !hasSolutions) {
    throw new BundleParseError("Bundle has neither a problem nor any solutions.")
  }
  return bundle
}

export type ImportResult = {
  problemId: number
  solutionCount: number
  // True when the bundle had no problem and we created a placeholder to host
  // the imported solutions.
  placeholderCreated: boolean
}

export async function importProblemBundle(
  bundle: ProblemExportBundle,
  dispatch: AppDispatch
): Promise<ImportResult> {
  // 1. Mint new custom-dimension ids for each user-created item in the bundle
  //    and record the old -> new mapping per column.
  const customIdMap: Record<"customers" | "contexts" | "problems", Record<string, string>> = {
    customers: {},
    contexts: {},
    problems: {},
  }
  for (const column of ["customers", "contexts", "problems"] as const) {
    const items = bundle.customDimensionItems?.[column] ?? []
    for (const item of items) {
      const created = (await dispatch.customDimensionItems.create({
        columnId: column,
        label: item.label,
      })) as unknown as CustomDimensionItem
      if (created?.id) customIdMap[column][item.id] = created.id
    }
  }

  // 2. Mint new self-discovery ids. addItem accepts an optional id, so we
  //    generate one ourselves to avoid a separate lookup-the-new-id round trip.
  const selfDiscoveryMap: Record<string, string> = {}
  for (const item of bundle.selfDiscoveryItems ?? []) {
    const newId = generateSelfDiscoveryItemId()
    dispatch.selfDiscoveryItems.addItem({
      id: newId,
      title: item.title,
      questionUrl: item.questionUrl,
      suggestionId: item.suggestionId,
    })
    selfDiscoveryMap[item.id] = newId
  }

  // 3. Remap dimension ids on the problem. Built-in slugs pass through; user
  //    ids resolve via the maps. An unmapped user id means the bundle was
  //    missing that catalog entry, so drop it rather than carry a dead ref.
  const remapColumn = (column: "customers" | "contexts" | "problems", ids: string[]): string[] =>
    ids
      .map((id) => (isUserId(id) ? customIdMap[column][id] : id))
      .filter((id): id is string => Boolean(id))
  const remapYou = (ids: string[]): string[] =>
    ids
      .map((id) => (isUserId(id) ? selfDiscoveryMap[id] : id))
      .filter((id): id is string => Boolean(id))

  // 4. Create the problem - either from the bundle, or as a placeholder when
  //    the bundle was solo-solutions only.
  const p = bundle.problem
  let newProblem: Problem
  let placeholderCreated = false
  if (p) {
    newProblem = (await dispatch.problems.create({
      source: p.source,
      title: p.title,
      description: p.description,
      customers: remapColumn("customers", p.customers ?? []),
      contexts: remapColumn("contexts", p.contexts ?? []),
      problems: remapColumn("problems", p.problems ?? []),
      you: remapYou(p.you ?? []),
      existingSolutions: p.existingSolutions,
      jobsToBeDone: p.jobsToBeDone,
      validationAssessment: p.validationAssessment,
      validationStatus: p.validationStatus,
      contextWhen: p.contextWhen,
      segmentSize: p.segmentSize,
      customerDescription: p.customerDescription,
      reflection: p.reflection,
    })) as unknown as Problem
  } else {
    placeholderCreated = true
    const firstSolutionTitle = bundle.solutions[0]?.title?.trim()
    newProblem = (await dispatch.problems.create({
      source: "manual",
      title: firstSolutionTitle
        ? `Imported solution: ${firstSolutionTitle}`
        : "Imported solution",
      description: "Placeholder problem created for an imported solution that had no problem attached.",
    })) as unknown as Problem
  }
  if (!newProblem?.id) {
    throw new Error("Failed to create imported problem.")
  }
  const newProblemId = newProblem.id

  // 5. Workspace: ensure-for-problem mints a fresh empty one, then update it
  //    with the bundle's refinement state.
  let newWorkspaceId: number | null = null
  if (bundle.workspace) {
    const workspace = (await dispatch.solutionWorkspaces.ensureForProblem(newProblemId)) as unknown as SolutionWorkspace
    newWorkspaceId = workspace.id
    const w = bundle.workspace
    await dispatch.solutionWorkspaces.update({
      id: workspace.id,
      patch: {
        analysisToolType: w.analysisToolType,
        discoveryToolType: w.discoveryToolType,
        rootCauses: w.rootCauses,
        fiveWhyChains: w.fiveWhyChains,
        affectedGroups: w.affectedGroups,
        rootCauseNotes: w.rootCauseNotes,
        reverseIdeation: w.reverseIdeation,
        reverseInversion: w.reverseInversion,
        analogyDomain: w.analogyDomain,
        analogyInsight: w.analogyInsight,
        improvementResponses: w.improvementResponses,
        scamperIdeas: w.scamperIdeas,
      },
    })
  }

  // 6. Solutions: create assigns a new id and defaults the scoring fields;
  //    follow up with update to restore feasibility/impact/cost/time/status.
  for (const s of bundle.solutions ?? []) {
    const created = (await dispatch.solutions.create({
      problemId: newProblemId,
      workspaceId: newWorkspaceId,
      title: s.title,
      description: s.description,
      inspirationSource: s.inspirationSource,
      inspirationDetail: s.inspirationDetail,
      analogyDomain: s.analogyDomain,
      analogyInsight: s.analogyInsight,
      scamperIdeas: s.scamperIdeas,
      improveIdeas: s.improveIdeas,
      reverseWorseIdeas: s.reverseWorseIdeas,
      reverseInversions: s.reverseInversions,
    })) as unknown as Solution
    if (created?.id) {
      await dispatch.solutions.update({
        id: created.id,
        patch: {
          feasibility: s.feasibility,
          impact: s.impact,
          cost: s.cost,
          timeToImplement: s.timeToImplement,
          validationStatus: s.validationStatus,
        },
      })
    }
  }

  return {
    problemId: newProblemId,
    solutionCount: (bundle.solutions ?? []).length,
    placeholderCreated,
  }
}
