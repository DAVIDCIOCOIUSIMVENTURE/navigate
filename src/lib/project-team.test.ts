import { describe, it, expect } from "vitest"
import type { ProjectMember } from "@/store/projects-model"
import {
  createProjectMember,
  hasMemberWithEmail,
  isEmailLike,
  memberAvatarClass,
  memberDisplayName,
  memberInitials,
} from "./project-team"

const member = (overrides: Partial<ProjectMember> = {}): ProjectMember => ({
  id: "member-1234abcd",
  name: "Jane Okonkwo",
  email: "jane@example.com",
  ...overrides,
})

describe("createProjectMember", () => {
  it("trims what was typed and mints an id", () => {
    const created = createProjectMember("  Jane Okonkwo ", " jane@example.com ")
    expect(created.name).toBe("Jane Okonkwo")
    expect(created.email).toBe("jane@example.com")
    expect(created.id).toMatch(/^member-[0-9a-f]{8}$/)
  })

  it("gives each member its own id", () => {
    const a = createProjectMember("A", "a@example.com")
    const b = createProjectMember("B", "b@example.com")
    expect(a.id).not.toBe(b.id)
  })
})

describe("memberDisplayName", () => {
  it("falls back to the email, then to a placeholder", () => {
    expect(memberDisplayName(member())).toBe("Jane Okonkwo")
    expect(memberDisplayName(member({ name: "  " }))).toBe("jane@example.com")
    expect(memberDisplayName(member({ name: "", email: "" }))).toBe("Unnamed member")
  })
})

describe("memberInitials", () => {
  it("takes the first two words of the name", () => {
    expect(memberInitials(member())).toBe("JO")
    expect(memberInitials(member({ name: "Prince" }))).toBe("P")
    expect(memberInitials(member({ name: "Ada Grace Lovelace" }))).toBe("AG")
  })

  it("falls back to the email when there is no name", () => {
    expect(memberInitials(member({ name: "", email: "sam.patel@example.com" }))).toBe("SP")
    // With neither, the placeholder display name carries the initials.
    expect(memberInitials(member({ name: "", email: "" }))).toBe("UM")
    expect(memberInitials(member({ name: "###" }))).toBe("?")
  })
})

describe("memberAvatarClass", () => {
  it("is stable for a member and drawn from the tile palette", () => {
    const first = memberAvatarClass(member())
    expect(memberAvatarClass(member())).toBe(first)
    expect(first).toMatch(/^bg-[a-z]+-\d00$/)
  })
})

describe("isEmailLike", () => {
  it("accepts a plausible address and rejects the rest", () => {
    expect(isEmailLike(" jane@example.com ")).toBe(true)
    expect(isEmailLike("jane@example")).toBe(false)
    expect(isEmailLike("jane")).toBe(false)
    expect(isEmailLike("")).toBe(false)
  })
})

describe("hasMemberWithEmail", () => {
  it("matches whatever case the email was typed in", () => {
    const members = [member()]
    expect(hasMemberWithEmail(members, " JANE@Example.com ")).toBe(true)
    expect(hasMemberWithEmail(members, "sam@example.com")).toBe(false)
  })
})
