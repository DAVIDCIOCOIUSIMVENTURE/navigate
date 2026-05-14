import {
  Gauge, Rocket, Car, Home,
  Target, Stethoscope, ShoppingBag, Coffee,
  Coins, Building2, Code2, Plane,
  Clock, MessageSquare, Factory,
} from "lucide-react"
import type { MetricContent } from "./metric-strategy"

/**
 * The four solution validation metrics share the same shape but each carries
 * its own descriptive copy, scoring scale, and case studies. They live here
 * (rather than alongside their step pages) so the solution hub can render the
 * same scoring blocks the step pages do without crossing the Next.js
 * page-export contract.
 */

export const FEASIBILITY_CONTENT: MetricContent = {
  icon: Gauge,
  title: "Feasibility",
  summary: "Feasibility is about whether you can actually build this solution with the resources, skills, and technology available to you. It's not about whether the idea is good; it's about whether you can realistically ship it.",
  accent: "bg-secondary-brand",
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

export const IMPACT_CONTENT: MetricContent = {
  icon: Target,
  title: "Impact",
  summary: "Impact is about how much value the solution delivers: to the customer, to the business, or to both. A solution that solves a real pain for many people, or a big pain for a smaller group, is high impact. A nice-to-have is not.",
  accent: "bg-secondary-brand",
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

export const COST_CONTENT: MetricContent = {
  icon: Coins,
  title: "Cost",
  summary: "Cost captures what it will take to build, operate, and maintain the solution in money and equivalent resources. A higher score means higher cost, so a 1 is cheap and a 5 is expensive. Include engineering time, infrastructure, licensing, support, and ongoing maintenance.",
  accent: "bg-secondary-brand",
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

export const TIME_CONTENT: MetricContent = {
  icon: Clock,
  title: "Time to Implement",
  summary: "Time to implement is how long it will take to get this solution from decision to delivery, including design, build, test, and launch. A higher score means it takes longer. Think about calendar time, not just effort time.",
  accent: "bg-secondary-brand",
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
