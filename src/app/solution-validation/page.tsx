"use client"

import { getNavigationItem } from "@/config/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SolutionValidationPage() {
  const navItem = getNavigationItem("/solution-validation")
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
          <h1 className="text-xl font-bold">Solution Validation</h1>
        </div>
        <p className="text-muted-foreground">
          Test and validate your proposed solutions through user feedback, prototypes, and market research.
          This step helps ensure your solutions effectively address the identified problems.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solution Validation Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a tool to begin validating your proposed solutions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 