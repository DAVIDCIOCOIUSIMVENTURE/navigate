"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { PieChart, Users, Globe, Target, type LucideIcon } from "lucide-react"

type DiscoveryMethod = {
  title: string
  description: string
  examples: string[]
  href: string | null
  icon: LucideIcon
}

const discoveryMethods: DiscoveryMethod[] = [
  {
    title: "I Already Know My Problem",
    description:
      "Skip the discovery phase if you have a clear problem in mind. Jump straight to defining it properly and exploring how to solve it.",
    examples: [
      "You've spotted a recurring frustration in your own work or daily life",
      "Customers or colleagues have told you directly what they struggle with",
      "You've already done research and have a specific problem statement ready",
    ],
    href: null,
    icon: Target,
  },
  {
    title: "Market Segmentation",
    description:
      "Divide a broad market into distinct subgroups of consumers who share common needs or characteristics. By understanding each segment's unique pain points, you can identify underserved problems worth solving.",
    examples: [
      "Small business owners struggling with payroll software designed for enterprises",
      "Remote workers who need ergonomic equipment but can't access corporate buying programmes",
      "Elderly users underserved by apps built for younger, tech-native audiences",
    ],
    href: "/problem-discovery/find-new-problems/market-segmentation",
    icon: PieChart,
  },
  {
    title: "Demographic",
    description:
      "Explore problems through the lens of age, income, education, occupation, or family structure. Demographic shifts often create new unmet needs as the makeup of society changes over time.",
    examples: [
      "Millennials navigating first-time home buying in high-cost markets",
      "Working parents balancing childcare logistics and career demands",
      "Retirees managing complex pension and investment decisions without professional help",
    ],
    href: null,
    icon: Users,
  },
  {
    title: "Changes in the Environment",
    description:
      "Look for problems triggered by shifts in technology, regulation, economy, or culture. External changes often disrupt established habits and create gaps that new solutions can fill.",
    examples: [
      "Businesses adapting to new data-privacy regulations like GDPR",
      "Workers reskilling after automation replaces their previous roles",
      "Consumers seeking sustainable alternatives following environmental policy changes",
    ],
    href: null,
    icon: Globe,
  },
]

export default function FindNewProblemsPage() {
  const router = useRouter()

  return (
    <Card className="w-full flex-1">
      <CardContent className="flex p-10 w-full flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Find New Problems</h1>
          <p className="text-muted-foreground">
            Use the tools below to uncover new problem spaces. Each tool offers a different lens for identifying
            unmet needs and opportunities — choose a starting point that best fits your current thinking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {discoveryMethods.map((method) => (
            <div
              key={method.title}
              className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-6"
            >
              <div className="flex flex-col gap-1 items-center text-center">
                <method.icon className="mb-2 h-8 w-8 text-primary" />
                <h2 className="text-base font-semibold">{method.title}</h2>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="examples" className="border-b-0">
                  <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                    See examples
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-2">
                      {method.examples.map((example, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="mt-0.5 shrink-0 text-xs">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-auto">
                <Button
                  variant="primary-outline"
                  size="sm"
                  className="w-full"
                  disabled={!method.href}
                  onClick={() => method.href && router.push(method.href)}
                >
                  {method.href ? `Start: ${method.title}` : "Coming soon"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
