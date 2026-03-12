"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProblemValidationProvider, useProblemValidation, NAV_ITEMS } from "./context"
import {
  GitFork, Clock, Heart, BarChart2, ShieldCheck, FileText, LayoutTemplate, BookOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  alternatives: GitFork,
  "context-step": Clock,
  "emotional-impact": Heart,
  "quantifiable-impact": BarChart2,
  validate: ShieldCheck,
  "problem-statement": LayoutTemplate,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef } = useProblemValidation()

  const base = `/problem-validation/${problemRef}`

  return (
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
                    className="w-full justify-start h-auto whitespace-normal text-left py-1.5 gap-2"
                    onClick={() => router.push(`${base}/${item.path}`)}
                  >
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue-500" : ""}`} />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">{children}</div>
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
