import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-account-settings"

export interface AccountSettingsState {
  // Account
  displayName: string
  email: string
  // Appearance
  theme: "light" | "dark" | "system"
  compactMode: boolean
  // Notifications
  enableNotifications: boolean
  notifyOnStageComplete: boolean
  notifyOnValidationVerdict: boolean
  // Data & Privacy
  analyticsEnabled: boolean
  autoSave: boolean
}

const defaultState: AccountSettingsState = {
  displayName: "",
  email: "",
  theme: "light",
  compactMode: false,
  enableNotifications: true,
  notifyOnStageComplete: true,
  notifyOnValidationVerdict: true,
  analyticsEnabled: false,
  autoSave: true,
}

function saveToStorage(state: AccountSettingsState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage errors
  }
}

export const accountSettings = createModel<RootModel>()({
  state: defaultState,

  reducers: {
    update(state, payload: Partial<AccountSettingsState>) {
      const next = { ...state, ...payload }
      saveToStorage(next)
      return next
    },
  },

  effects: (dispatch) => ({
    init() {
      if (typeof window === "undefined") return
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const stored: Partial<AccountSettingsState> = JSON.parse(raw)
        dispatch.accountSettings.update(stored)
      } catch {
        // ignore parse errors
      }
    },
  }),
})
