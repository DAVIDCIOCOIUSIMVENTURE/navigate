import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { ExistingSolutionItem, ValidationAssessment, ValidationStatus } from "@/types/idea"
import { DEFAULT_VALIDATION_ASSESSMENT } from "@/types/idea"
import type { CustomBrainstormItem } from "./custom-brainstorm-items-model"
import type { SelfDiscoveryItem } from "./self-discovery-items-model"
import { resolveDimensionLabel } from "@/lib/dimension-labels"

const STORAGE_KEY = "navigate-problems"

export type ProblemSource = "manual" | "brainstorm"

export type Problem = {
  id: number
  createdAt: string
  editedAt: string
  description: string
  customers: string[]
  contexts: string[]
  problems: string[]
  you: string[]
  source: ProblemSource
  existingSolutions: ExistingSolutionItem[]
  emotionalImpact: string[]
  validationAssessment: ValidationAssessment
  validationStatus: ValidationStatus
  validationReason: string
  contextWhen: string
  segmentSize: number | null
  customerDescription: string
}

export type ProblemPatch = Partial<Pick<Problem, "description" | "customers" | "contexts" | "problems" | "you" | "existingSolutions" | "emotionalImpact" | "validationAssessment" | "validationStatus" | "validationReason" | "contextWhen" | "segmentSize" | "customerDescription">>

/**
 * Build a short summary label for a Problem. Field values are ids, so the
 * resolver hands them off through the (built-in -> custom catalog -> self-
 * discovery item) lookup chain. Pass the relevant slices in to keep this
 * function pure and callable outside React.
 */
export function getProblemLabel(
  problem: Problem,
  customByColumn: Record<string, CustomBrainstormItem[]> = {},
  selfDiscoveryItems: SelfDiscoveryItem[] = []
): string {
  const resolve = (columnId: string, ids: string[]) =>
    ids.map((id) => resolveDimensionLabel(columnId, id, customByColumn, selfDiscoveryItems)).join(", ")
  return [
    resolve("customers", problem.customers),
    resolve("contexts", problem.contexts),
    resolve("problems", problem.problems),
  ].filter((s) => s.length > 0).join(" / ")
}

interface ProblemsState {
  problems: Problem[]
  nextId: number
}

const defaultState: ProblemsState = {
  problems: [],
  nextId: 1,
}

function saveToStorage(state: ProblemsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

function loadFromStorage(): ProblemsState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProblemsState
  } catch {
    return null
  }
}

export const problems = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    addProblem(state, problem: Problem) {
      return { ...state, problems: [...state.problems, problem], nextId: state.nextId + 1 }
    },

    removeProblem(state, id: number) {
      return { ...state, problems: state.problems.filter((p) => p.id !== id) }
    },

    updateProblem(state, { id, patch }: { id: number; patch: ProblemPatch & { editedAt: string } }) {
      return {
        ...state,
        problems: state.problems.map((p) => p.id === id ? { ...p, ...patch } : p),
      }
    },

    setAll(_, loaded: ProblemsState) {
      return loaded
    },
  },

  effects: (dispatch) => ({
    init() {
      const stored = loadFromStorage()
      if (stored) {
        dispatch.problems.setAll(stored)
      }
    },

    update({ id, patch }: { id: number; patch: ProblemPatch }, rootState) {
      const editedAt = new Date().toISOString()
      dispatch.problems.updateProblem({ id, patch: { ...patch, editedAt } })
      const updated = rootState.problems.problems.map((p) =>
        p.id === id ? { ...p, ...patch, editedAt } : p
      )
      saveToStorage({ problems: updated, nextId: rootState.problems.nextId })
    },

    create(
      payload: ProblemPatch & { source: ProblemSource },
      rootState
    ): Problem {
      const state = rootState.problems
      const now = new Date().toISOString()
      const newProblem: Problem = {
        id: state.nextId,
        createdAt: now,
        editedAt: now,
        description: payload.description ?? "",
        customers: payload.customers ?? [],
        contexts: payload.contexts ?? [],
        problems: payload.problems ?? [],
        you: payload.you ?? [],
        source: payload.source,
        existingSolutions: payload.existingSolutions ?? [],
        emotionalImpact: payload.emotionalImpact ?? [],
        validationAssessment: payload.validationAssessment ?? DEFAULT_VALIDATION_ASSESSMENT,
        validationStatus: payload.validationStatus ?? "unvalidated",
        validationReason: payload.validationReason ?? "",
        contextWhen: payload.contextWhen ?? "",
        segmentSize: payload.segmentSize ?? null,
        customerDescription: payload.customerDescription ?? "",
      }
      dispatch.problems.addProblem(newProblem)
      const nextState: ProblemsState = {
        problems: [...state.problems, newProblem],
        nextId: state.nextId + 1,
      }
      saveToStorage(nextState)
      return newProblem
    },

    delete(id: number, rootState) {
      dispatch.problems.removeProblem(id)
      const remaining = rootState.problems.problems.filter((p) => p.id !== id)
      saveToStorage({ problems: remaining, nextId: rootState.problems.nextId })
    },
  }),
})
