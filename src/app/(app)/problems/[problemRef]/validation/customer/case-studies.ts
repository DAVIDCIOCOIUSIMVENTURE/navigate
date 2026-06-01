import { Mail, Notebook, Glasses, Car, type LucideIcon } from "lucide-react"

export type CustomerCaseStudy = {
  company: string
  icon: LucideIcon
  iconBg: string
  customerDescription: string
  whyThisWorks: string
}

export const CUSTOMER_CASE_STUDIES: CustomerCaseStudy[] = [
  {
    company: "Mailchimp (early days)",
    icon: Mail,
    iconBg: "bg-yellow-500",
    customerDescription:
      "Small business owners with fewer than 10 employees, often running online shops, local services, or creative side-projects, who need to send regular email newsletters to their customers but lack the technical skills or budget for enterprise marketing tools. They are typically non-technical, time-poor, and manage their own marketing without a dedicated team.",
    whyThisWorks:
      "Mailchimp didn't try to compete with enterprise email platforms. They picked the smallest, most underserved businesses, people who were using BCC in Gmail, and built specifically for them. By narrowing the customer, they could simplify the product radically.",
  },
  {
    company: "Notion (early adopter phase)",
    icon: Notebook,
    iconBg: "bg-slate-700",
    customerDescription:
      "Individual knowledge workers and small startup teams (2 to 15 people) who juggle notes, wikis, project boards, and documents across multiple disconnected tools like Google Docs, Trello, and Evernote. They are tech-savvy, value flexibility, and are willing to invest time customising a tool if it can replace several others.",
    whyThisWorks:
      "Notion focused on people frustrated by tool sprawl, not enterprises needing compliance or IT admin features. This narrow focus let them prioritise flexibility and templates over permissions and security, which came later.",
  },
  {
    company: "Warby Parker (launch)",
    icon: Glasses,
    iconBg: "bg-blue-900",
    customerDescription:
      "Style-conscious adults, often younger professionals, who need prescription glasses but resent paying $300-500 at optical chains for what they see as an overpriced necessity. They shop online comfortably, care how frames look on them, and are open to buying eyewear a new way if the price and experience are better.",
    whyThisWorks:
      "Warby Parker didn't target everyone who needs glasses. They focused on price-aware, design-conscious online shoppers, the people most annoyed by the markup and least attached to buying in-store. That narrow focus justified the direct-to-consumer model and the home try-on program built around their one hesitation.",
  },
  {
    company: "Uber (launch)",
    icon: Car,
    iconBg: "bg-zinc-900",
    customerDescription:
      "Smartphone-owning urban professionals in dense cities who regularly need rides to meetings, airports, and nights out, and are repeatedly let down by unreliable taxis: no-shows, long waits, cash-only payment, and no way to know when a car will arrive. They value their time, can afford a premium fare, and judge a service on reliability over price.",
    whyThisWorks:
      "Uber didn't launch a cheap mass-market taxi alternative. They started with affluent professionals in one city who felt the unreliability most and could pay a premium for a black car. That narrow, high-willingness segment let them prove the model and the experience before scaling down to UberX and the mainstream.",
  },
]
