"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function SolutionsPage() {
  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Solutions</h2>
        <p className="text-sm">
          Survey the existing solutions in the market. Understanding what is already available — and where
          those solutions struggle — helps you pinpoint the gaps your problem sits within.
        </p>
      </CardContent>
    </Card>
  )
}
