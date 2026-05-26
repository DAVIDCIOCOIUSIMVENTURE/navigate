import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-settings"

export type IdentifyMode = "canvas" | "builder" | "reflect" | "research"
export type IdentifyBuilderStep = "pick" | "category" | "choose" | "review"
export type AvatarColor = "teal" | "mustard" | "navy" | "forest" | "crimson" | "indigo" | "violet" | "rose"

const AVATAR_COLOR_IDS: AvatarColor[] = ["teal", "mustard", "navy", "forest", "crimson", "indigo", "violet", "rose"]

function isAvatarColor(value: unknown): value is AvatarColor {
  return typeof value === "string" && (AVATAR_COLOR_IDS as string[]).includes(value)
}

interface SettingsState {
  hiddenIdentifyColumns: string[]
  fullView: boolean
  identifySelected: string[]
  identifyMode: IdentifyMode
  journalOpen: boolean
  identifyBuilderStep: IdentifyBuilderStep
  identifyBuilderActiveColumnId: string | null
  identifyBuilderActiveCategoryId: string | null
  identifyBuilderDescription: string
  avatarColor: AvatarColor
  nickname: string
  bio: string
}

const defaultState: SettingsState = {
  hiddenIdentifyColumns: [],
  fullView: false,
  identifySelected: [],
  identifyMode: "reflect",
  journalOpen: false,
  identifyBuilderStep: "pick",
  identifyBuilderActiveColumnId: null,
  identifyBuilderActiveCategoryId: null,
  identifyBuilderDescription: "",
  avatarColor: "teal",
  nickname: "",
  bio: "",
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
    setAvatarColor(state, avatarColor: AvatarColor) {
      const next = { ...state, avatarColor }
      saveToStorage(next)
      return next
    },
    setNickname(state, nickname: string) {
      const next = { ...state, nickname }
      saveToStorage(next)
      return next
    },
    setBio(state, bio: string) {
      const next = { ...state, bio }
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
        if (!raw) return
        const stored: Partial<SettingsState> = JSON.parse(raw)
        if (stored.hiddenIdentifyColumns) {
          dispatch.settings.setHiddenIdentifyColumns(stored.hiddenIdentifyColumns)
        }
        if (stored.identifySelected) {
          dispatch.settings.setIdentifySelected(stored.identifySelected)
        }
        if (stored.identifyMode) {
          if (stored.identifyMode === "canvas" || stored.identifyMode === "builder" || stored.identifyMode === "reflect" || stored.identifyMode === "research") {
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
        if (isAvatarColor(stored.avatarColor)) {
          dispatch.settings.setAvatarColor(stored.avatarColor)
        }
        if (typeof stored.nickname === "string") {
          dispatch.settings.setNickname(stored.nickname)
        }
        if (typeof stored.bio === "string") {
          dispatch.settings.setBio(stored.bio)
        }
      } catch {
        // ignore parse errors
      }
    },
  }),
})
