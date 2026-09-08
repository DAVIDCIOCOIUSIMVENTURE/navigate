import { getResearchMethod } from "@/data/researchMethods"
import {
  RESEARCH_ROOT,
  parseResearchPath,
  researchCaptureHref,
  researchResumeHref,
  researchReviewHref,
  researchStepHref,
  researchToolHref,
} from "./routes"

const method = getResearchMethod("abandoned-products")!
const id = method.id
const lastIndex = method.prompts.length - 1

describe("research hrefs", () => {
  it("builds 1-based capture urls", () => {
    expect(researchCaptureHref(id, 0)).toBe(`${RESEARCH_ROOT}/${id}/capture/1`)
    expect(researchCaptureHref(id, 2)).toBe(`${RESEARCH_ROOT}/${id}/capture/3`)
  })

  it("maps steps to their route", () => {
    expect(researchStepHref("pick", id)).toBe(RESEARCH_ROOT)
    expect(researchStepHref("tool", id)).toBe(researchToolHref(id))
    expect(researchStepHref("capture", id, 1)).toBe(`${RESEARCH_ROOT}/${id}/capture/2`)
    expect(researchStepHref("review", id)).toBe(researchReviewHref(id))
  })
})

describe("parseResearchPath", () => {
  it("treats the root (with or without a trailing slash) as the pick step", () => {
    expect(parseResearchPath(RESEARCH_ROOT)).toEqual({ kind: "pick" })
    expect(parseResearchPath(`${RESEARCH_ROOT}/`)).toEqual({ kind: "pick" })
  })

  it("parses canonical tool, capture and review urls", () => {
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/tool`)).toEqual({ kind: "tool", method })
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/capture/2`)).toEqual({
      kind: "capture",
      method,
      promptIndex: 1,
    })
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/review`)).toEqual({ kind: "review", method })
  })

  it("redirects an unknown method back to the picker", () => {
    expect(parseResearchPath(`${RESEARCH_ROOT}/nope/capture/1`)).toEqual({
      kind: "redirect",
      href: RESEARCH_ROOT,
    })
  })

  it("redirects a bare method or unknown section to the tool step", () => {
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}`)).toEqual({ kind: "redirect", href: researchToolHref(id) })
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/other`)).toEqual({ kind: "redirect", href: researchToolHref(id) })
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/tool/extra`)).toEqual({ kind: "redirect", href: researchToolHref(id) })
  })

  it("redirects a bare or non-numeric capture segment to the first prompt", () => {
    const first = researchCaptureHref(id, 0)
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/capture`)).toEqual({ kind: "redirect", href: first })
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/capture/abc`)).toEqual({ kind: "redirect", href: first })
  })

  it("clamps out-of-range capture numbers", () => {
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/capture/0`)).toEqual({
      kind: "redirect",
      href: researchCaptureHref(id, 0),
    })
    expect(parseResearchPath(`${RESEARCH_ROOT}/${id}/capture/999`)).toEqual({
      kind: "redirect",
      href: researchCaptureHref(id, lastIndex),
    })
  })
})

describe("researchResumeHref", () => {
  it("returns null without a usable method or when the user was on the picker", () => {
    expect(researchResumeHref(null, "capture", 0)).toBeNull()
    expect(researchResumeHref("nope", "capture", 0)).toBeNull()
    expect(researchResumeHref(id, "pick", 3)).toBeNull()
  })

  it("resumes each step, defaulting to the tool step and clamping the stored index", () => {
    expect(researchResumeHref(id, "tool", 0)).toBe(researchToolHref(id))
    expect(researchResumeHref(id, null, 0)).toBe(researchToolHref(id))
    expect(researchResumeHref(id, "review", 0)).toBe(researchReviewHref(id))
    expect(researchResumeHref(id, "capture", 1)).toBe(researchCaptureHref(id, 1))
    expect(researchResumeHref(id, "capture", 999)).toBe(researchCaptureHref(id, lastIndex))
  })
})
