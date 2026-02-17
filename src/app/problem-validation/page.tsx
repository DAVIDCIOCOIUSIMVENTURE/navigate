"use client"

import { getNavigationItem } from "@/config/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

type ProblemDiscoveryBucket = {
  id: string
  title: string
}

export default function ProblemValidationPage() {
  const navItem = getNavigationItem("/problem-validation")
  const Icon = navItem?.icon
  const [problems, setProblems] = useState<ProblemDiscoveryBucket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch('http://localhost:3001/problemDiscoveryBuckets')
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data: ProblemDiscoveryBucket[] = await response.json()
        setProblems(data)
      } catch (error) {
        console.error('Error fetching problems:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProblems()
  }, [])

  return (
    <Card className="w-full flex-1">
      <CardContent className="flex p-10 w-full flex-1 flex-col gap-6">
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
            This step helps ensure you&apos;re solving real problems that people care about.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Your Problems</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading problems...</p>
          ) : problems.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {problems.map((problem) => (
                <li
                  key={problem.id}
                  className="px-4 py-3 rounded-lg border bg-muted/40 text-sm font-medium"
                >
                  {problem.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No problems found yet. Complete the Problem Discovery step first.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
