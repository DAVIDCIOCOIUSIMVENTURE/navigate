"use client"

import { usePathname, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, LayoutTemplate } from "lucide-react"
import { getAdjacentSteps, useSolution } from "../context"
import { SolutionHubContent } from "@/components/solution-hub/solution-hub-content"

export default function ValidationSummaryPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { solutionId } = useSolution()
  const { prevPath } = getAdjacentSteps(pathname, solutionId)

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0 space-y-6">
        <CardTitle icon={LayoutTemplate} iconBg="bg-secondary-brand">Summary</CardTitle>
        <p className="text-base">A read-only overview of everything you have captured for this solution. Use <strong>Open Solution</strong> to jump to the editable solution page.</p>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-6">
        <SolutionHubContent mode="page" readOnly />

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="primary-outline" onClick={() => router.push(prevPath)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Previous
            </Button>
          ) : <div />}
          <Button
            variant="outline"
            className="bg-[#fcfbf8] border-secondary-brand/40 text-secondary-brand hover:bg-secondary-brand/5 hover:text-secondary-brand"
            onClick={() => router.push(`/solutions/${solutionId}`)}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Solution to edit
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
