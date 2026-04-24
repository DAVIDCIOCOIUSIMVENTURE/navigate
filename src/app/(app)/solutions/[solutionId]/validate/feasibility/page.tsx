"use client"

import { Gauge, Rocket, Car, Home } from "lucide-react"
import { MetricStep, type MetricContent } from "../_metric-step"
import { useSolutionValidation } from "../context"

const FEASIBILITY_CONTENT: MetricContent = {
  icon: Gauge,
  title: "Feasibility",
  summary: "Feasibility is about whether you can actually build this solution with the resources, skills, and technology available to you. It's not about whether the idea is good; it's about whether you can realistically ship it.",
  accent: "bg-primary",
  guidance: [
    "Audit what you already have: team skills, existing tech, available tooling, partnerships.",
    "List the biggest unknowns. The more fundamental unknowns you have, the lower the score.",
    "Consider regulatory or compliance requirements that could block or delay delivery.",
    "Ask whether a prototype could be built in days, weeks, or months, and whether key assumptions could be tested early.",
  ],
  scale: [
    { score: 1, label: "Very hard", description: "Requires capabilities you don't have and can't easily acquire. Most assumptions are untested, and a prototype would take many months." },
    { score: 2, label: "Hard", description: "Stretches your team's current skills. Several unknowns would need resolving before you could realistically start." },
    { score: 3, label: "Moderate", description: "You have most of what you need, but a few significant gaps (a hire, a partnership, a technology spike) stand between you and a working version." },
    { score: 4, label: "Achievable", description: "You can see a clear path to a prototype. Minor unknowns remain, but nothing that would derail delivery." },
    { score: 5, label: "Very achievable", description: "You could build a working prototype this week with your current team and tools." },
  ],
  caseStudies: [
    {
      icon: Rocket,
      company: "SpaceX (reusable rockets, 2010)",
      context: "Landing a rocket booster upright and reflying it had been attempted unsuccessfully for decades. SpaceX proposed doing it as a core business capability.",
      score: 1,
      reasoning: "Required breakthroughs in guidance control, engine throttling, and thermal protection that no one had commercialised. The team had no internal experience reflying orbital hardware, and every major subsystem was a research project.",
      outcome: "Took 9 years and several public crashes to achieve the first successful landing. A correct read of the feasibility risk would not have stopped the mission, but would have set honest expectations about cost and timelines.",
    },
    {
      icon: Car,
      company: "Tesla (Model S engineering, 2009)",
      context: "Building a premium all-electric sedan with 200+ miles of range, using an existing battery chemistry but at much larger scale than anyone had attempted.",
      score: 3,
      reasoning: "The battery chemistry and motor technology existed. What did not exist was Tesla's ability to industrialise it: the team had shipped the Roadster in small volumes but had never built a sedan production line. A few significant gaps stood between them and delivery.",
      outcome: "Shipped on time with quality issues in the first year, which the team absorbed and fixed. The honest feasibility read would have predicted exactly this: they could do it, but the first production run would be rough.",
    },
    {
      icon: Home,
      company: "Airbnb (air mattresses, 2007)",
      context: "Two founders with design backgrounds wanted to let strangers book air mattresses in their apartment during a design conference when hotels sold out.",
      score: 5,
      reasoning: "A weekend of work on a basic website was enough to test it. No new technology, no regulatory approvals, no staff; just a page, three air mattresses, and an email inbox.",
      outcome: "Launched in a weekend, validated the concept with three guests, and used the learnings to raise funding. When feasibility is very high, you test quickly and iterate.",
    },
  ],
}

export default function FeasibilityPage() {
  const { feasibility, setFeasibility } = useSolutionValidation()
  return (
    <MetricStep content={FEASIBILITY_CONTENT} value={feasibility} onChange={setFeasibility} />
  )
}
