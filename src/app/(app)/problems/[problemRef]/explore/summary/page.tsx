"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ExternalLink, GitFork, LayoutTemplate, Search, Sparkles, Users, type LucideIcon } from "lucide-react"
import { useProblem, getAdjacentSteps } from "../context"
import { CustomerStrategy } from "@/components/problem-strategies/customer-strategy"
import { RefinementStrategy } from "@/components/problem-strategies/refinement-strategy"
import { ExistingSolutionsStrategy } from "@/components/problem-strategies/existing-solutions-strategy"
import { JobsToBeDoneStrategy } from "@/components/problem-strategies/validation-strategy"
import { SHOW_REFINEMENT_STEPS } from "@/lib/feature-flags"

function Section({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-tertiary/10">
          <Icon className="h-3.5 w-3.5 text-tertiary" />
        </span>
        {label}
      </h3>
      {children}
    </section>
  )
}

export default function ExploreSummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblem()
  const { prevPath } = getAdjacentSteps(pathname, problemRef)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={LayoutTemplate} iconBg="bg-tertiary">Summary</CardTitle>
        <p className="text-base">A read-only overview of everything you uncovered while exploring this problem. When you are happy with the picture, continue to Problem Validation to size the market and weigh up the competition. Everything below carries forward.</p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-8">
        <Section icon={Users} label="Customer">
          <CustomerStrategy readOnly />
        </Section>

        {SHOW_REFINEMENT_STEPS && (
          <Section icon={Search} label="Refinement">
            <RefinementStrategy showChooser readOnly />
          </Section>
        )}

        <Section icon={GitFork} label="Existing Solutions, Shortcomings & Impacts">
          <ExistingSolutionsStrategy readOnly />
        </Section>

        <Section icon={Sparkles} label="Jobs your customer is trying to get done">
          <JobsToBeDoneStrategy readOnly />
        </Section>

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary/5 hover:text-primary"
              onClick={() => router.push(`/problems/${problemRef}/edit`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Problem to edit
            </Button>
            <Button onClick={() => router.push(`/problems/${problemRef}/validation/introduction`)}>
              Continue to Problem Validation
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
