import {
  Gauge, Rocket, Car, Home,
  Target, Stethoscope, ShoppingBag, Coffee,
  Coins, Building2, Code2, Plane,
  Clock, MessageSquare, Factory,
  Wrench, AlertTriangle, ShieldCheck, FlaskConical,
  Users, Megaphone, TrendingUp, Eye,
  Hammer, Receipt, Repeat, Scale,
  CalendarDays, Link2, GitBranch, Hourglass,
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
  intro: [
    "An idea on a whiteboard is cheap; shipping it is not. This step asks how confident you are that you, with the team and tools you have today, can turn the solution into something a customer can use. A low score does not mean stop, it means you owe yourself an honest plan for closing the gap before you commit.",
    "Read your own situation, not the industry's. Two teams looking at the same idea can land on very different scores depending on what they already know, who they can call on, and how much of the work is genuinely new. Be specific about what you have and what is missing.",
  ],
  readFor: [
    {
      icon: Wrench,
      iconBg: "bg-blue-900",
      title: "Skills and capabilities you already have",
      body: "What can your team build today without learning anything new? Count the engineering, design, research, and operational skills you can draw on without hiring or training from scratch.",
    },
    {
      icon: AlertTriangle,
      iconBg: "bg-orange-700",
      title: "Unknowns that have to be resolved first",
      body: "List the things you would have to figure out before you could realistically start. The more fundamental unknowns (new tech, untested assumptions, novel science) the lower the score.",
    },
    {
      icon: ShieldCheck,
      iconBg: "bg-emerald-800",
      title: "Regulatory, compliance, or external dependencies",
      body: "Approvals, certifications, partner integrations, and supplier contracts can all block delivery even when the build itself is straightforward. Treat each external dependency as a real risk, not a footnote.",
    },
    {
      icon: FlaskConical,
      iconBg: "bg-violet-800",
      title: "How quickly you could test a prototype",
      body: "If you could put a rough version in front of a customer this week, feasibility is high. If a meaningful test would take months, lower the score and plan for an intermediate experiment.",
    },
  ],
  pickLevel: "Treat the scale as anchored. Very hard means \"requires capabilities we do not have and cannot easily acquire\", hard means \"stretches our current skills with several unknowns\", moderate means \"a few significant gaps stand between us and a working version\", achievable means \"clear path to a prototype with minor unknowns\", and very achievable means \"we could build a working prototype this week\". If your evidence does not match an anchor, pick the lower level.",
  yourTurnTitle: "How feasible is this solution for your team?",
  yourTurnBody: "Pick the level that matches the team and tools you actually have, not the team you wish you had. An honest read now saves the project from optimistic timelines later.",
  strategyTitle: "Solution feasibility",
  strategyLabel: "How achievable is this solution for your team",
  strategyDescription: "Capture how confidently you could ship this with the skills, tooling, and dependencies available today. Lean on what you can already do, not what you could learn under pressure. A high score means a prototype is days away; a low score means real research or hiring stands in the way.",
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
      iconBg: "bg-red-800",
      company: "SpaceX (reusable rockets, 2010)",
      context: "Landing a rocket booster upright and reflying it had been attempted unsuccessfully for decades. SpaceX proposed doing it as a core business capability.",
      score: 1,
      reasoning: "Required breakthroughs in guidance control, engine throttling, and thermal protection that no one had commercialised. The team had no internal experience reflying orbital hardware, and every major subsystem was a research project.",
      outcome: "Took 9 years and several public crashes to achieve the first successful landing. A correct read of the feasibility risk would not have stopped the mission, but would have set honest expectations about cost and timelines.",
    },
    {
      icon: Car,
      iconBg: "bg-indigo-800",
      company: "Tesla (Model S engineering, 2009)",
      context: "Building a premium all-electric sedan with 200+ miles of range, using an existing battery chemistry but at much larger scale than anyone had attempted.",
      score: 3,
      reasoning: "The battery chemistry and motor technology existed. What did not exist was Tesla's ability to industrialise it: the team had shipped the Roadster in small volumes but had never built a sedan production line. A few significant gaps stood between them and delivery.",
      outcome: "Shipped on time with quality issues in the first year, which the team absorbed and fixed. The honest feasibility read would have predicted exactly this: they could do it, but the first production run would be rough.",
    },
    {
      icon: Home,
      iconBg: "bg-rose-800",
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
  intro: [
    "Impact is the answer to a simple question: if you never build this, who notices and how much do they care? A high-impact solution changes a customer's day or unlocks something the business could not do before. A low-impact one is a feature that nobody asks for after launch.",
    "Be careful with internal enthusiasm. The fact that your team finds the idea exciting tells you very little about whether customers will. Anchor the score in what customers have said and done, not in how clever the design feels.",
  ],
  readFor: [
    {
      icon: Users,
      iconBg: "bg-blue-900",
      title: "How many customers would notice",
      body: "Count who actually benefits, not who theoretically could. A solution that helps every customer is usually higher impact than one that helps a niche, but a deep niche with real urgency can outweigh a broad shallow benefit.",
    },
    {
      icon: Megaphone,
      iconBg: "bg-rose-800",
      title: "Whether customers would talk about it",
      body: "Strong impact shows up as word of mouth: people demoing the feature to colleagues, sharing screenshots, writing about it unprompted. If the best you can imagine is a polite acknowledgement, the score is lower than it feels.",
    },
    {
      icon: TrendingUp,
      iconBg: "bg-emerald-800",
      title: "Business outcomes the solution would move",
      body: "Think about revenue, retention, activation, or cost savings the solution would plausibly unlock. A clear story about which metric moves and by how much is the difference between a 3 and a 4.",
    },
    {
      icon: Eye,
      iconBg: "bg-orange-700",
      title: "What changes the day after launch",
      body: "Picture a customer's first week with the solution shipped. If you cannot describe one concrete behaviour that changes, the impact is probably minimal no matter how good the idea sounds in a deck.",
    },
  ],
  pickLevel: "Treat the scale as anchored. Minimal means \"most customers wouldn't notice\", modest means \"a narrow slice would appreciate it\", meaningful means \"visible benefit for a good portion of customers or a clear business outcome\", high means \"clearly changes how most customers use the product\", and transformative means \"customers would go out of their way to get this and it could shift competitive positioning\". If your evidence does not match an anchor, pick the lower level.",
  yourTurnTitle: "How much impact would this solution deliver?",
  yourTurnBody: "Pick the level that matches what customers and the business would actually feel, not what the team is hoping for. The honest signal is what customers have already asked for or worked around.",
  strategyTitle: "Solution impact",
  strategyLabel: "How much value would this deliver",
  strategyDescription: "Capture how much customers and the business would feel this if you shipped it. Count who actually benefits, how visibly their day changes, and which business metric you could plausibly move. A high score means people would seek the solution out; a low score means almost no one would notice.",
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
      iconBg: "bg-teal-700",
      company: "Dropbox (seamless file sync, 2008)",
      context: "Before Dropbox, sharing a file across devices meant emailing it to yourself or using awkward FTP tools.",
      score: 5,
      reasoning: "Solved a daily pain for essentially every knowledge worker. The value was immediate and obvious the first time someone saw it work. Competitors existed but none had got the core experience right.",
      outcome: "Grew from nothing to 50M users in four years largely on word of mouth. The transformative impact paid for a lot of feasibility risk and go-to-market spend.",
    },
    {
      icon: ShoppingBag,
      iconBg: "bg-orange-700",
      company: "Amazon Subscribe & Save (2007)",
      context: "A feature that let customers auto-reorder household consumables at a modest discount.",
      score: 3,
      reasoning: "Not revolutionary, but a meaningful convenience for a good portion of Prime customers. Drove retention and predictable recurring revenue for Amazon without needing to change customer behaviour much.",
      outcome: "Became a billions-in-GMV program without ever being the product's headline feature. A score of 3 is a very healthy place to be if feasibility is also strong.",
    },
    {
      icon: Coffee,
      iconBg: "bg-emerald-800",
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
  intro: [
    "Cost is more than the price tag on the build. It includes the team you tie up, the infrastructure you have to run for years, the support load you take on, and the things you will not build because this is in the way. Underweighting any of those turns a comfortable yes into a regret in twelve months.",
    "Project beyond year one. Most complex solutions look affordable when you only count the initial build, and reveal their real cost once they have to scale, integrate, and be supported by a team that turns over. Score the lifetime, not the launch.",
  ],
  readFor: [
    {
      icon: Hammer,
      iconBg: "bg-blue-900",
      title: "Build cost",
      body: "Engineering time, design, research, third-party tooling, and any specialist help you need to bring in. Convert effort to money even if you are paying it as opportunity cost rather than cash.",
    },
    {
      icon: Receipt,
      iconBg: "bg-emerald-800",
      title: "Run cost",
      body: "Infrastructure, support staff, licensing, customer operations, and anything else that recurs after launch. A modest build with a heavy run cost is more expensive than a big build that runs itself.",
    },
    {
      icon: Repeat,
      iconBg: "bg-orange-700",
      title: "Maintenance and complexity drag",
      body: "Every new surface adds to the cost of every future change. Score higher when the solution increases the number of moving parts the team will have to keep alive indefinitely.",
    },
    {
      icon: Scale,
      iconBg: "bg-violet-800",
      title: "Opportunity cost",
      body: "What will the team not build because they are building this? A solution that displaces a more valuable initiative carries a hidden cost that does not show up on any invoice.",
    },
  ],
  pickLevel: "Treat the scale as anchored. Negligible means \"a day or two of one person's time with no ongoing burden\", low means \"a couple of weeks for a small team with minor ongoing costs\", moderate means \"a focused quarter plus modest infrastructure\", high means \"multi-quarter investment or new headcount\", and very high means \"years of investment or operating costs that change the business model\". If your evidence does not match an anchor, pick the higher level.",
  yourTurnTitle: "How much will this cost to build and run?",
  yourTurnBody: "Pick the level that captures the full lifetime cost: build, run, maintain, and what you give up to ship it. Round up if you are unsure; surprise costs almost always land on the high side.",
  strategyTitle: "Solution cost",
  strategyLabel: "How expensive is this to build and run",
  strategyDescription: "Capture the full lifetime cost in money and equivalent resources: the build, the people, the infrastructure, the support load, and what the team will not build because they are building this. A low score means it slots into existing capacity; a high score means it reshapes the budget.",
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
      iconBg: "bg-yellow-600",
      company: "Amazon (opening Whole Foods checkout-free stores, 2018)",
      context: "Retrofitting grocery stores with cameras, shelf sensors, and computer vision to remove checkout entirely.",
      score: 5,
      reasoning: "Required new hardware, new software stacks, new operational playbooks, and years of iteration per store. Cost scaled linearly with stores opened, with no obvious path to reducing unit economics.",
      outcome: "Amazon eventually pulled back Just Walk Out from their flagship grocery stores because the cost did not support the impact. A correct early read of cost 5 should have set expectations for a much longer payback window.",
    },
    {
      icon: Code2,
      iconBg: "bg-violet-800",
      company: "Linear (keyboard shortcut overhaul, 2023)",
      context: "Adding a comprehensive keyboard shortcut system across the web app to match the preferences of their power-user audience.",
      score: 2,
      reasoning: "Bounded scope, clear technical approach, a couple of engineers for a few weeks. Ongoing maintenance fits inside existing work: shortcuts just travel with new features.",
      outcome: "Shipped on schedule. Low cost combined with meaningful impact for the most vocal segment of users is a near-automatic yes.",
    },
    {
      icon: Plane,
      iconBg: "bg-blue-900",
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
  intro: [
    "Calendar time is not the same as effort time. A solution that needs ten engineer-weeks of work but waits on a regulator, a vendor, or a quarterly approval cycle will land on the customer's desk months after the code is done. Score the wall clock, not the timesheet.",
    "Long timelines are not automatically bad, but they are riskier. The world moves while you build: competitors ship, customer needs shift, leadership priorities change. A high time-to-implement score should always come with a plan for staying relevant during the wait.",
  ],
  readFor: [
    {
      icon: CalendarDays,
      iconBg: "bg-blue-900",
      title: "Phases of work end to end",
      body: "Break the work into design, build, test, and launch and estimate calendar time for each. A realistic estimate is almost always longer than the team's first guess.",
    },
    {
      icon: Link2,
      iconBg: "bg-emerald-800",
      title: "Dependencies you do not control",
      body: "Other teams, vendors, approvals, data agreements, and infrastructure outside your patch all add weeks. Each unowned dependency should push your score up one level.",
    },
    {
      icon: GitBranch,
      iconBg: "bg-orange-700",
      title: "Likelihood of being blocked",
      body: "How often will the critical path stall while you wait for someone else? Frequent handoffs to slower teams or external bodies stretch timelines well beyond the optimistic plan.",
    },
    {
      icon: Hourglass,
      iconBg: "bg-violet-800",
      title: "Risk that the world changes mid-flight",
      body: "Long timelines compound risk. Watch for regulatory shifts, competitor moves, or shifts in customer behaviour that could land before you ship and force a rework.",
    },
  ],
  pickLevel: "Treat the scale as anchored. Days means \"could be shipped this week with no coordination\", weeks means \"a sprint or two with light coordination\", one quarter means \"a clearly scoped quarter with the critical path inside the team\", multiple quarters means \"6 to 12 months including external dependencies\", and year or more means \"a multi-year programme with long vendor, regulatory, or organisational cycles\". If your evidence does not match an anchor, pick the longer level.",
  yourTurnTitle: "How long will this take to deliver?",
  yourTurnBody: "Pick the level that captures end-to-end calendar time, including the parts you do not control. If you are tempted to split the difference, choose the longer option.",
  strategyTitle: "Time to implement",
  strategyLabel: "How long will this take end to end",
  strategyDescription: "Capture the calendar time from decision to delivery, not just the effort time on the timesheet. Include design, build, test, approvals, vendors, and anyone outside the team whose slowness can stall the critical path. Longer timelines compound risk, so be honest about the wait.",
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
      iconBg: "bg-emerald-800",
      company: "Slack (emoji reactions, 2016)",
      context: "A small team added reactions to messages as a way to reduce notification noise.",
      score: 2,
      reasoning: "Clear scope, self-contained, no cross-team dependencies. A few weeks from kickoff to launch, most of it spent on UI polish and emoji picker design.",
      outcome: "Shipped on a normal sprint cadence and became one of Slack's most loved features. Weeks-scale work with high impact is the best possible combination.",
    },
    {
      icon: Rocket,
      iconBg: "bg-indigo-800",
      company: "Stripe (Checkout v1, 2016)",
      context: "Stripe's hosted checkout page, meant to replace self-hosted payment forms for merchants.",
      score: 3,
      reasoning: "Scoped to a quarter but touched security, compliance, front-end frameworks, and merchant onboarding. The critical path was owned by one team but needed reviews from several adjacent ones.",
      outcome: "Shipped in a quarter as planned. The time read was realistic because the team deliberately bounded scope to what could fit inside one cycle.",
    },
    {
      icon: Factory,
      iconBg: "bg-orange-700",
      company: "Apple Silicon (M1 chip, announced 2020)",
      context: "Transitioning the entire Mac lineup away from Intel chips to Apple-designed ARM processors.",
      score: 5,
      reasoning: "Required custom chip fabrication, a new compiler toolchain, a Rosetta translation layer, developer co-ordination, and staggered product launches. Multi-year critical path.",
      outcome: "Announced in 2020 after years of internal work; full transition completed in 2023. Long timelines only work when the value is large enough to survive years of compounding risk.",
    },
  ],
}
