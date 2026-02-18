"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function IntroductionPage() {
  return (
    <Card className="w-full flex-1">
      <CardContent className="p-8 flex flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Market Segmentation</span>
        </div>
        <h2 className="text-xl font-semibold">Introduction</h2>
        <p className="text-sm">
          Market segmentation is a method for discovering problems by dividing a broad market into smaller,
          more defined groups of consumers. By examining each segment closely, you can uncover unmet needs
          and underserved opportunities that form the basis of a strong problem statement.
        </p>
        <p className="font-medium">We'll tackle this in 4 steps:</p>
        <ol className="flex flex-col gap-3">
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">1. Identify Your Market Segment</span>
            <span className="text-sm text-muted-foreground">Define the specific group of people you're targeting based on shared characteristics or needs.</span>
          </li>
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">2. Identify Jobs to be Done</span>
            <span className="text-sm text-muted-foreground">Understand the tasks, goals, and outcomes your segment is trying to accomplish.</span>
          </li>
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">3. Identify Existing Solutions</span>
            <span className="text-sm text-muted-foreground">Explore how your segment currently addresses those jobs and what tools or approaches they rely on.</span>
          </li>
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">4. Identify Problems</span>
            <span className="text-sm text-muted-foreground">Uncover the pain points, frustrations, and gaps left by existing solutions.</span>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
