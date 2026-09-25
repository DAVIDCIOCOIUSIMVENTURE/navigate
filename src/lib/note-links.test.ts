import {
  defaultNoteLink,
  describeNoteLink,
  isNoteInScope,
  isNoteLinkAvailable,
  journalScopeFromPathname,
  noteLinkFromParts,
  noteLinkParts,
  sectionOptions,
  solutionIdFromPathname,
  type NoteLinkProject,
} from "./note-links"
import type { NoteLink } from "@/store/notes-model"

const projects: NoteLinkProject[] = [
  { id: 7, label: "Rainy commutes", solutions: [{ id: 3, title: "Bus shelters" }, { id: 4, title: "  " }] },
  { id: 8, label: "Empty project", solutions: [] },
]

describe("noteLinkParts and noteLinkFromParts", () => {
  const links: NoteLink[] = [
    { kind: "none" },
    { kind: "self-discovery" },
    { kind: "problem", projectId: 7 },
    { kind: "solution", projectId: 7, solutionId: 3 },
  ]

  it("round-trips every kind of link through the project and section values", () => {
    for (const link of links) {
      expect(noteLinkFromParts(noteLinkParts(link))).toEqual(link)
    }
  })

  it("shows a general note as no project and General, and a solution note as its project and solution", () => {
    expect(noteLinkParts({ kind: "none" })).toEqual({ project: "none", section: "general" })
    expect(noteLinkParts({ kind: "solution", projectId: 7, solutionId: 3 })).toEqual({ project: "7", section: "solution:3" })
  })

  it("lands on the problem when a project is picked with a section that is not its own", () => {
    expect(noteLinkFromParts({ project: "7", section: "" })).toEqual({ kind: "problem", projectId: 7 })
    expect(noteLinkFromParts({ project: "7", section: "self-discovery" })).toEqual({ kind: "problem", projectId: 7 })
    expect(noteLinkFromParts({ project: "7", section: "solution:x" })).toEqual({ kind: "problem", projectId: 7 })
  })

  it("lands on General when no project is picked with a project section", () => {
    expect(noteLinkFromParts({ project: "none", section: "" })).toEqual({ kind: "none" })
    expect(noteLinkFromParts({ project: "none", section: "problem" })).toEqual({ kind: "none" })
    expect(noteLinkFromParts({ project: "abc", section: "self-discovery" })).toEqual({ kind: "self-discovery" })
  })
})

describe("sectionOptions", () => {
  it("offers General and Self Discovery without a project", () => {
    expect(sectionOptions("none", projects).map((o) => o.label)).toEqual(["General", "Self Discovery"])
    expect(sectionOptions("99", projects).map((o) => o.label)).toEqual(["General", "Self Discovery"])
  })

  it("offers the problem and every solution of the chosen project", () => {
    expect(sectionOptions("7", projects)).toEqual([
      { value: "problem", label: "Problem" },
      { value: "solution:3", label: "Solution: Bus shelters" },
      { value: "solution:4", label: "Solution: Untitled solution" },
    ])
    expect(sectionOptions("8", projects).map((o) => o.label)).toEqual(["Problem"])
  })
})

describe("describeNoteLink", () => {
  it("names the area a note is about", () => {
    expect(describeNoteLink({ kind: "self-discovery" }, projects)).toBe("Self Discovery")
    expect(describeNoteLink({ kind: "problem", projectId: 7 }, projects)).toBe("Rainy commutes · Problem")
    expect(describeNoteLink({ kind: "solution", projectId: 7, solutionId: 3 }, projects)).toBe("Rainy commutes · Bus shelters")
  })

  it("falls back for an untitled solution", () => {
    expect(describeNoteLink({ kind: "solution", projectId: 7, solutionId: 4 }, projects)).toBe("Rainy commutes · Untitled solution")
  })

  it("reads a general note, or one about something that no longer exists, as nothing", () => {
    expect(describeNoteLink({ kind: "none" }, projects)).toBeNull()
    expect(describeNoteLink({ kind: "problem", projectId: 99 }, projects)).toBeNull()
    expect(describeNoteLink({ kind: "solution", projectId: 7, solutionId: 99 }, projects)).toBeNull()
  })
})

describe("isNoteLinkAvailable", () => {
  it("is true for the fixed areas and for links the dropdown still offers", () => {
    expect(isNoteLinkAvailable({ kind: "none" }, projects)).toBe(true)
    expect(isNoteLinkAvailable({ kind: "self-discovery" }, projects)).toBe(true)
    expect(isNoteLinkAvailable({ kind: "problem", projectId: 8 }, projects)).toBe(true)
    expect(isNoteLinkAvailable({ kind: "solution", projectId: 7, solutionId: 99 }, projects)).toBe(false)
  })
})

describe("solutionIdFromPathname", () => {
  it("finds a solution page's id and nothing else", () => {
    expect(solutionIdFromPathname("/projects/7/solutions/3")).toBe(3)
    expect(solutionIdFromPathname("/projects/7/solutions/3/validate/impact")).toBe(3)
    expect(solutionIdFromPathname("/projects/7/solutions/identify/discover")).toBeNull()
    expect(solutionIdFromPathname("/projects/7/solutions/compare")).toBeNull()
    expect(solutionIdFromPathname("/projects/7")).toBeNull()
  })
})

describe("journalScopeFromPathname", () => {
  it("knows Self Discovery, a project and a solution within it", () => {
    expect(journalScopeFromPathname("/self-discovery")).toEqual({ kind: "self-discovery" })
    expect(journalScopeFromPathname("/self-discovery/discover/work")).toEqual({ kind: "self-discovery" })
    expect(journalScopeFromPathname("/projects/7/problem/explore/customer")).toEqual({ kind: "project", projectId: 7, solutionId: null })
    expect(journalScopeFromPathname("/projects/7/solutions/3/edit")).toEqual({ kind: "project", projectId: 7, solutionId: 3 })
  })

  it("is nothing elsewhere", () => {
    expect(journalScopeFromPathname("/")).toBeNull()
    expect(journalScopeFromPathname("/projects")).toBeNull()
    expect(journalScopeFromPathname("/self-discovery-ish")).toBeNull()
  })
})

describe("defaultNoteLink", () => {
  it("starts a note where it is written", () => {
    expect(defaultNoteLink(null, projects)).toEqual({ kind: "none" })
    expect(defaultNoteLink({ kind: "self-discovery" }, projects)).toEqual({ kind: "self-discovery" })
    expect(defaultNoteLink({ kind: "project", projectId: 7, solutionId: null }, projects)).toEqual({ kind: "problem", projectId: 7 })
    expect(defaultNoteLink({ kind: "project", projectId: 7, solutionId: 3 }, projects)).toEqual({
      kind: "solution",
      projectId: 7,
      solutionId: 3,
    })
  })

  it("falls back to the problem for an unknown solution and to general for an unknown project", () => {
    expect(defaultNoteLink({ kind: "project", projectId: 7, solutionId: 99 }, projects)).toEqual({ kind: "problem", projectId: 7 })
    expect(defaultNoteLink({ kind: "project", projectId: 99, solutionId: null }, projects)).toEqual({ kind: "none" })
  })
})

describe("isNoteInScope", () => {
  it("matches a project's problem and solution notes, and only Self Discovery notes there", () => {
    const project = { kind: "project", projectId: 7, solutionId: 3 } as const
    expect(isNoteInScope({ kind: "problem", projectId: 7 }, project)).toBe(true)
    expect(isNoteInScope({ kind: "solution", projectId: 7, solutionId: 4 }, project)).toBe(true)
    expect(isNoteInScope({ kind: "problem", projectId: 8 }, project)).toBe(false)
    expect(isNoteInScope({ kind: "self-discovery" }, project)).toBe(false)
    expect(isNoteInScope({ kind: "self-discovery" }, { kind: "self-discovery" })).toBe(true)
    expect(isNoteInScope({ kind: "problem", projectId: 7 }, { kind: "self-discovery" })).toBe(false)
    expect(isNoteInScope({ kind: "none" }, null)).toBe(true)
  })
})
