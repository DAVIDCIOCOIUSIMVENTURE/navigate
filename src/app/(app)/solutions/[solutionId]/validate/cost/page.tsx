"use client"

import { Coins, Building2, Code2, Plane } from "lucide-react"
import { MetricStep, type MetricContent } from "../_metric-step"
import { useSolutionValidation } from "../context"

const COST_CONTENT: MetricContent = {
  icon: Coins,
  title: "Cost",
  summary: "Cost captures what it will take to build, operate, and maintain the solution in money and equivalent resources. A higher score means higher cost, so a 1 is cheap and a 5 is expensive. Include engineering time, infrastructure, licensing, support, and ongoing maintenance.",
  accent: "bg-primary",
  guidance: [
    "Estimate build cost: engineering time, design, research, and any third-party tooling.",
    "Estimate run cost: infrastructure, support staff, licensing, and customer operations over the first year.",
    "Factor in opportunity cost: what will the team not build if they build this?",
    "Remember that complex solutions grow more expensive as they scale; project out, don't just look at year one.",
  ],
  scale: [
    { score: 1, label: "Negligible", description: "A day or two of one person's time. No new infrastructure, no ongoing operational burden." },
    { score: 2, label: "Low", description: "A couple of weeks of work for a small team. Minor ongoing costs that fit comfortably within existing budgets." },
    { score: 3, label: "Moderate", description: "A focused quarter of engineering effort plus modest infrastructure and operational commitments. Visible in the budget but not threatening." },
    { score: 4, label: "High", description: "A multi-quarter investment, new headcount, or meaningful new infrastructure. Requires explicit planning and buy-in." },
    { score: 5, label: "Very high", description: "Years of investment, significant new teams or facilities, or operating costs that fundamentally change the business model." },
  ],
  caseStudies: [
    {
      icon: Building2,
      company: "Amazon (opening Whole Foods checkout-free stores, 2018)",
      context: "Retrofitting grocery stores with cameras, shelf sensors, and computer vision to remove checkout entirely.",
      score: 5,
      reasoning: "Required new hardware, new software stacks, new operational playbooks, and years of iteration per store. Cost scaled linearly with stores opened, with no obvious path to reducing unit economics.",
      outcome: "Amazon eventually pulled back Just Walk Out from their flagship grocery stores because the cost did not support the impact. A correct early read of cost 5 should have set expectations for a much longer payback window.",
    },
    {
      icon: Code2,
      company: "Linear (keyboard shortcut overhaul, 2023)",
      context: "Adding a comprehensive keyboard shortcut system across the web app to match the preferences of their power-user audience.",
      score: 2,
      reasoning: "Bounded scope, clear technical approach, a couple of engineers for a few weeks. Ongoing maintenance fits inside existing work: shortcuts just travel with new features.",
      outcome: "Shipped on schedule. Low cost combined with meaningful impact for the most vocal segment of users is a near-automatic yes.",
    },
    {
      icon: Plane,
      company: "Boeing (787 Dreamliner composites, early 2000s)",
      context: "Replacing aluminium with carbon-fibre composites as the primary structure of a new widebody aircraft.",
      score: 5,
      reasoning: "Required new factories, new supplier relationships, new certification processes, and multi-billion-dollar tooling. Cost was visible from day one to anyone who could read an industrial roadmap.",
      outcome: "Delivered three years late and billions over budget. The cost read was correct; what the programme underweighted was how long the cost would take to amortise.",
    },
  ],
}

export default function CostPage() {
  const { cost, setCost } = useSolutionValidation()
  return <MetricStep content={COST_CONTENT} value={cost} onChange={setCost} />
}
