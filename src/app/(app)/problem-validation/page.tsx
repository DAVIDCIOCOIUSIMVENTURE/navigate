"use client"

import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Button } from "@/components/ui/button"
import { ProblemsTable } from "@/components/problems-table"
import { Search } from "lucide-react"

export default function ProblemValidationPage() {
  const router = useRouter()
  const problems = useSelector((state: RootState) => state.problems.problems)

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">Problem Validation</h1>
        <p className="text-sm text-muted-foreground">
          Validate that the problems you&apos;ve identified are real, painful, and worth solving.
        </p>
      </div>

      {problems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <div className="flex flex-col gap-1 max-w-sm">
            <p className="text-sm font-medium">No problems to validate yet</p>
            <p className="text-sm text-muted-foreground">
              Discover problems first before validating them.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/problem-discovery")}>
            Go to Problem Discovery
          </Button>
        </div>
      ) : (
        <ProblemsTable problems={problems} showStatus showEditDelete />
      )}
    </div>
  )
}
