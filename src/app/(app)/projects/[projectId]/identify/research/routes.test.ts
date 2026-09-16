import { getResearchMethod } from "@/data/researchMethods"
import {
  researchRoot,
  parseResearchPath,
  researchCaptureHref,
  researchHrefs,
  researchResumeHref,
  researchReviewHref,
  researchStepHref,
  researchToolHref,
} from "./routes"

const method = getResearchMethod("abandoned-products")!
const id = method.id
const lastIndex = method.prompts.length - 1
const P = 4
const ROOT = researchRoot(P)

describe("research hrefs", () => {
  it("lives under the project", () => {
    expect(ROOT).toBe("/projects/4/identify/research")
  })

  it("builds 1-based capture urls", () => {
    expect(researchCaptureHref(P, id, 0)).toBe(`${ROOT}/${id}/capture/1`)
    expect(researchCaptureHref(P, id, 2)).toBe(`${ROOT}/${id}/capture/3`)
  })

  it("maps steps to their route", () => {
    expect(researchStepHref(P, "pick", id)).toBe(ROOT)
    expect(researchStepHref(P, "tool", id)).toBe(researchToolHref(P, id))
    expect(researchStepHref(P, "capture", id, 1)).toBe(`${ROOT}/${id}/capture/2`)
    expect(researchStepHref(P, "review", id)).toBe(researchReviewHref(P, id))
  })

  it("binds the builders to a project", () => {
    const hrefs = researchHrefs(P)
    expect(hrefs.pick()).toBe(ROOT)
    expect(hrefs.tool(id)).toBe(researchToolHref(P, id))
    expect(hrefs.capture(id, 1)).toBe(researchCaptureHref(P, id, 1))
    expect(hrefs.review(id)).toBe(researchReviewHref(P, id))
  })
})

describe("parseResearchPath", () => {
  it("treats the root (with or without a trailing slash) as the pick step", () => {
    expect(parseResearchPath(ROOT)).toEqual({ kind: "pick" })
    expect(parseResearchPath(`${ROOT}/`)).toEqual({ kind: "pick" })
  })

  it("parses canonical tool, capture and review urls", () => {
    expect(parseResearchPath(`${ROOT}/${id}/tool`)).toEqual({ kind: "tool", method })
    expect(parseResearchPath(`${ROOT}/${id}/capture/2`)).toEqual({
      kind: "capture",
      method,
      promptIndex: 1,
    })
    expect(parseResearchPath(`${ROOT}/${id}/review`)).toEqual({ kind: "review", method })
  })

  it("redirects an unknown method back to the picker of the same project", () => {
    expect(parseResearchPath(`${ROOT}/nope/capture/1`)).toEqual({
      kind: "redirect",
      href: ROOT,
    })
  })

  it("redirects a bare method or unknown section to the tool step", () => {
    expect(parseResearchPath(`${ROOT}/${id}`)).toEqual({ kind: "redirect", href: researchToolHref(P, id) })
    expect(parseResearchPath(`${ROOT}/${id}/other`)).toEqual({ kind: "redirect", href: researchToolHref(P, id) })
    expect(parseResearchPath(`${ROOT}/${id}/tool/extra`)).toEqual({ kind: "redirect", href: researchToolHref(P, id) })
  })

  it("redirects a bare or non-numeric capture segment to the first prompt", () => {
    const first = researchCaptureHref(P, id, 0)
    expect(parseResearchPath(`${ROOT}/${id}/capture`)).toEqual({ kind: "redirect", href: first })
    expect(parseResearchPath(`${ROOT}/${id}/capture/abc`)).toEqual({ kind: "redirect", href: first })
  })

  it("clamps out-of-range capture numbers", () => {
    expect(parseResearchPath(`${ROOT}/${id}/capture/0`)).toEqual({
      kind: "redirect",
      href: researchCaptureHref(P, id, 0),
    })
    expect(parseResearchPath(`${ROOT}/${id}/capture/999`)).toEqual({
      kind: "redirect",
      href: researchCaptureHref(P, id, lastIndex),
    })
  })
})

describe("researchResumeHref", () => {
  it("returns null without a usable method or when the user was on the picker", () => {
    expect(researchResumeHref(P, null, "capture", 0)).toBeNull()
    expect(researchResumeHref(P, "nope", "capture", 0)).toBeNull()
    expect(researchResumeHref(P, id, "pick", 3)).toBeNull()
  })

  it("resumes each step, defaulting to the tool step and clamping the stored index", () => {
    expect(researchResumeHref(P, id, "tool", 0)).toBe(researchToolHref(P, id))
    expect(researchResumeHref(P, id, null, 0)).toBe(researchToolHref(P, id))
    expect(researchResumeHref(P, id, "review", 0)).toBe(researchReviewHref(P, id))
    expect(researchResumeHref(P, id, "capture", 1)).toBe(researchCaptureHref(P, id, 1))
    expect(researchResumeHref(P, id, "capture", 999)).toBe(researchCaptureHref(P, id, lastIndex))
  })
})
