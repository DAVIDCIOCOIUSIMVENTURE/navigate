"use client"

import { usePathname, useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProblemValidation, getAdjacentSteps } from "../context"
import { Users } from "lucide-react"

export default function CustomerSegmentPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { problemRef, problemId, segmentSize, setSegmentSize } = useProblemValidation()
  const { prevPath, nextPath } = getAdjacentSteps(pathname, problemRef)

  const problem = useSelector((state: RootState) =>
    state.problems.problems.find((p) => p.id === problemId)
  )
  const customerSegments = problem?.customerSegments ?? []

  return (
    <Card className="w-full flex-1">
      <CardHeader className="px-10 pt-10 pb-0">
        <CardTitle icon={Users} className="text-primary">Customer Segment Size</CardTitle>
      </CardHeader>
      <CardContent className="p-10 pt-6 flex flex-col gap-5">
        <p className="text-md text-muted-foreground">
          Before diving into alternatives and shortcomings, estimate how many people actually
          experience this problem. A large segment signals a bigger market opportunity; a small
          one may still be worth pursuing if the pain is intense enough.
        </p>

        {customerSegments.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Defined Segments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {customerSegments.map((segment) => (
                <span key={segment} className="rounded-md bg-muted px-2.5 py-1 text-md">
                  {segment}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border bg-muted/30 p-4 flex flex-col gap-3 text-md text-muted-foreground">
          <p className="font-medium text-foreground">How to estimate segment size</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <strong className="text-foreground">Top-down</strong> — start with a broad population
              (e.g. &quot;all small businesses in the UK&quot;) and narrow it by filters relevant to
              your problem (industry, company size, behaviour). Government census data, industry
              reports, and trade associations are good starting points.
            </li>
            <li>
              <strong className="text-foreground">Bottom-up</strong> — count from what you can
              observe: the number of users in a community, forum, or marketplace who mention this
              problem, then extrapolate.
            </li>
            <li>
              <strong className="text-foreground">Look for proxies</strong> — search volume for
              related keywords, number of competing products, job postings that reference the
              problem, or downloads of tools that work around it.
            </li>
            <li>
              <strong className="text-foreground">Ask around</strong> — survey potential customers,
              interview industry experts, or use LinkedIn filters to size the professional
              audience.
            </li>
          </ul>
          <p>
            An order-of-magnitude estimate is fine at this stage — the goal is to sense whether
            you&apos;re looking at thousands, hundreds of thousands, or millions of affected people.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="segment-size" className="text-md font-medium">
            Estimated number of people affected
          </label>
          <Input
            id="segment-size"
            type="number"
            min={0}
            placeholder="e.g. 500000"
            value={segmentSize ?? ""}
            onChange={(e) => {
              const val = e.target.value
              setSegmentSize(val === "" ? null : Number(val))
            }}
            className="text-md h-9 max-w-xs"
          />
        </div>

        <div className="flex justify-between mt-2">
          {prevPath ? (
            <Button variant="outline" onClick={() => router.push(prevPath)}>Previous</Button>
          ) : <div />}
          {nextPath && <Button onClick={() => router.push(nextPath)}>Next</Button>}
        </div>
      </CardContent>
    </Card>
  )
}
