export type AffectedGroupEntry = {
  name: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
}

export type AffectedGroupsCaseStudy = {
  company: string
  problem: string
  groups: AffectedGroupEntry[]
  outcome: string
}

export const AFFECTED_GROUPS_CASE_STUDIES: AffectedGroupsCaseStudy[] = [
  {
    company: "Uber (early ride-hail launch)",
    problem: "In most major cities, getting a taxi at peak times or in outer neighbourhoods was unreliable, and the experience of paying, tipping, and trusting the driver felt opaque.",
    groups: [
      {
        name: "Late-night commuters",
        severity: "critical",
        description: "Hospitality workers, hospital staff, and bar customers regularly stranded after public transport stopped, with cabs refusing to serve outer neighbourhoods. Personal safety, not just convenience, was at stake.",
      },
      {
        name: "Business travellers",
        severity: "high",
        description: "Needed receipts, predictable pricing, and a way to pay without cash in unfamiliar cities. Existing cab fleets handled expensing and credit cards inconsistently across markets.",
      },
      {
        name: "Tourists and non-locals",
        severity: "high",
        description: "Did not speak the local language, did not know fair fares, and were vulnerable to being overcharged or taken on long routes. Trust was the dominant pain point.",
      },
      {
        name: "Suburban and outer-borough residents",
        severity: "high",
        description: "Cabs concentrated in dense central areas, leaving anyone outside that zone with long waits, high refusal rates, and no reliable alternative to driving themselves.",
      },
      {
        name: "Drivers themselves",
        severity: "medium",
        description: "Medallion taxi drivers worked under high lease costs and unpredictable income; private vehicle owners had no easy way to monetise idle hours behind the wheel.",
      },
      {
        name: "Occasional city users",
        severity: "low",
        description: "Locals with their own car who only needed a ride a few times a year had a real but infrequent pain. Worth knowing about, but not the wedge to lead with.",
      },
    ],
    outcome: "Uber prioritised the high-severity groups first: launching in nightlife districts, optimising for late-night reliability, and building trust features (driver photos, GPS tracking, cashless payment) for tourists and business travellers. Solving for the most acute groups produced the network density that later served the casual users almost for free.",
  },
  {
    company: "Khan Academy (early years)",
    problem: "Students struggling with maths and science had limited access to high-quality tutoring outside of school, and self-paced learning materials were either expensive or low quality.",
    groups: [
      {
        name: "Students in under-resourced schools",
        severity: "critical",
        description: "Lacked access to private tutors and often to qualified subject teachers. A free, high-quality alternative could change life outcomes, not just grades.",
      },
      {
        name: "Students who fell behind temporarily",
        severity: "high",
        description: "After missing a key concept (illness, a transfer, a weak unit), classroom pace moved on and they had no efficient way to catch up. Compounding gaps drove disengagement.",
      },
      {
        name: "Homeschooling families",
        severity: "high",
        description: "Parents teaching across multiple subjects needed structured curriculum, exercises, and progress tracking they could rely on without buying a full curriculum package.",
      },
      {
        name: "Adult learners returning to study",
        severity: "medium",
        description: "Working adults brushing up on maths for university entry, certifications, or career changes wanted self-paced refreshers without enrolling in a formal course.",
      },
      {
        name: "Classroom teachers",
        severity: "medium",
        description: "Wanted assignable practice and visibility into where individual students were stuck, but had no easy way to differentiate instruction across a class of 30.",
      },
      {
        name: "Top-performing students",
        severity: "low",
        description: "Already had access to enrichment, tutoring, and support. Real but lower priority since the existing system mostly served them adequately.",
      },
    ],
    outcome: "Khan Academy focused product investment on the critical and high-severity groups: building mastery-based progression for catch-up learners, dashboards for teachers, and a fully free product to reach under-resourced students. The clarity about who was hurting most shaped both the product roadmap and the philanthropic pitch.",
  },
  {
    company: "Stripe (developer-first payments)",
    problem: "Accepting online payments required navigating banks, payment gateways, merchant accounts, and PCI compliance, a process that could take weeks of paperwork before a single transaction.",
    groups: [
      {
        name: "Solo developers and indie hackers",
        severity: "critical",
        description: "Had a working product but no realistic path to charge for it. Existing providers required incorporation, business plans, and weeks of underwriting before approval.",
      },
      {
        name: "Early-stage startups",
        severity: "critical",
        description: "Burning runway on integration work that distracted from the actual product. Time-to-first-charge was a make-or-break metric and existing tools made it punishing.",
      },
      {
        name: "Marketplace and platform builders",
        severity: "high",
        description: "Needed to split payments across many sellers, handle refunds, and manage payouts. No existing provider made this practical without building substantial bank-side infrastructure themselves.",
      },
      {
        name: "International sellers",
        severity: "high",
        description: "Charging customers in multiple currencies, complying with local rules, and getting paid out reliably across borders was almost impossible without a dedicated finance team.",
      },
      {
        name: "Established mid-market merchants",
        severity: "medium",
        description: "Already had a payments setup that worked. Pain existed (high fees, poor reporting) but switching cost was real and the existing system was tolerable.",
      },
      {
        name: "Large enterprises",
        severity: "low",
        description: "Had bespoke contracts with payment processors and dedicated treasury teams. Real friction existed, but solving for them would have required a totally different go-to-market.",
      },
    ],
    outcome: "Stripe built explicitly for the critical groups: a developer-first API, instant signup, and seven lines of code to take a charge. Solving for solo developers first created a bottoms-up wedge that later served startups, then platforms, and eventually the enterprise tier with a fundamentally different distribution model than the incumbents.",
  },
]
