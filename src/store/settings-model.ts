import { createModel } from "@rematch/core"
import type { RootModel } from "."
import type { SidebarMode } from "@/components/ui/sidebar"

const STORAGE_KEY = "navigate-settings"

interface SettingsState {
  sidebarMode: SidebarMode
  ideaMode: "guided" | "quickstart"
  hiddenBrainstormColumns: string[]
  fullView: boolean
}

const defaultState: SettingsState = {
  sidebarMode: "icon",
  ideaMode: "guided",
  hiddenBrainstormColumns: [],
  fullView: false,
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
    setIdeaMode(state, ideaMode: "guided" | "quickstart") {
      const next = { ...state, ideaMode }
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
        if (stored.ideaMode) {
          dispatch.settings.setIdeaMode(stored.ideaMode)
        }
        if (stored.hiddenBrainstormColumns) {
          dispatch.settings.setHiddenBrainstormColumns(stored.hiddenBrainstormColumns)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
