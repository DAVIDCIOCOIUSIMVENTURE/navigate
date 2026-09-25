import { previewHref, projectRoutes, summariseProjects, uniqueProjectName } from "./projects"
import type { Project } from "@/store/projects-model"

function project(id: number, problemId: number | null): Project {
  return { id, name: `Project ${id}`, problemId, members: [], visibility: "private", createdAt: "2026-09-01T00:00:00.000Z", editedAt: "2026-09-01T00:00:00.000Z" }
}

describe("summariseProjects", () => {
  it("counts the projects, the problems with a verdict and the solutions found", () => {
    const projects = [project(1, 10), project(2, 11), project(3, 12), project(4, null)]
    const problems = [
      { id: 10, validationStatus: "valid" },
      { id: 11, validationStatus: "unsure" },
      { id: 12, validationStatus: "in_progress" },
      { id: 13, validationStatus: "invalid" }, // held by no project, so left out
    ]
    const solutions = [{ problemId: 10 }, { problemId: 10 }, { problemId: 12 }, { problemId: 13 }]
    expect(summariseProjects(projects, problems, solutions)).toEqual({ projects: 4, problemsTested: 2, solutions: 3 })
  })

  it("treats a problem with no status as not tested and an empty library as zeros", () => {
    expect(summariseProjects([project(1, 10)], [{ id: 10 }], [])).toEqual({ projects: 1, problemsTested: 0, solutions: 0 })
    expect(summariseProjects([], [], [])).toEqual({ projects: 0, problemsTested: 0, solutions: 0 })
  })
})

describe("uniqueProjectName", () => {
  it("leaves a name nothing else uses alone", () => {
    expect(uniqueProjectName(["Other"], "Rainy commutes")).toBe("Rainy commutes")
    expect(uniqueProjectName([], "Rainy commutes")).toBe("Rainy commutes")
  })

  it("numbers a name that is already taken", () => {
    expect(uniqueProjectName(["Rainy commutes"], "Rainy commutes")).toBe("Rainy commutes (2)")
    expect(uniqueProjectName(["Rainy commutes", "Rainy commutes (2)"], "Rainy commutes")).toBe("Rainy commutes (3)")
  })

  it("skips a number already in use rather than reusing it", () => {
    expect(uniqueProjectName(["A", "A (2)", "A (3)"], "A")).toBe("A (4)")
  })

  it("compares on the trimmed name and returns it trimmed", () => {
    expect(uniqueProjectName(["  Rainy commutes  "], "Rainy commutes")).toBe("Rainy commutes (2)")
    expect(uniqueProjectName([], "  Rainy commutes  ")).toBe("Rainy commutes")
  })

  it("leaves an empty name to the caller's own default", () => {
    expect(uniqueProjectName(["Anything"], "   ")).toBe("")
  })
})

describe("previewHref", () => {
  it("builds the public preview path", () => {
    expect(previewHref(7)).toBe("/preview/7")
    expect(projectRoutes.preview(7)).toBe("/preview/7")
  })

  it("falls back home when there is no project", () => {
    expect(previewHref(null)).toBe("/")
    expect(previewHref(undefined)).toBe("/")
    expect(previewHref(Number.NaN)).toBe("/")
  })
})
