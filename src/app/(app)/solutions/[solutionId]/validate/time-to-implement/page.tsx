"use client"

import { Clock, MessageSquare, Rocket, Factory } from "lucide-react"
import { MetricStep, type MetricContent } from "../_metric-step"
import { useSolutionValidation } from "../context"

const TIME_CONTENT: MetricContent = {
  icon: Clock,
  title: "Time to Implement",
  summary: "Time to implement is how long it will take to get this solution from decision to delivery, including design, build, test, and launch. A higher score means it takes longer. Think about calendar time, not just effort time.",
  accent: "bg-purple-600",
  guidance: [
    "Break the work into phases: design, build, test, launch. Estimate calendar time for each.",
    "Account for dependencies: other teams, vendors, approvals, or data that must come together.",
    "Factor in how often the work could be blocked by things outside your control.",
    "Longer timelines are not always bad, but they are riskier: the world changes while you build.",
  ],
  scale: [
    { score: 1, label: "Days", description: "Could be shipped this week. Minimal coordination, no waiting on anyone else." },
    { score: 2, label: "Weeks", description: "A sprint or two. Some coordination but no hard dependencies." },
    { score: 3, label: "One quarter", description: "A clearly scoped quarter of focused work. Coordination with 1-2 adjacent teams, but the critical path is owned by you." },
    { score: 4, label: "Multiple quarters", description: "6-12 months including dependencies, approvals, or infrastructure work outside the core team." },
    { score: 5, label: "Year or more", description: "A multi-year programme. Long cycles for vendors, regulation, hardware, or organisational change." },
  ],
  caseStudies: [
    {
      icon: MessageSquare,
      company: "Slack (emoji reactions, 2016)",
      context: "A small team added reactions to messages as a way to reduce notification noise.",
      score: 2,
      reasoning: "Clear scope, self-contained, no cross-team dependencies. A few weeks from kickoff to launch, most of it spent on UI polish and emoji picker design.",
      outcome: "Shipped on a normal sprint cadence and became one of Slack's most loved features. Weeks-scale work with high impact is the best possible combination.",
    },
    {
      icon: Rocket,
      company: "Stripe (Checkout v1, 2016)",
      context: "Stripe's hosted checkout page, meant to replace self-hosted payment forms for merchants.",
      score: 3,
      reasoning: "Scoped to a quarter but touched security, compliance, front-end frameworks, and merchant onboarding. The critical path was owned by one team but needed reviews from several adjacent ones.",
      outcome: "Shipped in a quarter as planned. The time read was realistic because the team deliberately bounded scope to what could fit inside one cycle.",
    },
    {
      icon: Factory,
      company: "Apple Silicon (M1 chip, announced 2020)",
      context: "Transitioning the entire Mac lineup away from Intel chips to Apple-designed ARM processors.",
      score: 5,
      reasoning: "Required custom chip fabrication, a new compiler toolchain, a Rosetta translation layer, developer co-ordination, and staggered product launches. Multi-year critical path.",
      outcome: "Announced in 2020 after years of internal work; full transition completed in 2023. Long timelines only work when the value is large enough to survive years of compounding risk.",
    },
  ],
}

export default function TimeToImplementPage() {
  const { timeToImplement, setTimeToImplement } = useSolutionValidation()
  return <MetricStep content={TIME_CONTENT} value={timeToImplement} onChange={setTimeToImplement} />
}
