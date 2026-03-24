export type ValidateCaseStudy = {
  company: string
  howManyPeople: { level: string; detail: string }
  howOften: { level: string; detail: string }
  worthToThem: { level: string; detail: string }
  verdict: string
  reasoning: string
}

export const VALIDATE_CASE_STUDIES: ValidateCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    howManyPeople: {
      level: "High",
      detail: "~30 million small businesses in the US alone, most with no email marketing tool at all.",
    },
    howOften: {
      level: "High",
      detail: "Small business owners need to communicate with customers weekly — promotions, updates, newsletters. This is a recurring, ongoing need, not a one-off.",
    },
    worthToThem: {
      level: "Medium",
      detail: "Each email campaign could drive $50–500 in direct sales for a small shop. Businesses were willing to pay $10–30/month — modest individually, but massive at scale.",
    },
    verdict: "Valid — Worth Solving",
    reasoning:
      "Huge underserved audience with a frequent, recurring need and clear willingness to pay a small amount. The opportunity wasn't in high per-customer revenue but in the sheer volume of businesses that had zero solution. Mailchimp validated this by offering a free tier and watching organic growth explode.",
  },
  {
    company: "Notion (early adopter phase)",
    howManyPeople: {
      level: "High",
      detail: "~50 million knowledge workers globally using 3+ disconnected productivity tools daily.",
    },
    howOften: {
      level: "High",
      detail: "Tool-switching happens dozens of times per day. The friction is constant — every time someone needs to find a note, check a task, or update a doc, they hit this problem.",
    },
    worthToThem: {
      level: "Medium",
      detail: "Teams were already paying $10–30/user/month across multiple tools (Trello, Evernote, Google Workspace). Consolidating into one tool didn't necessarily cost more — the value was in time saved and reduced complexity.",
    },
    verdict: "Valid — Worth Solving",
    reasoning:
      "The combination of a massive audience, extremely high frequency, and clear existing spend made this a strong opportunity. Notion validated it by seeing power users organically convert their entire teams — the problem was painful enough that individuals championed the switch without top-down mandates.",
  },
]
