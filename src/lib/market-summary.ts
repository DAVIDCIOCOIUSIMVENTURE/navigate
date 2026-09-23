// The Market opportunity card's sentences. The card carries three things: a
// line on the estimates behind the sizing, a line on the competition, and the
// three market figures as pills. The sentences adapt to what has been captured
// and are built here so the wording is tested rather than assembled in JSX.

import type { ValidationAssessment } from "@/types/validation"
import { DEFAULT_REACHABLE_SHARE } from "@/types/validation"
import { computeMarket, formatMoney } from "./market"
import { formatList } from "./project-preview"

/** "once", "twice" or "N times". */
function timesWord(frequency: number): string {
  if (frequency === 1) return "once"
  if (frequency === 2) return "twice"
  return `${frequency.toLocaleString()} times`
}

function sentence(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}

/**
 * The estimates behind the market size in one sentence, or null until the
 * people count and the price are both captured: "About 210,000 people hit
 * this 20 times per year and would pay £6 each time. The team expects to
 * reach 8% of them and win 10% of those."
 */
export function describeMarketEstimates(assessment: ValidationAssessment): string | null {
  const customers = assessment.howManyPeople.value ?? 0
  const frequency = assessment.howOften.value ?? 0
  const price = assessment.worthToThem.value ?? 0
  const currency = assessment.worthToThem.unit || "GBP"
  const { reachPct, obtainPct, ready } = computeMarket({
    customers,
    frequency,
    price,
    reachableShare: assessment.reachableShare ?? DEFAULT_REACHABLE_SHARE,
    obtainableShare: assessment.obtainableShare,
  })
  if (!ready) return null

  const unit = assessment.howOften.unit.trim() || "per year"
  const cadence = frequency > 0 ? ` ${timesWord(frequency)} ${unit}` : ""
  const people = `About ${customers.toLocaleString()} ${customers === 1 ? "person hits" : "people hit"} this${cadence} and would pay ${formatMoney(price, { currency })} each time.`
  const share = `The team expects to reach ${reachPct}% of them and win ${obtainPct}% of those.`
  return `${people} ${share}`
}

const COMPETITOR_SIZE_WORDS: Record<string, string> = {
  micro: "tiny",
  small: "small",
  medium: "medium-sized",
  large: "large",
  giant: "giant",
}

function level(metric: { level: string }): string | null {
  const word = metric.level.trim().toLowerCase()
  return word.length > 0 ? word : null
}

/**
 * The three competition signals as one sentence, or null when none is set:
 * "Competitors are small, the cost of switching is low and today's solutions
 * are poor."
 */
export function describeCompetitionSignals(assessment: ValidationAssessment): string | null {
  const size = level(assessment.competitorSize)
  const switching = level(assessment.costOfSwitching)
  const effectiveness = level(assessment.solutionEffectiveness)

  const clauses = [
    size ? `competitors are ${COMPETITOR_SIZE_WORDS[size] ?? size}` : null,
    switching
      ? switching === "none"
        ? "there is no cost of switching"
        : `the cost of switching is ${switching}`
      : null,
    effectiveness ? `today's solutions are ${effectiveness}` : null,
  ].filter((clause): clause is string => clause !== null)

  return clauses.length > 0 ? sentence(formatList(clauses)) : null
}
