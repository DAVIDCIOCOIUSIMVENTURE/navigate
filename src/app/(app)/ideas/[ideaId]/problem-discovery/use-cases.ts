import type { PriorKnowledgeFields } from "@/types/idea"

export type JobUseCase = {
  job: string
  functional: string
  emotional: string
  social: string
  problems: string[]
}

export const USE_CASES: {
  title: string
  jobs: JobUseCase[]
  customer: {
    segment: string
    ageFrom: string
    ageTo: string
    whoTheyAre: string
    whatTheyDo: string
    goalsAndMotivations: string
    frustrationsAndChallenges: string
  }
  subSegment: {
    name: string
    differentiators: string
    specificContext: string
    uniqueNeeds: string
  }
  priorKnowledge: PriorKnowledgeFields
}[] = [
  {
    title: "B2B SaaS — Mid-market HR Teams",
    jobs: [
      {
        job: "Hire the right people quickly without overwhelming the team",
        functional: "Streamline the end-to-end recruiting process so open roles are filled within 30 days without requiring engineering support or manual spreadsheet tracking.",
        emotional: "Feel confident and in control during high-pressure hiring sprints, rather than reactive and stretched thin.",
        social: "Be seen by leadership as someone who runs a tight, professional hiring operation that reflects well on the company culture.",
        problems: [
          "Candidate information is scattered across email threads, spreadsheets, and ATS tools that don't talk to each other.",
          "Hiring managers don't give timely feedback, causing candidates to drop off mid-process.",
          "There's no clear visibility into where each role stands, so the recruiter has to manually chase updates.",
          "Job descriptions are written inconsistently, attracting the wrong applicants and wasting screening time.",
        ],
      },
      {
        job: "Onboard new hires so they're productive from day one",
        functional: "Automate paperwork, checklist delivery, and tool provisioning so new employees can hit the ground running without HR manually following up on every step.",
        emotional: "Feel proud of the onboarding experience they're providing — not embarrassed by a disorganised, chaotic first week.",
        social: "Be recognised as someone who creates a welcoming, well-run workplace that new hires rave about to their networks.",
        problems: [
          "New hires don't know who to contact or what to do in their first few days, leading to confusion and disengagement.",
          "IT provisioning and tool access are delayed, making it impossible for people to start working.",
          "Onboarding tasks are tracked manually in spreadsheets that quickly go out of date.",
          "Compliance paperwork is collected over email, with no audit trail or automated reminders.",
        ],
      },
    ] as JobUseCase[],
    customer: {
      segment: "HR managers and people ops leads at companies with 100–500 employees",
      ageFrom: "30", ageTo: "50",
      whoTheyAre: "Professionals responsible for recruiting, onboarding, and employee experience at growing companies. They often lack dedicated HR tech budgets and rely on a patchwork of tools.",
      whatTheyDo: "They post job listings, coordinate interviews, manage onboarding paperwork, run performance reviews, and handle compliance tasks — often simultaneously.",
      goalsAndMotivations: "Reduce time-to-hire, improve new hire retention, and demonstrate measurable ROI on people programs to leadership.",
      frustrationsAndChallenges: "Too many disconnected tools, manual data entry, and difficulty getting visibility into pipeline metrics without relying on the engineering team.",
    },
    subSegment: {
      name: "HR Managers at Series B startups scaling from 50 to 200 employees",
      differentiators: "Unlike enterprise HR, they have no legacy systems to work around — but also no established processes. They're building from scratch under pressure, often as a team of one or two.",
      specificContext: "Post-funding growth phase with aggressive hiring targets. They work closely with founders and have direct budget influence, but are overwhelmed by volume and speed.",
      uniqueNeeds: "They need tools that are fast to set up, require no IT involvement, and can flex as headcount doubles within 12 months.",
    },
    priorKnowledge: {
      personalFrustrations: "When scaling a team from 20 to 50, I spent more time chasing hiring managers for interview feedback than actually recruiting. Every open role lived in a different spreadsheet and nobody had a single source of truth.",
      whoStruggles: "HR managers at fast-growing startups who are often a team of one or two, suddenly responsible for hiring 30+ people a year with no real tooling or process.",
      existingWorkarounds: "People use Notion or Google Sheets to track candidates, send feedback requests via Slack, and manually remind interviewers to submit scores. It works until it doesn't.",
      complaintsHeard: "\"I had a great candidate drop out because we took two weeks to give feedback.\" \"I have no idea where this role stands — I have to ask the recruiter every time.\"",
      whyItMatters: "Bad hiring is expensive and demoralising. If a startup can't hire quickly and well, it will lose its best candidates to competitors who have a smoother process.",
    },
  },
  {
    title: "Consumer — Freelance Designers",
    jobs: [
      {
        job: "Win and retain high-quality clients without constantly hustling for new work",
        functional: "Build a repeatable pipeline of inbound leads through a strong portfolio and referral network so income doesn't depend on constantly pitching cold.",
        emotional: "Feel secure and valued as a professional rather than anxious about where the next project is coming from.",
        social: "Be known in their niche as a go-to designer whose work speaks for itself — not someone who undercuts on price.",
        problems: [
          "Their portfolio site doesn't communicate their specialisation clearly, so they attract generalist inquiries that don't convert.",
          "They have no system for following up with past clients, so warm leads go cold.",
          "Referrals happen by chance — there's no structured way to ask for or incentivise introductions.",
          "Without testimonials or case studies, prospective clients struggle to justify the budget to stakeholders.",
        ],
      },
      {
        job: "Complete projects profitably without scope creep eating into margins",
        functional: "Set clear project boundaries, communicate changes formally, and charge appropriately for additional work so every project ends on time and on budget.",
        emotional: "Feel respected by clients and in control of the relationship, not resentful after delivering extra work for free.",
        social: "Be seen as a professional who runs structured, well-managed engagements — not someone clients can push around.",
        problems: [
          "Clients request changes verbally or over Slack, making it hard to track what was agreed vs. what was added.",
          "Proposals don't clearly define what's out of scope, so clients assume everything is included.",
          "There's no standard process for raising a change request, so extra work often gets absorbed silently.",
          "Revision rounds balloon because there's no defined limit on feedback cycles in the contract.",
        ],
      },
    ] as JobUseCase[],
    customer: {
      segment: "Independent graphic and UX/UI designers working for multiple clients",
      ageFrom: "24", ageTo: "38",
      whoTheyAre: "Creative professionals who left full-time roles to work independently. They manage their own client relationships, invoicing, and project workflows without a support team.",
      whatTheyDo: "They take on design contracts, manage revision cycles with clients, deliver assets, and handle the business side of freelancing (proposals, invoices, taxes).",
      goalsAndMotivations: "Land higher-value clients, reduce administrative overhead, and build a stable income without sacrificing creative freedom.",
      frustrationsAndChallenges: "Scope creep, late payments, unclear client briefs, and spending too much time on non-design work like contracts and follow-ups.",
    },
    subSegment: {
      name: "Early-career freelance UX designers with 1–3 years of experience",
      differentiators: "They're still building their portfolio and client network. Unlike seasoned freelancers, they often undercharge, struggle to set boundaries, and lack confidence in client negotiations.",
      specificContext: "Transitioning out of bootcamps or junior roles, working on small projects (landing pages, mobile app screens) for startups or small businesses. Often juggling 2–3 clients at once.",
      uniqueNeeds: "Clear frameworks for scoping and pricing work, simple contract templates, and ways to demonstrate value to clients who haven't worked with a designer before.",
    },
    priorKnowledge: {
      personalFrustrations: "I've done freelance work and the worst part was always scope creep — spending an extra 10 hours on a project because the client kept asking for \"one small change\" that wasn't in the original scope.",
      whoStruggles: "Early-career designers who don't have established client relationships or a reputation to fall back on. They accept unclear briefs and avoid difficult conversations about scope because they fear losing the client.",
      existingWorkarounds: "Using Notion templates for proposals, tracking revision rounds manually in a spreadsheet, sending politely-worded emails to push back on scope — none of it feels professional or scalable.",
      complaintsHeard: "\"I ended up doing 3x the work I quoted.\" \"My client won't pay the invoice because they say the deliverables don't match what they expected.\" \"I don't know how to price this project.\"",
      whyItMatters: "Scope creep doesn't just eat into income — it burns out designers and poisons client relationships. Solving this early in someone's freelance career could change their entire trajectory.",
    },
  },
  {
    title: "Education — Community College Students",
    jobs: [
      {
        job: "Complete a degree that leads to a real job, not just a credential",
        functional: "Graduate with marketable skills, a clear pathway into employment, and enough financial stability to avoid dropping out before finishing.",
        emotional: "Feel hopeful and purposeful about the future rather than uncertain about whether the investment of time and money will pay off.",
        social: "Be able to show family and community that attending college was worth it — and be seen as someone who made it through against the odds.",
        problems: [
          "Students don't know which courses lead to which careers, so they pick based on availability rather than strategy.",
          "Career services are underresourced and reactive — students only visit when they're already in crisis.",
          "Internship and job opportunities aren't surfaced in a timely way, so students miss application windows.",
          "There's no mentorship from people who've taken the same path, leaving students to figure things out alone.",
        ],
      },
      {
        job: "Navigate institutional systems without getting lost or falling behind",
        functional: "Understand financial aid deadlines, registration requirements, and advising processes clearly enough to stay enrolled and on track without needing to figure it all out alone.",
        emotional: "Feel like someone who belongs at the institution and knows what they're doing — not like an outsider who is one misstep away from losing their place.",
        social: "Be seen by peers, family, and professors as a capable student who has their act together.",
        problems: [
          "Financial aid deadlines are communicated through generic email blasts that students don't read or understand.",
          "Advisors are overloaded and hard to book, so students make registration decisions without guidance.",
          "Important processes like adding/dropping courses or applying for graduation aren't clearly explained anywhere.",
          "Students don't know they're at risk of losing their financial aid until it's already happened.",
        ],
      },
    ] as JobUseCase[],
    customer: {
      segment: "First-generation college students at community colleges pursuing a degree while working part-time",
      ageFrom: "18", ageTo: "28",
      whoTheyAre: "Students who are often the first in their family to attend college. They balance coursework with 20–30 hours of work per week and have limited financial safety nets.",
      whatTheyDo: "They attend classes, study, work shifts, and navigate financial aid, registration, and academic advising with minimal institutional support.",
      goalsAndMotivations: "Complete their degree, improve their career prospects, and manage costs without taking on excessive debt.",
      frustrationsAndChallenges: "Confusing financial aid processes, scheduling conflicts, lack of academic support, and feeling invisible in large institutional systems.",
    },
    subSegment: {
      name: "First-generation students in STEM programs at urban community colleges",
      differentiators: "They face a steeper learning curve in technical subjects without the study-group culture or tutoring access that four-year universities offer. Many are also supporting family members financially.",
      specificContext: "Enrolled in 2-year associate degree programs in fields like nursing, IT, or engineering tech. Commute to campus and have limited time for office hours or extracurriculars.",
      uniqueNeeds: "Flexible, asynchronous academic support, clear pathways from their degree to employment, and peer communities that reflect their background.",
    },
    priorKnowledge: {
      personalFrustrations: "I've watched people close to me struggle to stay enrolled because they missed a financial aid deadline they didn't know existed. The information was available — but buried in emails nobody reads.",
      whoStruggles: "First-generation college students who didn't grow up with family members who navigated higher education. They don't know what they don't know, and there's no one at home to fill in the gaps.",
      existingWorkarounds: "Students ask each other on Reddit or group chats, visit advisors only when in crisis, or figure out requirements by trial and error. Some just drop out rather than navigate the complexity.",
      complaintsHeard: "\"I didn't know I had to apply to graduate — I thought I just finished my credits.\" \"I lost my financial aid and nobody warned me.\" \"My advisor is impossible to get an appointment with.\"",
      whyItMatters: "Community college is often the most accessible path to economic mobility for people without family wealth. If students drop out due to institutional friction rather than academic ability, that's a fixable problem.",
    },
  },
]
