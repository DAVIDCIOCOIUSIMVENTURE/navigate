"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function SummaryPage() {
  return (
    <Card className="w-full flex-1 flex flex-col h-[calc(100svh-9rem)]">
      <CardContent className="p-8 flex flex-col gap-4 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Finding My Customers</span>
        </div>
        <h2 className="text-xl font-semibold">Summary</h2>
        <p className="text-sm">
          Review everything you have uncovered through your customer analysis. This overview
          brings together your customer profile, jobs to be done, existing solutions, and identified
          problems — giving you a consolidated view before moving forward.
        </p>
      </CardContent>
    </Card>
  )
}
