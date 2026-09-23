/**
 * Pure rules for the Guided discovery tool: which questions a run passes
 * through given its answers so far, what those answers add up to, and how a
 * run is saved on a problem and read back. The content lives in
 * `src/data/guidedDiscovery.ts`; the flow (`identify/guided/`) only renders
 * what these functions return.
 *
 * A run is: the first question (which dimension to start from), then that
 * route's steps in order. The anchor fills its dimension's column, the voice
 * choice picks the wording of everything after it, and every other step is a
 * shared slot. The nodes below are built fresh from the answers each time,
 * so nothing about the path is stored.
 */
import {
  GUIDED_OPTION_FIELD,
  GUIDED_ROUTES,
  GUIDED_START,
  GUIDED_START_ID,
  GUIDED_TOOL_ID,
  getGuidedRoute,
  getGuidedSlot,
  guidedAnchorId,
  guidedVoiceId,
  type GuidedChoiceNode,
  type GuidedCopy,
  type GuidedNode,
  type GuidedOption,
  type GuidedPromptNode,
  type GuidedRoute,
  type GuidedWording,
} from "@/data/guidedDiscovery"
import type { DimensionKey } from "@/lib/dimension-visuals"
import type { ReflectAnswer } from "@/store/reflect-sessions-model"
import type { ReflectionCapture } from "@/types/reflection"

/** A run's answers, keyed by node id, in the same shape the lenses use. */
export type GuidedAnswers = Record<string, ReflectAnswer[]>

/**
 * The questions a run has reached, in order. `complete` is true once every
 * step of the route is known, which needs both choices answered: until then
 * the path stops at the unanswered choice.
 */
export type GuidedPath = {
  nodes: GuidedNode[]
  complete: boolean
}

/** The option a choice node was answered with, or null while it is unanswered. */
export function chosenOption(node: GuidedChoiceNode, answers: GuidedAnswers): GuidedOption | null {
  const answer = answers[node.id]?.[0]
  if (!answer) return null
  const byId = answer.context?.[GUIDED_OPTION_FIELD]
  if (byId) {
    const option = node.options.find((o) => o.id === byId)
    if (option) return option
  }
  // A run seeded from a saved problem has only the option's label.
  const text = answer.text.trim().toLowerCase()
  if (text.length === 0) return null
  return node.options.find((o) => o.label.trim().toLowerCase() === text) ?? null
}

/** The first question: one option per route, each carrying its dimension. */
export function guidedStartNode(): GuidedChoiceNode {
  return {
    kind: "choice",
    id: GUIDED_START_ID,
    question: GUIDED_START.question,
    helperText: GUIDED_START.helperText,
    options: GUIDED_ROUTES.map((route) => ({ ...route.option, dimension: route.dimension })),
  }
}

function voiceNode(route: GuidedRoute): GuidedChoiceNode {
  return {
    kind: "choice",
    id: guidedVoiceId(route.dimension),
    question: route.voice.copy.question,
    helperText: route.voice.copy.helperText,
    options: route.voice.options.map((option) => ({ ...option })),
  }
}

/** The wording for a route and voice: the voice's variant over the dimension's over the default. */
export function resolveGuidedCopy(wording: GuidedWording, dimension: DimensionKey, voiceId: string | null): GuidedCopy {
  return {
    ...wording.copy,
    ...wording.variants?.[dimension],
    ...(voiceId ? wording.variants?.[voiceId] : undefined),
  }
}

/** The dimension the run starts from: the first question's answer, or null before it is made. */
export function guidedStartingDimension(answers: GuidedAnswers): DimensionKey | null {
  return chosenOption(guidedStartNode(), answers)?.dimension ?? null
}

/** The voice chosen on the route, or null before it is. */
export function guidedVoice(answers: GuidedAnswers, route: GuidedRoute): string | null {
  return chosenOption(voiceNode(route), answers)?.id ?? null
}

/**
 * Walk the route the first answer chose, step by step, wording each question
 * for the voice. The path stops at the first unanswered choice, because the
 * wording of what follows is not known until it is made.
 */
export function resolveGuidedPath(answers: GuidedAnswers): GuidedPath {
  const start = guidedStartNode()
  const nodes: GuidedNode[] = [start]
  const dimension = chosenOption(start, answers)?.dimension ?? null
  const route = dimension ? getGuidedRoute(dimension) : undefined
  if (!dimension || !route) return { nodes, complete: false }

  const voiceId = guidedVoice(answers, route)
  for (const step of route.steps) {
    if (step === "voice") {
      nodes.push(voiceNode(route))
      if (voiceId === null) return { nodes, complete: false }
      continue
    }
    if (step === "anchor") {
      nodes.push({
        kind: "prompt",
        id: guidedAnchorId(dimension),
        ...resolveGuidedCopy(route.anchor, dimension, voiceId),
        multipleAllowed: false,
        role: dimension,
        anchor: true,
      })
      continue
    }
    const slotId = typeof step === "string" ? step : step.slot
    if (typeof step !== "string" && voiceId !== null && !step.voices.includes(voiceId)) continue
    const slot = getGuidedSlot(slotId)
    // A step naming nothing, or the column the anchor already fills, is left out rather than asked.
    if (!slot || slot.role === dimension) continue
    nodes.push({
      kind: "prompt",
      id: slot.id,
      ...resolveGuidedCopy(slot, dimension, voiceId),
      multipleAllowed: slot.multipleAllowed,
      role: slot.role,
    })
  }
  return { nodes, complete: true }
}

/** The prompt on the path that names what the run is about, or null before the route is known. */
export function guidedAnchor(path: GuidedPath): GuidedPromptNode | null {
  for (const node of path.nodes) {
    if (node.kind === "prompt" && node.anchor) return node
  }
  return null
}

/** The prompt on the path whose answers are saved into the given column, or null when this route has none. */
export function guidedRoleNode(path: GuidedPath, role: DimensionKey): GuidedPromptNode | null {
  for (const node of path.nodes) {
    if (node.kind === "prompt" && node.role === role) return node
  }
  return null
}

/** The filled answers to one node, trimmed. */
export function filledAnswers(answers: GuidedAnswers, nodeId: string): string[] {
  return (answers[nodeId] ?? []).map((a) => a.text.trim()).filter((t) => t.length > 0)
}

/**
 * A problem can be saved once the route is complete, the anchor is answered
 * and at least one question beyond it has an answer.
 */
export function guidedHasCandidate(path: GuidedPath, answers: GuidedAnswers): boolean {
  if (!path.complete) return false
  const anchor = guidedAnchor(path)
  if (!anchor || filledAnswers(answers, anchor.id).length === 0) return false
  return path.nodes.some((node) => node.kind === "prompt" && !node.anchor && filledAnswers(answers, node.id).length > 0)
}

/**
 * The run as it is kept on the saved problem: every node on the path with an
 * answer, choices included (as the chosen option's label), so a later visit
 * can rebuild the same route. Answers to questions not on this route (left
 * from an earlier run down another) are left out.
 */
export function buildGuidedCapture(path: GuidedPath, answers: GuidedAnswers, capturedAt: string): ReflectionCapture {
  return {
    lensId: GUIDED_TOOL_ID,
    capturedAt,
    prompts: path.nodes
      .map((node) => ({ promptId: node.id, answers: filledAnswers(answers, node.id) }))
      .filter((entry) => entry.answers.length > 0),
  }
}

/** Whether a problem's reflection was captured with this tool rather than a lens. */
export function isGuidedCapture(capture: Pick<ReflectionCapture, "lensId"> | null | undefined): boolean {
  return capture?.lensId === GUIDED_TOOL_ID
}

function choiceAnswer(node: GuidedChoiceNode, label: string | undefined): ReflectAnswer[] | null {
  const wanted = label?.trim().toLowerCase() ?? ""
  const option = node.options.find((o) => o.label.trim().toLowerCase() === wanted)
  return option ? [{ text: option.label, context: { [GUIDED_OPTION_FIELD]: option.id } }] : null
}

/**
 * The reflection saved on a problem, turned back into session answers so
 * revisiting the tool starts from what was captured. Choices are stored as
 * their option's label; the option id is filled in here so the session is the
 * same as one answered by hand. A capture whose first answer names no route
 * cannot be rebuilt and seeds nothing.
 */
export function answersFromGuidedCapture(capture: ReflectionCapture): GuidedAnswers {
  if (!isGuidedCapture(capture)) return {}
  const byId = new Map(capture.prompts.map((entry) => [entry.promptId, entry.answers]))
  const out: GuidedAnswers = {}

  const start = guidedStartNode()
  const startAnswer = choiceAnswer(start, byId.get(GUIDED_START_ID)?.[0])
  if (!startAnswer) return {}
  out[GUIDED_START_ID] = startAnswer
  const dimension = chosenOption(start, out)!.dimension!
  const route = getGuidedRoute(dimension)
  if (!route) return {}

  const voice = voiceNode(route)
  const voiceAnswer = choiceAnswer(voice, byId.get(voice.id)?.[0])
  if (voiceAnswer) out[voice.id] = voiceAnswer

  const anchorId = guidedAnchorId(dimension)
  for (const [id, texts] of byId) {
    if (id === GUIDED_START_ID || id === voice.id) continue
    if (id !== anchorId && !getGuidedSlot(id)) continue
    out[id] = texts.map((text) => ({ text, context: {} }))
  }
  return out
}

/** The label to show for a question's position: "Question 3 of 9" once the route is known, "Question 3" before. */
export function guidedProgressLabel(index: number, path: GuidedPath): string {
  const current = index + 1
  return path.complete ? `Question ${current} of ${path.nodes.length}` : `Question ${current}`
}
