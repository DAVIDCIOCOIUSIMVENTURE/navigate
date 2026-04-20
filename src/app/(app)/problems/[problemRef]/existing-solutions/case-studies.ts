import { Mail, Notebook, type LucideIcon } from "lucide-react"

export type ExistingSolutionCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  solutions: {
    name: string
    shortcomings: { text: string; impact: string }[]
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
          {
            text: "BCC limits vary by provider (often capped at 500 recipients)",
            impact: "Time Lost: business owners spent 2-3 hours manually splitting contact lists in spreadsheets",
          },
          {
            text: "No unsubscribe link, risking spam complaints",
            impact: "Customer Churn: unsubscribe requests went to personal inbox and were often missed, damaging trust",
          },
          {
            text: "Emails look unprofessional: plain text, no branding",
            impact: "Emotional Impact: owners felt embarrassed sending ugly emails that didn't reflect their brand",
          },
          {
            text: "No way to track opens or clicks",
            impact: "Productivity Loss: owners had no data to know which messages worked, so improving campaigns was guesswork",
          },
        ],
      },
      {
        name: "Enterprise email platforms (e.g. Constant Contact, early Salesforce Marketing Cloud)",
        shortcomings: [
          {
            text: "Pricing started at $100+/month, too expensive for micro-businesses",
            impact: "Money Wasted: small businesses paying for features they never used",
          },
          {
            text: "Complex setup requiring technical knowledge or a consultant",
            impact: "Productivity Loss: hours spent learning complex tools instead of running the business",
          },
          {
            text: "Feature-heavy interfaces designed for marketing teams, not solo operators",
            impact: "Emotional Impact: felt intimidating and exclusionary, like 'this isn't for people like me'",
          },
        ],
      },
      {
        name: "Doing nothing: relying on word of mouth and social media only",
        shortcomings: [
          {
            text: "No direct line to existing customers",
            impact: "Revenue Impact: repeat purchase rates were lower without a way to re-engage past buyers",
          },
          {
            text: "Algorithm changes could kill reach overnight",
            impact: "Customer Churn: reach dropped unpredictably when platforms tweaked their algorithms",
          },
          {
            text: "No way to segment or personalise messages",
            impact: "Emotional Impact: felt like shouting into the void with no feedback on what worked",
          },
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
          {
            text: "Information scattered across 3+ apps with no central index",
            impact: "Time Lost: teams spent ~30 min/day searching for information across tools",
          },
          {
            text: "Different permissions and sharing models per tool",
            impact: "Productivity Loss: onboarding new team members took days because knowledge lived in personal accounts",
          },
          {
            text: "No relational links between notes, tasks, and docs",
            impact: "Error Rates: decisions were made with incomplete context when related info lived in a different app",
          },
          {
            text: "Context-switching overhead between apps multiple times per hour",
            impact: "Emotional Impact: constant low-grade frustration of never knowing where something was saved",
          },
        ],
      },
      {
        name: "Company wiki tools (e.g. Confluence)",
        shortcomings: [
          {
            text: "Slow, clunky editing experience that discouraged updates",
            impact: "Emotional Impact: teams resented the wiki as a chore rather than a useful tool",
          },
          {
            text: "Pages became stale because nobody wanted to maintain them",
            impact: "Productivity Loss: outdated wiki pages led to teams making decisions on wrong information",
          },
          {
            text: "Poor mobile experience",
            impact: "Time Lost: employees couldn't reference docs on the go, forcing them to wait until they were at their desk",
          },
          {
            text: "Required admin setup and IT involvement",
            impact: "Support Tickets: internal helpdesk fielded questions that should have been answered by docs",
          },
        ],
      },
      {
        name: "Spreadsheets as project trackers",
        shortcomings: [
          {
            text: "No built-in views (kanban, calendar, timeline)",
            impact: "Time Lost: project leads spent hours each week updating and formatting spreadsheets",
          },
          {
            text: "Formulas break when rows are moved or deleted",
            impact: "Error Rates: manual status updates were frequently out of date, causing duplicate or missed work",
          },
          {
            text: "No commenting or assignment features",
            impact: "Emotional Impact: felt like busywork that added no real value",
          },
        ],
      },
    ],
  },
]
