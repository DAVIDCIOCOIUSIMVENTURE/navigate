import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SidebarMode } from "@/components/ui/sidebar"

const STORAGE_KEY = "navigate-settings"

export type BrainstormMode = "canvas" | "builder" | "builder-v2"

interface SettingsState {
  sidebarMode: SidebarMode
  hiddenBrainstormColumns: string[]
  fullView: boolean
  brainstormSelected: string[]
  brainstormMode: BrainstormMode
  hideBrainstormGuidance: boolean
}

const defaultState: SettingsState = {
  sidebarMode: "icon",
  hiddenBrainstormColumns: [],
  fullView: false,
  brainstormSelected: [],
  brainstormMode: "builder",
  hideBrainstormGuidance: false,
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
      // Not persisted — resets on reload
      return { ...state, fullView }
    },
    setBrainstormSelected(state, brainstormSelected: string[]) {
      // Not persisted — resets on reload
      return { ...state, brainstormSelected }
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
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
          // No saved settings — expand sidebar as default first-visit experience
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
        if (stored.brainstormMode) {
          dispatch.settings.setBrainstormMode(stored.brainstormMode)
        }
        if (stored.hideBrainstormGuidance) {
          dispatch.settings.setHideBrainstormGuidance(stored.hideBrainstormGuidance)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
