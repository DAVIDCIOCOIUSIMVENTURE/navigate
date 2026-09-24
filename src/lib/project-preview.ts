/**
 * Pure helpers for the public project preview (`/preview/<id>`).
 *
 * The preview shows the same work as the app, but written out rather than
 * laid out in fields: a reader who has never used Navigate, a teacher marking
 * the work, should be able to read it top to bottom. All the wording that
 * adapts to the data lives here so it stays testable and out of the page.
 *
 * Nothing in this file touches the store or the DOM: callers pass in labels
 * that have already been resolved (dimension ids are translated by
 * `src/lib/dimension-labels.ts` before they get here).
 */
import type { Problem } from "@/store/problems-model"
import type { Solution, SolutionMetricKey } from "@/types/solution"
import type {
  DecisionLevel,
  JobKind,
  JobsToBeDone,
  ValidationAssessment,
  ValidationMetric,
  ValidationStatus,
} from "@/types/validation"
import { DEFAULT_REACHABLE_SHARE } from "@/types/validation"
import { clampPercent, computeMarket, formatMoney } from "@/lib/market"
import { listAllJobs, resolveAnchorJob } from "@/lib/jobs"
import type { JourneyStepId } from "@/lib/journey-steps"
import {
  COST_CONTENT,
  FEASIBILITY_CONTENT,
  IMPACT_CONTENT,
  TIME_CONTENT,
} from "@/components/solution-strategies/metric-content"

/* ------------------------------------------------------------------ */
/*  Small language helpers                                             */
/* ------------------------------------------------------------------ */

const NUMBER_WORDS = [
  "no", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten",
]

/** Small counts read better as words in a sentence; larger ones as figures. */
export function countWord(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "no"
  const whole = Math.floor(count)
  return whole < NUMBER_WORDS.length ? NUMBER_WORDS[whole] : whole.toLocaleString()
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural
}

/** Join items the way UK prose does: "a, b and c", with no serial comma. */
export function formatList(items: readonly string[], conjunction: "and" | "or" = "and"): string {
  const clean = items.map((item) => item.trim()).filter((item) => item.length > 0)
  if (clean.length === 0) return ""
  if (clean.length === 1) return clean[0]
  return `${clean.slice(0, -1).join(", ")} ${conjunction} ${clean[clean.length - 1]}`
}

/** A level such as "medium" as it reads mid-sentence, or null when unset. */
export function levelWord(level: DecisionLevel | undefined | null): string | null {
  const trimmed = (level ?? "").trim()
  return trimmed.length > 0 ? trimmed : null
}

/** "12 per week", "12", "per week", or null when the metric holds nothing. */
export function metricText(metric: ValidationMetric | undefined): string | null {
  if (!metric) return null
  const parts: string[] = []
  if (metric.value !== null && Number.isFinite(metric.value)) parts.push(metric.value.toLocaleString())
  if (metric.unit.trim().length > 0) parts.push(metric.unit.trim())
  const text = parts.join(" ")
  return text.length > 0 ? text : null
}

/* ------------------------------------------------------------------ */
/*  How far the project has come                                       */
/* ------------------------------------------------------------------ */

/** The milestone labels as they read in a sentence about what has been done. */
const PROGRESS_PHRASES: Record<JourneyStepId, string> = {
  "identify-problems": "identified a problem",
  "explore-problems": "explored it in depth",
  "validate-problems": "reached a verdict on whether it is worth solving",
  "identify-solutions": "found solutions for it",
  "validate-solutions": "scored at least one of those solutions",
}

/**
 * One sentence on how far the project has travelled, for the top of the
 * preview. Takes the completed milestones from `completedJourneySteps`.
 */
export function describeProgress(completed: readonly JourneyStepId[]): string {
  const phrases = completed.map((id) => PROGRESS_PHRASES[id]).filter(Boolean)
  if (phrases.length === 0) return "This project has not started work on a problem yet."
  return `So far this team has ${formatList(phrases)}.`
}

/* ------------------------------------------------------------------ */
/*  The problem: who has it, and when                                  */
/* ------------------------------------------------------------------ */

/**
 * The lead-in above the customer and context lists. The lists themselves are
 * rendered by the page (their ids need resolving to labels first), so this
 * only has to set them up and therefore only needs to know how many there are.
 */
export function describeAudience(people: number, places: number): string {
  if (people === 0 && places === 0) {
    return "The team has not yet pinned down who has this problem or when it comes up."
  }
  const clauses: string[] = []
  if (people > 0) {
    clauses.push(`${countWord(people)} ${pluralise(people, "group", "groups")} of people`)
  }
  if (places > 0) {
    clauses.push(`${countWord(places)} ${pluralise(places, "situation", "situations")}`)
  }
  if (people > 0 && places > 0) {
    return `The team has this problem down to ${clauses[0]}, feeling it in ${clauses[1]}.`
  }
  if (people > 0) return `The team has this problem down to ${clauses[0]}.`
  return `The team has narrowed this problem to ${clauses[0]}, without yet saying who is in them.`
}

/** "About 40,000 of them", for the segment size, or null when unset. */
export function describeSegmentSize(segmentSize: number | null): string | null {
  if (segmentSize === null || !Number.isFinite(segmentSize) || segmentSize <= 0) return null
  return `The team puts that at roughly ${segmentSize.toLocaleString()} ${pluralise(segmentSize, "person", "people")}.`
}

/* ------------------------------------------------------------------ */
/*  Jobs to be done                                                    */
/* ------------------------------------------------------------------ */

export const JOB_KIND_COPY: Record<JobKind, { label: string; blurb: string }> = {
  functional: {
    label: "Practical jobs",
    blurb: "The tasks they are trying to finish.",
  },
  emotional: {
    label: "Emotional jobs",
    blurb: "How they want the situation to make them feel.",
  },
  social: {
    label: "Social jobs",
    blurb: "How they want to be seen by other people while they do it.",
  },
}

/** Counts the jobs recorded in each list. */
export function countJobs(jobs: JobsToBeDone): Record<JobKind, number> {
  return {
    functional: jobs.functional.filter((job) => job.text.trim().length > 0).length,
    emotional: jobs.emotional.filter((job) => job.text.trim().length > 0).length,
    social: jobs.social.filter((job) => job.text.trim().length > 0).length,
  }
}

/** The lead-in above the three job lists. */
export function describeJobs(jobs: JobsToBeDone): string {
  const counts = countJobs(jobs)
  const total = counts.functional + counts.emotional + counts.social
  if (total === 0) {
    return "The team has not yet recorded what these people are trying to get done."
  }
  const breakdown = (Object.keys(counts) as JobKind[])
    .filter((kind) => counts[kind] > 0)
    .map((kind) => `${countWord(counts[kind])} ${kind}`)
  return `People in this situation are trying to get ${countWord(total)} ${pluralise(total, "thing", "things")} done: ${formatList(breakdown)}.`
}

/** How strongly a job is felt, as it reads after the job itself. */
export function jobIntensityPhrase(intensity: string): string | null {
  switch (intensity) {
    case "mild":
      return "felt mildly"
    case "strong":
      return "felt strongly"
    case "unbearable":
      return "unbearable"
    default:
      return null
  }
}

/**
 * The one job the price is anchored on, written out. A customer hires a
 * solution for a single job, so this is the job the money question rests on.
 */
export function describeAnchorJob(problem: Pick<Problem, "jobsToBeDone" | "validationAssessment">): string | null {
  const anchor = resolveAnchorJob(problem.jobsToBeDone, problem.validationAssessment.anchorJob)
  if (!anchor) return null
  return `The money below rests on one job in particular: ${anchor.job.text.trim()}.`
}

/** True when at least one job has been written down. */
export function hasJobs(jobs: JobsToBeDone): boolean {
  return listAllJobs(jobs).length > 0
}

/* ------------------------------------------------------------------ */
/*  How the problem is handled today                                   */
/* ------------------------------------------------------------------ */

export function describeExistingSolutions(count: number, shortcomingCount: number): string {
  if (count === 0) {
    return "The team has not recorded how people cope with this problem today."
  }
  const lead = `People already have ${countWord(count)} ${pluralise(count, "way", "ways")} of coping with this.`
  if (shortcomingCount === 0) return `${lead} None of the gaps in them have been written down yet.`
  return `${lead} Between them the team found ${countWord(shortcomingCount)} ${pluralise(shortcomingCount, "shortcoming", "shortcomings")}, which is where a better answer would have to start.`
}

/* ------------------------------------------------------------------ */
/*  What the problem could be worth                                    */
/* ------------------------------------------------------------------ */

export type MarketStory = {
  ready: boolean
  currency: string
  /** Sentences describing the sizing, in reading order. */
  paragraphs: string[]
  figures: { label: string; blurb: string; value: string }[]
}

/**
 * The market sizing as prose plus three figures. TAM, SAM and SOM are never
 * named here: the preview is read by people who have not sat through the
 * validation flow, so they stay "total", "reachable" and "realistic".
 */
export function describeMarket(assessment: ValidationAssessment): MarketStory {
  const currency = assessment.worthToThem.unit || "GBP"
  const customers = assessment.howManyPeople.value ?? 0
  const frequency = assessment.howOften.value ?? 0
  const price = assessment.worthToThem.value ?? 0
  const { totalMarket, reachableMarket, realisticShare, reachPct, obtainPct, ready } = computeMarket({
    customers,
    frequency,
    price,
    reachableShare: assessment.reachableShare ?? DEFAULT_REACHABLE_SHARE,
    obtainableShare: assessment.obtainableShare,
  })

  if (!ready) {
    return {
      ready: false,
      currency,
      paragraphs: ["The team has not yet put numbers on how big this problem is."],
      figures: [],
    }
  }

  const money = (value: number) => formatMoney(value, { currency, compact: true })
  const howOften = metricText(assessment.howOften)
  const paragraphs = [
    `The team counts about ${customers.toLocaleString()} ${pluralise(customers, "person", "people")} with this problem${howOften ? `, and reckons it comes round ${howOften}` : ""}.`,
    `Each time it does, those people would happily pay ${formatMoney(price, { currency })} to have it taken away.`,
    `Multiplied out, that makes the whole market worth roughly ${money(totalMarket)}. The team expects to be able to reach ${clampPercent(reachPct)}% of it, and to realistically win ${clampPercent(obtainPct)}% of what it reaches.`,
  ]

  return {
    ready: true,
    currency,
    paragraphs,
    figures: [
      { label: "The total market", blurb: "Everyone with the problem, paying every time it happens.", value: money(totalMarket) },
      { label: "The reachable market", blurb: `The ${clampPercent(reachPct)}% this team could actually serve.`, value: money(reachableMarket) },
      { label: "A realistic share", blurb: `The ${clampPercent(obtainPct)}% of that it expects to win.`, value: money(realisticShare) },
    ],
  }
}

/* ------------------------------------------------------------------ */
/*  The competition                                                    */
/* ------------------------------------------------------------------ */

export type CompetitionSignal = { label: string; question: string; value: string | null }

/** The three competitive signals, each with the question it answers. */
export function describeCompetition(assessment: ValidationAssessment): CompetitionSignal[] {
  return [
    {
      label: "Cost of switching",
      question: "How much it would take for someone to leave what they use today.",
      value: levelWord(assessment.costOfSwitching.level),
    },
    {
      label: "How well today's answers work",
      question: "How good the existing ways of coping already are.",
      value: levelWord(assessment.solutionEffectiveness.level),
    },
    {
      label: "Size of the competition",
      question: "How big the people already serving this problem are.",
      value: levelWord(assessment.competitorSize.level),
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Verdicts                                                           */
/* ------------------------------------------------------------------ */

export const PROBLEM_VERDICT_COPY: Record<ValidationStatus, { label: string; reading: string }> = {
  unvalidated: {
    label: "Not tested yet",
    reading: "The team has not yet decided whether this problem is worth solving.",
  },
  in_progress: {
    label: "Being tested",
    reading: "The team is still working through the evidence on this problem.",
  },
  valid: {
    label: "Worth solving",
    reading: "The team has concluded that this problem is real, widely felt and worth solving.",
  },
  invalid: {
    label: "Not worth solving",
    reading: "The team has concluded that this problem is not worth solving as it stands.",
  },
  unsure: {
    label: "Needs more evidence",
    reading: "The evidence pointed both ways, so the team has left the question open pending more research.",
  },
}

export const SOLUTION_VERDICT_COPY: Record<ValidationStatus, { label: string; reading: string }> = {
  unvalidated: { label: "Not scored yet", reading: "This candidate has not been tested yet." },
  in_progress: { label: "Being scored", reading: "The team is part way through scoring this candidate." },
  valid: { label: "Worth pursuing", reading: "The team decided this one is worth building." },
  invalid: { label: "Ruled out", reading: "The team ruled this one out." },
  unsure: { label: "Needs more evidence", reading: "The scores pointed both ways, so this one is on hold." },
}

/* ------------------------------------------------------------------ */
/*  The solutions                                                      */
/* ------------------------------------------------------------------ */

/** The lead-in above the list of solutions. */
export function describeSolutions(solutions: readonly Solution[]): string {
  if (solutions.length === 0) {
    return "No solutions have been captured for this problem yet."
  }
  const count = (status: ValidationStatus) => solutions.filter((solution) => solution.validationStatus === status).length
  const worthPursuing = count("valid")
  const ruledOut = count("invalid")
  // A candidate left open has been scored, so it belongs in the outcomes
  // rather than falling through to "none have been scored yet".
  const openQuestion = count("unsure")
  const lead = `The team came up with ${countWord(solutions.length)} ${pluralise(solutions.length, "candidate", "candidates")}.`
  const outcomes: string[] = []
  if (worthPursuing > 0) outcomes.push(`${countWord(worthPursuing)} judged worth pursuing`)
  if (openQuestion > 0) outcomes.push(`${countWord(openQuestion)} left open pending more evidence`)
  if (ruledOut > 0) outcomes.push(`${countWord(ruledOut)} ruled out`)
  if (outcomes.length === 0) return `${lead} None of them have been scored yet.`
  return `${lead} Of those, ${formatList(outcomes)}.`
}

/** How a candidate was arrived at, or null when the method was not recorded. */
export function describeMethod(solution: Pick<Solution, "inspirationSource" | "inspirationDetail">): string | null {
  const detail = solution.inspirationDetail.trim()
  switch (solution.inspirationSource) {
    case "scamper":
      return detail || "Found by running an existing solution through SCAMPER, a checklist of ways to transform it into a new one."
    case "reverse":
      return detail || "Found by asking how to make the problem worse, then turning each answer on its head."
    case "analogy":
      return detail || "Found by borrowing from how another field solves the same shape of problem."
    case "improve":
      return detail || "Found by taking what people already use and asking what would make it better."
    case "freeform":
      return detail || "Written down straight, without a prompt."
    default:
      return detail || null
  }
}

const METRIC_SCALES: Record<SolutionMetricKey, { label: string; scale: { score: number; label: string; description: string }[] }> = {
  feasibility: { label: "How buildable it is", scale: FEASIBILITY_CONTENT.scale },
  impact: { label: "How much difference it would make", scale: IMPACT_CONTENT.scale },
  cost: { label: "What it would cost", scale: COST_CONTENT.scale },
  timeToImplement: { label: "How long it would take", scale: TIME_CONTENT.scale },
}

export type SolutionScore = {
  key: SolutionMetricKey
  /** The question the score answers, in plain words. */
  label: string
  /** The word the validation flow uses for this score, for example "Achievable". */
  word: string
  /** The flow's own explanation of that score. */
  description: string
  score: number
}

/** The word the validation flow gives a 1-5 score, or null when unscored. */
export function solutionScoreWord(key: SolutionMetricKey, score: number | null | undefined): string | null {
  if (score == null || !Number.isFinite(score)) return null
  return METRIC_SCALES[key].scale.find((step) => step.score === score)?.label ?? null
}

/** The four validation scores of one candidate, written out. */
export function describeSolutionScores(solution: Solution): SolutionScore[] {
  return (Object.keys(METRIC_SCALES) as SolutionMetricKey[]).flatMap((key) => {
    const score = solution[key]
    if (score == null || !Number.isFinite(score)) return []
    const step = METRIC_SCALES[key].scale.find((entry) => entry.score === score)
    if (!step) return []
    return [{ key, label: METRIC_SCALES[key].label, word: step.label, description: step.description, score }]
  })
}

/* ------------------------------------------------------------------ */
/*  Dates                                                              */
/* ------------------------------------------------------------------ */

/** A stored ISO timestamp as a long UK date, or null when it cannot be read. */
export function formatPreviewDate(iso: string | undefined | null): string | null {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}
