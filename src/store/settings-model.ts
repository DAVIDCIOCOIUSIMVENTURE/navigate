import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SidebarMode } from "@/components/ui/sidebar"

const STORAGE_KEY = "navigate-settings"

export type BrainstormMode = "canvas" | "builder"
export type BrainstormBuilderStep = "pick" | "category" | "choose" | "review"

interface SettingsState {
  sidebarMode: SidebarMode
  hiddenBrainstormColumns: string[]
  fullView: boolean
  brainstormSelected: string[]
  brainstormMode: BrainstormMode
  hideBrainstormGuidance: boolean
  journalOpen: boolean
  brainstormBuilderStep: BrainstormBuilderStep
  brainstormBuilderActiveColumnId: string | null
  brainstormBuilderActiveCategoryId: string | null
  brainstormBuilderDescription: string
}

const defaultState: SettingsState = {
  sidebarMode: "icon",
  hiddenBrainstormColumns: [],
  fullView: false,
  brainstormSelected: [],
  brainstormMode: "builder",
  hideBrainstormGuidance: false,
  journalOpen: false,
  brainstormBuilderStep: "pick",
  brainstormBuilderActiveColumnId: null,
  brainstormBuilderActiveCategoryId: null,
  brainstormBuilderDescription: "",
}

function saveToStorage(state: SettingsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

export const settings = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    setSidebarMode(state, sidebarMode: SidebarMode) {
      const next = { ...state, sidebarMode }
      saveToStorage(next)
      return next
    },
    setHiddenBrainstormColumns(state, hiddenBrainstormColumns: string[]) {
      const next = { ...state, hiddenBrainstormColumns }
      saveToStorage(next)
      return next
    },
    setFullView(state, fullView: boolean) {
      // Not persisted, resets on reload
      return { ...state, fullView }
    },
    setBrainstormSelected(state, brainstormSelected: string[]) {
      const next = { ...state, brainstormSelected }
      saveToStorage(next)
      return next
    },
    setBrainstormMode(state, brainstormMode: BrainstormMode) {
      const next = { ...state, brainstormMode }
      saveToStorage(next)
      return next
    },
    setHideBrainstormGuidance(state, hideBrainstormGuidance: boolean) {
      const next = { ...state, hideBrainstormGuidance }
      saveToStorage(next)
      return next
    },
    setJournalOpen(state, journalOpen: boolean) {
      const next = { ...state, journalOpen }
      saveToStorage(next)
      return next
    },
    setBrainstormBuilderStep(state, brainstormBuilderStep: BrainstormBuilderStep) {
      const next = { ...state, brainstormBuilderStep }
      saveToStorage(next)
      return next
    },
    setBrainstormBuilderActiveColumnId(state, brainstormBuilderActiveColumnId: string | null) {
      const next = { ...state, brainstormBuilderActiveColumnId }
      saveToStorage(next)
      return next
    },
    setBrainstormBuilderActiveCategoryId(state, brainstormBuilderActiveCategoryId: string | null) {
      const next = { ...state, brainstormBuilderActiveCategoryId }
      saveToStorage(next)
      return next
    },
    setBrainstormBuilderDescription(state, brainstormBuilderDescription: string) {
      const next = { ...state, brainstormBuilderDescription }
      saveToStorage(next)
      return next
    },
    resetBrainstormBuilder(state) {
      const next: SettingsState = {
        ...state,
        brainstormBuilderStep: "pick",
        brainstormBuilderActiveColumnId: null,
        brainstormBuilderActiveCategoryId: null,
        brainstormBuilderDescription: "",
        // Selections are shared between canvas and builder; reset clears both.
        brainstormSelected: [],
      }
      saveToStorage(next)
      return next
    },
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          // No saved settings: expand sidebar as default first-visit experience
          dispatch.settings.setSidebarMode("expanded")
          return
        }
        const stored: Partial<SettingsState> = JSON.parse(raw)
        if (stored.sidebarMode) {
          dispatch.settings.setSidebarMode(stored.sidebarMode)
        }
        if (stored.hiddenBrainstormColumns) {
          dispatch.settings.setHiddenBrainstormColumns(stored.hiddenBrainstormColumns)
        }
        if (stored.brainstormSelected) {
          dispatch.settings.setBrainstormSelected(stored.brainstormSelected)
        }
        if (stored.brainstormMode) {
          // Migrate legacy "builder-v2" value to the unified "builder" mode
          const mode = (stored.brainstormMode as string) === "builder-v2"
            ? "builder"
            : stored.brainstormMode
          dispatch.settings.setBrainstormMode(mode)
        }
        if (stored.hideBrainstormGuidance) {
          dispatch.settings.setHideBrainstormGuidance(stored.hideBrainstormGuidance)
        }
        if (typeof stored.journalOpen === "boolean") {
          dispatch.settings.setJournalOpen(stored.journalOpen)
        }
        if (stored.brainstormBuilderStep) {
          dispatch.settings.setBrainstormBuilderStep(stored.brainstormBuilderStep)
        }
        if (stored.brainstormBuilderActiveColumnId !== undefined) {
          dispatch.settings.setBrainstormBuilderActiveColumnId(stored.brainstormBuilderActiveColumnId)
        }
        if (stored.brainstormBuilderActiveCategoryId !== undefined) {
          dispatch.settings.setBrainstormBuilderActiveCategoryId(stored.brainstormBuilderActiveCategoryId)
        }
        if (typeof stored.brainstormBuilderDescription === "string") {
          dispatch.settings.setBrainstormBuilderDescription(stored.brainstormBuilderDescription)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
