/**
 * Pure helpers for a project's team. Membership is mocked for now: there are
 * no user accounts, so a member is just the name and email typed into the
 * project settings dialog, kept on the project itself (see `ProjectMember` in
 * `src/store/projects-model.ts`).
 */
import type { ProjectMember } from "@/store/projects-model"

/** The saturated dark tile palette, so an avatar looks like the rest of the app's coloured tiles. */
const AVATAR_CLASSES = [
  "bg-blue-900",
  "bg-green-800",
  "bg-orange-700",
  "bg-violet-800",
  "bg-teal-700",
  "bg-rose-800",
  "bg-indigo-800",
  "bg-emerald-800",
] as const

export function createProjectMember(name: string, email: string): ProjectMember {
  return {
    id: `member-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    email: email.trim(),
  }
}

/** What to call a member: their name, then their email, then a placeholder. */
export function memberDisplayName(member: ProjectMember): string {
  const name = member.name.trim()
  if (name.length > 0) return name
  const email = member.email.trim()
  return email.length > 0 ? email : "Unnamed member"
}

/** Up to two letters for the avatar disc, taken from the name or, failing that, the email. */
export function memberInitials(member: ProjectMember): string {
  const words = memberDisplayName(member)
    .split(/[\s@._-]+/)
    .filter((word) => /[a-z0-9]/i.test(word))
  const letters = words.slice(0, 2).map((word) => word[0])
  return letters.join("").toUpperCase() || "?"
}

/** A stable colour per member, so the same person keeps the same avatar between renders. */
export function memberAvatarClass(member: ProjectMember): string {
  let hash = 0
  for (const char of member.id) hash = (hash * 31 + char.charCodeAt(0)) % 10007
  return AVATAR_CLASSES[hash % AVATAR_CLASSES.length]
}

/** A light check that an email is worth saving. Deliberately loose: nothing is sent anywhere yet. */
export function isEmailLike(value: string): boolean {
  const trimmed = value.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

/** True when this email is already on the team, whatever case it was typed in. */
export function hasMemberWithEmail(members: readonly ProjectMember[], email: string): boolean {
  const needle = email.trim().toLowerCase()
  return members.some((member) => member.email.trim().toLowerCase() === needle)
}
