"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function IntroductionPage() {
  return (
    <Card className="w-full flex-1 flex flex-col h-[calc(100svh-9rem)]">
      <CardContent className="p-8 flex flex-col gap-4 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Finding My Customers</span>
        </div>
        <h2 className="text-xl font-semibold">Introduction</h2>
        <p className="text-sm">
          Finding your customers is a method for discovering problems by starting with a specific group of
          people you want to serve. Rather than searching abstractly for opportunities, you anchor your
          discovery in real customers — understanding who they are, what they&apos;re trying to accomplish,
          and where existing solutions let them down.
        </p>
        <p className="font-medium">We'll tackle this in 4 steps:</p>
        <ol className="flex flex-col gap-3">
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">1. Describe Your Customers</span>
            <span className="text-sm text-muted-foreground">Define the specific group of people you want to serve — who they are, their situation, and what makes them a distinct audience.</span>
          </li>
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">2. Identify Jobs to be Done</span>
            <span className="text-sm text-muted-foreground">Understand the tasks, goals, and outcomes your customers are trying to accomplish — functionally, emotionally, and socially.</span>
          </li>
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">3. Identify Existing Solutions</span>
            <span className="text-sm text-muted-foreground">Explore how your customers currently address those jobs and what tools or approaches they rely on.</span>
          </li>
          <li className="flex flex-col gap-0.5">
            <span className="font-medium">4. Identify Problems</span>
            <span className="text-sm text-muted-foreground">Uncover the pain points, frustrations, and gaps left by existing solutions that your customers still experience.</span>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
