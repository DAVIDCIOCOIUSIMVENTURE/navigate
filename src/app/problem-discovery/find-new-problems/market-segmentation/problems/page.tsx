"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function ProblemsPage() {
  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Problems</h2>
        <p className="text-sm">
          Capture and articulate the specific problems you have uncovered through your market segmentation
          analysis. Each problem you record here becomes a candidate for deeper validation and solution
          development.
        </p>
      </CardContent>
    </Card>
  )
}
