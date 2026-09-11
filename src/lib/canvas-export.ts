import type { Problem } from "@/store/problems-model"
import { inspirationSourceLabel, type Solution } from "@/types/solution"
import type { CustomDimensionItem } from "@/store/custom-dimension-items-model"
import type { SelfDiscoveryItem } from "@/store/self-discovery-items-model"
import { resolveDimensionLabel } from "@/lib/dimension-labels"
import type { ValidationMetric, ValidationStatus } from "@/types/validation"

const STATUS_LABEL: Record<ValidationStatus, string> = {
  valid: "Valid",
  invalid: "Invalid",
  unsure: "Unsure",
  in_progress: "In progress",
  unvalidated: "Unvalidated",
}

function formatMetric(metric: ValidationMetric): string {
  const hasValue = metric.value !== null && metric.value !== undefined
  const hasLevel = Boolean(metric.level)
  if (!hasValue && !hasLevel) return "Not captured"
  const parts: string[] = []
  if (hasValue) parts.push(`${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`)
  if (hasLevel) parts.push(metric.level)
  return parts.join(" / ")
}

function bulletList(items: string[]): string {
  if (items.length === 0) return "  (none)"
  return items.map((s) => `  - ${s}`).join("\n")
}

function section(title: string, body: string): string {
  return `## ${title}\n${body}`
}

export function buildProblemExportText(
  problem: Problem,
  linkedSolutions: Solution[],
  customByColumn: Record<string, CustomDimensionItem[]>,
  selfDiscoveryItems: SelfDiscoveryItem[],
): string {
  const resolveIds = (columnId: string, ids: string[]) =>
    ids.map((id) => resolveDimensionLabel(columnId, id, customByColumn, selfDiscoveryItems))

  const va = problem.validationAssessment

  const lines: string[] = []
  lines.push(`# Problem Canvas`)
  lines.push("")
  lines.push(`Title: ${problem.title || "Untitled problem"}`)
  lines.push(`Status: ${STATUS_LABEL[problem.validationStatus ?? "unvalidated"]}`)
  lines.push(`Created: ${problem.createdAt}`)
  lines.push(`Edited: ${problem.editedAt}`)
  lines.push("")
  lines.push(section("Description", problem.description || "(none)"))
  lines.push("")

  lines.push(section("Customer", [
    "Segments:",
    bulletList(resolveIds("customers", problem.customers)),
    problem.customerDescription ? `Description: ${problem.customerDescription}` : "Description: (none)",
    problem.segmentSize != null ? `Segment size: ${problem.segmentSize.toLocaleString()}` : "Segment size: (not captured)",
  ].join("\n")))
  lines.push("")

  lines.push(section("Context", [
    "Contexts:",
    bulletList(resolveIds("contexts", problem.contexts)),
    problem.contextWhen ? `When: ${problem.contextWhen}` : "When: (none)",
  ].join("\n")))
  lines.push("")

  lines.push(section("Problem types", bulletList(resolveIds("problems", problem.problems))))
  lines.push("")

  const jobLine = (j: { text: string; intensity: string }) =>
    `${j.text}${j.intensity ? ` (${j.intensity})` : ""}`
  const jobs = problem.jobsToBeDone
  lines.push(section("Jobs to be done", [
    "Functional:",
    bulletList(jobs?.functional?.map((j) => j.text) ?? []),
    "Emotional:",
    bulletList(jobs?.emotional?.map(jobLine) ?? []),
    "Social:",
    bulletList(jobs?.social?.map(jobLine) ?? []),
  ].join("\n")))
  lines.push("")

  lines.push(section("Validation metrics", [
    `How many customers: ${formatMetric(va.howManyPeople)}`,
    `Frequency (how often): ${formatMetric(va.howOften)}`,
    `Price they'd pay: ${formatMetric(va.worthToThem)}`,
    `Reachable share of the market: ${va.reachableShare ?? 0}%`,
    `Realistic share you can win: ${va.obtainableShare}%`,
    `Cost of switching: ${formatMetric(va.costOfSwitching)}`,
    `Solution effectiveness: ${formatMetric(va.solutionEffectiveness)}`,
    `Competitor size: ${formatMetric(va.competitorSize)}`,
  ].join("\n")))
  lines.push("")

  const existing = problem.existingSolutions.length === 0
    ? "  (none)"
    : problem.existingSolutions.map((s) => {
        const head = `  - ${s.text || "Untitled solution"}`
        if (s.shortcomings.length === 0) return head
        const shortLines = s.shortcomings.map((sc) => `      * ${sc.text}`).join("\n")
        return `${head}\n${shortLines}`
      }).join("\n")
  lines.push(section("Existing solutions", existing))
  lines.push("")

  lines.push(section(`Solutions (${linkedSolutions.length})`,
    linkedSolutions.length === 0
      ? "  (none)"
      : linkedSolutions.map((sol) => formatSolutionBlock(sol)).join("\n\n"),
  ))
  lines.push("")

  return lines.join("\n")
}

function formatSolutionBlock(sol: Solution): string {
  const out: string[] = []
  out.push(`### ${sol.title || `Solution #${sol.id}`}`)
  out.push(`Status: ${STATUS_LABEL[sol.validationStatus ?? "unvalidated"]}`)
  if (sol.description) out.push(`Description: ${sol.description}`)
  if (sol.inspirationSource) {
    const detail = sol.inspirationDetail ? ` (${sol.inspirationDetail})` : ""
    out.push(`Method used: ${inspirationSourceLabel(sol.inspirationSource)}${detail}`)
  }
  const score = (n: number | null) => (n == null ? "not scored" : `${n} / 5`)
  out.push(`Feasibility: ${score(sol.feasibility)} (1 hard, 5 easy)`)
  out.push(`Impact: ${score(sol.impact)} (1 low, 5 high)`)
  out.push(`Cost: ${score(sol.cost)} (1 cheap, 5 expensive)`)
  out.push(`Time to implement: ${score(sol.timeToImplement)} (1 fast, 5 slow)`)
  return out.join("\n")
}

export function buildSolutionExportText(
  solution: Solution,
  linkedProblem: Problem | null,
): string {
  const lines: string[] = []
  lines.push(`# Solution Canvas`)
  lines.push("")
  lines.push(`Title: ${solution.title || "Untitled solution"}`)
  lines.push(`Status: ${STATUS_LABEL[solution.validationStatus ?? "unvalidated"]}`)
  lines.push(`Created: ${solution.createdAt}`)
  lines.push(`Edited: ${solution.editedAt}`)
  lines.push("")
  const linkedProblemBlock = linkedProblem
    ? [
        `Title: ${linkedProblem.title || `Problem #${linkedProblem.id}`}`,
        linkedProblem.description ? `Description: ${linkedProblem.description}` : null,
      ].filter(Boolean).join("\n")
    : "(not linked)"
  lines.push(section("Linked problem", linkedProblemBlock))
  lines.push("")
  lines.push(section("Description", solution.description || "(none)"))
  lines.push("")
  if (solution.inspirationSource || solution.inspirationDetail) {
    lines.push(section("Method used", [
      solution.inspirationSource ? `Method: ${inspirationSourceLabel(solution.inspirationSource)}` : null,
      solution.inspirationDetail ? `Detail: ${solution.inspirationDetail}` : null,
    ].filter(Boolean).join("\n")))
    lines.push("")
  }
  const score = (n: number | null) => (n == null ? "not scored" : `${n} / 5`)
  lines.push(section("Scores", [
    `Feasibility: ${score(solution.feasibility)} (1 hard, 5 easy)`,
    `Impact: ${score(solution.impact)} (1 low, 5 high)`,
    `Cost: ${score(solution.cost)} (1 cheap, 5 expensive)`,
    `Time to implement: ${score(solution.timeToImplement)} (1 fast, 5 slow)`,
  ].join("\n")))
  lines.push("")
  return lines.join("\n")
}

export function downloadTextFile(filename: string, contents: string) {
  if (typeof window === "undefined") return
  const blob = new Blob([contents], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function safeFilename(name: string, fallback: string): string {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "")
  return cleaned.length > 0 ? cleaned.slice(0, 60) : fallback
}
