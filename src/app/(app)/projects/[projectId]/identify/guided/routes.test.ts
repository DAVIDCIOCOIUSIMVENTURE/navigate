import { describe, expect, it } from "vitest"
import {
  clampQuestionIndex,
  guidedHrefs,
  guidedQuestionHref,
  guidedResumeHref,
  guidedReviewHref,
  guidedRoot,
  parseGuidedPath,
} from "./routes"

describe("guided hrefs", () => {
  it("build the tool's routes under the project's hub", () => {
    expect(guidedRoot(12)).toBe("/projects/12/identify/guided")
    expect(guidedQuestionHref(12, 0)).toBe("/projects/12/identify/guided/questions/1")
    expect(guidedReviewHref(12)).toBe("/projects/12/identify/guided/review")
    const hrefs = guidedHrefs(12)
    expect(hrefs.step("prompts", 2)).toBe("/projects/12/identify/guided/questions/3")
    expect(hrefs.step("review")).toBe("/projects/12/identify/guided/review")
  })
})

describe("parseGuidedPath", () => {
  it("recognises the root, a question and the review", () => {
    expect(parseGuidedPath("/projects/12/identify/guided")).toEqual({ kind: "root", projectId: 12 })
    expect(parseGuidedPath("/projects/12/identify/guided/")).toEqual({ kind: "root", projectId: 12 })
    expect(parseGuidedPath("/projects/12/identify/guided/questions/3")).toEqual({ kind: "questions", projectId: 12, questionIndex: 2 })
    expect(parseGuidedPath("/projects/12/identify/guided/review")).toEqual({ kind: "review", projectId: 12 })
  })

  it("sends anything non-canonical to the first question or the review", () => {
    expect(parseGuidedPath("/projects/12/identify/guided/questions")).toEqual({ kind: "redirect", href: "/projects/12/identify/guided/questions/1" })
    expect(parseGuidedPath("/projects/12/identify/guided/questions/0")).toEqual({ kind: "redirect", href: "/projects/12/identify/guided/questions/1" })
    expect(parseGuidedPath("/projects/12/identify/guided/questions/x")).toEqual({ kind: "redirect", href: "/projects/12/identify/guided/questions/1" })
    expect(parseGuidedPath("/projects/12/identify/guided/review/extra")).toEqual({ kind: "redirect", href: "/projects/12/identify/guided/review" })
    expect(parseGuidedPath("/projects/12/identify/guided/other")).toEqual({ kind: "redirect", href: "/projects/12/identify/guided/questions/1" })
  })

  it("sends a path outside the tool home", () => {
    expect(parseGuidedPath("/projects/12/identify/life")).toEqual({ kind: "redirect", href: "/" })
  })
})

describe("guidedResumeHref", () => {
  it("lands on the first question unless this tool was left mid-run", () => {
    expect(guidedResumeHref(12, null, "guided", null, 3, 9)).toBe("/projects/12/identify/guided/questions/1")
    expect(guidedResumeHref(12, "life", "guided", "prompts", 3, 9)).toBe("/projects/12/identify/guided/questions/1")
    expect(guidedResumeHref(12, "guided", "guided", "prompts", 3, 9)).toBe("/projects/12/identify/guided/questions/4")
    expect(guidedResumeHref(12, "guided", "guided", "review", 0, 9)).toBe("/projects/12/identify/guided/review")
  })

  it("clamps a stored question the shorter path no longer has", () => {
    expect(guidedResumeHref(12, "guided", "guided", "prompts", 8, 2)).toBe("/projects/12/identify/guided/questions/2")
    expect(clampQuestionIndex(-1, 3)).toBe(0)
    expect(clampQuestionIndex(5, 0)).toBe(0)
  })
})
