import { createModel } from "@rematch/core"
import type { RootModel } from "."

const STORAGE_KEY = "navigate-settings"

export type CanvasBuilderMode = "canvas" | "builder"
export type CanvasBuilderStep = "pick" | "category" | "choose" | "review"
export type AvatarColor = "teal" | "mustard" | "navy" | "forest" | "crimson" | "indigo" | "violet" | "rose"

const AVATAR_COLOR_IDS: AvatarColor[] = ["teal", "mustard", "navy", "forest", "crimson", "indigo", "violet", "rose"]

function isAvatarColor(value: unknown): value is AvatarColor {
  return typeof value === "string" && (AVATAR_COLOR_IDS as string[]).includes(value)
}

interface SettingsState {
  hiddenCanvasBuilderColumns: string[]
  fullView: boolean
  canvasBuilderSelected: string[]
  canvasBuilderMode: CanvasBuilderMode
  journalOpen: boolean
  canvasBuilderStep: CanvasBuilderStep
  canvasBuilderActiveColumnId: string | null
  canvasBuilderActiveCategoryId: string | null
  canvasBuilderDescription: string
  avatarColor: AvatarColor
  nickname: string
  bio: string
}

const defaultState: SettingsState = {
  hiddenCanvasBuilderColumns: [],
  fullView: false,
  canvasBuilderSelected: [],
  canvasBuilderMode: "canvas",
  journalOpen: false,
  canvasBuilderStep: "pick",
  canvasBuilderActiveColumnId: null,
  canvasBuilderActiveCategoryId: null,
  canvasBuilderDescription: "",
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
    setHiddenCanvasBuilderColumns(state, hiddenCanvasBuilderColumns: string[]) {
      const next = { ...state, hiddenCanvasBuilderColumns }
      saveToStorage(next)
      return next
    },
    setFullView(state, fullView: boolean) {
      // Not persisted, resets on reload
      return { ...state, fullView }
    },
    setCanvasBuilderSelected(state, canvasBuilderSelected: string[]) {
      const next = { ...state, canvasBuilderSelected }
      saveToStorage(next)
      return next
    },
    setCanvasBuilderMode(state, canvasBuilderMode: CanvasBuilderMode) {
      const next = { ...state, canvasBuilderMode }
      saveToStorage(next)
      return next
    },
    setJournalOpen(state, journalOpen: boolean) {
      const next = { ...state, journalOpen }
      saveToStorage(next)
      return next
    },
    setCanvasBuilderStep(state, canvasBuilderStep: CanvasBuilderStep) {
      const next = { ...state, canvasBuilderStep }
      saveToStorage(next)
      return next
    },
    setCanvasBuilderActiveColumnId(state, canvasBuilderActiveColumnId: string | null) {
      const next = { ...state, canvasBuilderActiveColumnId }
      saveToStorage(next)
      return next
    },
    setCanvasBuilderActiveCategoryId(state, canvasBuilderActiveCategoryId: string | null) {
      const next = { ...state, canvasBuilderActiveCategoryId }
      saveToStorage(next)
      return next
    },
    setCanvasBuilderDescription(state, canvasBuilderDescription: string) {
      const next = { ...state, canvasBuilderDescription }
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
    resetCanvasBuilder(state) {
      const next: SettingsState = {
        ...state,
        canvasBuilderStep: "pick",
        canvasBuilderActiveColumnId: null,
        canvasBuilderActiveCategoryId: null,
        canvasBuilderDescription: "",
        // Selections are shared between canvas and builder; reset clears both.
        canvasBuilderSelected: [],
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
        if (stored.hiddenCanvasBuilderColumns) {
          dispatch.settings.setHiddenCanvasBuilderColumns(stored.hiddenCanvasBuilderColumns)
        }
        if (stored.canvasBuilderSelected) {
          dispatch.settings.setCanvasBuilderSelected(stored.canvasBuilderSelected)
        }
        if (stored.canvasBuilderMode) {
          // Reflect and research are now their own pages, not canvas-builder modes;
          // any persisted value for them falls back to the default canvas mode.
          if (stored.canvasBuilderMode === "canvas" || stored.canvasBuilderMode === "builder") {
            dispatch.settings.setCanvasBuilderMode(stored.canvasBuilderMode)
          }
        }
        if (typeof stored.journalOpen === "boolean") {
          dispatch.settings.setJournalOpen(stored.journalOpen)
        }
        if (stored.canvasBuilderStep) {
          dispatch.settings.setCanvasBuilderStep(stored.canvasBuilderStep)
        }
        if (stored.canvasBuilderActiveColumnId !== undefined) {
          dispatch.settings.setCanvasBuilderActiveColumnId(stored.canvasBuilderActiveColumnId)
        }
        if (stored.canvasBuilderActiveCategoryId !== undefined) {
          dispatch.settings.setCanvasBuilderActiveCategoryId(stored.canvasBuilderActiveCategoryId)
        }
        if (typeof stored.canvasBuilderDescription === "string") {
          dispatch.settings.setCanvasBuilderDescription(stored.canvasBuilderDescription)
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
