"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { DISCOVERY_METHODS } from "@/lib/discoveryMethods"

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
          {DISCOVERY_METHODS.map((method) => (
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
