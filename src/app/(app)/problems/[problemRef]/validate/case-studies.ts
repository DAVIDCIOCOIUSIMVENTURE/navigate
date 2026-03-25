export type ValidateCaseStudy = {
  company: string
  howManyPeople: { value: number; detail: string }
  howOften: { value: number; unit: string; detail: string }
  worthToThem: { value: number; unit: string; detail: string }
  costOfSwitching: { level: "none" | "low" | "medium" | "high" | "prohibitive"; detail: string }
  solutionEffectiveness: { level: "terrible" | "poor" | "average" | "good" | "excellent"; detail: string }
  competitorSize: { level: "micro" | "small" | "medium" | "large" | "giant"; detail: string }
  verdict: string
  reasoning: string
}

export const VALIDATE_CASE_STUDIES: ValidateCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    howManyPeople: {
      value: 30000000,
      detail: "~30 million small businesses in the US alone, most with no email marketing tool at all.",
    },
    howOften: {
      value: 2,
      unit: "times per week",
      detail: "Small business owners need to communicate with customers weekly: promotions, updates, newsletters. This is a recurring, ongoing need, not a one-off.",
    },
    worthToThem: {
      value: 20,
      unit: "USD per month",
      detail: "Each email campaign could drive $50-500 in direct sales for a small shop. Businesses were willing to pay $10-30/month, modest individually but massive at scale.",
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
      "Huge underserved audience with a frequent, recurring need and clear willingness to pay a small amount. The opportunity was not in high per-customer revenue but in the sheer volume of businesses that had zero solution. Mailchimp validated this by offering a free tier and watching organic growth explode.",
  },
  {
    company: "Notion (early adopter phase)",
    howManyPeople: {
      value: 50000000,
      detail: "~50 million knowledge workers globally using 3+ disconnected productivity tools daily.",
    },
    howOften: {
      value: 30,
      unit: "times per day",
      detail: "Tool-switching happens dozens of times per day. The friction is constant: every time someone needs to find a note, check a task, or update a doc, they hit this problem.",
    },
    worthToThem: {
      value: 15,
      unit: "USD per user per month",
      detail: "Teams were already paying $10-30/user/month across multiple tools (Trello, Evernote, Google Workspace). Consolidating into one tool did not necessarily cost more, the value was in time saved and reduced complexity.",
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
      "The combination of a massive audience, extremely high frequency, and clear existing spend made this a strong opportunity. Notion validated it by seeing power users organically convert their entire teams, the problem was painful enough that individuals championed the switch without top-down mandates.",
  },
]
