import { Mail, Notebook, type LucideIcon } from "lucide-react"

export type ExistingSolutionCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  solutions: {
    name: string
    shortcomings: { text: string }[]
  }[]
}

export const EXISTING_SOLUTIONS_CASE_STUDIES: ExistingSolutionCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    icon: Mail,
    iconBg: "bg-yellow-500",
    solutions: [
      {
        name: "BCC in Gmail / Outlook",
        shortcomings: [
          { text: "BCC limits (often capped at 500 recipients) forced business owners to spend 2-3 hours manually splitting contact lists in spreadsheets." },
          { text: "No unsubscribe link, so opt-out requests landed in personal inboxes and were often missed, damaging trust and risking spam complaints." },
          { text: "Plain-text emails with no branding left owners feeling embarrassed sending messages that didn't reflect their business." },
          { text: "No way to track opens or clicks, so owners had no signal of what worked and improving campaigns became guesswork." },
        ],
      },
      {
        name: "Enterprise email platforms (e.g. Constant Contact, early Salesforce Marketing Cloud)",
        shortcomings: [
          { text: "Pricing started at $100+/month, too expensive for micro-businesses who ended up paying for features they never used." },
          { text: "Complex setup required technical knowledge or a consultant, costing hours that should have gone toward running the business." },
          { text: "Feature-heavy interfaces designed for marketing teams felt intimidating and exclusionary to solo operators, like 'this isn't for people like me'." },
        ],
      },
      {
        name: "Doing nothing: relying on word of mouth and social media only",
        shortcomings: [
          { text: "No direct line to existing customers, so repeat purchase rates suffered without a way to re-engage past buyers." },
          { text: "Algorithm changes could kill reach overnight, with audience size dropping unpredictably whenever platforms tweaked their feeds." },
          { text: "No way to segment or personalise messages, leaving owners feeling like they were shouting into the void with no feedback on what worked." },
        ],
      },
    ],
  },
  {
    company: "Notion (early adopter phase)",
    icon: Notebook,
    iconBg: "bg-slate-700",
    solutions: [
      {
        name: "Google Docs + Trello + Evernote (tool sprawl)",
        shortcomings: [
          { text: "Information scattered across 3+ apps with no central index, forcing teams to spend ~30 min/day searching for what they needed." },
          { text: "Different permissions and sharing models per tool meant onboarding new team members took days, since knowledge lived in personal accounts." },
          { text: "No relational links between notes, tasks, and docs led to decisions being made with incomplete context when related info lived in a different app." },
          { text: "Context-switching between apps multiple times per hour created constant low-grade frustration of never knowing where something was saved." },
        ],
      },
      {
        name: "Company wiki tools (e.g. Confluence)",
        shortcomings: [
          { text: "Slow, clunky editing discouraged updates, leaving teams to resent the wiki as a chore rather than a useful tool." },
          { text: "Pages became stale because nobody wanted to maintain them, so teams ended up making decisions on outdated information." },
          { text: "Poor mobile experience meant employees couldn't reference docs on the go and had to wait until they were back at their desks." },
          { text: "Required admin setup and IT involvement, so the internal helpdesk fielded questions that should have been answered by docs." },
        ],
      },
      {
        name: "Spreadsheets as project trackers",
        shortcomings: [
          { text: "No built-in views (kanban, calendar, timeline), so project leads spent hours each week updating and formatting cells by hand." },
          { text: "Formulas break when rows are moved or deleted, leaving status updates frequently out of date and causing duplicate or missed work." },
          { text: "No commenting or assignment features made the whole exercise feel like busywork that added no real value." },
        ],
      },
    ],
  },
]
