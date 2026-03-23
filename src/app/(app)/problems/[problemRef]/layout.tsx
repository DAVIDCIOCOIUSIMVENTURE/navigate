"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProblemValidationProvider, useProblemValidation, NAV_ITEMS } from "./context"
import {
  GitFork, Clock, ShieldCheck, FileText, LayoutTemplate, BookOpen, Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "customer": Users,
  "existing-solutions": GitFork,
  "context-step": Clock,
  validate: ShieldCheck,
  "problem-statement": LayoutTemplate,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblemValidation()

  const base = `/problems/${problemRef}`

  return (
    <div className="flex flex-col gap-6 flex-1 w-full">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary shrink-0">
          <ShieldCheck className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">Problem Validation</h1>
          <p className="text-sm text-muted-foreground">
            Validate that the problems you&apos;ve identified are real, painful, and worth solving.
          </p>
        </div>
      </div>
    <div className="flex gap-6 flex-1 w-full items-start">
      <div className="w-56 flex flex-col gap-3 shrink-0">
        <Card>
          <CardContent className="p-3">
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === `${base}/${item.path}`
                const Icon = NAV_ICONS[item.path] ?? FileText
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2 ${isActive ? "text-primary" : ""}`}
                    onClick={() => router.push(`${base}/${item.path}`)}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
    </div>
  )
}

export default function ProblemRefLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const problemRef = params.problemRef as string

  return (
    <ProblemValidationProvider problemRef={problemRef}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemValidationProvider>
  )
}
