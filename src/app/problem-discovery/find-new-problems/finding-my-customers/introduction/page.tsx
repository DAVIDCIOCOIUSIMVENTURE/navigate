"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function IntroductionPage() {
  return (
    <Card className="w-full flex-1 flex flex-col h-[calc(100svh-9rem)]">
      <CardContent className="p-8 flex flex-col gap-4 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center justify-center w-5 h-5 rounded bg-yellow-400">
            <Search className="h-3 w-3 text-white" />
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Problem Discovery - Finding My Customers</span>
        </div>
        <h2 className="text-xl font-semibold">Introduction</h2>
        <p className="text-sm">
          Finding your customers is a method for discovering problems by starting with a specific group of
          people you want to serve. Rather than searching abstractly for opportunities, you anchor your
          discovery in real customers — understanding who they are, what they&apos;re trying to accomplish,
          and where existing solutions let them down.
        </p>
        <p className="font-medium">We'll tackle this in 3 steps:</p>
        <ol className="flex flex-col gap-3">
          <li className="flex gap-3 items-start">
            <span className="flex items-center justify-center w-10 h-10 rounded bg-blue-500 shrink-0 text-white font-semibold">1</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Describe Your Customers</span>
              <span className="text-sm text-muted-foreground">Define the specific group of people you want to serve — who they are, their situation, and what makes them a distinct audience.</span>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="flex items-center justify-center w-10 h-10 rounded bg-green-500 shrink-0 text-white font-semibold">2</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Identify Jobs to be Done</span>
              <span className="text-sm text-muted-foreground">Understand the tasks, goals, and outcomes your customers are trying to accomplish — functionally, emotionally, and socially.</span>
            </div>
          </li>
          <li className="flex gap-3 items-start">
            <span className="flex items-center justify-center w-10 h-10 rounded bg-orange-500 shrink-0 text-white font-semibold">3</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Identify Problems and Existing Solutions</span>
              <span className="text-sm text-muted-foreground">Explore how your customers currently address their jobs, what tools or approaches they rely on, and uncover the pain points, frustrations, and gaps those solutions leave behind.</span>
            </div>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
