import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { parsePerProject, perProjectReducers, type PerProject, type PerProjectState } from "./per-project"

const STORAGE_KEY = "navigate-canvas-drafts"

export type CanvasBuilderStep = "pick" | "category" | "choose" | "review"

const CANVAS_BUILDER_STEPS: readonly CanvasBuilderStep[] = ["pick", "category", "choose", "review"]

/**
 * One project's in-progress Canvas Builder work: the dimension items ticked
 * on the canvas (shared with the Builder mode, which walks the same
 * selection step by step), the problem title being typed, and the Builder
 * mode's position. It is scratch space: it is thrown away once the problem
 * is saved, and it never shows in another project.
 */
export type CanvasDraft = {
  selected: string[]
  title: string
  step: CanvasBuilderStep
  activeColumnId: string | null
  activeCategoryId: string | null
}

export const EMPTY_CANVAS_DRAFT: CanvasDraft = {
  selected: [],
  title: "",
  step: "pick",
  activeColumnId: null,
  activeCategoryId: null,
}

type CanvasDraftsState = PerProjectState<CanvasDraft>

const defaultState: CanvasDraftsState = {
  byProject: {},
  hydrated: false,
}

/** The Canvas Builder draft of one project, empty when it has none. */
export function selectCanvasDraft(state: { canvasDrafts: CanvasDraftsState }, projectId: number): CanvasDraft {
  return state.canvasDrafts.byProject[projectId] ?? EMPTY_CANVAS_DRAFT
}

/** Whether the draft holds anything worth keeping. */
export function isCanvasDraftEmpty(draft: CanvasDraft): boolean {
  return draft.selected.length === 0 && draft.title.trim().length === 0
}

function saveToStorage(byProject: PerProject<CanvasDraft>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ byProject }))
  } catch {
    // ignore storage errors
  }
}

function parseDraft(raw: unknown): CanvasDraft | null {
  if (!raw || typeof raw !== "object") return null
  const value = raw as Partial<CanvasDraft>
  return {
    selected: Array.isArray(value.selected) ? value.selected.filter((id): id is string => typeof id === "string") : [],
    title: typeof value.title === "string" ? value.title : "",
    step: CANVAS_BUILDER_STEPS.includes(value.step as CanvasBuilderStep) ? (value.step as CanvasBuilderStep) : "pick",
    activeColumnId: typeof value.activeColumnId === "string" ? value.activeColumnId : null,
    activeCategoryId: typeof value.activeCategoryId === "string" ? value.activeCategoryId : null,
  }
}

function loadFromStorage(): PerProject<CanvasDraft> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { byProject?: unknown }
    return parsePerProject(parsed.byProject, parseDraft)
  } catch {
    return {}
  }
}

const {
  update: updateProject,
  clear: clearProjectSlice,
  restore: restoreProjectSlice,
} = perProjectReducers(EMPTY_CANVAS_DRAFT, saveToStorage)

export const canvasDrafts = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setAll(state, byProject: PerProject<CanvasDraft>): CanvasDraftsState {
      return { ...state, byProject, hydrated: true }
    },

    /** Changes part of one project's draft. */
    update(state, payload: { projectId: number; patch: Partial<CanvasDraft> }): CanvasDraftsState {
      return updateProject(state, payload, (draft, { patch }) => ({ ...draft, ...patch }))
    },

    /** Throws one project's draft away (after saving, or on Reset). */
    clearProject(state, projectId: number): CanvasDraftsState {
      return clearProjectSlice(state, projectId)
    },

    /** Puts a whole draft back under a project, for an imported bundle. */
    restoreProject(state, payload: { projectId: number; slice: CanvasDraft }): CanvasDraftsState {
      return restoreProjectSlice(state, payload.projectId, payload.slice)
    },
  },

  effects: (dispatch) => ({
    init() {
      dispatch.canvasDrafts.setAll(loadFromStorage())
    },
  }),
})
