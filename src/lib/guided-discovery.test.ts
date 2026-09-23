import { describe, expect, it } from "vitest"
import {
  GUIDED_ANSWER_IDS,
  GUIDED_OPTION_FIELD,
  GUIDED_ROUTES,
  GUIDED_SLOTS,
  GUIDED_START_ID,
  GUIDED_TOOL_ID,
  getGuidedSlot,
  guidedAnchorId,
  guidedVoiceId,
} from "@/data/guidedDiscovery"
import type { DimensionKey } from "@/lib/dimension-visuals"
import {
  answersFromGuidedCapture,
  buildGuidedCapture,
  chosenOption,
  guidedAnchor,
  guidedHasCandidate,
  guidedProgressLabel,
  guidedRoleNode,
  guidedStartNode,
  guidedStartingDimension,
  isGuidedCapture,
  resolveGuidedPath,
  type GuidedAnswers,
} from "./guided-discovery"

const DIMENSIONS: DimensionKey[] = ["you", "customers", "problems", "contexts"]

function start(dimension: DimensionKey): GuidedAnswers {
  const option = guidedStartNode().options.find((o) => o.dimension === dimension)!
  return { [GUIDED_START_ID]: [{ text: option.label, context: { [GUIDED_OPTION_FIELD]: option.id } }] }
}

function voice(dimension: DimensionKey, optionId: string): GuidedAnswers {
  const route = GUIDED_ROUTES.find((r) => r.dimension === dimension)!
  const option = route.voice.options.find((o) => o.id === optionId)!
  return { [guidedVoiceId(dimension)]: [{ text: option.label, context: { [GUIDED_OPTION_FIELD]: option.id } }] }
}

function typed(nodeId: string, ...texts: string[]): GuidedAnswers {
  return { [nodeId]: texts.map((text) => ({ text, context: {} })) }
}

/** Every complete route, one per voice. */
function everyRun(): { dimension: DimensionKey; voiceId: string; answers: GuidedAnswers }[] {
  return GUIDED_ROUTES.flatMap((route) =>
    route.voice.options.map((option) => ({
      dimension: route.dimension,
      voiceId: option.id,
      answers: { ...start(route.dimension), ...voice(route.dimension, option.id) },
    })),
  )
}

describe("guided content schema", () => {
  it("has one route per dimension, each with a voice of at least two options", () => {
    expect(GUIDED_ROUTES.map((r) => r.dimension).sort()).toEqual([...DIMENSIONS].sort())
    for (const route of GUIDED_ROUTES) {
      expect(route.voice.options.length, route.dimension).toBeGreaterThanOrEqual(2)
      expect(route.steps.filter((s) => s === "anchor")).toHaveLength(1)
      expect(route.steps.filter((s) => s === "voice")).toHaveLength(1)
    }
  })

  it("has unique slot, option and answer ids", () => {
    const slotIds = GUIDED_SLOTS.map((s) => s.id)
    expect(new Set(slotIds).size).toBe(slotIds.length)
    const optionIds = GUIDED_ROUTES.flatMap((r) => [r.option.id, ...r.voice.options.map((o) => o.id)])
    expect(new Set(optionIds).size).toBe(optionIds.length)
    expect(new Set(GUIDED_ANSWER_IDS).size).toBe(GUIDED_ANSWER_IDS.length)
  })

  it("every step names a slot, never the column the anchor fills, and only voices the route has", () => {
    for (const route of GUIDED_ROUTES) {
      const voices = route.voice.options.map((o) => o.id)
      for (const step of route.steps) {
        if (step === "anchor" || step === "voice") continue
        const slotId = typeof step === "string" ? step : step.slot
        const slot = getGuidedSlot(slotId)
        expect(slot, `${route.dimension}: ${slotId}`).toBeDefined()
        expect(slot?.role, `${route.dimension}: ${slotId}`).not.toBe(route.dimension)
        if (typeof step !== "string") for (const v of step.voices) expect(voices).toContain(v)
      }
    }
  })

  it("every wording variant is keyed by a dimension or a voice", () => {
    const keys = new Set<string>([...DIMENSIONS, ...GUIDED_ROUTES.flatMap((r) => r.voice.options.map((o) => o.id))])
    const wordings = [...GUIDED_SLOTS, ...GUIDED_ROUTES.map((r) => r.anchor), ...GUIDED_ROUTES.map((r) => r.voice)]
    for (const wording of wordings) {
      for (const key of Object.keys(wording.variants ?? {})) expect(keys.has(key), key).toBe(true)
    }
  })

  it("a You anchor always knows where to save a new entry", () => {
    const route = GUIDED_ROUTES.find((r) => r.dimension === "you")!
    expect(route.anchor.copy.selfDiscoveryQuestionUrl).toBeTruthy()
  })

  it("no prose carries an em dash", () => {
    expect(JSON.stringify({ GUIDED_SLOTS, GUIDED_ROUTES })).not.toContain("—")
  })
})

describe("resolveGuidedPath", () => {
  it("stops at the first question until it is answered", () => {
    const path = resolveGuidedPath({})
    expect(path.nodes.map((n) => n.id)).toEqual([GUIDED_START_ID])
    expect(path.complete).toBe(false)
    expect(guidedStartingDimension({})).toBeNull()
  })

  it("stops at the voice choice until it is made, wherever the route puts it", () => {
    const you = resolveGuidedPath(start("you"))
    expect(you.nodes.map((n) => n.id)).toEqual([GUIDED_START_ID, guidedVoiceId("you")])
    expect(you.complete).toBe(false)

    const problems = resolveGuidedPath(start("problems"))
    expect(problems.nodes.map((n) => n.id)).toEqual([GUIDED_START_ID, guidedAnchorId("problems"), guidedVoiceId("problems")])
    expect(problems.complete).toBe(false)
  })

  it("every complete run has one anchor of the starting dimension, a problems column, and asks each column at most once", () => {
    const runs = everyRun()
    expect(runs.length).toBeGreaterThan(8)
    for (const { dimension, voiceId, answers } of runs) {
      const path = resolveGuidedPath(answers)
      const label = `${dimension} / ${voiceId}`
      expect(path.complete, label).toBe(true)
      expect(path.nodes.filter((n) => n.kind === "prompt" && n.anchor), label).toHaveLength(1)
      expect(guidedAnchor(path)?.role, label).toBe(dimension)
      expect(guidedStartingDimension(answers)).toBe(dimension)
      expect(guidedRoleNode(path, "problems"), label).not.toBeNull()
      for (const role of DIMENSIONS) {
        expect(path.nodes.filter((n) => n.kind === "prompt" && n.role === role).length, `${label} ${role}`).toBeLessThanOrEqual(1)
      }
      for (const node of path.nodes) expect(node.question.trim().length, `${label} ${node.id}`).toBeGreaterThan(0)
    }
  })

  it("words the shared questions for the voice, and asks the same slots either way", () => {
    const once = resolveGuidedPath({ ...start("you"), ...voice("you", "you-once") })
    const recurring = resolveGuidedPath({ ...start("you"), ...voice("you", "you-recurring") })
    const question = (path: typeof once, id: string) => path.nodes.find((n) => n.id === id)?.question
    expect(question(once, "problems")).toBe("Looking back, what was harder than it needed to be?")
    expect(question(recurring, "problems")).toBe("What about it has frustrated you recently?")
    expect(question(once, "cope")).toBe(question(recurring, "cope"))
    // The one route-specific question only appears for the voice it makes sense for.
    expect(once.nodes.map((n) => n.id)).toContain("wish")
    expect(recurring.nodes.map((n) => n.id)).not.toContain("wish")
  })

  it("the You anchor draws from a different self-discovery question per voice", () => {
    const once = guidedAnchor(resolveGuidedPath({ ...start("you"), ...voice("you", "you-once") }))
    const recurring = guidedAnchor(resolveGuidedPath({ ...start("you"), ...voice("you", "you-recurring") }))
    expect(once?.selfDiscoveryQuestionUrl).toBe("life-experiences")
    expect(recurring?.selfDiscoveryQuestionUrl).toBe("work-done")
  })

  it("falls back from voice to dimension to default wording", () => {
    const contexts = resolveGuidedPath({ ...start("contexts"), ...voice("contexts", "contexts-other") })
    const question = (id: string) => contexts.nodes.find((n) => n.id === id)?.question
    expect(question("problems")).toBe("What goes wrong in that moment?")
    expect(question("why")).toBe("Why do you think it is still like this?")
    expect(question("spend")).toBe("What do people spend money, time or attention on that doesn't really help?")
  })

  it("keeps a shared answer when the voice or the route changes", () => {
    const answers = { ...start("customers"), ...voice("customers", "customers-serve"), ...typed("cope", "A spreadsheet") }
    const other = resolveGuidedPath({ ...answers, ...voice("customers", "customers-member") })
    expect(other.nodes.map((n) => n.id)).toContain("cope")
    const rerouted = { ...answers, ...start("problems"), ...voice("problems", "problems-mine") }
    const path = resolveGuidedPath(rerouted)
    expect(path.nodes.map((n) => n.id)).toContain("cope")
    expect(buildGuidedCapture(path, rerouted, "").prompts).toContainEqual({ promptId: "cope", answers: ["A spreadsheet"] })
  })

  it("resolves a choice by its label when the option id is missing", () => {
    const node = guidedStartNode()
    const option = chosenOption(node, { [GUIDED_START_ID]: [{ text: "  a MOMENT when things go wrong ", context: {} }] })
    expect(option?.id).toBe("start-contexts")
    expect(chosenOption(node, { [GUIDED_START_ID]: [{ text: "", context: {} }] })).toBeNull()
  })
})

describe("guidedHasCandidate", () => {
  const route = { ...start("problems"), ...voice("problems", "problems-mine") }

  it("needs a complete route, an anchor and one more answer", () => {
    expect(guidedHasCandidate(resolveGuidedPath({}), {})).toBe(false)
    expect(guidedHasCandidate(resolveGuidedPath(route), route)).toBe(false)
    const anchored = { ...route, ...typed(guidedAnchorId("problems"), "Fees at the checkout") }
    expect(guidedHasCandidate(resolveGuidedPath(anchored), anchored)).toBe(false)
    const answered = { ...anchored, ...typed("occasion", "Booking the trip") }
    expect(guidedHasCandidate(resolveGuidedPath(answered), answered)).toBe(true)
  })

  it("ignores answers to questions not on this route", () => {
    const answers = { ...route, ...typed(guidedAnchorId("problems"), "Fees"), ...typed("wish", "Read the small print") }
    expect(guidedHasCandidate(resolveGuidedPath(answers), answers)).toBe(false)
  })
})

describe("capture round trip", () => {
  const answers: GuidedAnswers = {
    ...start("you"),
    ...voice("you", "you-once"),
    ...typed(guidedAnchorId("you"), "Moving country"),
    ...typed("problems", "Proving identity", "  ", "Finding a GP"),
    ...typed("customers", "Skilled immigrants"),
    // Left over from an earlier run down another route: not asked here.
    ...typed("occasion", "Cancelling a subscription"),
  }

  it("keeps only the answered questions on the route, in order, choices as their labels", () => {
    const capture = buildGuidedCapture(resolveGuidedPath(answers), answers, "2026-09-23T10:00:00.000Z")
    expect(capture.lensId).toBe(GUIDED_TOOL_ID)
    expect(capture.prompts).toEqual([
      { promptId: GUIDED_START_ID, answers: ["My own experience"] },
      { promptId: guidedVoiceId("you"), answers: ["Something I went through once"] },
      { promptId: guidedAnchorId("you"), answers: ["Moving country"] },
      { promptId: "problems", answers: ["Proving identity", "Finding a GP"] },
      { promptId: "customers", answers: ["Skilled immigrants"] },
    ])
  })

  it("reads back into the same route with option ids restored", () => {
    const capture = buildGuidedCapture(resolveGuidedPath(answers), answers, "2026-09-23T10:00:00.000Z")
    const seeded = answersFromGuidedCapture(capture)
    expect(seeded[GUIDED_START_ID]).toEqual([{ text: "My own experience", context: { [GUIDED_OPTION_FIELD]: "start-you" } }])
    expect(seeded[guidedVoiceId("you")]).toEqual([{ text: "Something I went through once", context: { [GUIDED_OPTION_FIELD]: "you-once" } }])
    expect(seeded.problems).toEqual([
      { text: "Proving identity", context: {} },
      { text: "Finding a GP", context: {} },
    ])
    expect(seeded.occasion).toBeUndefined()
    const path = resolveGuidedPath(seeded)
    expect(path.complete).toBe(true)
    expect(guidedAnchor(path)?.id).toBe(guidedAnchorId("you"))
  })

  it("ignores a lens capture, an unknown route and unknown questions", () => {
    expect(isGuidedCapture({ lensId: "life" })).toBe(false)
    expect(isGuidedCapture(null)).toBe(false)
    expect(answersFromGuidedCapture({ lensId: "life", capturedAt: "", prompts: [{ promptId: "x", answers: ["y"] }] })).toEqual({})
    expect(
      answersFromGuidedCapture({ lensId: GUIDED_TOOL_ID, capturedAt: "", prompts: [{ promptId: GUIDED_START_ID, answers: ["No such option"] }] }),
    ).toEqual({})
    const seeded = answersFromGuidedCapture({
      lensId: GUIDED_TOOL_ID,
      capturedAt: "",
      prompts: [
        { promptId: GUIDED_START_ID, answers: ["My own experience"] },
        { promptId: "no-such-question", answers: ["y"] },
      ],
    })
    expect(Object.keys(seeded)).toEqual([GUIDED_START_ID])
  })
})

describe("guidedProgressLabel", () => {
  it("shows the total only once the route is known", () => {
    expect(guidedProgressLabel(0, resolveGuidedPath({}))).toBe("Question 1")
    const path = resolveGuidedPath({ ...start("problems"), ...voice("problems", "problems-mine") })
    expect(guidedProgressLabel(2, path)).toBe(`Question 3 of ${path.nodes.length}`)
  })
})
