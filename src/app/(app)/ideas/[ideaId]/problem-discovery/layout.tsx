"use client"

import { useParams, usePathname, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProblemDiscoveryProvider, useProblemDiscovery, NAV_ITEMS } from "./context"
import { Users, Briefcase, AlertCircle, CheckCircle2, FileText, BookOpen, UserSearch } from "lucide-react"
import type { LucideIcon } from "lucide-react"

const NAV_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  customers: Users,
  "customer-sub-segment": UserSearch,
  "jobs-to-be-done": Briefcase,
  problems: AlertCircle,
  summary: CheckCircle2,
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const ideaId = Number(params.ideaId)
  const { customer, subSegment } = useProblemDiscovery()
  const base = `/ideas/${ideaId}/problem-discovery`

  return (
    <div className="flex gap-6 flex-1 w-full items-start">
      <div className="w-56 sticky top-4 flex flex-col gap-3 shrink-0">
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

        <Card>
          <CardContent className="p-3 flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Customer Segment
              </p>
              <div className="flex items-start gap-2 px-1 py-1">
                <Users className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                {customer.segmentName ? (
                  <span className="text-sm line-clamp-3">{customer.segmentName}</span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Not set</span>
                )}
              </div>
            </div>
            <div className="border-t pt-2 flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Sub-Segment
              </p>
              <div className="flex items-start gap-2 px-1 py-1">
                <UserSearch className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                {subSegment.name ? (
                  <span className="text-sm line-clamp-3">{subSegment.name}</span>
                ) : (
                  <span className="text-sm text-muted-foreground italic">Not set</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function ProblemDiscoveryLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const ideaId = Number(params.ideaId)

  return (
    <ProblemDiscoveryProvider ideaId={ideaId}>
      <LayoutContent>{children}</LayoutContent>
    </ProblemDiscoveryProvider>
  )
}
