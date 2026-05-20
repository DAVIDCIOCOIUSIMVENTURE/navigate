import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SidebarMode } from "@/components/ui/sidebar"

const STORAGE_KEY = "navigate-settings"

export type IdentifyMode = "canvas" | "builder" | "reflect"
export type IdentifyBuilderStep = "pick" | "category" | "choose" | "review"

interface SettingsState {
  sidebarMode: SidebarMode
  hiddenIdentifyColumns: string[]
  fullView: boolean
  identifySelected: string[]
  identifyMode: IdentifyMode
  journalOpen: boolean
  identifyBuilderStep: IdentifyBuilderStep
  identifyBuilderActiveColumnId: string | null
  identifyBuilderActiveCategoryId: string | null
  identifyBuilderDescription: string
}

const defaultState: SettingsState = {
  sidebarMode: "icon",
  hiddenIdentifyColumns: [],
  fullView: false,
  identifySelected: [],
  identifyMode: "builder",
  journalOpen: false,
  identifyBuilderStep: "pick",
  identifyBuilderActiveColumnId: null,
  identifyBuilderActiveCategoryId: null,
  identifyBuilderDescription: "",
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
    setHiddenIdentifyColumns(state, hiddenIdentifyColumns: string[]) {
      const next = { ...state, hiddenIdentifyColumns }
      saveToStorage(next)
      return next
    },
    setFullView(state, fullView: boolean) {
      // Not persisted, resets on reload
      return { ...state, fullView }
    },
    setIdentifySelected(state, identifySelected: string[]) {
      const next = { ...state, identifySelected }
      saveToStorage(next)
      return next
    },
    setIdentifyMode(state, identifyMode: IdentifyMode) {
      const next = { ...state, identifyMode }
      saveToStorage(next)
      return next
    },
    setJournalOpen(state, journalOpen: boolean) {
      const next = { ...state, journalOpen }
      saveToStorage(next)
      return next
    },
    setIdentifyBuilderStep(state, identifyBuilderStep: IdentifyBuilderStep) {
      const next = { ...state, identifyBuilderStep }
      saveToStorage(next)
      return next
    },
    setIdentifyBuilderActiveColumnId(state, identifyBuilderActiveColumnId: string | null) {
      const next = { ...state, identifyBuilderActiveColumnId }
      saveToStorage(next)
      return next
    },
    setIdentifyBuilderActiveCategoryId(state, identifyBuilderActiveCategoryId: string | null) {
      const next = { ...state, identifyBuilderActiveCategoryId }
      saveToStorage(next)
      return next
    },
    setIdentifyBuilderDescription(state, identifyBuilderDescription: string) {
      const next = { ...state, identifyBuilderDescription }
      saveToStorage(next)
      return next
    },
    resetIdentifyBuilder(state) {
      const next: SettingsState = {
        ...state,
        identifyBuilderStep: "pick",
        identifyBuilderActiveColumnId: null,
        identifyBuilderActiveCategoryId: null,
        identifyBuilderDescription: "",
        // Selections are shared between canvas and builder; reset clears both.
        identifySelected: [],
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
        if (stored.hiddenIdentifyColumns) {
          dispatch.settings.setHiddenIdentifyColumns(stored.hiddenIdentifyColumns)
        }
        if (stored.identifySelected) {
          dispatch.settings.setIdentifySelected(stored.identifySelected)
        }
        if (stored.identifyMode) {
          if (stored.identifyMode === "canvas" || stored.identifyMode === "builder" || stored.identifyMode === "reflect") {
            dispatch.settings.setIdentifyMode(stored.identifyMode)
          }
        }
        if (typeof stored.journalOpen === "boolean") {
          dispatch.settings.setJournalOpen(stored.journalOpen)
        }
        if (stored.identifyBuilderStep) {
          dispatch.settings.setIdentifyBuilderStep(stored.identifyBuilderStep)
        }
        if (stored.identifyBuilderActiveColumnId !== undefined) {
          dispatch.settings.setIdentifyBuilderActiveColumnId(stored.identifyBuilderActiveColumnId)
        }
        if (stored.identifyBuilderActiveCategoryId !== undefined) {
          dispatch.settings.setIdentifyBuilderActiveCategoryId(stored.identifyBuilderActiveCategoryId)
        }
        if (typeof stored.identifyBuilderDescription === "string") {
          dispatch.settings.setIdentifyBuilderDescription(stored.identifyBuilderDescription)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
