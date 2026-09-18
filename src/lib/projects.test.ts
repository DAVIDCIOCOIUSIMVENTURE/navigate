import { previewHref, projectRoutes, uniqueProjectName } from "./projects"

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
