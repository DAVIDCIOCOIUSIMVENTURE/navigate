import { Mail, Notebook, type LucideIcon } from "lucide-react"

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
]
