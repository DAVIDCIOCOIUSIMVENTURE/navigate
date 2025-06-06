"use client"

import { getNavigationItem } from "@/config/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SolutionIdeationPage() {
  const navItem = getNavigationItem("/solution-ideation")
  const Icon = navItem?.icon

  return (
    <div className="flex flex-col h-full w-full gap-6 flex-1">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {navItem && Icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500">
              <Icon className="h-5 w-5 text-white" />
            </div>
          )}
          <h1 className="text-xl font-bold">Solution Ideation</h1>
        </div>
        <p className="text-muted-foreground">
          Generate innovative solutions for your validated problems. Use creative thinking techniques
          and brainstorming tools to explore different approaches and possibilities.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solution Ideation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a tool to begin generating solutions for your validated problems.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 