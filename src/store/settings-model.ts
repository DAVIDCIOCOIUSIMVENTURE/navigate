import { createModel } from "@rematch/core"
import type { RootModel } from "."
import { AVATAR_COLOR_IDS } from "@/lib/avatar-colors"
import type { AvatarColor } from "@/lib/avatar-colors"
import type { SidebarMode } from "@/components/ui/sidebar"

const STORAGE_KEY = "navigate-settings"

export type CanvasBuilderMode = "canvas" | "builder"
// Re-exported so existing consumers can keep importing it from the store, but
// the canonical definition now lives alongside the colour data in lib.
export type { AvatarColor }

function isAvatarColor(value: unknown): value is AvatarColor {
  return typeof value === "string" && (AVATAR_COLOR_IDS as string[]).includes(value)
}

function isSidebarMode(value: unknown): value is SidebarMode {
  return value === "expanded" || value === "icon" || value === "collapsed"
}

/**
 * App-wide preferences and UI state. Nothing here belongs to one project:
 * the Canvas Builder's in-progress selection lives in `canvasDrafts`, keyed
 * by project, while its view preferences (which columns are hidden, canvas
 * or builder mode) stay here because they are how the user likes to work.
 */
interface SettingsState {
  hiddenCanvasBuilderColumns: string[]
  fullView: boolean
  canvasBuilderMode: CanvasBuilderMode
  journalOpen: boolean
  sidebarMode: SidebarMode
  avatarColor: AvatarColor
  nickname: string
  bio: string
}

const defaultState: SettingsState = {
  hiddenCanvasBuilderColumns: [],
  fullView: false,
  canvasBuilderMode: "canvas",
  journalOpen: false,
  sidebarMode: "expanded",
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
    setSidebarMode(state, sidebarMode: SidebarMode) {
      const next = { ...state, sidebarMode }
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
        if (stored.canvasBuilderMode === "canvas" || stored.canvasBuilderMode === "builder") {
          dispatch.settings.setCanvasBuilderMode(stored.canvasBuilderMode)
        }
        if (typeof stored.journalOpen === "boolean") {
          dispatch.settings.setJournalOpen(stored.journalOpen)
        }
        if (isSidebarMode(stored.sidebarMode)) {
          dispatch.settings.setSidebarMode(stored.sidebarMode)
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
