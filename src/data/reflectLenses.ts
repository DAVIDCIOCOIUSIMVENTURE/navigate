import {
  Annoyed,
  Briefcase,
  HeartHandshake,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import type { DimensionKey } from "@/lib/dimension-visuals"

/**
 * The guided-prompt tools on the Identify a Problem hub. Each lens is a guided
 * Q&A offered as a tool in its own right, beside the Canvas Builder and
 * Research, in the order of `REFLECT_LENSES`. Every lens has one `contextOnly`
 * anchor prompt (the thing the run reflects on, rendered by its own
 * single-select picker in `src/components/reflect/`, wired up in
 * `lens-panels.tsx`) followed by the prompts that dig into it. The catalogue
 * keeps the "Reflect" name because saved problems carry `reflection.lensId`.
 */

export type LensPrompt = {
  id: string
  question: string
  helperText?: string
  examples?: string[]
  /** True if the user can capture multiple distinct answers to this prompt. */
  multipleAllowed: boolean
  /**
   * The anchor: this prompt's answer is what the rest of the run is about
   * (an experience, a role, an audience, an annoyance) and pre-fills the
   * problem's title, but is never a candidate answer itself.
   */
  contextOnly?: boolean
  /**
   * Role in the save-as-problem flow: which of the problem's dimension columns
   * the answers land in, resolved to dimension ids and rendered with that
   * column's picker. The anchor may carry a role too (Audience problems anchors
   * on a customer, Something that annoys you on a problem type). Untagged
   * prompts (other than the anchor) are kept as the problem's reflection only.
   */
  role?: LensDimensionRole
}

/** The problem dimension columns a prompt's answers can be saved into. */
export type LensDimensionRole = "problems" | "customers" | "contexts"

export type LensId =
  | "life"
  | "work"
  | "own-problems"
  | "audience-problems"
  | "annoyance"

export type Lens = {
  id: LensId
  title: string
  /** One line for the hub row and the guidance panel's tool card. */
  shortDescription: string
  /** The fuller framing, for anywhere with room for a paragraph. */
  longDescription: string
  icon: LucideIcon
  estimatedMinutes: number
  prompts: LensPrompt[]
  /** The one-line tip shown beside the tool in the guidance panel. */
  helperText: string
  /**
   * Who this tool suits, shown behind the "Best for" drop-down on the
   * Identify a Problem hub. Written in the same voice as the other tools there.
   */
  bestFor: string
  /**
   * Short label for the anchor prompt's answer (e.g. "Life experience",
   * "Work area"), used in the review heading and the save dialog.
   */
  anchorLabel: string
}

export const REFLECT_LENSES: Lens[] = [
  {
    id: "life",
    title: "Life experiences",
    shortDescription: "Productise what you've already lived through. The friction you remember is friction others are about to hit.",
    longDescription:
      "Look back at one significant experience you've navigated and pull out the parts that were harder than they needed to be. You focus on a single experience per run so the prompts stay specific; to explore another, simply run this tool again and pick a different one.",
    icon: HeartHandshake,
    estimatedMinutes: 10,
    anchorLabel: "Life experience",
    helperText:
      "Retrospective beats current pain here. The specific things you only learned by doing are the things others are looking for.",
    bestFor:
      "Best for something significant you have already been through: a move, a diagnosis, a new baby, a career change. You answer from memory rather than research, and the friction you still remember is usually the friction worth solving.",
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
          "Think about the moment you realised something too late: a cost you didn't budget for, a deadline nobody flagged, a step that only made sense once you'd done it wrong. If you had to brief a friend about to go through the same thing, what is the one warning you'd give them first? Skip generic advice (\"be patient\", \"do your research\") and go for the specific thing you only figured out the hard way. Each of these gaps is something a product, guide, or service could have filled for you.",
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
          "A running phone note logging each paediatrician visit and which form needed updating next",
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
      "Pick one job, role, or slice of work you do regularly and answer the prompts about that one place. The friction you've stopped noticing is often the friction worth productising; focusing on a single role per run keeps the prompts specific. To explore another, run this tool again and pick a different one.",
    icon: Briefcase,
    estimatedMinutes: 10,
    anchorLabel: "Work area",
    helperText:
      "Repeated small annoyances at work are easy to dismiss but they point to missing tools. Small, specific, and slightly weird are good signals.",
    bestFor:
      "Best for a job or role you do often enough to have stopped noticing its rough edges. You already know the process, the tools and the people, so the prompts can go straight at what wastes your week.",
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
    estimatedMinutes: 10,
    anchorLabel: "What you've done",
    helperText:
      "Both the problem and your workaround matter. The workaround is the early prototype of the product; the problem is the reason anyone else would want it.",
    bestFor:
      "Best for anything you have run or built yourself, paid or not: a side project, a hobby, a small business. If you have already cobbled a fix together, this tool is the quickest way to turn it into a problem statement.",
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
    estimatedMinutes: 10,
    anchorLabel: "Audience",
    helperText:
      "You're looking outward at one specific group. Anything you list should be something you've actually seen them deal with, not what you assume they deal with.",
    bestFor:
      "Best for when you already have a group of people in mind and want to start from them rather than from yourself. You need to have watched them closely enough to describe what they actually do, not what you assume they do.",
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
    /*
     * The one tool that starts from the Problems dimension. Every other lens
     * anchors on a situation (an experience, a role, an audience) and asks what
     * goes wrong in it; this one anchors on the irritation and works backwards
     * to the situation: one real occasion, the job behind it, who else has it,
     * when it bites (the contexts column) and how people cope. The order
     * matters: each prompt narrows the one before it, so by the review the
     * annoyance has a customer, a context and a workaround to beat. Why the
     * problem is still there is deliberately not asked: the competition step
     * of Test the problem captures that as structured signals.
     */
    id: "annoyance",
    title: "Something that annoys you",
    shortDescription: "Start from the irritation itself, then work backwards to who has it, when it bites and how people cope today.",
    longDescription:
      "Pick one thing that annoys you, or that you have watched someone else put up with, and work backwards from it: the last time it happened, what you were trying to get done, who else runs into it and when, and how people cope today. Sticking to one annoyance per run keeps the prompts specific; to explore another, run this tool again and pick a different one.",
    icon: Annoyed,
    estimatedMinutes: 10,
    anchorLabel: "Annoyance",
    helperText:
      "An annoyance only becomes a problem once you can say who has it, when it bites and what they were trying to do at the time. Answer from occasions you remember rather than complaints in general.",
    bestFor:
      "Best for when you have the irritation but not the story around it: you know what makes you sigh, but not yet who else feels it or when it bites. The other tools start from a situation and look for its problems; this one starts from the problem and looks for its situation.",
    prompts: [
      {
        id: "annoyance-anchor",
        question: "What annoys you, or someone you know?",
        helperText:
          "Pick the kind of pain from the list, or add your own in your own words. It can be yours or something you have watched someone else put up with. Keep it to one so the next prompts stay specific.",
        examples: [
          "Being kept on hold to fix something that should take two minutes",
          "Fees that only appear at the checkout",
          "Instructions written for people who already know the answer",
        ],
        multipleAllowed: false,
        contextOnly: true,
        role: "problems",
      },
      {
        id: "last-time",
        question: "When did it last happen? Describe that moment.",
        helperText:
          "One real occasion beats a complaint in general. Where were you, what were you in the middle of, and exactly what went wrong? The details are what turn an annoyance into a problem you can describe to somebody else. Add another occasion if a different one comes to mind.",
        examples: [
          "Tuesday lunchtime, trying to cancel a gym membership on my phone, and being told to ring a number that only answers between nine and five",
          "Booking a plumber for a leak and discovering the call-out charge only once he was standing in the kitchen",
          "Setting up my mum's new phone and finding every step assumed she already had a working email account",
        ],
        multipleAllowed: true,
      },
      {
        id: "trying-to-do",
        question: "What were you actually trying to get done when it got in the way?",
        helperText:
          "The annoyance is rarely the point; behind it is a job you were trying to finish. Name the job and the problem starts to look like something a product or service could take off your hands.",
        examples: [
          "Stop paying for something I no longer use, without it turning into an afternoon",
          "Get the leak fixed today without being taken advantage of",
          "Get my mum onto video calls so she can see the grandchildren",
        ],
        multipleAllowed: true,
      },
      {
        id: "who-else",
        question: "Who else runs into this?",
        helperText:
          "Think about who is in the same situation when it bites: the same job, life stage or set-up. Pick the groups you have actually seen deal with it rather than everyone who plausibly might.",
        examples: [
          "Anyone with a subscription they have stopped using",
          "Homeowners facing an emergency repair for the first time",
          "Adult children setting up technology for elderly parents",
        ],
        multipleAllowed: true,
        role: "customers",
      },
      {
        id: "when-it-bites",
        question: "When and where does it bite hardest?",
        helperText:
          "Annoyances cluster around moments: a deadline, a first time, a bad day, a particular place or device. Naming the moment tells you where a solution would have to show up to be any use.",
        examples: [
          "In a lunch break, on a phone, with no time to be passed around",
          "In an emergency, with no time to compare options",
          "When helping someone else, so you cannot see what they see",
        ],
        multipleAllowed: true,
        role: "contexts",
      },
      {
        id: "how-cope",
        question: "How do you, or they, get around it today?",
        helperText:
          "Nobody just suffers; they build a workaround or pay for one. What people do instead is the best clue to what a solution has to beat and what it might be worth. If the honest answer is \"nothing, we put up with it\", say so: that is a signal too.",
        examples: [
          "A calendar reminder the day before every free trial ends",
          "Asking the street WhatsApp group who they used and what it cost",
          "Driving over to do it in person, twice a month",
        ],
        multipleAllowed: true,
      },
    ],
  },
]

/** The lens with this id, or undefined for anything else (a stale URL, an old bundle). */
export function getReflectLens(id: string): Lens | undefined {
  return REFLECT_LENSES.find((lens) => lens.id === id)
}

/** The lens's anchor prompt: the experience, work area, audience or annoyance the rest of the prompts reflect on. */
export function getAnchorPrompt(lens: Lens): LensPrompt {
  const anchor = lens.prompts.find((p) => p.contextOnly)
  if (!anchor) throw new Error(`Lens ${lens.id} has no anchor prompt`)
  return anchor
}

export function getAnchorPromptId(lens: Lens): string {
  return getAnchorPrompt(lens).id
}

/** The prompt whose answers are saved into the given dimension column, or null when the lens has none. */
export function getRolePromptId(lens: Lens, role: LensDimensionRole): string | null {
  return lens.prompts.find((p) => p.role === role)?.id ?? null
}

/**
 * Whether the lens starts from the problem and works backwards to its
 * situation (its anchor is a problem type), as opposed to starting from a
 * situation and looking for its problems.
 */
export function startsFromProblem(lens: Lens): boolean {
  return getAnchorPrompt(lens).role === "problems"
}

/**
 * The dimension a lens starts from, shown as a pill beside its title on the
 * hub. An anchor saved into a dimension column starts there (an audience is a
 * customer, an annoyance a problem type); an anchor kept only as reflection (a
 * life experience, a work area, something you have done) starts from You.
 */
export function startingDimension(lens: Lens): DimensionKey {
  return getAnchorPrompt(lens).role ?? "you"
}
