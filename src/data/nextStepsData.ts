export type NextStepsIconKey = "hammer" | "flask" | "route" | "users" | "rotate-ccw"

export interface NextStepsApproach {
  title: string
  description: string
}

export interface NextStepsTopic {
  url: string
  title: string
  shortTitle: string
  tagline: string
  iconKey: NextStepsIconKey
  intro: string
  keyPoints: string[]
  approaches: NextStepsApproach[]
  pitfalls: string[]
}

export const NEXT_STEPS_TOPICS: NextStepsTopic[] = [
  {
    url: "build-a-prototype",
    title: "Build a small prototype",
    shortTitle: "Build a prototype",
    tagline: "Make the cheapest version of your solution that a real person can react to.",
    iconKey: "hammer",
    intro:
      "A prototype is the cheapest, ugliest, fastest version of your solution that someone outside your head can react to. Its job is not to impress; its job is to make your assumptions visible so they can be tested. Founders who skip this step often spend months building something nobody asked for. Founders who build prototypes early save themselves from polishing the wrong thing.",
    keyPoints: [
      "Pick the cheapest format that lets a real person form an opinion: paper, Figma, a one-page site, or a fake button.",
      "Don't build anything that isn't required to answer your top question.",
      "Show, don't tell. Let users react to the artefact, not to your description of it.",
      "Plan to throw it away. Your prototype is a learning instrument, not version one.",
      "Set a tight deadline (a week, ideally less) before you start.",
    ],
    approaches: [
      {
        title: "Paper sketch",
        description:
          "Draw the screens on paper or a whiteboard and walk users through them. Best for testing flows, language, and overall structure before any pixels exist.",
      },
      {
        title: "Clickable mockup",
        description:
          "Use Figma, Excalidraw, or Balsamiq to wire up hotspots between static screens. Best for testing UI structure and information density without writing code.",
      },
      {
        title: "Landing page",
        description:
          "One page, a headline, a value proposition, and a single call to action (sign up, pre-order, book a call). Best for testing demand and the words that resonate.",
      },
      {
        title: "Wizard of Oz",
        description:
          "Looks automated to the user; you do the work behind the scenes. Best for testing workflows you'd otherwise need months of engineering to build.",
      },
      {
        title: "Concierge",
        description:
          "Deliver the outcome manually for one customer, end to end. Slow on purpose: you learn exactly what the product needs to do before you build it.",
      },
    ],
    pitfalls: [
      "Building real software when a sketch would do.",
      "Polishing the design instead of testing the idea.",
      "Showing the prototype only to friends and asking 'would you use this?'.",
      "Building features users haven't asked for, 'because we'll need them eventually'.",
    ],
  },
  {
    url: "run-a-customer-test",
    title: "Run a focused customer test",
    shortTitle: "Run a customer test",
    tagline: "Design one experiment with a clear yes-or-no signal.",
    iconKey: "flask",
    intro:
      "Validation isn't a vibe; it's an experiment. A focused customer test asks one specific question and gives you a clean answer. The trap most founders fall into is asking vague questions ('would you use this?') and treating polite responses as evidence. Real tests put a clear, observable behaviour on the line.",
    keyPoints: [
      "Identify the single assumption that, if wrong, kills the idea. Test that one first.",
      "Define what success looks like before you run the test (e.g. 'I'll continue if at least 3 of 10 people pre-order').",
      "Find people in your target segment. Friends and family don't count.",
      "Watch what people do, not what they say. Behaviour beats opinion.",
      "Avoid leading questions. Don't pitch; observe.",
    ],
    approaches: [
      {
        title: "Customer interview",
        description:
          "A 30-minute conversation about the problem in their words. Use Mom Test rules: ask about past behaviour and concrete examples, not hypotheticals.",
      },
      {
        title: "Smoke test",
        description:
          "A landing page with a 'buy now' or 'join waitlist' button. Track how many click. Cheap, fast, and surprisingly honest.",
      },
      {
        title: "Pre-sale",
        description:
          "Ask people to pay (or commit) before the product exists. The hardest signal to fake, and often the most informative.",
      },
      {
        title: "Fake door",
        description:
          "A button or feature inside a real app that doesn't yet do anything. Track clicks, then explain. Tests appetite for a feature in context.",
      },
      {
        title: "Concierge service",
        description:
          "Deliver the outcome manually for a small group and see what they actually pay for. You'll learn what's truly load-bearing in your offer.",
      },
    ],
    pitfalls: [
      "Asking 'would you use this?' instead of 'have you ever paid to solve this?'.",
      "Letting the participant feel they have to be encouraging.",
      "Stopping the test too early because the early signal looked good.",
      "Confusing willingness to listen with willingness to pay.",
    ],
  },
  {
    url: "map-a-learning-roadmap",
    title: "Map a learning roadmap",
    shortTitle: "Learning roadmap",
    tagline: "Sequence what you need to learn before what you want to build.",
    iconKey: "route",
    intro:
      "A learning roadmap is a list of the questions you need to answer, ordered by how much they would change your plan. It's the document you maintain instead of (or before) a build roadmap. Most early-stage roadmaps are misnamed: they describe what you'll build, not what you don't yet know. The cheapest pivot is the one you make on a doc, not in production code.",
    keyPoints: [
      "List every assumption your idea relies on, especially the ones you've never tested.",
      "Mark each assumption with its expected risk: high, medium, or low.",
      "Start with the highest-risk assumption. If it fails, nothing else matters.",
      "Each item should have a test method and a 'what would change my mind' condition.",
      "Update it weekly. New learnings often expose new assumptions.",
    ],
    approaches: [
      {
        title: "Riskiest assumption test",
        description:
          "Identify the single belief that would sink everything if false, then design the smallest possible test for it. Run that test before anything else.",
      },
      {
        title: "Assumption mapping",
        description:
          "Plot each assumption on a 2x2 grid of importance against evidence. The high-importance, low-evidence quadrant is your test queue.",
      },
      {
        title: "Pre-mortem",
        description:
          "Imagine it's a year from now and the idea has failed. Write down the reasons. Each reason is a question you can test today.",
      },
      {
        title: "Weekly learning review",
        description:
          "At the end of each week, write down what you learned and what changed. If nothing changed, you weren't testing hard enough.",
      },
    ],
    pitfalls: [
      "Confusing a build roadmap with a learning roadmap. They are different documents.",
      "Testing easy assumptions first because they're comfortable.",
      "Treating learning as a phase that ends, rather than a habit that continues.",
      "Refusing to update the roadmap when evidence contradicts the plan.",
    ],
  },
  {
    url: "decide-on-commitment",
    title: "Decide on commitment",
    shortTitle: "Decide on commitment",
    tagline: "Validation tells you the idea is real. Commitment is a separate question.",
    iconKey: "users",
    intro:
      "Validating an idea and committing to it are different decisions. Validation tells you the idea is real; commitment is about whether it deserves your time, your savings, your relationships, and your career risk. Plenty of validated ideas should not become full-time companies, and plenty of part-time projects compound into something serious. Be deliberate about which one this is for you.",
    keyPoints: [
      "Separate the two questions: is the idea real? and do I want to bet my next few years on it?",
      "Be honest about what you can afford to give up: time, income, certainty, family bandwidth.",
      "Talk to the people commitment will affect: partner, family, current employer, potential co-founders.",
      "Define a 'kill criteria' up front: what would make you walk away, and when?",
      "Reversible commitments first. Quitting your job is reversible only on paper.",
    ],
    approaches: [
      {
        title: "Side project",
        description:
          "Evenings and weekends. Lowest risk, lowest velocity. Tests sustained interest more than market signal, but it's the right starting point for most.",
      },
      {
        title: "Part-time or sabbatical",
        description:
          "Ten to twenty hours a week, or a three-month leave. Forces structure and urgency without burning the bridge to your day job.",
      },
      {
        title: "Full-time bootstrapping",
        description:
          "Live off savings, no investors yet. Maximum control, maximum personal risk. Best when the idea has paying customers or a near-zero burn rate.",
      },
      {
        title: "Fundraise",
        description:
          "Outside capital changes the company you're building. Expect investor expectations, dilution, and a different time horizon. It's a job in itself.",
      },
      {
        title: "Co-founder search",
        description:
          "Often the highest-leverage decision you'll make. Two committed people beat one brilliant solo founder. Pick for fit, not for proximity.",
      },
    ],
    pitfalls: [
      "Going full-time on a partially-validated idea because the validation looked exciting.",
      "Staying part-time forever because every step up feels uncomfortable.",
      "Picking a co-founder for proximity (a friend, an ex-colleague) rather than fit.",
      "Forgetting that fundraising is itself a full-time job, often for months.",
    ],
  },
  {
    url: "revisit-your-problem",
    title: "Revisit your problem",
    shortTitle: "Revisit your problem",
    tagline: "Solutions are diagnostic instruments. The problem you started with is rarely the one you'll end with.",
    iconKey: "rotate-ccw",
    intro:
      "Solutions are diagnostic instruments. The moment you put one in front of users, you discover things about the problem that no amount of upstream interviewing could have surfaced. The most common pattern: you set out to solve a stated problem, and your prototype reveals that the real problem is adjacent, narrower, or different. Don't fight it; update your problem statement.",
    keyPoints: [
      "After every test, ask: did the problem look the way I thought it did?",
      "New segments, contexts, or framings often emerge. Capture them in the Problems section.",
      "Sometimes the right move isn't a better solution; it's a sharper problem.",
      "The original problem statement is a hypothesis, not a contract.",
      "Loop, don't escalate. Going back to Problems is the system working, not failing.",
    ],
    approaches: [
      {
        title: "Problem refresh",
        description:
          "After your first round of tests, rewrite the problem statement using the language users actually used. Their words almost always beat yours.",
      },
      {
        title: "Segment narrowing",
        description:
          "Identify which sub-segment had the strongest signal and refocus on them. A narrow audience that loves it beats a broad audience that's lukewarm.",
      },
      {
        title: "Context reframing",
        description:
          "Ask whether the problem you saw was really about the moment, the role, or the trigger you assumed. Often the same pain lives in a different context.",
      },
      {
        title: "Pivot vs persevere",
        description:
          "Decide explicitly. Don't drift between the two. Write down the criteria that would make you change direction, and revisit them at a fixed cadence.",
      },
      {
        title: "Document the change",
        description:
          "Keep a log of how the problem evolved. It will pay off when explaining the idea to investors, partners, or your future self.",
      },
    ],
    pitfalls: [
      "Falling in love with the original problem statement.",
      "Treating evidence as noise when it contradicts your plan.",
      "Pivoting on every weak signal, or staying on every strong one.",
      "Skipping the loop back to Problems because it feels like backwards motion.",
    ],
  },
]

export function getNextStepsTopic(url: string): NextStepsTopic | undefined {
  return NEXT_STEPS_TOPICS.find((t) => t.url === url)
}

export const NEXT_STEPS_TOPIC_ICON_BG: Record<string, string> = {
  "build-a-prototype": "bg-amber-500",
  "run-a-customer-test": "bg-violet-500",
  "map-a-learning-roadmap": "bg-sky-500",
  "decide-on-commitment": "bg-emerald-500",
  "revisit-your-problem": "bg-rose-500",
}
