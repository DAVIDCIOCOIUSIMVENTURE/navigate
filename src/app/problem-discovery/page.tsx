"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getNavigationItem } from "@/config/navigation"
import { CURRENT_USER_ID } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

type ProblemTrigger = {
  id: string
  title: string
  selfDiscoveryQuestionId: string | null
}

export default function ProblemDiscoveryPage() {
  const navItem = getNavigationItem("/problem-discovery")
  const Icon = navItem?.icon
  const router = useRouter()
  const [problems, setProblems] = useState<ProblemTrigger[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProblems() {
      try {
        const response = await fetch(`/api/problemTriggers?userId=${CURRENT_USER_ID}`)
        if (!response.ok) throw new Error('Failed to fetch problems')
        const data: ProblemTrigger[] = await response.json()
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
            <h1 className="text-xl font-bold">Problem Discovery</h1>
          </div>
          <p className="text-muted-foreground">
            Start your problem discovery journey here. Select a problem discovery bucket or generate a new one.
            Each bucket represents a unique problem space to explore and develop solutions for.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Problems</h2>
            <Button variant="primary-outline" size="sm" className="flex items-center gap-2" onClick={() => router.push("/problem-discovery/find-new-problems")}>
              <Plus className="h-4 w-4" />
              Find New Problems
            </Button>
          </div>

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
              No problems found yet. Use &quot;Find New Problems&quot; to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
