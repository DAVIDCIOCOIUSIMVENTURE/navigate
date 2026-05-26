import {
  Briefcase,
  HeartHandshake,
  Building2,
  Shuffle,
  Users,
  UsersRound,
  Radar,
  Wrench,
  type LucideIcon,
} from "lucide-react"

/**
 * Static config for the Reflect feature. Each lens defines a guided Q&A. Adding
 * a seventh lens is just appending a `Lens` object here, no code changes needed.
 */

export type LensSelfDiscoverySource = {
  /** Self-discovery category id whose items become starter chips for the matching prompts. */
  category: "knowledge" | "skills-expertise" | "personal-interests" | "social-impact" | "work-experience"
  /** Prompt ids that should surface chips from this category. */
  promptIds: string[]
}

export type LensPrompt = {
  id: string
  question: string
  helperText?: string
  examples?: string[]
  /** True if the user can capture multiple distinct answers to this prompt. */
  multipleAllowed: boolean
  /**
   * Ids of follow-up fields asked lazily at the review step (only for answers the
   * user keeps). Each id should map to a field rendered by the review screen.
   */
  capturesContext?: string[]
  /**
   * If true, this prompt's answer is context for later prompts, not a candidate
   * itself (e.g. "Name an organization"). Captured in session state but never
   * becomes a `ProblemCandidate`.
   */
  contextOnly?: boolean
  /**
   * Role in the save-as-problem flow:
   * - "problems": answers resolve to problem dimension ids; rendered with the
   *   identify problem picker.
   * - "customers": answers resolve to customer dimension ids; rendered with the
   *   identify customer picker.
   * Untagged prompts (other than the contextOnly anchor) are kept as reflection
   * context only.
   */
  role?: "problems" | "customers"
}

export type LensId =
  | "work"
  | "life"
  | "insider"
  | "cross"
  | "people"
  | "market"
  | "own-problems"
  | "audience-problems"

export type Lens = {
  id: LensId
  title: string
  shortDescription: string
  longDescription: string
  icon: LucideIcon
  /** Tailwind class for the icon tile background. From the brand palette in CLAUDE.md. */
  tileColor: string
  estimatedMinutes: number
  prompts: LensPrompt[]
  /** Optional helper text rendered in the guidance panel for this lens. */
  helperText?: string
  /** Self-discovery items to surface as starter chips inside specific prompts. */
  selfDiscoverySources?: LensSelfDiscoverySource[]
  /**
   * Some lenses (Market signals) don't follow the standard intro -> prompts ->
   * review flow. Mark them here so the lens layout can route differently.
   */
  flowKind?: "standard" | "single-form"
  /**
   * Short label for the contextOnly anchor prompt (e.g. "Life experience",
   * "Work area"). Used in the review heading, the "Reflecting on:" badge, and
   * the save dialog. Falls back to "Anchor" if missing.
   */
  anchorLabel?: string
}

export const REFLECT_LENSES: Lens[] = [
  {
    id: "life",
    title: "Life experiences",
    shortDescription: "Productize what you've already lived through. The friction you remember is friction others are about to hit.",
    longDescription:
      "Look back at one significant experience you've navigated and pull out the parts that were harder than they needed to be. You focus on a single experience per run so the prompts stay specific; to explore another, simply run this tool again and pick a different one.",
    icon: HeartHandshake,
    tileColor: "bg-primary",
    estimatedMinutes: 10,
    anchorLabel: "Life experience",
    helperText:
      "Retrospective beats current pain here. The specific things you only learned by doing are the things others are looking for.",
    prompts: [
      {
        id: "significant-experience",
        question: "Which life experience do you want to reflect on?",
        helperText:
          "Pick one from your self-discovery or another context, or add a new one. Keeping it to one experience makes the next prompts specific.",
        examples: [
          "Becoming a parent",
          "Moving country",
          "Caring for an aging relative",
        ],
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "harder-than-needed",
        question: "Looking back at that experience, what part was harder than it needed to be?",
        helperText:
          "Friction you remember vividly is friction others are about to hit. Steps you had to redo, info you couldn't find, or things that always hit at the worst possible time are good signals.",
        examples: [
          "Coordinating the same form across three providers who each wanted their own copy",
          "Proving identity without a local credit history",
          "Finding which specialists actually had availability without a referral",
        ],
        multipleAllowed: true,
        role: "problems",
      },
      {
        id: "wish-told",
        question: "What did you wish someone had told you upfront?",
        helperText:
          "Not generic advice: the specific thing you only figured out the hard way.",
        examples: [
          "That the visa fee was the smallest line item; translations and certifications dwarfed it",
          "That the first three months land critical paperwork in the foggiest window of your life",
          "That the bottleneck isn't specialist capacity, it's knowing who is accepting referrals this month",
        ],
        multipleAllowed: true,
      },
      {
        id: "wasted-spend",
        question: "What did you spend money on during that experience that turned out not to help?",
        helperText:
          "Misallocated spend often signals a missing or misleading product. The thing you paid for promised one outcome and delivered something else.",
        examples: [
          "An annual baby tracker subscription that died because logging a 3am feed needed too much focus",
          "A premium credit report from home that no local bank or landlord would accept",
          "Three private second opinions that all referred back to the first specialist",
        ],
        multipleAllowed: true,
      },
      {
        id: "personal-workaround",
        question: "What workaround did you build for yourself that you still use?",
        helperText:
          "The hack you built once and never stopped using is usually a product hiding in plain sight. Spreadsheets, group chats, and phone notes are the giveaways.",
        examples: [
          "A running phone note logging each pediatrician visit and which form needed updating next",
          "A spreadsheet of every document I've had translated: who, when, and where the original lives",
          "A sibling WhatsApp group used as the daily care log: meals, meds, doctor visits",
        ],
        multipleAllowed: true,
      },
      {
        id: "customer",
        question: "Who is this for?",
        helperText:
          "Optional, but adding a customer makes the problem easier to refine later. Pick the segments most likely to feel this the same way you did.",
        examples: [
          "First-time parents in the first six months",
          "Skilled immigrants in their first year in a new country",
          "Adult children coordinating care for a parent at a distance",
        ],
        multipleAllowed: true,
        role: "customers",
      },
    ],
  },
  {
    id: "work",
    title: "Work friction",
    shortDescription: "Mine one of your jobs for repeated annoyances and \"this should just exist\" thoughts.",
    longDescription:
      "Pick one job, role, or slice of work you do regularly and answer the prompts about that one place. The friction you've stopped noticing is often the friction worth productizing; focusing on a single role per run keeps the prompts specific. To explore another, run this tool again and pick a different one.",
    icon: Briefcase,
    tileColor: "bg-primary",
    estimatedMinutes: 10,
    anchorLabel: "Work area",
    helperText:
      "Repeated small annoyances at work are easy to dismiss but they point to missing tools. Small, specific, and slightly weird are good signals.",
    selfDiscoverySources: [
      { category: "knowledge", promptIds: ["time-consuming", "workarounds", "should-exist"] },
      { category: "skills-expertise", promptIds: ["time-consuming", "workarounds", "should-exist"] },
    ],
    prompts: [
      {
        id: "work-context",
        question: "Which job, role, or area of work do you want to reflect on?",
        helperText:
          "Pick one. It can be your current job, a past role, or a slice of work you do regularly (e.g. \"client onboarding at my consultancy\"). Keeping it to one role makes the next prompts specific.",
        examples: [
          "Running the operations team at a logistics company",
          "Onboarding new clients at my consultancy",
          "Managing finance month-end close",
        ],
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "frustrating-process",
        question: "Looking at that role, what process has frustrated you in the last month?",
        helperText:
          "Recent friction is easier to describe. Steps you had to redo, info you couldn't find, or processes that always hit at the worst possible time are good signals.",
        examples: [
          "Chasing approvals across three departments for a routine purchase",
          "Onboarding a new teammate without an up-to-date runbook",
          "A weekly meeting that always overruns and never decides anything",
        ],
        multipleAllowed: true,
        role: "problems",
      },
      {
        id: "time-consuming",
        question: "What do you spend a surprising amount of time on each week?",
        helperText:
          "Think about tasks you'd struggle to explain why they take so long. They're often a sign of a missing or misshaped tool.",
        examples: [
          "Reformatting the same report for five different stakeholders",
          "Jumping between five tools to complete one task",
          "Reconciling numbers between two systems that should agree",
        ],
        multipleAllowed: true,
      },
      {
        id: "expensive",
        question: "What does this work cost (in time, money, or tools) more than it feels worth?",
        helperText:
          "Subscriptions, contractors, recurring purchases. Misallocated spend often signals a missing or misleading product.",
        examples: [
          "A premium analytics tool nobody uses past month one",
          "Contractor hours spent on work the team could do with the right template",
          "Three SaaS tools that all do roughly the same thing",
        ],
        multipleAllowed: true,
      },
      {
        id: "workarounds",
        question: "Where do you work around a system instead of through it?",
        helperText:
          "The hack you built once and never stopped using is usually a product hiding in plain sight. Spreadsheets, group chats, and phone notes are the giveaways.",
        examples: [
          "A spreadsheet that shadows the CRM because the CRM can't filter what we need",
          "Private notes that duplicate what's in the project tracker",
          "A Slack DM thread used as the real status tracker for a project",
        ],
        multipleAllowed: true,
      },
      {
        id: "should-exist",
        question: "What \"this should just exist\" thought have you had recently?",
        helperText: "Small, specific, and slightly weird is good. The thing you wish you could install today.",
        examples: [
          "A way to ask everyone in a channel a question once and have it auto-collate the answers",
          "A tool that flags when two team calendars are about to double-book a customer",
        ],
        multipleAllowed: true,
      },
      {
        id: "customer",
        question: "Who else does this work?",
        helperText:
          "Other people in this role, industry, or setup who would likely feel the same friction. Optional, but adding a customer makes the problem easier to refine later.",
        examples: [
          "Operations leads at logistics companies of similar size",
          "Independent consultants running solo client onboarding",
          "Finance managers in mid-market companies",
        ],
        multipleAllowed: true,
        role: "customers",
      },
    ],
  },
  {
    id: "own-problems",
    title: "Problems you've solved yourself",
    shortDescription: "Mine one thing you've done (a job, a hobby, a side project) for problems you hit and the fixes you cobbled together.",
    longDescription:
      "Pick one thing you've actually done, then describe the problems you ran into and what you did about it. The fixes you built for yourself are often the seed of a product someone else would pay for. To explore another, run this tool again and pick a different one.",
    icon: Wrench,
    tileColor: "bg-primary",
    estimatedMinutes: 10,
    anchorLabel: "What you've done",
    helperText:
      "Both the problem and your workaround matter. The workaround is the early prototype of the product; the problem is the reason anyone else would want it.",
    selfDiscoverySources: [
      { category: "work-experience", promptIds: ["own-anchor"] },
      { category: "personal-interests", promptIds: ["own-anchor"] },
    ],
    prompts: [
      {
        id: "own-anchor",
        question: "Pick one thing you've worked on or done.",
        helperText:
          "A job you've held, a hobby you keep returning to, a side project you ran. Keep it to one so the next prompts stay specific.",
        examples: [
          "Running a small bakery",
          "Coaching a junior football team",
          "Restoring vintage motorbikes",
        ],
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "problems-hit",
        question: "What problems did you hit doing this?",
        helperText:
          "Concrete friction you remember: things that took longer than they should have, info that was hard to find, or moments where the obvious tool didn't exist.",
        examples: [
          "Forecasting how much to bake on a Saturday after a rainy Friday",
          "Tracking which kids had paid for the tournament and which hadn't",
          "Sourcing a discontinued part without paying collector prices",
        ],
        multipleAllowed: true,
        role: "problems",
      },
      {
        id: "what-you-did",
        question: "What did you do about it? What solutions or workarounds did you build?",
        helperText:
          "The hack you keep using is usually a product hiding in plain sight. Spreadsheets, phone notes, group chats, and homemade jigs all count.",
        examples: [
          "A spreadsheet weighting last year's sales by weather to set today's bake list",
          "A WhatsApp group used as the real payment tracker, with a pinned tally",
          "A homemade jig for pulling bearings that I now lend to other restorers",
        ],
        multipleAllowed: true,
      },
      {
        id: "customer",
        question: "Who else does this?",
        helperText:
          "Other people doing the same work or hobby who would likely hit the same problems. Optional, but adding a customer makes the problem easier to refine later.",
        examples: [
          "Other independent bakers running weekend retail",
          "Volunteer youth-sports coaches handling their own admin",
          "Hobbyist vintage motorbike restorers",
        ],
        multipleAllowed: true,
        role: "customers",
      },
    ],
  },
  {
    id: "audience-problems",
    title: "Audience problems",
    shortDescription: "Pick one audience you know or want to serve, then dig into the problems they hit.",
    longDescription:
      "Choose one audience (a customer segment or a group from your self-discovery), then explore the friction, workarounds, and wasted spend that shape their day. Sticking to a single audience per run keeps the prompts specific; to explore another, run this tool again and pick a different one.",
    icon: UsersRound,
    tileColor: "bg-primary",
    estimatedMinutes: 10,
    anchorLabel: "Audience",
    helperText:
      "You're looking outward at one specific group. Anything you list should be something you've actually seen them deal with, not what you assume they deal with.",
    prompts: [
      {
        id: "audience-anchor",
        question: "Which audience do you want to reflect on?",
        helperText:
          "Pick one from your self-discovery, your existing customers, or the built-in list. Keeping it to one audience makes the next prompts specific.",
        examples: [
          "First-time freelancers",
          "Parents of school-age children",
          "Small local retailers",
        ],
        multipleAllowed: false,
        contextOnly: true,
        role: "customers",
      },
      {
        id: "their-friction",
        question: "What do they struggle with that they shouldn't have to?",
        helperText:
          "Specific friction beats broad pain. Steps they redo, info they can't find, or recurring problems they've learned to live with are good signals.",
        examples: [
          "Tracking invoices across three different clients who each want a different format",
          "Coordinating after-school pickups when both parents work shifting hours",
          "Keeping in-store stock counts in sync with the online shop",
        ],
        multipleAllowed: true,
        role: "problems",
      },
      {
        id: "their-workarounds",
        question: "What workarounds have you seen them build for themselves?",
        helperText:
          "The hacks they keep using are usually products hiding in plain sight. Spreadsheets, group chats, phone notes, and homemade tools are the giveaways.",
        examples: [
          "A shared spreadsheet that shadows the official tool because the tool can't filter what they need",
          "A WhatsApp group used as the real schedule, with a pinned plan everyone updates",
          "A printed cheat sheet taped next to the till because the POS menu is too deep",
        ],
        multipleAllowed: true,
      },
      {
        id: "wasted-spend",
        question: "What do they spend money, time, or attention on that doesn't really help?",
        helperText:
          "Misallocated spend often signals a missing or misleading product. The thing they pay for promises one outcome and delivers another.",
        examples: [
          "Subscriptions to tools they barely use past the first month",
          "Paid courses that cover everything except the part they actually got stuck on",
          "Recurring contractor hours spent on work the right template would absorb",
        ],
        multipleAllowed: true,
      },
    ],
  },
  {
    id: "insider",
    title: "Insider angle",
    shortDescription: "Use what you know about organizations from the inside. Outsiders can't see what you've seen.",
    longDescription:
      "Pick one organization you know intimately and answer the prompts about that one place. The aim is to surface the things only an insider would notice.",
    icon: Building2,
    tileColor: "bg-primary",
    estimatedMinutes: 10,
    helperText:
      "One organization is enough. If you're worried about specifics, anonymize the language; the prompts work just as well in general terms.",
    selfDiscoverySources: [
      { category: "knowledge", promptIds: ["org-name"] },
    ],
    prompts: [
      {
        id: "org-name",
        question: "Name an organization you've worked at or know intimately.",
        helperText: "This answer isn't a candidate. It sets context for the prompts that follow.",
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "broken-process",
        question: "What internal process there was obviously broken but never got fixed?",
        examples: [
          "A manual handoff between two teams",
          "A report that everyone re-derives from scratch",
        ],
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
      {
        id: "skipped-opportunity",
        question: "What opportunity did people discuss inside but the organization never pursued?",
        helperText: "Often this is something with the wrong owner, not the wrong idea.",
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
      {
        id: "quiet-complaint",
        question: "What does everyone there quietly complain about?",
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
      {
        id: "surprising-knowledge",
        question: "What knowledge from inside that organization would surprise an outsider?",
        helperText: "Surprising knowledge is sellable knowledge.",
        multipleAllowed: true,
        capturesContext: ["other-orgs"],
      },
    ],
  },
  {
    id: "cross",
    title: "Cross-context patterns",
    shortDescription: "Spot something that works in one industry, hobby, or country and is missing in another you know.",
    longDescription:
      "A pattern that's normal in one context can be a fresh idea in another. The interesting question is usually why nobody has moved it yet.",
    icon: Shuffle,
    tileColor: "bg-primary",
    estimatedMinutes: 8,
    helperText:
      "Always ask \"why hasn't this happened yet?\". A clean answer (regulation, timing, distribution) often gates whether the transplant is a real opportunity.",
    selfDiscoverySources: [
      { category: "personal-interests", promptIds: ["hobby-vs-job"] },
    ],
    prompts: [
      {
        id: "hobby-vs-job",
        question: "Something normal in your hobby that's missing in your job, or vice versa.",
        examples: [
          "Scoring systems",
          "Tournament brackets",
          "Community moderation conventions",
        ],
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
      {
        id: "country-pattern",
        question: "Something common in another country or culture you know that isn't here.",
        examples: [
          "A payment method",
          "A bureaucratic shortcut",
          "A piece of infrastructure",
        ],
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
      {
        id: "industry-pattern",
        question: "Something common in one industry you've worked in that another industry would benefit from.",
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
      {
        id: "generational-pattern",
        question: "A solution that's normal for one age group or generation that no one's adapted for another.",
        multipleAllowed: true,
        capturesContext: ["who-benefits", "why-not-yet"],
      },
    ],
  },
  {
    id: "people",
    title: "People around you",
    shortDescription: "Observation, not introspection. The people in your daily life are a problem source you can verify by asking them.",
    longDescription:
      "Pick one person you observe regularly and answer the prompts with them in mind. Then validate by actually asking them.",
    icon: Users,
    tileColor: "bg-primary",
    estimatedMinutes: 8,
    helperText:
      "Treat this as observation, not assumption. Anything you capture here should be confirmed by talking to the person before you commit to it.",
    prompts: [
      {
        id: "person",
        question: "Pick one person in your life you observe regularly.",
        helperText: "This answer sets context. It doesn't become a candidate.",
        multipleAllowed: false,
        contextOnly: true,
      },
      {
        id: "repeated-complaint",
        question: "What do you hear them complain about repeatedly?",
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
      {
        id: "their-workaround",
        question: "What workaround have you watched them build for themselves?",
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
      {
        id: "hours-spent",
        question: "What do they spend hours doing that they wish was faster, cheaper, or easier?",
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
      {
        id: "life-stage",
        question: "What life stage are they in that has its own friction?",
        examples: ["New job", "New parent", "Recently retired", "First time renting"],
        multipleAllowed: true,
        capturesContext: ["how-many"],
      },
    ],
  },
  {
    id: "market",
    title: "Market signals",
    shortDescription: "A capture form for problems you spot by looking outward at reviews, trends, public data, and research.",
    longDescription:
      "This lens doesn't ask you what to look at. It gives you a place to write down what you find when you scan low-rated tools, trend trackers, open data, and research.",
    icon: Radar,
    tileColor: "bg-primary",
    estimatedMinutes: 5,
    flowKind: "single-form",
    helperText:
      "Useful source categories: low-rated but in-demand products on app stores, trend-tracking sites, scientific or industry research aggregators, public data portals. Capture the insight, not just the URL.",
    prompts: [
      {
        id: "what-found",
        question: "What did you find?",
        helperText: "A short title for the signal you spotted.",
        multipleAllowed: false,
      },
      {
        id: "where-seen",
        question: "Where did you see it?",
        helperText: "One line. The source category or the specific tool / dataset / report.",
        multipleAllowed: false,
      },
      {
        id: "what-problem",
        question: "What problem does it suggest?",
        helperText: "This is the candidate. Phrase it as a problem in plain language.",
        multipleAllowed: false,
      },
      {
        id: "who-affected",
        question: "Who is affected?",
        multipleAllowed: false,
      },
    ],
  },
]

/**
 * Field labels for the lazy context-capture fields rendered on the review step.
 * Prompt's `capturesContext` is a list of these field ids.
 */
export const LENS_CONTEXT_FIELDS: Record<string, { label: string; helperText?: string }> = {
  "who-else": {
    label: "Who else has this problem?",
    helperText: "A role, an industry, a team type.",
  },
  "other-orgs": {
    label: "Which other organizations have the same setup?",
    helperText: "A sector or a size.",
  },
  "who-benefits": {
    label: "Who would benefit from the transplant?",
  },
  "why-not-yet": {
    label: "Why hasn't this happened yet?",
    helperText: "Regulation, timing, distribution, or something else.",
  },
  "how-many": {
    label: "Roughly how many other people are in the same situation?",
  },
}

export const REFLECT_LENS_BY_ID: Record<LensId, Lens> = REFLECT_LENSES.reduce(
  (acc, lens) => {
    acc[lens.id] = lens
    return acc
  },
  {} as Record<LensId, Lens>
)

export function getReflectLens(id: string): Lens | undefined {
  return REFLECT_LENS_BY_ID[id as LensId]
}
