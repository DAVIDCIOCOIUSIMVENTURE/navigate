"use client"

import { Target, Stethoscope, ShoppingBag, Coffee } from "lucide-react"
import { MetricStep, type MetricContent } from "../_metric-step"
import { useSolutionValidation } from "../context"

const IMPACT_CONTENT: MetricContent = {
  icon: Target,
  title: "Impact",
  summary: "Impact is about how much value the solution delivers: to the customer, to the business, or to both. A solution that solves a real pain for many people, or a big pain for a smaller group, is high impact. A nice-to-have is not.",
  accent: "bg-primary",
  guidance: [
    "Picture the customer after adopting the solution: what changes in their day, week, or month?",
    "Count who benefits. A solution that helps every customer is usually higher impact than one that helps a niche.",
    "Think about revenue, retention, or cost savings the solution would unlock for the business.",
    "Ask whether a customer would notice or care if this was never built. If the answer is no, the score is low.",
  ],
  scale: [
    { score: 1, label: "Minimal", description: "Most customers wouldn't notice. Marginal improvement to something that already works fine." },
    { score: 2, label: "Modest", description: "A narrow slice of users would appreciate it. No meaningful business outcome expected." },
    { score: 3, label: "Meaningful", description: "A visible benefit for a good portion of customers, or a clear but modest business outcome (retention lift, cost savings)." },
    { score: 4, label: "High", description: "Clearly changes how most customers use the product. A plausible 10%+ lift in a top-line metric." },
    { score: 5, label: "Transformative", description: "Customers would go out of their way to get this. It could shift competitive positioning or open a new market." },
  ],
  caseStudies: [
    {
      icon: Stethoscope,
      company: "Dropbox (seamless file sync, 2008)",
      context: "Before Dropbox, sharing a file across devices meant emailing it to yourself or using awkward FTP tools.",
      score: 5,
      reasoning: "Solved a daily pain for essentially every knowledge worker. The value was immediate and obvious the first time someone saw it work. Competitors existed but none had got the core experience right.",
      outcome: "Grew from nothing to 50M users in four years largely on word of mouth. The transformative impact paid for a lot of feasibility risk and go-to-market spend.",
    },
    {
      icon: ShoppingBag,
      company: "Amazon Subscribe & Save (2007)",
      context: "A feature that let customers auto-reorder household consumables at a modest discount.",
      score: 3,
      reasoning: "Not revolutionary, but a meaningful convenience for a good portion of Prime customers. Drove retention and predictable recurring revenue for Amazon without needing to change customer behaviour much.",
      outcome: "Became a billions-in-GMV program without ever being the product's headline feature. A score of 3 is a very healthy place to be if feasibility is also strong.",
    },
    {
      icon: Coffee,
      company: "Starbucks (free in-store mug polish, early 2000s)",
      context: "A proposal to polish personal travel mugs for customers who brought them in.",
      score: 1,
      reasoning: "Very few customers would have used it. No meaningful business outcome expected. Solved a problem few people had while adding operational load for baristas already under pressure.",
      outcome: "Never shipped. A low impact score should almost always kill an initiative, even if it's feasible and cheap.",
    },
  ],
}

export default function ImpactPage() {
  const { impact, setImpact } = useSolutionValidation()
  return <MetricStep content={IMPACT_CONTENT} value={impact} onChange={setImpact} />
}
