"use client"

import { getNavigationItem } from "@/config/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProblemValidationPage() {
  const navItem = getNavigationItem("/problem-validation")
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
          <h1 className="text-xl font-bold">Problem Validation</h1>
        </div>
        <p className="text-muted-foreground">
          Validate your identified problems through research, user interviews, and market analysis.
          This step helps ensure you're solving real problems that people care about.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Validation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a tool to begin validating your problems.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 