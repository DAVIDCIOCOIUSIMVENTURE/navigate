import { Mail, Notebook, type LucideIcon } from "lucide-react"

export type CaseStudyJob = {
  text: string
  intensity: "mild" | "strong" | "unbearable"
}

export type ValidateCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  jobs: {
    functional: string[]
    emotional: CaseStudyJob[]
    social: CaseStudyJob[]
  }
  howManyPeople: { value: number; detail: string }
  howOften: { value: number; unit: string; detail: string }
  worthToThem: { value: number; unit: string; detail: string }
  reachableShare: { value: number; detail: string }
  obtainableShare: { value: number; detail: string }
  costOfSwitching: { level: "none" | "low" | "medium" | "high" | "prohibitive"; detail: string }
  solutionEffectiveness: { level: "terrible" | "poor" | "average" | "good" | "excellent"; detail: string }
  competitorSize: { level: "micro" | "small" | "medium" | "large" | "giant"; detail: string }
  verdict: string
  reasoning: string
}

export const VALIDATE_CASE_STUDIES: ValidateCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    icon: Mail,
    iconBg: "bg-yellow-500",
    jobs: {
      functional: [
        "Send a campaign to a customer list without exposing addresses.",
        "See whether anyone opened or clicked the last campaign.",
        "Schedule a recurring newsletter without thinking about it each week.",
      ],
      emotional: [
        { text: "Stop dreading hitting send on the next BCC list.", intensity: "strong" },
        { text: "Feel like a legitimate business, not someone fumbling through a workaround.", intensity: "strong" },
      ],
      social: [
        { text: "Not look amateur to customers when an email goes out.", intensity: "strong" },
      ],
    },
    howManyPeople: {
      value: 30000000,
      detail: "~30 million small businesses in the US alone, most with no email marketing tool at all.",
    },
    howOften: {
      value: 2,
      unit: "per week",
      detail: "Small business owners need to communicate with customers weekly: promotions, updates, newsletters. This is a recurring, ongoing need, not a one-off.",
    },
    worthToThem: {
      value: 20,
      unit: "USD per month",
      detail: "Each email campaign could drive $50-500 in direct sales for a small shop. Businesses were willing to pay $10-30/month, anchored on the strong emotional pull of not looking unprofessional.",
    },
    reachableShare: {
      value: 35,
      detail: "Initially launchable to English-speaking small businesses with internet access and a customer list, roughly a third of the global TAM.",
    },
    obtainableShare: {
      value: 10,
      detail: "Realistic capture in the early years given that Constant Contact and AWeber already had distribution to the mid-market.",
    },
    costOfSwitching: {
      level: "none",
      detail: "Most small businesses had no existing email tool, so there was nothing to switch from. The free tier eliminated any financial barrier to getting started.",
    },
    solutionEffectiveness: {
      level: "poor",
      detail: "Existing tools like Constant Contact were clunky, expensive, and designed for enterprises. Small businesses either used nothing or cobbled together manual BCC emails, which were error-prone and unprofessional.",
    },
    competitorSize: {
      level: "medium",
      detail: "Constant Contact and AWeber existed but were mid-sized companies focused on larger businesses. No dominant player owned the small business email marketing space.",
    },
    verdict: "Valid: Worth Solving",
    reasoning:
      "Huge underserved audience with a frequent, recurring need and a strong emotional pull to stop looking amateur. The opportunity was not in high per-customer revenue but in the sheer volume of businesses that had zero solution. Mailchimp validated this by offering a free tier and watching organic growth explode.",
  },
  {
    company: "Notion (early adopter phase)",
    icon: Notebook,
    iconBg: "bg-slate-700",
    jobs: {
      functional: [
        "Keep notes, tasks, and docs in one place instead of five.",
        "Share a single source of truth with the rest of the team.",
        "Stop losing work to sync conflicts across tools.",
      ],
      emotional: [
        { text: "Stop feeling overwhelmed by tool fragmentation every morning.", intensity: "unbearable" },
        { text: "Feel in control of the team's knowledge instead of chasing it.", intensity: "strong" },
      ],
      social: [
        { text: "Be seen as the person who finally fixed the team's chaos.", intensity: "strong" },
      ],
    },
    howManyPeople: {
      value: 50000000,
      detail: "~50 million knowledge workers globally using 3+ disconnected productivity tools daily.",
    },
    howOften: {
      value: 30,
      unit: "per day",
      detail: "Tool-switching happens dozens of times per day. The friction is constant: every time someone needs to find a note, check a task, or update a doc, they hit this problem.",
    },
    worthToThem: {
      value: 15,
      unit: "USD per user per month",
      detail: "Teams were already paying $10-30/user/month across multiple tools (Trello, Evernote, Google Workspace). The unbearable emotional pull is what justified consolidating: the cost saving alone would not have moved them.",
    },
    reachableShare: {
      value: 25,
      detail: "Initially launchable to English-speaking knowledge workers in mid-sized tech and creative teams. Larger enterprises had procurement cycles Notion could not crack early on.",
    },
    obtainableShare: {
      value: 7,
      detail: "A realistic capture given Google Workspace and Microsoft were already in most of those teams. Power-user evangelism made conversion cheap inside teams, but cross-team rollout was slow.",
    },
    costOfSwitching: {
      level: "high",
      detail: "Migrating notes, docs, and workflows from multiple tools required significant effort. Teams needed to rebuild templates, retrain habits, and convince every member to adopt the new tool.",
    },
    solutionEffectiveness: {
      level: "average",
      detail: "Individual tools (Trello, Evernote, Google Docs) each did their specific job adequately, but the fragmentation across multiple tools created friction. No single solution addressed the full workflow effectively.",
    },
    competitorSize: {
      level: "large",
      detail: "Google Workspace, Microsoft Office, Atlassian, and Evernote were all large, well-funded competitors. However, none offered a unified all-in-one workspace, leaving a gap Notion could exploit.",
    },
    verdict: "Valid: Worth Solving",
    reasoning:
      "The combination of a massive audience, extremely high frequency, and an unbearable emotional job made this a strong opportunity. Notion validated it by seeing power users organically convert their entire teams, the problem was painful enough that individuals championed the switch without top-down mandates.",
  },
]
