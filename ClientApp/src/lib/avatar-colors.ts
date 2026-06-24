// Single source of truth for the selectable avatar colours. The union type and
// the id list are consumed by the settings store (to type and validate the
// persisted value); the id/label/bgClass options are consumed by the header
// avatar and the account settings page. Each id maps to a brand background
// utility class.
export type AvatarColor =
  | "teal" | "mustard" | "navy" | "forest"
  | "crimson" | "indigo" | "violet" | "rose"

export const AVATAR_COLOR_OPTIONS: { id: AvatarColor; label: string; bgClass: string }[] = [
  { id: "teal", label: "Teal", bgClass: "bg-quaternary" },
  { id: "mustard", label: "Mustard", bgClass: "bg-yellow-600" },
  { id: "navy", label: "Navy", bgClass: "bg-blue-900" },
  { id: "forest", label: "Forest", bgClass: "bg-green-800" },
  { id: "crimson", label: "Crimson", bgClass: "bg-red-800" },
  { id: "indigo", label: "Indigo", bgClass: "bg-indigo-800" },
  { id: "violet", label: "Violet", bgClass: "bg-violet-800" },
  { id: "rose", label: "Rose", bgClass: "bg-rose-800" },
]

export const AVATAR_COLOR_IDS: AvatarColor[] = AVATAR_COLOR_OPTIONS.map((c) => c.id)
